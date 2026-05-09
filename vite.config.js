import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// Base path: '/' untuk dev/preview lokal, '/web_cerita2/' saat build di GitHub Actions
const base = process.env.GITHUB_ACTIONS ? '/web_cerita2/' : '/';

// https://vitejs.dev/config/
export default defineConfig({
  base,
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      strategies: 'injectManifest',
      srcDir: 'scripts',
      filename: 'sw.js',
      manifest: {
        name: 'Aplikasi Cerita',
        short_name: 'Cerita',
        description: 'Aplikasi untuk berbagi dan menjelajahi cerita dari seluruh dunia',
        theme_color: '#0d1b2a',
        background_color: '#0d1b2a',
        display: 'standalone',
        start_url: base,
        scope: base,
        lang: 'id',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: 'screenshots/screenshot-1.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Halaman Beranda Aplikasi Cerita',
          },
          {
            src: 'screenshots/screenshot-2.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Halaman Daftar Cerita',
          },
        ],
        shortcuts: [
          {
            name: 'Lihat Cerita',
            short_name: 'Cerita',
            description: 'Buka halaman daftar cerita',
            url: `${base}#/stories`,
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Tambah Cerita',
            short_name: 'Tambah',
            description: 'Buka halaman tambah cerita baru',
            url: `${base}#/add-story`,
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Favorit',
            short_name: 'Favorit',
            description: 'Lihat cerita yang disimpan',
            url: `${base}#/favorites`,
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
