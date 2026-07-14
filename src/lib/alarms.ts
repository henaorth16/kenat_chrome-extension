import { getExtensionApi } from './extension'
import type { CountdownItem } from './types'

const ALARM_PREFIX = 'countdown:'

export function alarmNameFor(id: string): string {
  return `${ALARM_PREFIX}${id}`
}

/** Schedule a notification for 9:00 local on the Gregorian target day. */
export async function syncCountdownAlarms(
  countdowns: CountdownItem[],
  enabled: boolean,
): Promise<void> {
  const ext = getExtensionApi()
  if (!ext?.alarms) return

  const existing = await ext.alarms.getAll()
  await Promise.all(
    existing
      .filter((a) => a.name.startsWith(ALARM_PREFIX))
      .map((a) => ext.alarms.clear(a.name)),
  )

  if (!enabled) return

  const now = Date.now()
  for (const item of countdowns) {
    if (!item.notify) continue
    const { year, month, day } = item.gregorian
    const when = new Date(year, month - 1, day, 9, 0, 0, 0).getTime()
    if (when <= now) continue
    await ext.alarms.create(alarmNameFor(item.id), { when })
  }
}

export async function notifyCountdown(
  title: string,
  message: string,
): Promise<void> {
  const ext = getExtensionApi()
  if (!ext?.notifications) return
  await ext.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message,
    priority: 2,
  })
}
