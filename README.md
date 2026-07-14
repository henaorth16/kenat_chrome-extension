# kenat_chrome_extention

Ethiopian calendar new-tab extension — Geez clock, weather, agenda, todos, countdowns, quick links, and search with suggestions.

## Develop

```bash
npm install
npm run dev
```

Then in Chrome → `chrome://extensions` → **Load unpacked** → select the `dist` folder (CRXJS writes an HMR build there while Vite runs on `http://localhost:5173`).

Keep `npm run dev` running while developing. Reload the extension after changing `manifest.config.ts` or `background.ts`.

## Production build

```bash
npm run build
```

Load unpacked from the fresh `dist/` folder (or zip `dist` for distribution). Do **not** ship a `dist` produced only by `npm run dev` — that build points at localhost.

## Features

- Ethiopian calendar + Geez/Arabic/Roman clock
- Weather drawer (Open-Meteo)
- Agenda, countdown, and to-do widgets
- Quick links (Chrome bookmarks / local)
- Search with live suggestions (Google, DuckDuckGo, Bing, YouTube)
- Themes, accent color, wallpaper modes

## Branding

- Package / extension name: **kenat_chrome_extention**
- Version: **1.0.0**

## Privacy

See [PRIVACY.md](./PRIVACY.md).

## Fonts

- **Outfit** — used for UI (`public/fonts/Outfit.ttf`)
- **Hibur Mono** — Ethiopic UI (`public/fonts/HiburMono-Regular.ttf`)

Confirm license terms of each font before commercial Chrome Web Store distribution.

## Wallpaper photos

Daily Unsplash landscape URLs are hardcoded for the photo wallpaper mode. Follow [Unsplash license](https://unsplash.com/license) attribution guidelines where required.
