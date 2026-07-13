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

export default function App() {
  const { ready } = useApp()

  if (!ready) {
    return <div className="boot" aria-busy="true" />
  }

  return (
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
        <HolidayList />
        <div className="workspace-side">
          <CountdownPanel />
          <TodoPanel />
        </div>
      </section>
    </div>
  )
}
