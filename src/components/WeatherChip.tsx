import { useEffect, useState } from 'react'
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

function WeatherIcon({ code }: { code: number }) {
  // Sunny / Clear
  if (code === 0 || code === 1) {
    return (
      <svg className="weather-icon-svg sunny animate-pulse-slow" viewBox="0 0 24 24" width="32" height="32">
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
      <svg className="weather-icon-svg cloudy" viewBox="0 0 24 24" width="32" height="32">
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
      <svg className="weather-icon-svg fog" viewBox="0 0 24 24" width="32" height="32" stroke="var(--label-secondary)" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17 10a5 5 0 0 0-9.5-2A4 4 0 0 0 4 12" fill="none" />
        <path d="M5 15h14M8 18h8M6 21h12" />
      </svg>
    )
  }
  // Rain / Drizzle / Showers
  if (code === 51 || code === 61 || code === 63 || code === 65 || code === 80) {
    return (
      <svg className="weather-icon-svg rainy" viewBox="0 0 24 24" width="32" height="32">
        <path d="M19.5 13a3.5 3.5 0 0 0-3.5-3.5h-.5A5.5 5.5 0 0 0 6 11a4.5 4.5 0 0 0 1.5 8.8h12a3.5 3.5 0 0 0 0-6.8z" fill="none" stroke="var(--label)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 19l-1 2.5M12 18l-1 3M15 19l-1 2.5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  // Snow
  if (code === 71) {
    return (
      <svg className="weather-icon-svg snowy" viewBox="0 0 24 24" width="32" height="32" stroke="var(--label)" strokeWidth="1.8" strokeLinecap="round">
        <path d="M19.5 13a3.5 3.5 0 0 0-3.5-3.5h-.5A5.5 5.5 0 0 0 6 11a4.5 4.5 0 0 0 1.5 8.8h12a3.5 3.5 0 0 0 0-6.8z" fill="none" strokeLinejoin="round" />
        <path d="M8 18h.01M12 19h.01M16 18h.01M10 21h.01M14 21h.01" strokeWidth="2.5" />
      </svg>
    )
  }
  // Thunderstorm
  if (code === 95) {
    return (
      <svg className="weather-icon-svg thunderstorm" viewBox="0 0 24 24" width="32" height="32">
        <path d="M19.5 13a3.5 3.5 0 0 0-3.5-3.5h-.5A5.5 5.5 0 0 0 6 11a4.5 4.5 0 0 0 1.5 8.8h12a3.5 3.5 0 0 0 0-6.8z" fill="none" stroke="var(--label)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 16l-2 3.5h3L13 23" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg className="weather-icon-svg fallback" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--label-secondary)" strokeWidth="1.8">
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
  const [open, setOpen] = useState(false)
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

  return (
    <div className="weather-wrap animate-in">
      <button
        type="button"
        className="weather-card panel"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {error && <span className="weather-err">{dict.location}</span>}
        {!error && !weather && <span className="weather-loading">…</span>}
        {weather && temp !== null && feels !== null && (
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
                <WeatherIcon code={weather.weatherCode} />
                <div className="weather-desc-meta">
                  <p className={`weather-cond ${chromeAm ? 'ethiopic' : ''}`}>
                    {weatherLabel(weather.weatherCode, chromeLang)}
                  </p>
                  <span className="weather-loc">{settings.weatherLocation.name}</span>
                </div>
              </div>
              <div className="humidity-track-wrap">
                <div className="humidity-track" aria-hidden>
                  <div
                    className="humidity-fill"
                    style={{ width: `${Math.min(100, weather.humidity)}%` }}
                  />
                </div>
                <p className="weather-sub">
                  {dict.feelsLike} {feels}{unit} · {weather.humidity}%
                </p>
              </div>
            </div>
          </>
        )}
      </button>

      {open && (
        <div className="weather-popover panel" role="dialog">
          <div className="weather-popover-head">
            <strong className={chromeAm ? 'ethiopic' : ''}>{dict.location}</strong>
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
          <input
            className="field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.searchCity}
          />
          <ul className="weather-results">
            {results.map((r) => (
              <li key={`${r.name}-${r.latitude}`}>
                <button
                  type="button"
                  onClick={() => {
                    void updateSettings({ weatherLocation: r })
                    setOpen(false)
                    setQuery('')
                  }}
                >
                  {r.name}
                  {r.country ? `, ${r.country}` : ''}
                </button>
              </li>
            ))}
          </ul>
          <div className="weather-units">
            <button
              type="button"
              className={
                settings.tempUnit === 'celsius' ? 'btn-primary' : 'btn-ghost'
              }
              onClick={() => void updateSettings({ tempUnit: 'celsius' })}
            >
              °C
            </button>
            <button
              type="button"
              className={
                settings.tempUnit === 'fahrenheit' ? 'btn-primary' : 'btn-ghost'
              }
              onClick={() => void updateSettings({ tempUnit: 'fahrenheit' })}
            >
              °F
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

