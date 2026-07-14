import { useState } from 'react'
import { useApp } from './context/AppContext'
import { GeezClock } from './components/GeezClock'
import { SearchBar } from './components/SearchBar'
import { QuickLinks } from './components/QuickLinks'
import { WeatherChip } from './components/WeatherChip'
import { CalendarGrid } from './components/CalendarGrid'
import { AgendaPanel } from './components/AgendaPanel'
import { CountdownPanel } from './components/CountdownPanel'
import { TodoPanel } from './components/TodoPanel'
import { QuoteWidget } from './components/QuoteWidget'
import { BottomDock } from './components/BottomDock'
import { SettingsPanel } from './components/SettingsPanel'
import { getToday } from './lib/kenat'
import { cssUrl, isSafeImageUrl } from './lib/urlSafety'
import './App.css'

const WALLPAPERS = [
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2400&q=80',
  'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=2400&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80',
]

function pickDailyWallpaper(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % WALLPAPERS.length
  return WALLPAPERS[dayIndex]
}

function resolveWallpaperUrl(
  mode: 'solid' | 'unsplash' | 'custom',
  customUrl: string,
): string | undefined {
  if (mode === 'unsplash') return pickDailyWallpaper()
  if (mode === 'custom') {
    const url = customUrl.trim()
    if (!url || !isSafeImageUrl(url)) return undefined
    return url
  }
  return undefined
}

export default function App() {
  const { ready, settings } = useApp()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const ethToday = getToday().getEthiopian()
  const [viewMonth, setViewMonth] = useState({
    year: ethToday.year,
    month: ethToday.month,
  })

  if (!ready) {
    return <div className="boot" aria-busy="true" />
  }

  const wallpaperUrl = resolveWallpaperUrl(
    settings.wallpaperMode,
    settings.customWallpaperUrl,
  )
  const visibleWidgets = [
    settings.widgets.calendar,
    settings.widgets.agenda,
    settings.widgets.countdown,
    settings.widgets.todo,
  ].filter(Boolean).length

  return (
    <div className="app-container">
      {wallpaperUrl && (
        <div
          className="app-wallpaper-backdrop"
          style={{ backgroundImage: cssUrl(wallpaperUrl) }}
          aria-hidden
        />
      )}
      <div className="app-shell">
        <header className="top-band">
          <GeezClock />
          <WeatherChip />
        </header>

        <section className="hero-band">
          <SearchBar />
          <QuickLinks />
        </section>

        <section className="bottom-zone">
          {visibleWidgets > 0 && (
            <div
              className="bottom-widgets"
              style={{
                gridTemplateColumns: `repeat(${Math.min(visibleWidgets, 4)}, minmax(0, 1fr))`,
              }}
            >
              {settings.widgets.calendar && (
                <CalendarGrid
                  year={viewMonth.year}
                  month={viewMonth.month}
                  onMonthChange={setViewMonth}
                />
              )}
              {settings.widgets.agenda && (
                <AgendaPanel year={viewMonth.year} month={viewMonth.month} />
              )}
              {settings.widgets.countdown && <CountdownPanel />}
              {settings.widgets.todo && <TodoPanel />}
            </div>
          )}

          <footer className="app-footer">
            <QuoteWidget />
            <BottomDock onOpenSettings={() => setSettingsOpen(true)} />
          </footer>
        </section>
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
