import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import { requestSearchSuggestions } from '../lib/searchSuggest'
import { SEARCH_URLS, uiLang } from '../lib/types'
import './SearchBar.css'

export function SearchBar() {
  const { settings, dict } = useApp()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [menuBox, setMenuBox] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const requestId = useRef(0)
  const listId = useId()
  const chromeAm = uiLang(settings.language) === 'am'

  const go = (raw: string) => {
    const q = raw.trim()
    if (!q) return

    if (/^https?:\/\//i.test(q) || /^[\w-]+(\.[\w-]+)+/.test(q)) {
      const url = /^https?:\/\//i.test(q) ? q : `https://${q}`
      window.location.href = url
      return
    }

    window.location.href = SEARCH_URLS[settings.searchEngine](q)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      go(suggestions[activeIndex])
      return
    }
    go(query)
  }

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setSuggestions([])
      setActiveIndex(-1)
      setOpen(false)
      return
    }

    const id = ++requestId.current
    const timer = window.setTimeout(() => {
      void requestSearchSuggestions(settings.searchEngine, q).then((items) => {
        if (id !== requestId.current) return
        setSuggestions(items)
        setActiveIndex(-1)
        setOpen(items.length > 0)
      })
    }, 120)

    return () => {
      window.clearTimeout(timer)
    }
  }, [query, settings.searchEngine])

  const showSuggestions = open && suggestions.length > 0

  const updateMenuBox = () => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setMenuBox({
      top: rect.bottom - 1,
      left: rect.left,
      width: rect.width,
    })
  }

  useLayoutEffect(() => {
    if (!showSuggestions) {
      setMenuBox(null)
      return
    }
    updateMenuBox()
    const onReposition = () => updateMenuBox()
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [showSuggestions, suggestions.length, query])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (wrapRef.current?.contains(target)) return
      if ((target as HTMLElement).closest?.('.search-suggestions')) return
      setOpen(false)
      setActiveIndex(-1)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
      return
    }

    if (!suggestions.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (i + 1) % suggestions.length)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    }
  }

  return (
    <form className="search-bar animate-in" onSubmit={onSubmit} role="search">
      <div
        className={`search-combo ${showSuggestions ? 'has-suggestions' : ''}`}
        ref={wrapRef}
      >
        <div className={`search-shell ${showSuggestions ? 'is-open' : ''}`}>
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
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => {
              if (suggestions.length) setOpen(true)
            }}
            onKeyDown={onKeyDown}
            placeholder={dict.searchPlaceholder}
            aria-label={dict.searchPlaceholder}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={showSuggestions}
            aria-activedescendant={
              activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
            }
            role="combobox"
            autoComplete="off"
            autoFocus
          />
          <button type="submit" className="search-submit" aria-label="Search">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {showSuggestions &&
        menuBox &&
        createPortal(
          <ul
            className="search-suggestions"
            id={listId}
            role="listbox"
            style={{
              top: menuBox.top,
              left: menuBox.left,
              width: menuBox.width,
            }}
          >
            {suggestions.map((item, index) => (
              <li key={`${item}-${index}`} role="presentation">
                <button
                  type="button"
                  id={`${listId}-opt-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`search-suggestion ${index === activeIndex ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => go(item)}
                >
                  <svg
                    className="search-suggestion-icon"
                    width="15"
                    height="15"
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
                  <span className={chromeAm ? 'ethiopic' : ''}>{item}</span>
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </form>
  )
}
