import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  formatEthTime,
  formatToday,
  geezHourLabels,
  getEthiopianTimeNow,
} from '../lib/kenat'
import { calLang } from '../lib/types'
import './GeezClock.css'

export function GeezClock() {
  const { settings } = useApp()
  const useGeez = settings.numeralStyle === 'geez'
  const contentLang = calLang(settings.language)
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

  const labels = useMemo(() => geezHourLabels(), [])

  const hour = ethTime.hour % 12
  const minute = ethTime.minute
  const second = now.getSeconds()
  const minuteAngle = minute * 6 + second * 0.1
  const hourAngle = hour * 30 + minute * 0.5
  const secondAngle = second * 6
  const timeLabel = formatEthTime(ethTime, contentLang, useGeez)

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
                transform: `rotate(${angle}deg) translateY(-3.35rem) rotate(-${angle}deg)`,
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
        <p className="clock-digital ethiopic">{timeLabel}</p>
        <h1 className="clock-date ethiopic">{dateInfo.ethiopian}</h1>
        <p className="clock-gregorian ethiopic">{dateInfo.gregorian}</p>
      </div>
    </section>
  )
}
