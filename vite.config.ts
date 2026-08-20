import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Where the app is served from. '/' today; set BASE_PATH=/PetFoodCalc/ in the
// Netlify environment when it moves behind app.atlasvetapps.com. Router
// basename, asset URLs, function calls and the PWA manifest all derive from
// this, so the move is a one-variable change.
const base = process.env.BASE_PATH || '/'

// Same default as src/utils/urls.ts. Social scrapers don't run JS, so the
// Open Graph tags have to be absolute in index.html itself — this fills the
// %SITE_ORIGIN% / %BASE% tokens at build time.
const siteOrigin = (process.env.VITE_SITE_URL || 'https://pet-food-calc.netlify.app').replace(/\/$/, '')

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512] as const
const MASKABLE = new Set([192, 512])

export default defineConfig({
  base,
  plugins: [
    {
      name: 'absolute-og-urls',
      transformIndexHtml: (html: string) =>
        html.replace(/%SITE_ORIGIN%/g, siteOrigin).replace(/%BASE%/g, base),
    },
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['avh-logo.png', 'icon-*.png'],
      manifest: {
        name: 'Pet Food DMB Calculator — Atlas Veterinary Hospital',
        short_name: 'Pet Food DMB',
        description: 'Compare pet food labels accurately using dry matter basis calculations. Brought to you by Atlas Veterinary Hospital.',
        theme_color: '#0d9488',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: ICON_SIZES.map(size => ({
          src: `${base}icon-${size}.png`,
          sizes: `${size}x${size}`,
          type: 'image/png',
          ...(MASKABLE.has(size) ? { purpose: 'any maskable' } : {}),
        })),
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' },
          },
        ],
      },
    }),
  ],
})
