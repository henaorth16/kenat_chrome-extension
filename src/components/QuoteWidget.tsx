import { useCallback, useEffect, useState } from 'react'
import { fetchRandomQuote, type Quote } from '../lib/quotes'
import { useApp } from '../context/AppContext'
import './QuoteWidget.css'

export function QuoteWidget() {
  const { dict } = useApp()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)

  const loadQuote = useCallback(async () => {
    setLoading(true)
    const next = await fetchRandomQuote()
    setQuote(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadQuote()
  }, [loadQuote])

  return (
    <button
      type="button"
      className="quote-widget animate-in"
      onClick={() => void loadQuote()}
      title={dict.newQuote}
      aria-label={dict.quoteLabel}
    >
      <svg
        className="quote-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621 1.736-.763 4.102-.664 5.482 1.078 1.19 1.495 1.025 3.6-.383 4.958-1.626 1.554-4.247 1.554-5.193-.856zm11.834 0C15.387 16.227 14.834 15 14.834 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621 1.736-.763 4.102-.664 5.482 1.078 1.19 1.495 1.025 3.6-.383 4.958-1.626 1.554-4.247 1.554-5.193-.856z" />
      </svg>
      <p className={`quote-text ${loading ? 'is-loading' : ''}`}>
        {loading ? '…' : quote ? `"${quote.text}"` : ''}
      </p>
      {quote && !loading && (
        <span className="quote-author">— {quote.author}</span>
      )}
    </button>
  )
}
