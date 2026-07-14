import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import path from 'node:path'
import manifest from './manifest.config.ts'
import { absoluteSuggestUrl } from './src/lib/searchSuggest.ts'
import type { SearchEngine } from './src/lib/types.ts'

function apiProxyPlugin(): Plugin {
  return {
    name: 'kenat-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next()

        try {
          if (req.url.startsWith('/api/suggest')) {
            const url = new URL(req.url, 'http://localhost')
            const engine = (url.searchParams.get('engine') || 'google') as SearchEngine
            const q = url.searchParams.get('q') || ''
            if (!q.trim()) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify([q, []]))
              return
            }

            const upstream = await fetch(absoluteSuggestUrl(engine, q), {
              headers: { Accept: 'application/json' },
            })
            const text = await upstream.text()
            res.statusCode = upstream.ok ? 200 : 502
            res.setHeader('Content-Type', 'application/json')
            res.end(text)
            return
          }

          if (req.url.startsWith('/api/quote')) {
            const upstream = await fetch('https://dummyjson.com/quotes/random', {
              headers: { Accept: 'application/json' },
            })
            const text = await upstream.text()
            res.statusCode = upstream.ok ? 200 : 502
            res.setHeader('Content-Type', 'application/json')
            res.end(text)
            return
          }
        } catch {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end('[]')
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), crx({ manifest }), apiProxyPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
