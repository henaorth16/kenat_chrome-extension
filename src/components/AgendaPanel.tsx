import { type FormEvent, useMemo, useState } from 'react'
import Kenat, { toGeez, type DiffBreakdown } from 'kenat'
import { useApp } from '../context/AppContext'
import { getHolidaysInMonth, getToday } from '../lib/kenat'
import { getHolidayColorClass, getUserEventColorClass } from '../lib/holidayColors'
import type { UserEventItem } from '../lib/types'
import { calLang, uiLang } from '../lib/types'
import './AgendaPanel.css'

interface AgendaItem {
  id: string
  name: string
  ethiopian: { year: number; month: number; day: number }
  daysUntil: number
  distanceLabel: string
  type: 'holiday' | 'user'
  colorClass: string
}

interface AgendaPanelProps {
  year: number
  month: number
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function AgendaPanel({ year, month }: AgendaPanelProps) {
  const { settings, dict, userEvents, setUserEvents } = useApp()
  const chromeAm = uiLang(settings.language) === 'am'
  const contentLang = calLang(settings.language)
  const distanceLang = uiLang(settings.language)

  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [dateValue, setDateValue] = useState('')
  const [category, setCategory] = useState('personal')

  const agenda = useMemo(() => {
    const holidays = getHolidaysInMonth(year, month, contentLang, distanceLang)

    const holidayItems: AgendaItem[] = holidays.map((h) => ({
      id: `${h.key}-${h.ethiopian.year}-${h.ethiopian.month}-${h.ethiopian.day}`,
      name: h.name || 'Holiday',
      ethiopian: {
        year: h.ethiopian.year,
        month: h.ethiopian.month,
        day: h.ethiopian.day,
      },
      daysUntil: h.daysUntil,
      distanceLabel: h.daysUntil === 0 ? dict.today : h.distanceLabel,
      type: 'holiday',
      colorClass: getHolidayColorClass(h.tags),
    }))

    const today = getToday()
    const distanceKenatLang = distanceLang === 'am' ? 'amharic' : 'english'

    const userEventItems: AgendaItem[] = userEvents.flatMap((evt) => {
      if (evt.year !== year || evt.month !== month) return []

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

        return [
          {
            id: evt.id,
            name: evt.title,
            ethiopian: { year: evt.year, month: evt.month, day: evt.day },
            daysUntil,
            distanceLabel: daysUntil === 0 ? dict.today : distanceLabel,
            type: 'user' as const,
            colorClass: getUserEventColorClass(evt.category),
          },
        ]
      } catch {
        return []
      }
    })

    return [...holidayItems, ...userEventItems]
      .sort((a, b) => a.daysUntil - b.daysUntil || a.ethiopian.day - b.ethiopian.day)
      .slice(0, 5)
  }, [year, month, settings.language, userEvents, contentLang, distanceLang, dict.today])

  const handleDeleteEvent = (id: string) => {
    void setUserEvents(userEvents.filter((evt) => evt.id !== id))
  }

  const addEvent = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dateValue) return
    const [y, m, d] = dateValue.split('-').map(Number)
    const kenat = new Kenat(new Date(y, m - 1, d))
    const eth = kenat.getEthiopian()

    const item: UserEventItem = {
      id: uid(),
      title: title.trim(),
      category,
      year: eth.year,
      month: eth.month,
      day: eth.day,
      createdAt: Date.now(),
    }

    void setUserEvents([item, ...userEvents])
    setTitle('')
    setDateValue('')
    setShowAdd(false)
  }

  return (
    <section className="agenda-panel widget-panel panel animate-in">
      <header className="widget-head">
        <div className="panel-header-clean">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className={chromeAm ? 'ethiopic' : ''}>{dict.agenda}</span>
        </div>
        <button
          type="button"
          className="widget-action-btn"
          onClick={() => setShowAdd((v) => !v)}
        >
          {dict.addEvent}
        </button>
      </header>

      {showAdd && (
        <form className="agenda-add-form" onSubmit={addEvent}>
          <input
            className={`field ${chromeAm ? 'ethiopic' : ''}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.eventTitle}
            required
          />
          <div className="agenda-add-row">
            <input
              className="field"
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              required
              aria-label={dict.date}
            />
            <select
              className="field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="personal">{dict.catPersonal}</option>
              <option value="work">{dict.catWork}</option>
              <option value="important">{dict.catImportant}</option>
            </select>
            <button type="submit" className="btn-primary">
              {dict.save}
            </button>
          </div>
        </form>
      )}

      <ul className="agenda-list widget-list">
        {agenda.map((item) => (
          <li key={item.id} className={`widget-row agenda-row ${item.type === 'user' ? 'is-user-event' : ''}`}>
            <span
              className={`event-pill ${item.daysUntil === 0 ? 'is-today' : ''} ${item.colorClass}`}
            />
            <div className="agenda-main">
              <strong className="ethiopic">{item.name}</strong>
              <span className="agenda-date ethiopic">
                {settings.numeralStyle === 'geez'
                  ? `${toGeez(item.ethiopian.day)}/${toGeez(item.ethiopian.month)}`
                  : `${item.ethiopian.day}/${item.ethiopian.month}`}
              </span>
            </div>

            <div className="agenda-actions">
              <span className={`agenda-eta ${chromeAm ? 'ethiopic' : ''}`}>
                {item.daysUntil === 0 ? dict.today : item.distanceLabel}
              </span>
              {item.type === 'user' && (
                <button
                  type="button"
                  className="icon-btn delete-btn"
                  onClick={() => handleDeleteEvent(item.id)}
                  aria-label={dict.delete}
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
          <p className={`widget-empty ${chromeAm ? 'ethiopic' : ''}`}>{dict.emptyAgenda}</p>
        )}
      </ul>
    </section>
  )
}
