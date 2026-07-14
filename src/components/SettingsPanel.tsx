import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import type {
  ClockNumeralStyle,
  LangCode,
  NumeralStyle,
  ThemeMode,
  WallpaperMode,
  WidgetVisibility,
} from '../lib/types'
import { uiLang, ACCENT_PRESETS } from '../lib/types'
import './SettingsPanel.css'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

type SettingsTab = 'general' | 'appearance' | 'widgets'

function isPresetAccent(color: string): boolean {
  return ACCENT_PRESETS.some((p) => p.color.toLowerCase() === color.trim().toLowerCase())
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { settings, dict, updateSettings } = useApp()
  const panelRef = useRef<HTMLDivElement>(null)
  const chromeAm = uiLang(settings.language) === 'am'
  const [tab, setTab] = useState<SettingsTab>('general')
  const [wallpaperUrlDraft, setWallpaperUrlDraft] = useState(settings.customWallpaperUrl)
  const [customAccentDraft, setCustomAccentDraft] = useState(
    isPresetAccent(settings.accentColor) ? '#30b0b8' : settings.accentColor,
  )

  useEffect(() => {
    if (!open) return
    setWallpaperUrlDraft(settings.customWallpaperUrl)
    setCustomAccentDraft(
      isPresetAccent(settings.accentColor) ? settings.accentColor : settings.accentColor,
    )
  }, [open, settings.customWallpaperUrl, settings.accentColor])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const setWidget = (key: keyof WidgetVisibility, value: boolean) => {
    void updateSettings({
      widgets: { ...settings.widgets, [key]: value },
    })
  }

  const applyCustomWallpaper = () => {
    const url = wallpaperUrlDraft.trim()
    void updateSettings({
      customWallpaperUrl: url,
      wallpaperMode: url
        ? 'custom'
        : settings.wallpaperMode === 'custom'
          ? 'solid'
          : settings.wallpaperMode,
    })
  }

  const applyCustomAccent = (hex: string) => {
    const next = hex.trim()
    if (!/^#?[0-9a-fA-F]{6}$/.test(next)) return
    const color = next.startsWith('#') ? next : `#${next}`
    setCustomAccentDraft(color)
    void updateSettings({ accentColor: color })
  }

  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: 'general', label: dict.settingsTabGeneral },
    { id: 'appearance', label: dict.settingsTabAppearance },
    { id: 'widgets', label: dict.settingsTabWidgets },
  ]

  return createPortal(
    <>
      <div
        className="settings-modal-overlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      />
      <div
        className="settings-panel panel"
        role="dialog"
        aria-modal="true"
        aria-label={dict.settings}
        ref={panelRef}
      >
        <header className="settings-head">
          <h2 className={chromeAm ? 'ethiopic' : ''}>{dict.settings}</h2>
          <button
            type="button"
            className="icon-btn settings-close"
            onClick={onClose}
            aria-label={dict.close}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="settings-tabs" role="tablist" aria-label={dict.settings}>
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`settings-tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`settings-panel-${item.id}`}
              className={`settings-tab ${tab === item.id ? 'is-active' : ''} ${chromeAm ? 'ethiopic' : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="settings-body">
          {tab === 'general' && (
            <div
              className="settings-tab-panel"
              role="tabpanel"
              id="settings-panel-general"
              aria-labelledby="settings-tab-general"
            >
              <div className="settings-grid">
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

          {tab === 'appearance' && (
            <div
              className="settings-tab-panel"
              role="tabpanel"
              id="settings-panel-appearance"
              aria-labelledby="settings-tab-appearance"
            >
              <div className="settings-grid">
                <label className="settings-row">
                  <span className={chromeAm ? 'ethiopic' : ''}>{dict.background}</span>
                  <select
                    className="field"
                    value={settings.wallpaperMode}
                    onChange={(e) =>
                      void updateSettings({
                        wallpaperMode: e.target.value as WallpaperMode,
                      })
                    }
                  >
                    <option value="solid">{dict.backgroundSolid}</option>
                    <option value="unsplash">{dict.backgroundPhoto}</option>
                    <option value="custom">{dict.backgroundCustom}</option>
                  </select>
                </label>

                <label className="settings-row">
                  <span className={chromeAm ? 'ethiopic' : ''}>{dict.clockNumerals}</span>
                  <select
                    className="field"
                    value={settings.clockNumeralStyle}
                    onChange={(e) =>
                      void updateSettings({
                        clockNumeralStyle: e.target.value as ClockNumeralStyle,
                      })
                    }
                  >
                    <option value="geez">{dict.clockNumeralsGeez}</option>
                    <option value="arabic">{dict.clockNumeralsArabic}</option>
                    <option value="roman">{dict.clockNumeralsRoman}</option>
                  </select>
                </label>
              </div>

              {settings.wallpaperMode === 'custom' && (
                <label className="settings-row">
                  <span className={chromeAm ? 'ethiopic' : ''}>{dict.backgroundImageUrl}</span>
                  <div className="settings-inline-fields">
                    <input
                      className="field"
                      type="url"
                      placeholder="https://…"
                      value={wallpaperUrlDraft}
                      onChange={(e) => setWallpaperUrlDraft(e.target.value)}
                      onBlur={applyCustomWallpaper}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          applyCustomWallpaper()
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn-primary settings-apply-btn"
                      onClick={applyCustomWallpaper}
                    >
                      {dict.save}
                    </button>
                  </div>
                </label>
              )}

              <div className="settings-row">
                <span className={chromeAm ? 'ethiopic' : ''}>{dict.accentColor}</span>
                <div className="accent-color-picker">
                  {ACCENT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className={`accent-color-dot ${settings.accentColor.toLowerCase() === preset.color.toLowerCase() ? 'is-active' : ''}`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                      onClick={() => void updateSettings({ accentColor: preset.color })}
                      aria-label={`Select ${preset.name} Accent`}
                    />
                  ))}
                  <label
                    className={`accent-color-custom ${!isPresetAccent(settings.accentColor) ? 'is-active' : ''}`}
                    title={dict.accentCustom}
                  >
                    <input
                      type="color"
                      value={
                        /^#[0-9a-fA-F]{6}$/.test(customAccentDraft)
                          ? customAccentDraft
                          : '#30b0b8'
                      }
                      onChange={(e) => applyCustomAccent(e.target.value)}
                      aria-label={dict.accentCustom}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {tab === 'widgets' && (
            <div
              className="settings-tab-panel"
              role="tabpanel"
              id="settings-panel-widgets"
              aria-labelledby="settings-tab-widgets"
            >
              <p className={`settings-hint ${chromeAm ? 'ethiopic' : ''}`}>
                {dict.widgetsVisibility}
              </p>
              <div className="settings-widget-grid">
                <label className="settings-widget-card">
                  <input
                    type="checkbox"
                    checked={settings.widgets.calendar}
                    onChange={(e) => setWidget('calendar', e.target.checked)}
                  />
                  <span className={chromeAm ? 'ethiopic' : ''}>{dict.showCalendar}</span>
                </label>
                <label className="settings-widget-card">
                  <input
                    type="checkbox"
                    checked={settings.widgets.agenda}
                    onChange={(e) => setWidget('agenda', e.target.checked)}
                  />
                  <span className={chromeAm ? 'ethiopic' : ''}>{dict.showAgenda}</span>
                </label>
                <label className="settings-widget-card">
                  <input
                    type="checkbox"
                    checked={settings.widgets.countdown}
                    onChange={(e) => setWidget('countdown', e.target.checked)}
                  />
                  <span className={chromeAm ? 'ethiopic' : ''}>{dict.showCountdown}</span>
                </label>
                <label className="settings-widget-card">
                  <input
                    type="checkbox"
                    checked={settings.widgets.todo}
                    onChange={(e) => setWidget('todo', e.target.checked)}
                  />
                  <span className={chromeAm ? 'ethiopic' : ''}>{dict.showTodo}</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
