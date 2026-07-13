import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { syncCountdownAlarms } from '../lib/alarms'
import {
  loadCountdowns,
  loadSettings,
  loadTodos,
  loadUserEvents,
  saveCountdowns,
  saveSettings,
  saveTodos,
  saveUserEvents,
} from '../lib/storage'
import type { AppSettings, CountdownItem, TodoItem, UserEventItem } from '../lib/types'
import { DEFAULT_SETTINGS, uiLang } from '../lib/types'
import { t, type Dictionary } from '../i18n'
import { getToday } from '../lib/kenat'

interface AppContextValue {
  ready: boolean
  settings: AppSettings
  todos: TodoItem[]
  countdowns: CountdownItem[]
  userEvents: UserEventItem[]
  dict: Dictionary
  resolvedTheme: 'light' | 'dark'
  selectedDate: { year: number; month: number; day: number }
  setSelectedDate: (date: { year: number; month: number; day: number }) => void
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>
  setTodos: (todos: TodoItem[]) => Promise<void>
  setCountdowns: (items: CountdownItem[]) => Promise<void>
  setUserEvents: (events: UserEventItem[]) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

function resolveTheme(
  theme: AppSettings['theme'],
  prefersDark: boolean,
): 'light' | 'dark' {
  if (theme === 'system') return prefersDark ? 'dark' : 'light'
  return theme
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [todos, setTodosState] = useState<TodoItem[]>([])
  const [countdowns, setCountdownsState] = useState<CountdownItem[]>([])
  const [userEvents, setUserEventsState] = useState<UserEventItem[]>([])
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = getToday().getEthiopian()
    return { year: today.year, month: today.month, day: today.day }
  })
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setPrefersDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [{ settings: storedSettings, isFresh }, todoList, countdownList, userEventList] =
        await Promise.all([loadSettings(), loadTodos(), loadCountdowns(), loadUserEvents()])
      if (cancelled) return

      const next: AppSettings = isFresh
        ? { ...DEFAULT_SETTINGS }
        : {
            ...DEFAULT_SETTINGS,
            ...storedSettings,
            // Migrate older en/am-only installs: keep choice; unknown → combo
            language:
              storedSettings.language === 'en' ||
              storedSettings.language === 'am' ||
              storedSettings.language === 'combo'
                ? storedSettings.language
                : 'combo',
          }

      if (isFresh) await saveSettings(next)

      setSettings(next)
      const ethToday = getToday().getEthiopian()
      const migratedTodos = todoList.map((t) => {
        if (t.year === undefined) {
          return { ...t, year: ethToday.year, month: ethToday.month, day: ethToday.day }
        }
        return t
      })
      setTodosState(migratedTodos)
      setCountdownsState(countdownList)
      setUserEventsState(userEventList)
      setReady(true)
      await syncCountdownAlarms(countdownList, next.notifyCountdowns)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const resolvedTheme = resolveTheme(settings.theme, prefersDark)

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.lang = uiLang(settings.language)
    document.documentElement.style.colorScheme = resolvedTheme

    const themeColor = resolvedTheme === 'dark' ? '#12141a' : '#f2f0eb'
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', themeColor)

    // Keep the document root painted so any Chrome chrome bleed matches the page.
    document.documentElement.style.backgroundColor = themeColor
    document.body.style.backgroundColor = themeColor
  }, [resolvedTheme, settings.language])

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      const next = { ...settings, ...patch }
      setSettings(next)
      await saveSettings(next)
      if (patch.notifyCountdowns !== undefined) {
        await syncCountdownAlarms(countdowns, next.notifyCountdowns)
      }
    },
    [settings, countdowns],
  )

  const setTodos = useCallback(async (next: TodoItem[]) => {
    setTodosState(next)
    await saveTodos(next)
  }, [])

  const setCountdowns = useCallback(
    async (next: CountdownItem[]) => {
      setCountdownsState(next)
      await saveCountdowns(next)
      await syncCountdownAlarms(next, settings.notifyCountdowns)
    },
    [settings.notifyCountdowns],
  )

  const setUserEvents = useCallback(
    async (next: UserEventItem[]) => {
      setUserEventsState(next)
      await saveUserEvents(next)
    },
    [],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      settings,
      todos,
      countdowns,
      userEvents,
      dict: t(settings.language),
      resolvedTheme,
      selectedDate,
      setSelectedDate,
      updateSettings,
      setTodos,
      setCountdowns,
      setUserEvents,
    }),
    [
      ready,
      settings,
      todos,
      countdowns,
      userEvents,
      resolvedTheme,
      selectedDate,
      updateSettings,
      setTodos,
      setCountdowns,
      setUserEvents,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
