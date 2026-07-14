import { getExtensionApi } from './extension'
import type { AppSettings, CountdownItem, TodoItem, UserEventItem } from './types'
import { DEFAULT_SETTINGS } from './types'

const KEYS = {
  settings: 'kenat_settings',
  todos: 'kenat_todos',
  countdowns: 'kenat_countdowns',
  userEvents: 'kenat_user_events',
} as const

async function getLocalRaw(key: string): Promise<unknown | undefined> {
  const ext = getExtensionApi()
  if (ext?.storage?.local) {
    const result = await ext.storage.local.get(key)
    return result[key]
  }
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

async function getLocal<T>(key: string, fallback: T): Promise<T> {
  const value = await getLocalRaw(key)
  return (value as T) ?? fallback
}

async function setLocal(key: string, value: unknown): Promise<void> {
  const ext = getExtensionApi()
  if (ext?.storage?.local) {
    await ext.storage.local.set({ [key]: value })
    return
  }
  localStorage.setItem(key, JSON.stringify(value))
}

export async function loadSettings(): Promise<{
  settings: AppSettings
  isFresh: boolean
}> {
  const raw = await getLocalRaw(KEYS.settings)
  if (!raw || typeof raw !== 'object') {
    return { settings: { ...DEFAULT_SETTINGS }, isFresh: true }
  }
  return {
    settings: { ...DEFAULT_SETTINGS, ...(raw as Partial<AppSettings>) },
    isFresh: false,
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setLocal(KEYS.settings, settings)
}

export async function loadTodos(): Promise<TodoItem[]> {
  return getLocal<TodoItem[]>(KEYS.todos, [])
}

export async function saveTodos(todos: TodoItem[]): Promise<void> {
  await setLocal(KEYS.todos, todos)
}

export async function loadCountdowns(): Promise<CountdownItem[]> {
  return getLocal<CountdownItem[]>(KEYS.countdowns, [])
}

export async function saveCountdowns(
  countdowns: CountdownItem[],
): Promise<void> {
  await setLocal(KEYS.countdowns, countdowns)
}

export async function loadUserEvents(): Promise<UserEventItem[]> {
  return getLocal<UserEventItem[]>(KEYS.userEvents, [])
}

export async function saveUserEvents(
  events: UserEventItem[],
): Promise<void> {
  await setLocal(KEYS.userEvents, events)
}
