import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3, // Firefox requires this
  name: 'kenat_chrome_extention',
  version: '1.0.0',
  description:
    'Kenat new tab — Ethiopian calendar, Geez clock, weather, agenda, todos, countdowns, and search.',
  browser_specific_settings: {
    gecko: {
      id: 'kenat-newtab@kenat.local',
      strict_min_version: '109.0',
    },
  },
  chrome_url_overrides: {
    newtab: 'index.html',
  },
  background: {
    scripts: ['src/background.ts'],
    type: 'module',
  },
  permissions: ['storage', 'alarms', 'notifications', 'bookmarks'],
  host_permissions: [
    'https://api.open-meteo.com/*',
    'https://geocoding-api.open-meteo.com/*',
    'https://dummyjson.com/*',
    'https://suggestqueries.google.com/*',
    'https://duckduckgo.com/*',
    'https://api.bing.com/*',
    'https://images.unsplash.com/*',
    'https://www.google.com/*',
    'https://www.youtube.com/*',
  ],
  icons: {
    '16': 'icons/icon16.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png',
  },
  action: {
    default_title: 'kenat_chrome_extention',
    default_icon: {
      '16': 'icons/icon16.png',
      '48': 'icons/icon48.png',
    },
  },
} as unknown as Parameters<typeof defineManifest>[0])
