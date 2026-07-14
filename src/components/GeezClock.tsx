import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  formatEthTime,
  formatToday,
  geezHourLabels,
  getEthiopianTimeNow,
} from '../lib/kenat'
import { calLang, uiLang } from '../lib/types'
import './GeezClock.css'

function getGreeting(hour: number, chromeAm: boolean): string {
  if (hour >= 5 && hour < 12) return chromeAm ? 'እንደምን አደሩ 👋' : 'Good morning 👋'
  if (hour >= 12 && hour < 17) return chromeAm ? 'እንደምን ዋሉ 👋' : 'Good afternoon 👋'
  if (hour >= 17 && hour < 21) return chromeAm ? 'እንደምን አመሹ 👋' : 'Good evening 👋'
  return chromeAm ? 'ሰላም 👋' : 'Good night 👋'
}

export function GeezClock() {
  const { settings } = useApp()
  const useGeez = settings.numeralStyle === 'geez'
  const contentLang = calLang(settings.language)
  const chromeAm = uiLang(settings.language) === 'am'
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
    const locale = chromeAm ? 'am-ET' : 'en-US'
    return now.toLocaleDateString(locale, {
      weekday: undefined,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [now, chromeAm])

  const labels = useMemo(() => geezHourLabels(), [])

  const hour = ethTime.hour % 12
  const minute = ethTime.minute
  const second = now.getSeconds()
  const minuteAngle = minute * 6 + second * 0.1
  const hourAngle = hour * 30 + minute * 0.5
  const secondAngle = second * 6
  const timeLabel = formatEthTime(ethTime, contentLang, useGeez)
  const greeting = getGreeting(now.getHours(), chromeAm)

  return (
    <section className="clock-block animate-in" aria-label={timeLabel}>
      <div className="clock-face" role="img" aria-label={timeLabel}>
        {labels.map((label, i) => {
          const angle = ((i + 1) % 12) * 30
          const isCardinal = (i + 1) % 3 === 0
          return (
            <span
              key={label + i}
              className={`clock-mark ethiopic ${isCardinal ? 'is-cardinal' : ''}`}
              style={{
                transform: `rotate(${angle}deg) translateY(-5.4rem) rotate(-${angle}deg)`,
              }}
            >
              {isCardinal ? label : ''}
            </span>
          )
        })}
        <div
          className="hand hour"
          style={{ transform: `rotate(${hourAngle}deg)` }}
        />
        <div
          className="hand minute"
          style={{ transform: `rotate(${minuteAngle}deg)` }}
        />
        <div
          className="hand second"
          style={{ transform: `rotate(${secondAngle}deg)` }}
        />
        <div className="clock-center" />
      </div>
      <div className="clock-meta">
        <p className={`clock-greeting ${chromeAm ? 'ethiopic' : ''}`}>{greeting}</p>
        <h1 className={`clock-date ${chromeAm ? '' : ''}`}>{gregorianDisplay}</h1>
        <p className="clock-ethiopian ethiopic">{dateInfo.ethiopian}</p>
        <p className="clock-digital ethiopic" aria-hidden="true">
          {timeLabel}
        </p>
      </div>
    </section>
  )
}
