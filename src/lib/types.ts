export type LangCode = 'en' | 'am' | 'combo'
export type ContentLang = 'en' | 'am'
export type ThemeMode = 'system' | 'light' | 'dark'
export type SearchEngine = 'google' | 'duckduckgo' | 'bing' | 'youtube'
export type TempUnit = 'celsius' | 'fahrenheit'
export type NumeralStyle = 'arabic' | 'geez'

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

export interface AppSettings {
  language: LangCode
  theme: ThemeMode
  searchEngine: SearchEngine
  tempUnit: TempUnit
  numeralStyle: NumeralStyle
  weatherLocation: WeatherLocation
  notifyCountdowns: boolean
  wallpaperMode: 'solid' | 'unsplash'
  accentColor: string
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

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'combo',
  theme: 'dark',
  searchEngine: 'google',
  tempUnit: 'celsius',
  numeralStyle: 'arabic',
  weatherLocation: DEFAULT_LOCATION,
  notifyCountdowns: true,
  wallpaperMode: 'unsplash',
  accentColor: '#30b0b8',
}

export const SEARCH_URLS: Record<SearchEngine, (q: string) => string> = {
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  youtube: (q) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
}
