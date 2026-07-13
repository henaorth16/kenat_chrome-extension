import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { createMonthGrid, getToday } from '../lib/kenat'
import { calT } from '../i18n'
import { calLang } from '../lib/types'
import type { UserEventItem } from '../lib/types'
import './CalendarGrid.css'

export function CalendarGrid() {
  const { settings, userEvents, setUserEvents } = useApp()
  const today = getToday().getEthiopian()
  const [year, setYear] = useState(today.year)
  const [month, setMonth] = useState(today.month)
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null)
  
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventCategory, setNewEventCategory] = useState('personal')

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
    setSelectedDayNum(null) // Close popover when month changes
  }

  // Fetch events for active selected day
  const activeDayEvents = useMemo(() => {
    if (selectedDayNum === null) return []
    return userEvents.filter(
      (e) => e.year === year && e.month === month && e.day === selectedDayNum,
    )
  }, [userEvents, year, month, selectedDayNum])

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle.trim() || selectedDayNum === null) return

    const newEvent: UserEventItem = {
      id: crypto.randomUUID(),
      title: newEventTitle.trim(),
      category: newEventCategory,
      year,
      month,
      day: selectedDayNum,
      createdAt: Date.now(),
    }

    void setUserEvents([...userEvents, newEvent])
    setNewEventTitle('')
  }

  const handleDeleteEvent = (id: string) => {
    void setUserEvents(userEvents.filter((item) => item.id !== id))
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
          className="icon-btn"
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

          const dayEvents = userEvents.filter(
            (e) => e.year === year && e.month === month && e.day === day.ethiopian.day,
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
            <div
              key={i}
              className={`day ${day.isToday ? 'is-today' : ''} ${
                hasHoliday ? 'has-holiday' : ''
              } ${hasUserEvents ? 'has-user-event' : ''}`}
              title={title}
              onClick={() => setSelectedDayNum(typeof day.ethiopian.day === 'string' ? parseInt(day.ethiopian.day, 10) : day.ethiopian.day)}
            >
              <span className="day-num ethiopic">{day.ethiopian.day}</span>
              {day.isToday && (
                <span className="day-today-tag ethiopic">{calDict.today}</span>
              )}
              <div className="day-dots-container">
                {hasHoliday && <span className="day-dot holiday" aria-hidden />}
                {hasUserEvents && <span className="day-dot user" aria-hidden />}
              </div>
            </div>
          )
        })}
      </div>

      {selectedDayNum !== null && (
        <div className="calendar-event-popover panel animate-in">
          <header className="popover-head">
            <h3>
              {grid.monthName} {selectedDayNum}
            </h3>
            <button
              type="button"
              className="icon-btn close-btn"
              onClick={() => setSelectedDayNum(null)}
            >
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <div className="popover-events-list">
            {activeDayEvents.length === 0 ? (
              <p className="no-events-text">No custom events scheduled</p>
            ) : (
              activeDayEvents.map((evt) => (
                <div key={evt.id} className="popover-event-row">
                  <span className={`event-cat-dot ${evt.category}`} />
                  <span className="event-row-title">{evt.title}</span>
                  <button
                    type="button"
                    className="icon-btn delete-btn"
                    onClick={() => handleDeleteEvent(evt.id)}
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddEvent} className="popover-add-form">
            <input
              type="text"
              className="field"
              placeholder="New Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
            />
            <div className="form-row-compact">
              <select
                className="field"
                value={newEventCategory}
                onChange={(e) => setNewEventCategory(e.target.value)}
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="important">Important</option>
              </select>
              <button type="submit" className="btn-primary">
                Add
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
