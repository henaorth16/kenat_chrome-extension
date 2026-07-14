import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { createMonthGrid } from '../lib/kenat'
import { calT } from '../i18n'
import { calLang } from '../lib/types'
import './CalendarGrid.css'

interface CalendarGridProps {
  year: number
  month: number
  onMonthChange: (next: { year: number; month: number }) => void
}

export function CalendarGrid({ year, month, onMonthChange }: CalendarGridProps) {
  const { settings, userEvents, selectedDate, setSelectedDate } = useApp()

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
    onMonthChange({ year: y, month: m })
  }

  return (
    <section className="calendar widget-panel panel animate-in">
      <header className="calendar-head">
        <button
          type="button"
          className="cal-nav-btn"
          onClick={() => go(-1)}
          aria-label="Previous month"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="calendar-title">
          <h2 className="ethiopic">{grid.monthName}</h2>
          <span className="ethiopic">{grid.year}</span>
        </div>
        <button
          type="button"
          className="cal-nav-btn"
          onClick={() => go(1)}
          aria-label="Next month"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </header>

      <div className="calendar-body">
        <div className="calendar-weekdays">
          {grid.headers.map((h) => (
            <div key={h} className="ethiopic">
              {h}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {grid.days.map((day, i) => {
            if (!day) return <div key={i} className="day empty" />

            const dayNum =
              typeof day.ethiopian.day === 'string'
                ? parseInt(day.ethiopian.day, 10)
                : day.ethiopian.day
            const isSelected =
              selectedDate.year === year &&
              selectedDate.month === month &&
              selectedDate.day === dayNum
            const dayEvents = userEvents.filter(
              (e) => e.year === year && e.month === month && e.day === dayNum,
            )
            const hasUserEvents = dayEvents.length > 0
            const hasHoliday = day.holidays.length > 0

            const title = [
              ...day.holidays.map((h) => h.name),
              ...dayEvents.map((e) => e.title),
            ]
              .filter(Boolean)
              .join(', ')

            return (
              <button
                key={i}
                type="button"
                className={`day ${day.isToday ? 'is-today' : ''} ${
                  isSelected ? 'is-selected' : ''
                } ${hasHoliday ? 'has-holiday' : ''} ${
                  hasUserEvents ? 'has-user-event' : ''
                }`}
                title={title}
                onClick={() => setSelectedDate({ year, month, day: dayNum })}
              >
                <span className="day-num ethiopic">{day.ethiopian.day}</span>
                {day.isToday && (
                  <span className="day-today-tag ethiopic">{calDict.today}</span>
                )}
                <div className="day-dots-container">
                  {hasHoliday && <span className="day-dot holiday" aria-hidden />}
                  {hasUserEvents && <span className="day-dot user" aria-hidden />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
