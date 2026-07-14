export type LangCode = 'en' | 'am' | 'combo'
export type ContentLang = 'en' | 'am'
export type ThemeMode = 'system' | 'light' | 'dark'
export type SearchEngine = 'google' | 'duckduckgo' | 'bing' | 'youtube'
export type TempUnit = 'celsius' | 'fahrenheit'
export type NumeralStyle = 'arabic' | 'geez'
export type ClockNumeralStyle = 'geez' | 'arabic' | 'roman'
export type WallpaperMode = 'solid' | 'unsplash' | 'custom'

/** Chrome UI strings (English in combo mode). */
export function uiLang(mode: LangCode): ContentLang {
  return mode === 'am' ? 'am' : 'en'
}

/** Calendar / date / month / holiday content (Amharic in combo mode). */
export function calLang(mode: LangCode): ContentLang {
  return mode === 'en' ? 'en' : 'am'
}

export interface WeatherLocation {
  name: string
  latitude: number
  longitude: number
  country?: string
}

export interface WidgetVisibility {
  calendar: boolean
  agenda: boolean
  countdown: boolean
  todo: boolean
}

export interface AppSettings {
  language: LangCode
  theme: ThemeMode
  searchEngine: SearchEngine
  tempUnit: TempUnit
  numeralStyle: NumeralStyle
  clockNumeralStyle: ClockNumeralStyle
  weatherLocation: WeatherLocation
  notifyCountdowns: boolean
  wallpaperMode: WallpaperMode
  customWallpaperUrl: string
  accentColor: string
  widgets: WidgetVisibility
}

export interface AccentPreset {
  name: string
  color: string
  soft: string
  deep: string
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { name: 'Teal', color: '#00828a', soft: 'rgba(0, 130, 138, 0.08)', deep: '#00656b' },
  { name: 'Blue', color: '#007aff', soft: 'rgba(0, 122, 255, 0.08)', deep: '#005ec3' },
  { name: 'Purple', color: '#8e2de2', soft: 'rgba(142, 45, 226, 0.08)', deep: '#6f1cb0' },
  { name: 'Orange', color: '#f2711c', soft: 'rgba(242, 113, 28, 0.08)', deep: '#ce570d' },
  { name: 'Green', color: '#21ba45', soft: 'rgba(33, 186, 69, 0.08)', deep: '#198e33' },
  { name: 'Rose', color: '#e03997', soft: 'rgba(224, 57, 151, 0.08)', deep: '#ba1a74' },
]

function parseHex(color: string): { r: number; g: number; b: number } | null {
  const hex = color.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

function darkenChannel(value: number, amount: number): number {
  return Math.max(0, Math.min(255, Math.round(value * (1 - amount))))
}

/** Resolve preset or derive soft/deep tokens from a custom hex accent. */
export function resolveAccent(
  color: string,
  theme: 'light' | 'dark' = 'dark',
): AccentPreset {
  const trimmed = color.trim()
  const normalized = trimmed.toLowerCase()
  const preset = ACCENT_PRESETS.find((p) => p.color.toLowerCase() === normalized)
  if (preset) return preset

  const rgb = parseHex(trimmed)
  if (!rgb) {
    return ACCENT_PRESETS[0]
  }

  const softAlpha = theme === 'dark' ? 0.16 : 0.09
  const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  return {
    name: 'Custom',
    color: hex,
    soft: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${softAlpha})`,
    deep: `#${[rgb.r, rgb.g, rgb.b]
      .map((c) => darkenChannel(c, 0.22).toString(16).padStart(2, '0'))
      .join('')}`,
  }
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  pinned: boolean
  createdAt: number
  year?: number
  month?: number
  day?: number
}

export interface CountdownItem {
  id: string
  title: string
  ethiopian: { year: number; month: number; day: number }
  gregorian: { year: number; month: number; day: number }
  notify: boolean
  createdAt: number
}

export interface UserEventItem {
  id: string
  title: string
  category: string // 'personal' | 'work' | 'important'
  year: number
  month: number
  day: number
  createdAt: number
}

export const DEFAULT_LOCATION: WeatherLocation = {
  name: 'Addis Ababa',
  latitude: 9.03,
  longitude: 38.74,
  country: 'Ethiopia',
}

export const DEFAULT_WIDGETS: WidgetVisibility = {
  calendar: true,
  agenda: true,
  countdown: true,
  todo: true,
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'combo',
  theme: 'dark',
  searchEngine: 'google',
  tempUnit: 'celsius',
  numeralStyle: 'arabic',
  clockNumeralStyle: 'geez',
  weatherLocation: DEFAULT_LOCATION,
  notifyCountdowns: true,
  wallpaperMode: 'unsplash',
  customWallpaperUrl: '',
  accentColor: '#30b0b8',
  widgets: { ...DEFAULT_WIDGETS },
}

export const SEARCH_URLS: Record<SearchEngine, (q: string) => string> = {
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  youtube: (q) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
}
