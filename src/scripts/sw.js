/**
 * Service Worker for Aplikasi Cerita
 * Strategy:
 *  - App Shell (HTML/CSS/JS): CacheFirst via Workbox precache
 *  - Leaflet CDN assets: CacheFirst
 *  - Story API GET requests: StaleWhileRevalidate (offline support)
 *  - Push Notifications: Dynamic content from server
 */

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// ── Core ──────────────────────────────────────────────────────────────────────

self.skipWaiting();
clientsClaim();

// Inject manifest entries from Vite build (replaces __WB_MANIFEST)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// SPA navigation fallback (serve index.html for all navigation requests)
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'))
);

// ── API Caching — StaleWhileRevalidate ────────────────────────────────────────
// Story list and story detail endpoints

registerRoute(
  ({ url }) =>
    url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/v1/stories'),
  new StaleWhileRevalidate({
    cacheName: 'api-stories-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }), // 1 day
    ],
  })
);

// ── CDN Assets — CacheFirst ───────────────────────────────────────────────────
// Leaflet CSS & JS from cdnjs

registerRoute(
  ({ url }) => url.hostname === 'cdnjs.cloudflare.com',
  new CacheFirst({
    cacheName: 'cdn-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 }), // 30 days
    ],
  })
);

// OpenStreetMap tile images
registerRoute(
  ({ url }) =>
    url.hostname.endsWith('.tile.openstreetmap.org') ||
    url.hostname === 'server.arcgisonline.com',
  new CacheFirst({
    cacheName: 'map-tiles-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }), // 7 days
    ],
  })
);

// Story photo images from Dicoding CDN
registerRoute(
  ({ url }) => url.pathname.startsWith('/images/') || url.hostname.includes('dicoding'),
  new StaleWhileRevalidate({
    cacheName: 'story-images-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  })
);

// ── Push Notifications ────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Aplikasi Cerita',
    body: 'Ada cerita baru!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    storyId: null,
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      // Dicoding API sends: { title, options: { body, icon, data: { storyId } } }
      notificationData.title = payload.title || notificationData.title;
      if (payload.options) {
        notificationData.body = payload.options.body || notificationData.body;
        notificationData.icon = payload.options.icon || notificationData.icon;
        if (payload.options.data) {
          notificationData.storyId = payload.options.data.storyId || null;
        }
      }
    } catch {
      // Fallback: treat as plain text
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'cerita-notification',
    renotify: true,
    data: {
      storyId: notificationData.storyId,
      url: notificationData.storyId ? `/#/stories` : '/',
    },
    actions: [
      {
        action: 'view-stories',
        title: '📖 Lihat Cerita',
      },
      {
        action: 'dismiss',
        title: '✕ Tutup',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(notificationData.title, options));
});

// ── Notification Click ────────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
