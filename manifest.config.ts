import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'kenat_chrome_extention',
  version: '1.0.0',
  description:
    'Kenat new tab — Ethiopian calendar, Geez clock, weather, agenda, todos, countdowns, and search.',
  chrome_url_overrides: {
    newtab: 'index.html',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  permissions: ['storage', 'alarms', 'notifications', 'bookmarks', 'favicon'],
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
})
