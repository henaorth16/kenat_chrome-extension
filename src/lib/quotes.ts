export interface Quote {
  text: string
  author: string
}

const FALLBACK_QUOTES: Quote[] = [
  { text: 'Discipline today, freedom tomorrow.', author: 'Unknown' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Small steps every day lead to big changes.', author: 'Unknown' },
]

function pickFallback(): Quote {
  return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
}

/** Fetch a random motivational quote (extension host permission required). */
export async function fetchRandomQuote(): Promise<Quote> {
  try {
    const res = await fetch('https://api.quotable.io/random?tags=motivational|inspirational|wisdom')
    if (res.ok) {
      const data = (await res.json()) as { content?: string; author?: string }
      if (data.content) {
        return { text: data.content, author: data.author || 'Unknown' }
      }
    }
  } catch {
    /* fall through */
  }

  try {
    const res = await fetch('https://zenquotes.io/api/random')
    if (res.ok) {
      const data = (await res.json()) as Array<{ q?: string; a?: string }>
      if (data[0]?.q) {
        return { text: data[0].q, author: data[0].a || 'Unknown' }
      }
    }
  } catch {
    /* fall through */
  }

  return pickFallback()
}
