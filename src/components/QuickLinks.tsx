import { useEffect, useState } from 'react'
import './QuickLinks.css'

interface BookmarkLink {
  title: string
  url: string
}

const MOCK_LINKS: BookmarkLink[] = [
  { title: 'Google', url: 'https://www.google.com' },
  { title: 'YouTube', url: 'https://www.youtube.com' },
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { title: 'Reddit', url: 'https://www.reddit.com' },
]

export function QuickLinks() {
  const [links, setLinks] = useState<BookmarkLink[]>(MOCK_LINKS)

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.getRecent) {
      chrome.bookmarks.getRecent(15, (results) => {
        if (results && results.length > 0) {
          // Filter bookmarks that have a valid url
          const filtered = results
            .filter((node) => node.url)
            .map((node) => {
              // Extract a clean title if empty
              let cleanTitle = node.title.trim()
              if (!cleanTitle) {
                try {
                  cleanTitle = new URL(node.url!).hostname.replace('www.', '')
                } catch {
                  cleanTitle = 'Link'
                }
              }
              return {
                title: cleanTitle,
                url: node.url!,
              }
            })
          if (filtered.length > 0) {
            setLinks(filtered.slice(0, 5))
          }
        }
      })
    }
  }, [])

  return (
    <div className="quick-links animate-in">
      {links.map((link, idx) => {
        // Truncate title if too long
        const shortTitle = link.title.length > 12 
          ? link.title.slice(0, 10) + '...'
          : link.title

        const faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(link.url)}`

        return (
          <a
            key={idx + '-' + link.url}
            href={link.url}
            className="quick-link-item panel"
            title={link.title}
          >
            <img
              src={faviconUrl}
              alt=""
              className="quick-link-favicon"
              onError={(e) => {
                // Fallback globe icon
                e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2386868b' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/%3E%3C/svg%3E`
              }}
            />
            <span className="quick-link-title">{shortTitle}</span>
          </a>
        )
      })}
    </div>
  )
}
