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

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'combo',
  theme: 'system',
  searchEngine: 'google',
  tempUnit: 'celsius',
  numeralStyle: 'arabic',
  weatherLocation: DEFAULT_LOCATION,
  notifyCountdowns: true,
  wallpaperMode: 'solid',
}

export const SEARCH_URLS: Record<SearchEngine, (q: string) => string> = {
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  youtube: (q) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
}
