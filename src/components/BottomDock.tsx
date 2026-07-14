import { useApp } from '../context/AppContext'
import { ACCENT_PRESETS } from '../lib/types'
import './BottomDock.css'

interface BottomDockProps {
  onOpenSettings: () => void
}

export function BottomDock({ onOpenSettings }: BottomDockProps) {
  const { settings, dict, updateSettings } = useApp()

  const cycleAccent = () => {
    const idx = ACCENT_PRESETS.findIndex((p) => p.color === settings.accentColor)
    const next = ACCENT_PRESETS[(idx + 1) % ACCENT_PRESETS.length]
    void updateSettings({ accentColor: next.color })
  }

  const toggleWallpaper = () => {
    const modes = (
      settings.customWallpaperUrl.trim()
        ? ['solid', 'unsplash', 'custom']
        : ['solid', 'unsplash']
    ) as Array<'solid' | 'unsplash' | 'custom'>
    const idx = Math.max(0, modes.indexOf(settings.wallpaperMode))
    const next = modes[(idx + 1) % modes.length]
    void updateSettings({ wallpaperMode: next })
  }

  return (
    <nav className="bottom-dock animate-in" aria-label={dict.quickActions}>
      <button
        type="button"
        className="dock-btn panel"
        onClick={cycleAccent}
        title={dict.cycleAccent}
        aria-label={dict.cycleAccent}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </button>

      <button
        type="button"
        className={`dock-btn panel ${settings.wallpaperMode !== 'solid' ? 'is-active' : ''}`}
        onClick={toggleWallpaper}
        title={dict.toggleWallpaper}
        aria-label={dict.toggleWallpaper}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </button>

      <button
        type="button"
        className="dock-btn panel"
        onClick={onOpenSettings}
        title={dict.settings}
        aria-label={dict.settings}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>
    </nav>
  )
}
