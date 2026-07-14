import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import {
  displayDayNumber,
  getDaysInEthiopianMonth,
  getEthiopianMonthNames,
  getTodayEthiopian,
} from '../lib/kenat'
import { calLang } from '../lib/types'
import './EthiopianDateSelector.css'

export type EthiopianDateValue = {
  year: number
  month: number
  day: number
}

export function getDefaultEthiopianDate(): EthiopianDateValue {
  const today = getTodayEthiopian()
  return { year: today.year, month: today.month, day: today.day }
}

interface EthiopianDateSelectorProps {
  value: EthiopianDateValue
  onChange: (value: EthiopianDateValue) => void
  ariaLabel?: string
}

export function EthiopianDateSelector({
  value,
  onChange,
  ariaLabel,
}: EthiopianDateSelectorProps) {
  const { settings, dict } = useApp()
  const contentLang = calLang(settings.language)
  const useGeez = settings.numeralStyle === 'geez'
  const chromeAm = contentLang === 'am'

  const monthNames = useMemo(
    () => getEthiopianMonthNames(contentLang, useGeez),
    [contentLang, useGeez],
  )

  const years = useMemo(() => {
    const currentYear = getTodayEthiopian().year
    return Array.from({ length: 12 }, (_, index) => currentYear - 1 + index)
  }, [])

  const maxDay = useMemo(
    () => getDaysInEthiopianMonth(value.year, value.month),
    [value.year, value.month],
  )

  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, index) => index + 1),
    [maxDay],
  )

  const update = (patch: Partial<EthiopianDateValue>) => {
    const next = { ...value, ...patch }
    const cappedDay = Math.min(
      next.day,
      getDaysInEthiopianMonth(next.year, next.month),
    )
    onChange({ ...next, day: cappedDay })
  }

  return (
    <div className="eth-date-selector" role="group" aria-label={ariaLabel ?? dict.date}>
      <select
        className={`field eth-date-field ${chromeAm ? 'ethiopic' : ''}`}
        value={value.year}
        onChange={(e) => update({ year: Number(e.target.value) })}
        required
        aria-label={`${dict.date} — year`}
      >
        {years.map((year) => (
          <option key={year} value={year} className={useGeez ? 'ethiopic' : ''}>
            {displayDayNumber(year, settings.numeralStyle)}
          </option>
        ))}
      </select>
      <select
        className={`field eth-date-field eth-date-month ${chromeAm ? 'ethiopic' : ''}`}
        value={value.month}
        onChange={(e) => update({ month: Number(e.target.value) })}
        required
        aria-label={`${dict.date} — month`}
      >
        {monthNames.map((name, index) => (
          <option key={index + 1} value={index + 1} className="ethiopic">
            {name}
          </option>
        ))}
      </select>
      <select
        className={`field eth-date-field ${useGeez ? 'ethiopic' : ''}`}
        value={value.day}
        onChange={(e) => update({ day: Number(e.target.value) })}
        required
        aria-label={`${dict.date} — day`}
      >
        {days.map((day) => (
          <option key={day} value={day} className={useGeez ? 'ethiopic' : ''}>
            {displayDayNumber(day, settings.numeralStyle)}
          </option>
        ))}
      </select>
    </div>
  )
}
