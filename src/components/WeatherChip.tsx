import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import {
  convertTemp,
  fetchWeather,
  searchCities,
  weatherLabel,
  type WeatherSnapshot,
} from '../lib/weather'
import type { WeatherLocation } from '../lib/types'
import { uiLang } from '../lib/types'
import './WeatherChip.css'

function WeatherIcon({ code, size = 32 }: { code: number; size?: number }) {
  // Sunny / Clear
  if (code === 0 || code === 1) {
    return (
      <svg className="weather-icon-svg sunny animate-pulse-slow" viewBox="0 0 24 24" width={size} height={size}>
        <circle cx="12" cy="12" r="5" fill="var(--gold)" />
        <path
          d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke="var(--gold)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  // Partly Cloudy / Cloudy / Overcast
  if (code === 2 || code === 3) {
    return (
      <svg className="weather-icon-svg cloudy" viewBox="0 0 24 24" width={size} height={size}>
        <path d="M17.5 19A4.5 4.5 0 0 0 22 14.5c0-2.3-1.7-4.2-4-4.5A7 7 0 0 0 5 11c0 3 .5 4 2.5 5.5.5.3 1 .5 1.5.5h8.5z" fill="var(--label-secondary)" opacity="0.15" />
        <path d="M19.5 15a3 3 0 0 0-3-3H16a5 5 0 0 0-9.5-2A4 4 0 0 0 3 14a4 4 0 0 0 4 4h9.5a3 3 0 0 0 3-3z" fill="none" stroke="var(--label)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {code === 2 && (
          <circle cx="15" cy="8" r="3.2" fill="var(--gold)" />
        )}
      </svg>
    )
  }
  // Fog
  if (code === 45 || code === 48) {
    return (
      <svg className="weather-icon-svg fog" viewBox="0 0 24 24" width={size} height={size} stroke="var(--label-secondary)" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17 10a5 5 0 0 0-9.5-2A4 4 0 0 0 4 12" fill="none" />
        <path d="M5 15h14M8 18h8M6 21h12" />
      </svg>
    )
  }
  // Rain / Drizzle / Showers
  if (code === 51 || code === 61 || code === 63 || code === 65 || code === 80) {
    return (
      <svg className="weather-icon-svg rainy" viewBox="0 0 24 24" width={size} height={size}>
        <path d="M19.5 13a3.5 3.5 0 0 0-3.5-3.5h-.5A5.5 5.5 0 0 0 6 11a4.5 4.5 0 0 0 1.5 8.8h12a3.5 3.5 0 0 0 0-6.8z" fill="none" stroke="var(--label)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 19l-1 2.5M12 18l-1 3M15 19l-1 2.5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  // Snow
  if (code === 71) {
    return (
      <svg className="weather-icon-svg snowy" viewBox="0 0 24 24" width={size} height={size} stroke="var(--label)" strokeWidth="1.8" strokeLinecap="round">
        <path d="M19.5 13a3.5 3.5 0 0 0-3.5-3.5h-.5A5.5 5.5 0 0 0 6 11a4.5 4.5 0 0 0 1.5 8.8h12a3.5 3.5 0 0 0 0-6.8z" fill="none" strokeLinejoin="round" />
        <path d="M8 18h.01M12 19h.01M16 18h.01M10 21h.01M14 21h.01" strokeWidth="2.5" />
      </svg>
    )
  }
  // Thunderstorm
  if (code === 95) {
    return (
      <svg className="weather-icon-svg thunderstorm" viewBox="0 0 24 24" width={size} height={size}>
        <path d="M19.5 13a3.5 3.5 0 0 0-3.5-3.5h-.5A5.5 5.5 0 0 0 6 11a4.5 4.5 0 0 0 1.5 8.8h12a3.5 3.5 0 0 0 0-6.8z" fill="none" stroke="var(--label)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 16l-2 3.5h3L13 23" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg className="weather-icon-svg fallback" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="var(--label-secondary)" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}

export function WeatherChip() {
  const { settings, dict, updateSettings } = useApp()
  const chromeLang = uiLang(settings.language)
  const chromeAm = chromeLang === 'am'
  
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null)
  const [error, setError] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WeatherLocation[]>([])

  useEffect(() => {
    let cancelled = false
    setError(false)
    fetchWeather(settings.weatherLocation)
      .then((w) => {
        if (!cancelled) setWeather(w)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [settings.weatherLocation])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const id = window.setTimeout(() => {
      void searchCities(query).then(setResults)
    }, 280)
    return () => window.clearTimeout(id)
  }, [query])

  const temp = weather
    ? convertTemp(weather.temperature, settings.tempUnit)
    : null
  const feels = weather
    ? convertTemp(weather.feelsLike, settings.tempUnit)
    : null
  const low = weather
    ? convertTemp(weather.low, settings.tempUnit)
    : null
  const high = weather
    ? convertTemp(weather.high, settings.tempUnit)
    : null
  const unit = settings.tempUnit === 'celsius' ? '°C' : '°F'

  // Format hour label (e.g. "14:00" -> "2 PM")
  const formatHour = (isoString: string) => {
    try {
      const date = new Date(isoString)
      let hours = date.getHours()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12
      hours = hours ? hours : 12 // the hour '0' should be '12'
      return `${hours} ${ampm}`
    } catch {
      return ''
    }
  }

  // Format daily date to weekday name (e.g. "2026-07-14" -> "Tue")
  const formatDay = (dateString: string, idx: number) => {
    if (idx === 0) return chromeAm ? 'ዛሬ' : 'Today'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(chromeLang === 'am' ? 'am-ET' : 'en-US', { weekday: 'short' })
    } catch {
      return ''
    }
  }

  return (
    <div className="weather-wrap animate-in">
      <button
        type="button"
        className="weather-card panel"
        onClick={() => setIsDrawerOpen(true)}
      >
        {error && <span className="weather-err">{dict.location}</span>}
        {!error && !weather && <span className="weather-loading">…</span>}
        {weather && temp !== null && (
          <>
            <div className="weather-temp-col">
              <strong className="weather-temp">
                {temp}<span>{unit}</span>
              </strong>
              <div className="weather-extremes">
                <span>H: {high}°</span>
                <span>L: {low}°</span>
              </div>
            </div>
            <div className="weather-detail-col">
              <div className="weather-desc-row">
                <WeatherIcon code={weather.weatherCode} size={34} />
                <div className="weather-desc-meta">
                  <span className="weather-loc">{settings.weatherLocation.name} 📍</span>
                </div>
              </div>
            </div>
          </>
        )}
      </button>

      {/* Drawer Overlay Backdrop & Drawer rendered via React Portal to escape parent animation transforms */}
      {createPortal(
        <>
          {isDrawerOpen && (
            <div 
              className="weather-drawer-overlay" 
              onClick={() => {
                setIsDrawerOpen(false)
                setQuery('')
              }}
            />
          )}

          <div className={`weather-drawer panel ${isDrawerOpen ? 'is-open' : ''}`}>
            <header className="weather-drawer-head">
              <div className="drawer-title-wrap">
                <h2 className="weather-loc-title">{settings.weatherLocation.name}</h2>
                {weather && (
                  <span className={`weather-drawer-cond ${chromeAm ? 'ethiopic' : ''}`}>
                    {weatherLabel(weather.weatherCode, chromeLang)}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="icon-btn close-btn"
                onClick={() => {
                  setIsDrawerOpen(false)
                  setQuery('')
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </header>

            {weather && temp !== null && feels !== null && (
              <div className="weather-drawer-body">
                {/* Giant Temp Display */}
                <div className="weather-drawer-hero">
                  <WeatherIcon code={weather.weatherCode} size={64} />
                  <div className="drawer-hero-temp">
                    <strong>{temp}°</strong>
                    <p>
                      H: {high}° &nbsp;&nbsp; L: {low}°
                    </p>
                  </div>
                </div>

                {/* Quick Metrics Grid */}
                <div className="weather-metrics-grid">
                  <div className="metric-card panel">
                    <span>{dict.feelsLike}</span>
                    <strong>{feels}°</strong>
                  </div>
                  <div className="metric-card panel">
                    <span>Humidity</span>
                    <strong>{weather.humidity}%</strong>
                  </div>
                  <div className="metric-card panel">
                    <span>Wind</span>
                    <strong>{Math.round(weather.windSpeed)} km/h</strong>
                  </div>
                </div>

                {/* Hourly Forecast */}
                <div className="drawer-section">
                  <span className="drawer-section-title">Hourly Forecast</span>
                  <div className="hourly-forecast-row">
                    {weather.hourly.map((h, idx) => (
                      <div key={idx} className="hourly-chip panel">
                        <span className="hourly-time">{formatHour(h.time)}</span>
                        <WeatherIcon code={h.weatherCode} size={20} />
                        <span className="hourly-temp">{convertTemp(h.temp, settings.tempUnit)}°</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5-Day Forecast */}
                <div className="drawer-section">
                  <span className="drawer-section-title">5-Day Forecast</span>
                  <div className="daily-forecast-list">
                    {weather.daily.map((d, idx) => (
                      <div key={idx} className="daily-row panel">
                        <span className="daily-day-name ethiopic">{formatDay(d.date, idx)}</span>
                        <WeatherIcon code={d.weatherCode} size={22} />
                        <div className="daily-range">
                          <span className="daily-low">{convertTemp(d.min, settings.tempUnit)}°</span>
                          <div className="daily-progress-bar" />
                          <span className="daily-high">{convertTemp(d.max, settings.tempUnit)}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Search Bar */}
                <div className="drawer-section location-search-section">
                  <span className="drawer-section-title">{dict.location}</span>
                  <input
                    className="field search-city-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={dict.searchCity}
                  />
                  {results.length > 0 && (
                    <ul className="drawer-search-results panel">
                      {results.map((r) => (
                        <li key={`${r.name}-${r.latitude}`}>
                          <button
                            type="button"
                            onClick={() => {
                              void updateSettings({ weatherLocation: r })
                              setQuery('')
                              setResults([])
                            }}
                          >
                            {r.name}
                            {r.country ? `, ${r.country}` : ''}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <footer className="weather-drawer-footer">
              <div className="weather-units">
                <button
                  type="button"
                  className={settings.tempUnit === 'celsius' ? 'btn-primary' : 'btn-ghost'}
                  onClick={() => void updateSettings({ tempUnit: 'celsius' })}
                >
                  °C
                </button>
                <button
                  type="button"
                  className={settings.tempUnit === 'fahrenheit' ? 'btn-primary' : 'btn-ghost'}
                  onClick={() => void updateSettings({ tempUnit: 'fahrenheit' })}
                >
                  °F
                </button>
              </div>
            </footer>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
