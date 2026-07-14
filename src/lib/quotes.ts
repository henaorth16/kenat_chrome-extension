import { getExtensionApi, isExtensionPage } from './extension'

export interface Quote {
  text: string
  author: string
}

const FALLBACK_QUOTES: Quote[] = [
  { text: 'Discipline today, freedom tomorrow.', author: 'Unknown' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Small steps every day lead to big changes.', author: 'Unknown' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Well begun is half done.', author: 'Aristotle' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  {
    text: 'The best way to get started is to quit talking and begin doing.',
    author: 'Walt Disney',
  },
]

function pickFallback(): Quote {
  const day = Math.floor(Date.now() / 86_400_000)
  return FALLBACK_QUOTES[day % FALLBACK_QUOTES.length]
}

function isDevServerOrigin(): boolean {
  if (typeof location === 'undefined') return false
  return (
    location.origin.startsWith('http://localhost:') ||
    location.origin.startsWith('http://127.0.0.1:')
  )
}

async function fetchQuoteFromUrl(url: string): Promise<Quote | null> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return null
  const data: unknown = await res.json()

  if (data && typeof data === 'object' && 'quote' in data) {
    const quote = (data as { quote?: unknown; author?: unknown }).quote
    const author = (data as { quote?: unknown; author?: unknown }).author
    if (typeof quote === 'string' && quote.trim()) {
      return {
        text: quote.trim(),
        author: typeof author === 'string' && author.trim() ? author.trim() : 'Unknown',
      }
    }
  }

  return null
}

async function fetchQuoteViaWorker(): Promise<Quote | null> {
  const ext = getExtensionApi()
  if (!ext?.runtime) return null

  return new Promise((resolve) => {
    try {
      ext.runtime.sendMessage({ type: 'FETCH_QUOTE' }, (response) => {
        if (ext.runtime.lastError || !response?.ok || !response.quote) {
          resolve(null)
          return
        }
        resolve(response.quote as Quote)
      })
    } catch {
      resolve(null)
    }
  })
}

/** Fetch a random quote without CORS errors from the page. */
export async function fetchRandomQuote(): Promise<Quote> {
  try {
    if (isDevServerOrigin()) {
      const quote = await fetchQuoteFromUrl('/api/quote')
      if (quote) return quote
    } else if (isExtensionPage()) {
      const quote = await fetchQuoteViaWorker()
      if (quote) return quote
    }
  } catch {
    /* use fallback */
  }

  return pickFallback()
}
