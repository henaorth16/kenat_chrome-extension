import { alarmNameFor, notifyCountdown } from './lib/alarms'
import { loadCountdowns } from './lib/storage'

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith('countdown:')) return
  const id = alarm.name.slice('countdown:'.length)
  const items = await loadCountdowns()
  const item = items.find((c) => c.id === id)
  const title = item?.title ?? 'Countdown'
  await notifyCountdown('Reminder', `${title} — today`)
  await chrome.alarms.clear(alarmNameFor(id))
})
