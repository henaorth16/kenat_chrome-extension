import { type FormEvent, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { SearchEngine } from '../lib/types'
import { SEARCH_URLS, uiLang } from '../lib/types'
import './SearchBar.css'

const ENGINES: { id: SearchEngine; label: string }[] = [
  { id: 'google', label: 'Google' },
  { id: 'duckduckgo', label: 'DuckDuckGo' },
  { id: 'bing', label: 'Bing' },
  { id: 'youtube', label: 'YouTube' },
]

export function SearchBar() {
  const { settings, dict, updateSettings } = useApp()
  const [query, setQuery] = useState('')
  const chromeAm = uiLang(settings.language) === 'am'

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
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
          className={`search-input ${chromeAm ? 'ethiopic' : ''}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.searchPlaceholder}
          aria-label={dict.searchPlaceholder}
          autoFocus
        />
        <button type="submit" className="search-submit">
          Search
        </button>
      </div>
      <div
        className="search-engines"
        role="radiogroup"
        aria-label={dict.searchEngine}
      >
        {ENGINES.map((engine) => (
          <button
            key={engine.id}
            type="button"
            role="radio"
            aria-checked={settings.searchEngine === engine.id}
            className={`engine-chip ${settings.searchEngine === engine.id ? 'is-active' : ''}`}
            onClick={() => void updateSettings({ searchEngine: engine.id })}
          >
            {engine.label}
          </button>
        ))}
      </div>
    </form>
  )
}
