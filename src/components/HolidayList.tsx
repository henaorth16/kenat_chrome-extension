import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getUpcomingHolidays, toGeez } from '../lib/kenat'
import { calLang, uiLang } from '../lib/types'
import './HolidayList.css'

export function HolidayList() {
  const { settings, dict } = useApp()
  const chromeAm = uiLang(settings.language) === 'am'

  const holidays = useMemo(
    () =>
      getUpcomingHolidays(
        4,
        calLang(settings.language),
        uiLang(settings.language),
      ),
    [settings.language],
  )

  return (
    <section className="holiday-list panel animate-in">
      <h2 className={`panel-title ${chromeAm ? 'ethiopic' : ''}`}>
        {dict.upcomingHolidays}
      </h2>
      <ul>
        {holidays.map((h) => (
          <li
            key={`${h.key}-${h.ethiopian.year}-${h.ethiopian.month}-${h.ethiopian.day}`}
          >
            <span className={`event-pill ${h.daysUntil === 0 ? 'is-today' : ''}`} />
            <div className="holiday-main">
              <strong className="ethiopic">{h.name}</strong>
              <span className="holiday-date ethiopic">
                {settings.numeralStyle === 'geez'
                  ? `${toGeez(h.ethiopian.day)}/${toGeez(h.ethiopian.month)}`
                  : `${h.ethiopian.day}/${h.ethiopian.month}`}
              </span>
            </div>
            <span className={`holiday-eta ${chromeAm ? 'ethiopic' : ''}`}>
              {h.daysUntil === 0 ? dict.today : h.distanceLabel}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
