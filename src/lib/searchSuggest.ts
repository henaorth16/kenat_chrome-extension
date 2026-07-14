import type { SearchEngine } from './types'
import { absoluteSuggestUrl } from './suggestUrls'
import { getExtensionApi, isExtensionPage } from './extension'

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
  const ext = getExtensionApi()
  if (isExtensionPage() && ext?.runtime) {
    return new Promise((resolve) => {
      try {
        ext.runtime.sendMessage(
          { type: 'SEARCH_SUGGEST', engine, query: q },
          (response: { ok?: boolean; suggestions?: string[] } | undefined) => {
            if (ext.runtime.lastError || !response?.ok) {
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
