# Privacy Policy — kenat_chrome_extention

Last updated: 2026-07-14

## Summary

kenat_chrome_extention is a Chrome new-tab extension. It does **not** require an account and does **not** sell personal data. Most information stays on your device via Chrome `storage`.

## Data stored on your device

Using Chrome extension storage (and sometimes `localStorage` in local/dev builds):

- Settings (language, theme, search engine, numerals, accent, wallpaper preferences)
- To-dos, countdowns, and custom agenda events
- Quick links you add

Countdown reminder notifications may be shown using the Chrome notifications API when you enable that option.

## Network requests

The extension may contact these services to provide features:

| Service | Purpose |
|--------|---------|
| Open-Meteo | Weather and city geocoding |
| DummyJSON | Occasional random quotes (falls back to built-in quotes if unavailable) |
| Google / DuckDuckGo / Bing / YouTube suggest APIs | Search autocomplete for the engine you select |
| Google / DuckDuckGo / Bing / YouTube search pages | Opening your search |
| Unsplash CDN | Optional wallpaper images |
| Google favicon service | Favicons for quick links when the Chrome favicon API is unavailable |

Weather is requested for the location you choose in settings (default city name + coordinates).

## Permissions

- `storage` — save settings and your lists
- `alarms` / `notifications` — countdown reminders
- `bookmarks` — optional quick-link helpers
- `favicon` — site icons for quick links
- Host permissions — only the HTTPS APIs and sites listed above (no blanket `http://*/*` / `https://*/*`)

## What we do not do

- No analytics SDKs in this codebase
- No advertising trackers
- No sale of personal information

## Contact

For privacy questions about this extension, open an issue on the project repository or contact the maintainer who distributes your build.

If you publish on the Chrome Web Store, replace this contact section with a real email and host this policy at a public HTTPS URL.
