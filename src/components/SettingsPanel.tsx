import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { LangCode, NumeralStyle, ThemeMode } from '../lib/types'
import { uiLang, ACCENT_PRESETS } from '../lib/types'
import './SettingsPanel.css'

export function SettingsPanel() {
  const { settings, dict, updateSettings } = useApp()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const chromeAm = uiLang(settings.language) === 'am'

  useEffect(() => {
    if (!open) return

    const handleMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="settings-wrap" ref={wrapRef}>
      <button
        type="button"
        className="settings-trigger icon-btn panel"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={dict.settings}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {open && (
        <div
          className="settings-panel panel"
          role="dialog"
          aria-label={dict.settings}
        >
          <div className="settings-head">
            <h2 className={chromeAm ? 'ethiopic' : ''}>{dict.settings}</h2>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setOpen(false)}
              aria-label={dict.close}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <label className="settings-row">
            <span className={chromeAm ? 'ethiopic' : ''}>{dict.language}</span>
            <select
              className="field"
              value={settings.language}
              onChange={(e) =>
                void updateSettings({ language: e.target.value as LangCode })
              }
            >
              <option value="combo">{dict.langCombo}</option>
              <option value="en">{dict.langEnglish}</option>
              <option value="am">{dict.langAmharic}</option>
            </select>
          </label>

          <label className="settings-row">
            <span className={chromeAm ? 'ethiopic' : ''}>{dict.theme}</span>
            <select
              className="field"
              value={settings.theme}
              onChange={(e) =>
                void updateSettings({ theme: e.target.value as ThemeMode })
              }
            >
              <option value="system">{dict.themeSystem}</option>
              <option value="light">{dict.themeLight}</option>
              <option value="dark">{dict.themeDark}</option>
            </select>
          </label>

          <label className="settings-row">
            <span className={chromeAm ? 'ethiopic' : ''}>{dict.numerals}</span>
            <select
              className="field"
              value={settings.numeralStyle}
              onChange={(e) =>
                void updateSettings({
                  numeralStyle: e.target.value as NumeralStyle,
                })
              }
            >
              <option value="geez">{dict.numeralsGeez}</option>
              <option value="arabic">{dict.numeralsArabic}</option>
            </select>
          </label>

          <label className="settings-row">
            <span className={chromeAm ? 'ethiopic' : ''}>Background</span>
            <select
              className="field"
              value={settings.wallpaperMode}
              onChange={(e) =>
                void updateSettings({
                  wallpaperMode: e.target.value as 'solid' | 'unsplash',
                })
              }
            >
              <option value="solid">Solid Color</option>
              <option value="unsplash">Landscape Photo</option>
            </select>
          </label>

          <div className="settings-row">
            <span className={chromeAm ? 'ethiopic' : ''}>
              {chromeAm ? 'የቀለም አምድ' : 'Accent Color'}
            </span>
            <div className="accent-color-picker">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className={`accent-color-dot ${settings.accentColor === preset.color ? 'is-active' : ''}`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                  onClick={() => void updateSettings({ accentColor: preset.color })}
                  aria-label={`Select ${preset.name} Accent`}
                />
              ))}
            </div>
          </div>

          <label className="settings-check">
            <input
              type="checkbox"
              checked={settings.notifyCountdowns}
              onChange={(e) =>
                void updateSettings({ notifyCountdowns: e.target.checked })
              }
            />
            <span className={chromeAm ? 'ethiopic' : ''}>
              {dict.notifyCountdowns}
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
