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
  if (typeof chrome === 'undefined' || !chrome.alarms) return

  const existing = await chrome.alarms.getAll()
  await Promise.all(
    existing
      .filter((a) => a.name.startsWith(ALARM_PREFIX))
      .map((a) => chrome.alarms.clear(a.name)),
  )

  if (!enabled) return

  const now = Date.now()
  for (const item of countdowns) {
    if (!item.notify) continue
    const { year, month, day } = item.gregorian
    const when = new Date(year, month - 1, day, 9, 0, 0, 0).getTime()
    if (when <= now) continue
    await chrome.alarms.create(alarmNameFor(item.id), { when })
  }
}

export async function notifyCountdown(
  title: string,
  message: string,
): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.notifications) return
  await chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message,
    priority: 2,
  })
}
