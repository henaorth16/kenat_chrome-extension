import { useMemo } from 'react'
import Kenat, { toGeez, type DiffBreakdown } from 'kenat'
import { useApp } from '../context/AppContext'
import { getToday, getUpcomingHolidays } from '../lib/kenat'
import { calLang, uiLang } from '../lib/types'
import './HolidayList.css'

interface AgendaItem {
  id: string
  name: string
  ethiopian: { year: number; month: number; day: number }
  daysUntil: number
  distanceLabel: string
  type: 'holiday' | 'user'
  category?: string
}

export function HolidayList() {
  const { settings, dict, userEvents, setUserEvents } = useApp()
  const chromeAm = uiLang(settings.language) === 'am'

  const contentLang = calLang(settings.language)
  const distanceLang = uiLang(settings.language)

  const agenda = useMemo(() => {
    // 1. Get upcoming public holidays
    const holidays = getUpcomingHolidays(
      6,
      contentLang,
      distanceLang,
    )

    const holidayItems: AgendaItem[] = holidays.map((h) => ({
      id: h.key,
      name: h.name || 'Holiday',
      ethiopian: { year: h.ethiopian.year, month: h.ethiopian.month, day: h.ethiopian.day },
      daysUntil: h.daysUntil,
      distanceLabel: h.distanceLabel,
      type: 'holiday',
    }))

    // 2. Map and calculate distance for custom user events
    const today = getToday()
    const distanceKenatLang = distanceLang === 'am' ? 'amharic' : 'english'

    const userEventItems: AgendaItem[] = userEvents.flatMap((evt) => {
      try {
        const target = new Kenat(`${evt.year}/${evt.month}/${evt.day}`)
        const breakdown = today.distanceTo(target, {
          units: ['days'],
          output: 'object',
          lang: distanceKenatLang,
        }) as DiffBreakdown

        const daysUntil = breakdown.totalDays * breakdown.sign
        if (daysUntil < 0) return []

        const distanceLabel =
          breakdown.sign < 0
            ? ''
            : (Kenat.formatDistance(breakdown, {
                units: ['days'],
                lang: distanceKenatLang,
              }) as string)

        return [{
          id: evt.id,
          name: evt.title,
          ethiopian: { year: evt.year, month: evt.month, day: evt.day },
          daysUntil,
          distanceLabel: daysUntil === 0 ? dict.today : distanceLabel,
          type: 'user' as const,
          category: evt.category,
        }]
      } catch {
        return []
      }
    })

    // 3. Merge, sort chronologically, and limit to top 5
    return [...holidayItems, ...userEventItems]
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5)
  }, [settings.language, userEvents, contentLang, distanceLang, dict.today])

  const handleDeleteEvent = (id: string) => {
    void setUserEvents(userEvents.filter((evt) => evt.id !== id))
  }

  return (
    <section className="holiday-list panel animate-in">
      <div className="panel-header-clean">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span className={chromeAm ? 'ethiopic' : ''}>Agenda</span>
      </div>

      <ul>
        {agenda.map((item) => (
          <li
            key={item.id}
            className={`${item.type === 'user' ? 'is-user-event' : ''}`}
          >
            <span
              className={`event-pill ${item.daysUntil === 0 ? 'is-today' : ''} ${
                item.type === 'user' ? item.category || 'personal' : ''
              }`}
            />
            <div className="holiday-main">
              <strong className="ethiopic">{item.name}</strong>
              <span className="holiday-date ethiopic">
                {settings.numeralStyle === 'geez'
                  ? `${toGeez(item.ethiopian.day)}/${toGeez(item.ethiopian.month)}`
                  : `${item.ethiopian.day}/${item.ethiopian.month}`}
              </span>
            </div>
            
            <div className="agenda-actions">
              <span className={`holiday-eta ${chromeAm ? 'ethiopic' : ''}`}>
                {item.daysUntil === 0 ? dict.today : item.distanceLabel}
              </span>
              
              {item.type === 'user' && (
                <button
                  type="button"
                  className="icon-btn delete-btn"
                  onClick={() => handleDeleteEvent(item.id)}
                  aria-label="Delete event"
                >
                  <svg
                    width="10"
                    height="10"
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
              )}
            </div>
          </li>
        ))}
        {agenda.length === 0 && (
          <p className="no-events-text">No upcoming events scheduled</p>
        )}
      </ul>
    </section>
  )
}
