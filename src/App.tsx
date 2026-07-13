import { useEffect } from 'react'
import { useApp } from './context/AppContext'
import { CalendarGrid } from './components/CalendarGrid'
import { CountdownPanel } from './components/CountdownPanel'
import { GeezClock } from './components/GeezClock'
import { HolidayList } from './components/HolidayList'
import { SearchBar } from './components/SearchBar'
import { SettingsPanel } from './components/SettingsPanel'
import { TodoPanel } from './components/TodoPanel'
import { WeatherChip } from './components/WeatherChip'
import { QuickLinks } from './components/QuickLinks'
import './App.css'

const WALLPAPERS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Tropical Beach
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80', // Misty Forest
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1920&q=80', // Mountain Sunset
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1920&q=80', // Forest Walkway
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80', // Grassy Mountain Valley
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80', // Yosemite Valley
  'https://images.unsplash.com/photo-1433832597046-4f10e10ac764?auto=format&fit=crop&w=1920&q=80', // Sand Dunes Sunrise
  'https://images.unsplash.com/photo-1472214222541-d510753a4907?auto=format&fit=crop&w=1920&q=80', // Green Hills
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80', // Volcanic Lake
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1920&q=80', // Ocean Sunset
]

export default function App() {
  const { ready, settings } = useApp()

  useEffect(() => {
    if (!ready) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')

      if (isInputFocused) return

      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        const searchInput = document.getElementById('search-input') as HTMLInputElement | null
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [ready])

  if (!ready) {
    return <div className="boot" aria-busy="true" />
  }

  const dayOfMonth = new Date().getDate()
  const wallpaperUrl = WALLPAPERS[dayOfMonth % WALLPAPERS.length]

  return (
    <div className={`app-container ${settings.wallpaperMode === 'unsplash' ? 'has-wallpaper' : ''}`}>
      {settings.wallpaperMode === 'unsplash' && (
        <div
          className="app-wallpaper-backdrop"
          style={{ backgroundImage: `url(${wallpaperUrl})` }}
        />
      )}
      
      <div className="app-shell">
        <header className="top-band">
          <GeezClock />
          <div className="top-band-end">
            <WeatherChip />
            <SettingsPanel />
          </div>
        </header>

        <SearchBar />

        <QuickLinks />

        <section className="workspace">
          <CalendarGrid />
          <div className="workspace-center">
            <HolidayList />
          </div>
          <div className="workspace-side">
            <CountdownPanel />
            <TodoPanel />
          </div>
        </section>
      </div>
    </div>
  )
}
