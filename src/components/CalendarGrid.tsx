import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { createMonthGrid, getToday } from '../lib/kenat'
import { type MonthGridDay } from 'kenat'
import { calT } from '../i18n'
import { calLang } from '../lib/types'
import './CalendarGrid.css'

export function CalendarGrid() {
  const { settings } = useApp()
  const today = getToday().getEthiopian()
  const [year, setYear] = useState(today.year)
  const [month, setMonth] = useState(today.month)
  const useGeez = settings.numeralStyle === 'geez'
  const contentLang = calLang(settings.language)
  const calDict = calT(settings.language)

  const grid = useMemo(
    () =>
      createMonthGrid({
        year,
        month,
        lang: contentLang,
        useGeez,
      }),
    [year, month, contentLang, useGeez],
  )

  const go = (dir: -1 | 1) => {
    let m = month + dir
    let y = year
    if (m < 1) {
      m = 13
      y -= 1
    } else if (m > 13) {
      m = 1
      y += 1
    }
    setMonth(m)
    setYear(y)
  }
  return (
    <section className="calendar panel animate-in">
      <header className="calendar-head">
        <button
          type="button"
          className="icon-btn"
          onClick={() => go(-1)}
          aria-label="Previous month"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="calendar-title">
          <h2 className="ethiopic">{grid.monthName}</h2>
          <span className="ethiopic">{grid.year}</span>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => go(1)}
          aria-label="Next month"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </header>
      <div className="calendar-weekdays">
        {grid.headers.map((h) => (
          <div key={h} className="ethiopic">
            {h}
          </div>
        ))}
      </div>

      <div className="calendar-days">
        {grid.days.map((day, i) => (
          <DayCell key={i} day={day} todayLabel={calDict.today} />
        ))}
      </div>
    </section>
  )
}

function DayCell({
  day,
  todayLabel,
}: {
  day: MonthGridDay | null
  todayLabel: string
}) {
  if (!day) return <div className="day empty" />
  const hasHoliday = day.holidays.length > 0
  const title = hasHoliday
    ? day.holidays
        .map((h) => h.name)
        .filter(Boolean)
        .join(', ')
    : undefined

  return (
    <div
      className={`day ${day.isToday ? 'is-today' : ''} ${hasHoliday ? 'has-holiday' : ''}`}
      title={title}
    >
      <span className="day-num ethiopic">{day.ethiopian.day}</span>
      {day.isToday && (
        <span className="day-today-tag ethiopic">{todayLabel}</span>
      )}
      {hasHoliday && <span className="day-dot" aria-hidden />}
    </div>
  )
}
