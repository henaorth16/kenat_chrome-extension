import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import type { LangCode, NumeralStyle, ThemeMode } from '../lib/types'
import { uiLang, ACCENT_PRESETS } from '../lib/types'
import './SettingsPanel.css'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { settings, dict, updateSettings } = useApp()
  const panelRef = useRef<HTMLDivElement>(null)
  const chromeAm = uiLang(settings.language) === 'am'

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <>
      <div
        className="settings-modal-overlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      />
      <div
        className="settings-panel panel settings-modal"
        role="dialog"
        aria-label={dict.settings}
        ref={panelRef}
      >
        <div className="settings-head">
          <h2 className={chromeAm ? 'ethiopic' : ''}>{dict.settings}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label={dict.close}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
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
          <span className={chromeAm ? 'ethiopic' : ''}>{dict.background}</span>
          <select
            className="field"
            value={settings.wallpaperMode}
            onChange={(e) =>
              void updateSettings({
                wallpaperMode: e.target.value as 'solid' | 'unsplash',
              })
            }
          >
            <option value="solid">{dict.backgroundSolid}</option>
            <option value="unsplash">{dict.backgroundPhoto}</option>
          </select>
        </label>

        <div className="settings-row">
          <span className={chromeAm ? 'ethiopic' : ''}>{dict.accentColor}</span>
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
    </>,
    document.body,
  )
}
