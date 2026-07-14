import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
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
import './App.css'

const WALLPAPERS = [
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2400&q=80',
  'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=2400&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80',
]

function pickWallpaper(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % WALLPAPERS.length
  return WALLPAPERS[dayIndex]
}

function Dashboard() {
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

  const wallpaperUrl =
    settings.wallpaperMode === 'unsplash' ? pickWallpaper() : undefined

  return (
    <div className="app-container">
      {wallpaperUrl && (
        <div
          className="app-wallpaper-backdrop"
          style={{ backgroundImage: `url(${wallpaperUrl})` }}
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
          <div className="bottom-widgets">
            <CalendarGrid
              year={viewMonth.year}
              month={viewMonth.month}
              onMonthChange={setViewMonth}
            />
            <AgendaPanel year={viewMonth.year} month={viewMonth.month} />
            <CountdownPanel />
            <TodoPanel />
          </div>

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

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  )
}
