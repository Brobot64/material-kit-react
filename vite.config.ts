import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// ----------------------------------------------------------------------

const PORT = 3039;

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'assets/icons/pwa/*.png'],
      manifest: {
        name: 'ShopMaster by Tajarah',
        short_name: 'ShopMaster',
        description: 'Retail ERP for Nigerian businesses — sales, inventory, employees and more.',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/assets/icons/pwa/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/assets/icons/pwa/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/assets/icons/pwa/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          // Cloudflare sync Worker (may be cross-origin via VITE_SYNC_URL)
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/v1/sync/') ||
              url.pathname.startsWith('/v1/edge-cache/') ||
              url.port === '8787',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sync-edge-cache',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 8,
            },
          },
          // Origin Express API (cross-origin via VITE_API_URL host)
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: { port: PORT, host: true },
  preview: { port: PORT, host: true },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
});

