import { type FormEvent, useState } from 'react'
import { useApp } from '../context/AppContext'
import { SEARCH_URLS, uiLang } from '../lib/types'
import './SearchBar.css'

export function SearchBar() {
  const { settings, dict } = useApp()
  const [query, setQuery] = useState('')
  const chromeAm = uiLang(settings.language) === 'am'

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    if (/^https?:\/\//i.test(q) || /^[\w-]+(\.[\w-]+)+/.test(q)) {
      const url = /^https?:\/\//i.test(q) ? q : `https://${q}`
      window.location.href = url
      return
    }

    window.location.href = SEARCH_URLS[settings.searchEngine](q)
  }

  return (
    <form className="search-bar animate-in" onSubmit={onSubmit} role="search">
      <div className="search-shell">
        <svg
          className="search-icon"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M20 20l-3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <input
          id="search-input"
          className={`search-input ${chromeAm ? 'ethiopic' : ''}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.searchPlaceholder}
          aria-label={dict.searchPlaceholder}
          autoFocus
        />
        <button type="submit" className="search-submit" aria-label="Search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </form>
  )
}
