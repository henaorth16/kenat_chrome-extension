import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  formatEthTime,
  formatToday,
  clockHourLabels,
  getEthiopianTimeNow,
} from '../lib/kenat'
import { calLang } from '../lib/types'
import './GeezClock.css'

function getGreeting(hour: number, useAmharic: boolean): string {
  if (hour >= 5 && hour < 12) return useAmharic ? 'እንደምን አደሩ 👋' : 'Good morning 👋'
  if (hour >= 12 && hour < 17) return useAmharic ? 'እንደምን ዋሉ 👋' : 'Good afternoon 👋'
  if (hour >= 17 && hour < 21) return useAmharic ? 'እንደምን አመሹ 👋' : 'Good evening 👋'
  return useAmharic ? 'ሰላም 👋' : 'Good night 👋'
}

export function GeezClock() {
  const { settings } = useApp()
  const useGeez = settings.numeralStyle === 'geez'
  const contentLang = calLang(settings.language)
  const greetingAm = contentLang === 'am'
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const ethTime = useMemo(() => {
    void now
    return getEthiopianTimeNow()
  }, [now])

  const dateInfo = useMemo(() => {
    void now
    return formatToday(contentLang, useGeez)
  }, [contentLang, useGeez, now])

  const gregorianDisplay = useMemo(() => {
    void now
    // GC month/date stay English in combo; Amharic only when language is fully Amharic
    const locale = settings.language === 'am' ? 'am-ET' : 'en-US'
    return now.toLocaleDateString(locale, {
      weekday: undefined,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [now, settings.language])

  const labels = useMemo(
    () => clockHourLabels(settings.clockNumeralStyle),
    [settings.clockNumeralStyle],
  )

  const hour = ethTime.hour % 12
  const minute = ethTime.minute
  const second = now.getSeconds()
  const minuteAngle = minute * 6 + second * 0.1
  const hourAngle = hour * 30 + minute * 0.5
  const secondAngle = second * 6
  const timeLabel = formatEthTime(ethTime, contentLang, useGeez)
  const greeting = getGreeting(now.getHours(), greetingAm)

  return (
    <section className="clock-block animate-in" aria-label={timeLabel}>
      <div className="clock-layout">
        <div className="clock-face" role="img" aria-label={timeLabel}>
          {Array.from({ length: 60 }, (_, i) => (
            <span
              key={i}
              className={`clock-tick ${i % 5 === 0 ? 'is-major' : ''}`}
              style={{ transform: `rotate(${i * 6}deg)` }}
              aria-hidden
            />
          ))}
          {labels.map((label, i) => {
            const angle = ((i + 1) % 12) * 30
            const isCardinal = (i + 1) % 3 === 0
            const markClass =
              settings.clockNumeralStyle === 'geez' ? 'ethiopic' : ''
            return (
              <span
                key={label + i}
                className={`clock-mark ${markClass} ${isCardinal ? 'is-cardinal' : ''}`}
                style={{
                  transform: `rotate(${angle}deg) translateY(-3.65rem) rotate(-${angle}deg)`,
                }}
              >
                {isCardinal ? label : ''}
              </span>
            )
          })}
          <div className="hand hour" style={{ transform: `rotate(${hourAngle}deg)` }} />
          <div className="hand minute" style={{ transform: `rotate(${minuteAngle}deg)` }} />
          <div className="hand second" style={{ transform: `rotate(${secondAngle}deg)` }} />
          <div className="clock-center" />
        </div>

        <div className="clock-meta">
          <p className={`clock-greeting ${greetingAm ? 'ethiopic' : ''}`}>{greeting}</p>
          <h1 className="clock-date">{gregorianDisplay}</h1>
          <p className="clock-ethiopian ethiopic">{dateInfo.ethiopian}</p>
          <p className="clock-digital ethiopic">{timeLabel}</p>
        </div>
      </div>
    </section>
  )
}
