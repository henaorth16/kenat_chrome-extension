import { useEffect, useState, useRef } from 'react'
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

function getFaviconUrl(url: string): string {
  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`
  }
  return `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(url)}`
}

async function loadLinks(): Promise<BookmarkLink[]> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get(STORAGE_KEY)
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
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [STORAGE_KEY]: links })
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
}

export function QuickLinks() {
  const [links, setLinks] = useState<BookmarkLink[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!isAddOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const trigger = document.querySelector('.quick-link-add-trigger')
      if (
        formRef.current &&
        !formRef.current.contains(e.target as Node) &&
        trigger &&
        !trigger.contains(e.target as Node)
      ) {
        setIsAddOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isAddOpen])

  useEffect(() => {
    void loadLinks().then((saved) => {
      if (saved && saved.length > 0) {
        setLinks(saved)
      } else {
        // Prepopulate from bookmarks on first load
        if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.getRecent) {
          chrome.bookmarks.getRecent(15, (results) => {
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
            title="Add Link"
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
          <span className="quick-link-add-label">Add</span>

          {isAddOpen && (
            <form ref={formRef} onSubmit={addLink} className="quick-links-form panel animate-in">
              <div className="form-fields">
                <input
                  className="field"
                  type="text"
                  placeholder="Name"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  required
                  autoFocus
                />
                <input
                  className="field"
                  type="text"
                  placeholder="URL (e.g., google.com)"
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
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
