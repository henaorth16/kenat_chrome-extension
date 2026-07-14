import Kenat, {
  MonthGrid,
  Time,
  getHolidaysForYear,
  toGeez,
  type DiffBreakdown,
  type EthiopianDate,
  type Holiday,
  type MonthGridResult,
} from 'kenat'
import type { ContentLang, NumeralStyle } from './types'

function toKenatLang(lang: ContentLang): 'amharic' | 'english' {
  return lang === 'am' ? 'amharic' : 'english'
}

export function getToday(): Kenat {
  return new Kenat()
}

export function formatToday(
  lang: ContentLang,
  useGeez: boolean,
): { ethiopian: string; gregorian: string; ethDate: EthiopianDate } {
  const today = getToday()
  const kenatLang = toKenatLang(lang)
  return {
    ethiopian: today.format({
      lang: kenatLang,
      showWeekday: true,
      useGeez,
    }),
    gregorian: today.format({
      calendar: 'gregorian',
      lang: kenatLang,
      showWeekday: true,
    }),
    ethDate: today.getEthiopian(),
  }
}

export function getEthiopianTimeNow(): Time {
  const now = new Date()
  return Time.fromGregorian(now.getHours(), now.getMinutes())
}

export function formatEthTime(
  time: Time,
  lang: ContentLang,
  useGeez: boolean,
): string {
  return time.format({
    lang: toKenatLang(lang),
    useGeez,
    showPeriodLabel: true,
  })
}

export function geezHourLabels(): string[] {
  return Array.from({ length: 12 }, (_, i) => toGeez(i + 1))
}

export function createMonthGrid(options: {
  year: number
  month: number
  lang: ContentLang
  useGeez: boolean
}): MonthGridResult {
  return MonthGrid.create({
    year: options.year,
    month: options.month,
    useGeez: options.useGeez,
    weekdayLang: toKenatLang(options.lang),
    weekStart: 1,
  })
}

export function getHolidaysInMonth(
  year: number,
  month: number,
  holidayLang: ContentLang = 'en',
  distanceLang: ContentLang = 'en',
): Array<Holiday & { daysUntil: number; distanceLabel: string }> {
  const today = getToday()
  const holidayKenatLang = toKenatLang(holidayLang)
  const distanceKenatLang = toKenatLang(distanceLang)

  return getHolidaysForYear(year, { lang: holidayKenatLang })
    .filter((h) => h.ethiopian.month === month)
    .map((h) => {
      const target = new Kenat(
        `${h.ethiopian.year}/${h.ethiopian.month}/${h.ethiopian.day}`,
      )
      const breakdown = today.distanceTo(target, {
        units: ['days'],
        output: 'object',
        lang: distanceKenatLang,
      }) as DiffBreakdown
      return {
        ...h,
        daysUntil: breakdown.totalDays * breakdown.sign,
        distanceLabel:
          breakdown.sign < 0
            ? ''
            : (Kenat.formatDistance(breakdown, {
                units: ['days'],
                lang: distanceKenatLang,
              }) as string),
      }
    })
    .filter((h) => h.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
}

export function getUpcomingHolidays(
  limit = 5,
  holidayLang: ContentLang = 'en',
  distanceLang: ContentLang = 'en',
): Array<Holiday & { daysUntil: number; distanceLabel: string }> {
  const today = getToday()
  const eth = today.getEthiopian()
  const holidayKenatLang = toKenatLang(holidayLang)
  const distanceKenatLang = toKenatLang(distanceLang)

  const thisYear = getHolidaysForYear(eth.year, { lang: holidayKenatLang })
  const nextYear = getHolidaysForYear(eth.year + 1, { lang: holidayKenatLang })
  const all = [...thisYear, ...nextYear]

  const upcoming = all
    .map((h) => {
      const target = new Kenat(
        `${h.ethiopian.year}/${h.ethiopian.month}/${h.ethiopian.day}`,
      )
      const breakdown = today.distanceTo(target, {
        units: ['days'],
        output: 'object',
        lang: distanceKenatLang,
      }) as DiffBreakdown
      return {
        ...h,
        daysUntil: breakdown.totalDays * breakdown.sign,
        distanceLabel:
          breakdown.sign < 0
            ? ''
            : (Kenat.formatDistance(breakdown, {
                units: ['days'],
                lang: distanceKenatLang,
              }) as string),
      }
    })
    .filter((h) => h.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  const seen = new Set<string>()
  const unique: typeof upcoming = []
  for (const h of upcoming) {
    const id = `${h.key}-${h.ethiopian.year}-${h.ethiopian.month}-${h.ethiopian.day}`
    if (seen.has(id)) continue
    seen.add(id)
    unique.push(h)
    if (unique.length >= limit) break
  }
  return unique
}

function compactDistanceUnits(
  breakdown: DiffBreakdown,
): Array<'years' | 'months' | 'days'> {
  const units: Array<'years' | 'months' | 'days'> = []
  if (breakdown.years) units.push('years')
  if (breakdown.months) units.push('months')
  if (breakdown.days || units.length === 0) units.push('days')
  return units
}

function formatCompactDistance(
  breakdown: DiffBreakdown,
  lang: ReturnType<typeof toKenatLang>,
): string {
  return Kenat.formatDistance(breakdown, {
    units: compactDistanceUnits(breakdown),
    lang,
  }) as string
}

export function distanceToEthiopianDate(
  target: EthiopianDate,
  lang: ContentLang,
): { daysUntil: number; label: string } {
  const today = getToday()
  const kenat = new Kenat(`${target.year}/${target.month}/${target.day}`)
  const kenatLang = toKenatLang(lang)
  const breakdown = today.distanceTo(kenat, {
    units: ['years', 'months', 'days'],
    output: 'object',
    lang: kenatLang,
  }) as DiffBreakdown
  const daysUntil = breakdown.totalDays * breakdown.sign
  return {
    daysUntil,
    label:
      daysUntil === 0
        ? lang === 'am'
          ? 'ዛሬ'
          : 'Today'
        : daysUntil < 0
          ? lang === 'am'
            ? 'ያለፈ'
            : 'Passed'
          : formatCompactDistance(breakdown, kenatLang),
  }
}

export function ethiopianToGregorian(eth: EthiopianDate): {
  year: number
  month: number
  day: number
} {
  return new Kenat(`${eth.year}/${eth.month}/${eth.day}`).getGregorian()
}

export function gregorianToEthiopian(g: {
  year: number
  month: number
  day: number
}): EthiopianDate {
  return new Kenat(new Date(g.year, g.month - 1, g.day)).getEthiopian()
}

export function displayDayNumber(
  value: number | string,
  style: NumeralStyle,
): string {
  if (style === 'geez') {
    const n = typeof value === 'string' ? Number(value) : value
    if (!Number.isFinite(n)) return String(value)
    return toGeez(n)
  }
  return String(value)
}

export { Kenat, toGeez, Time }
