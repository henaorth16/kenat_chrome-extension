import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import { getExtensionApi, getFaviconUrl } from '../lib/extension'
import './QuickLinks.css'

interface BookmarkLink {
  title: string
  url: string
}

const STORAGE_KEY = 'kenat_quick_links'

const MOCK_LINKS: BookmarkLink[] = [
  { title: 'Google', url: 'https://www.google.com' },
  { title: 'YouTube', url: 'https://www.youtube.com' },
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { title: 'Reddit', url: 'https://www.reddit.com' },
]

async function loadLinks(): Promise<BookmarkLink[]> {
  const ext = getExtensionApi()
  if (ext?.storage?.local) {
    const result = await ext.storage.local.get(STORAGE_KEY)
    return (result[STORAGE_KEY] as BookmarkLink[]) || []
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BookmarkLink[]) : []
  } catch {
    return []
  }
}

async function saveLinks(links: BookmarkLink[]): Promise<void> {
  const ext = getExtensionApi()
  if (ext?.storage?.local) {
    await ext.storage.local.set({ [STORAGE_KEY]: links })
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
}

export function QuickLinks() {
  const { dict } = useApp()
  const [links, setLinks] = useState<BookmarkLink[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const [urlInput, setUrlInput] = useState('')

  useEffect(() => {
    if (!isAddOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAddOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isAddOpen])

  useEffect(() => {
    void loadLinks().then((saved) => {
      if (saved && saved.length > 0) {
        setLinks(saved)
      } else {
        // Prepopulate from bookmarks on first load
        const ext = getExtensionApi()
        if (ext?.bookmarks?.getRecent) {
          ext.bookmarks.getRecent(15, (results) => {
            if (results && results.length > 0) {
              const filtered = results
                .filter((node) => node.url)
                .map((node) => {
                  let cleanTitle = node.title.trim()
                  if (!cleanTitle) {
                    try {
                      cleanTitle = new URL(node.url!).hostname.replace('www.', '')
                    } catch {
                      cleanTitle = 'Link'
                    }
                  }
                  return { title: cleanTitle, url: node.url! }
                })
              const initialLinks = filtered.slice(0, 5)
              if (initialLinks.length > 0) {
                setLinks(initialLinks)
                void saveLinks(initialLinks)
              } else {
                setLinks(MOCK_LINKS)
                void saveLinks(MOCK_LINKS)
              }
            } else {
              setLinks(MOCK_LINKS)
              void saveLinks(MOCK_LINKS)
            }
          })
        } else {
          setLinks(MOCK_LINKS)
          void saveLinks(MOCK_LINKS)
        }
      }
    })
  }, [])

  const removeLink = (urlToRemove: string) => {
    const updated = links.filter((l) => l.url !== urlToRemove)
    setLinks(updated)
    void saveLinks(updated)
  }

  const addLink = (e: React.FormEvent) => {
    e.preventDefault()
    let url = urlInput.trim()
    const title = titleInput.trim()
    if (!url || !title) return

    // Prepend protocol if missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }

    const newLink: BookmarkLink = { title, url }
    const updated = [...links, newLink]
    setLinks(updated)
    void saveLinks(updated)

    // Reset inputs
    setTitleInput('')
    setUrlInput('')
    setIsAddOpen(false)
  }

  return (
    <div className="quick-links-container">
      <div className="quick-links animate-in">
        {links.map((link, idx) => {
          const shortTitle =
            link.title.length > 12
              ? link.title.slice(0, 10) + '...'
              : link.title

          const faviconUrl = getFaviconUrl(link.url)

          return (
            <div key={idx + '-' + link.url} className="quick-link-wrapper">
              <a
                href={link.url}
                className="quick-link-item panel"
                title={link.title}
              >
                <img
                  src={faviconUrl}
                  alt=""
                  className="quick-link-favicon"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2386868b' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/%3E%3C/svg%3E`
                  }}
                />
                <span className="quick-link-title">{shortTitle}</span>
              </a>
              <button
                type="button"
                className="quick-link-delete"
                onClick={() => removeLink(link.url)}
                aria-label={`Remove ${link.title}`}
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )
        })}

        <div className="quick-link-add-wrapper">
          <button
            type="button"
            className="quick-link-add-trigger"
            onClick={() => setIsAddOpen((o) => !o)}
            title={dict.addLink}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="quick-link-add-label">{dict.addLinkShort}</span>
        </div>

        {isAddOpen &&
          createPortal(
            <div
              className="widget-add-modal-overlay"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setIsAddOpen(false)
              }}
            >
              <form
                onSubmit={addLink}
                className="widget-add-form panel"
                role="dialog"
                aria-modal="true"
                aria-label={dict.addLink}
              >
                <h3 className="widget-add-form-title">{dict.addLink}</h3>
                <div className="form-fields">
                  <input
                    className="field"
                    type="text"
                    placeholder={dict.linkName}
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    required
                    autoFocus
                  />
                  <input
                    className="field"
                    type="text"
                    placeholder={dict.linkUrl}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setIsAddOpen(false)}
                  >
                    {dict.cancel}
                  </button>
                  <button type="submit" className="btn-primary">{dict.addLinkShort}</button>
                </div>
              </form>
            </div>,
            document.body,
          )}
      </div>
    </div>
  )
}
