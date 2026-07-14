import { alarmNameFor, notifyCountdown } from './lib/alarms'
import { fetchSearchSuggestions } from './lib/searchSuggest'
import type { Quote } from './lib/quotes'
import { loadCountdowns } from './lib/storage'
import type { SearchEngine } from './lib/types'

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith('countdown:')) return
  const id = alarm.name.slice('countdown:'.length)
  const items = await loadCountdowns()
  const item = items.find((c) => c.id === id)
  const title = item?.title ?? 'Countdown'
  await notifyCountdown('Reminder', `${title} — today`)
  await chrome.alarms.clear(alarmNameFor(id))
})

async function fetchQuoteUpstream(): Promise<Quote | null> {
  try {
    const res = await fetch('https://dummyjson.com/quotes/random', {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { quote?: string; author?: string }
    if (!data.quote?.trim()) return null
    return {
      text: data.quote.trim(),
      author: data.author?.trim() || 'Unknown',
    }
  } catch {
    return null
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return undefined

  if (message.type === 'SEARCH_SUGGEST') {
    const engine = message.engine as SearchEngine
    const query = String(message.query ?? '')
    void fetchSearchSuggestions(engine, query)
      .then((suggestions) => sendResponse({ ok: true, suggestions }))
      .catch(() => sendResponse({ ok: false, suggestions: [] }))
    return true
  }

  if (message.type === 'FETCH_QUOTE') {
    void fetchQuoteUpstream()
      .then((quote) => {
        if (quote) sendResponse({ ok: true, quote })
        else sendResponse({ ok: false })
      })
      .catch(() => sendResponse({ ok: false }))
    return true
  }

  return undefined
})
