import type { SearchEngine } from './types'

/** Upstream suggestion endpoints — keep free of DOM/`chrome` so Vite config can import it. */
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
