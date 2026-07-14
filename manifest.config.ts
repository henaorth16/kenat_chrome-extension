import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Calendar',
  version: '1.0.4',
  description: 'Ethiopian calendar, Geez clock, holidays, todos, and countdowns.',
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
    'https://api.quotable.io/*',
    'https://zenquotes.io/*',
    'https://images.unsplash.com/*',
  ],
  icons: {
    '16': 'icons/icon16.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png',
  },
  action: {
    default_title: 'Open calendar',
    default_icon: {
      '16': 'icons/icon16.png',
      '48': 'icons/icon48.png',
    },
  },
})
