import type { SearchEngine } from './types'

export function absoluteSuggestUrl(engine: SearchEngine, query: string): string {
  const q = encodeURIComponent(query)
  switch (engine) {
    case 'duckduckgo':
      return `https://duckduckgo.com/ac/?q=${q}&type=list`
    case 'bing':
      return `https://api.bing.com/osjson.aspx?query=${q}`
    case 'youtube':
      return `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${q}`
    case 'google':
    default:
      return `https://suggestqueries.google.com/complete/search?client=firefox&q=${q}`
  }
}

export function parseSuggestions(data: unknown): string[] {
  if (!Array.isArray(data)) return []

  // Google / Bing / YouTube / DDG type=list → ["query", ["s1", "s2", ...]]
  if (Array.isArray(data[1])) {
    return data[1]
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .slice(0, 8)
  }

  // DuckDuckGo default → [{ phrase: "..." }, ...]
  return data
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object' && 'phrase' in item) {
        const phrase = (item as { phrase?: unknown }).phrase
        return typeof phrase === 'string' ? phrase : ''
      }
      return ''
    })
    .filter((item) => item.trim().length > 0)
    .slice(0, 8)
}

async function fetchAndParse(url: string, signal?: AbortSignal): Promise<string[]> {
  const res = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return []
  const text = await res.text()
  try {
    return parseSuggestions(JSON.parse(text) as unknown)
  } catch {
    return []
  }
}

/** Absolute upstream fetch — for service worker / Node. */
export async function fetchSearchSuggestions(
  engine: SearchEngine,
  query: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const q = query.trim()
  if (q.length < 1) return []
  return fetchAndParse(absoluteSuggestUrl(engine, q), signal)
}

function isDevServerOrigin(): boolean {
  if (typeof location === 'undefined') return false
  return (
    location.origin.startsWith('http://localhost:') ||
    location.origin.startsWith('http://127.0.0.1:')
  )
}

function isExtensionPage(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    typeof chrome.runtime?.id === 'string' &&
    typeof location !== 'undefined' &&
    location.protocol === 'chrome-extension:'
  )
}

/** Page-facing suggest request — never hits CORS-blocked hosts from the UI. */
export async function requestSearchSuggestions(
  engine: SearchEngine,
  query: string,
): Promise<string[]> {
  const q = query.trim()
  if (!q) return []

  // Vite / CRXJS HMR page: same-origin proxy
  if (isDevServerOrigin()) {
    try {
      return await fetchAndParse(
        `/api/suggest?engine=${encodeURIComponent(engine)}&q=${encodeURIComponent(q)}`,
      )
    } catch {
      return []
    }
  }

  // Packaged extension page: background worker (host permissions bypass CORS)
  if (isExtensionPage()) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(
          { type: 'SEARCH_SUGGEST', engine, query: q },
          (response: { ok?: boolean; suggestions?: string[] } | undefined) => {
            if (chrome.runtime.lastError || !response?.ok) {
              resolve([])
              return
            }
            resolve(response.suggestions ?? [])
          },
        )
      } catch {
        resolve([])
      }
    })
  }

  return []
}
