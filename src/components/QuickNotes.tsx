import { useEffect, useState } from 'react'
import './QuickNotes.css'

const STORAGE_KEY = 'kenat_scratchpad'

export function QuickNotes() {
  const [content, setContent] = useState('')

  useEffect(() => {
    // Load saved notes
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      void chrome.storage.local.get(STORAGE_KEY).then((res) => {
        if (res[STORAGE_KEY]) {
          setContent(res[STORAGE_KEY] as string)
        }
      })
    } else {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setContent(saved)
      }
    }
  }, [])

  const handleChange = (val: string) => {
    setContent(val)
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      void chrome.storage.local.set({ [STORAGE_KEY]: val })
    } else {
      localStorage.setItem(STORAGE_KEY, val)
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="notes-panel panel animate-in">
      <div className="panel-header-clean">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
        <span>Notes</span>
      </div>

      <textarea
        className="notes-textarea"
        placeholder="Type a quick note..."
        value={content}
        onChange={(e) => handleChange(e.target.value)}
      />

      <div className="notes-footer">
        <span>{wordCount} words</span>
      </div>
    </div>
  )
}
