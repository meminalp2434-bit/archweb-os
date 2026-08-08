const CACHE_NAME = 'archweb-os-v20-1-3';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/icon.svg',
  '/pwa-icon.png',
  '/archweb_offline.html'
];

// Install Event
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('SW cache.addAll warning:', err);
      });
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('SW deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First for Navigation & HTML, Stale-While-Revalidate for static assets
self.addEventListener('fetch', (e) => {
  const request = e.request;
  const url = new URL(request.url);

  // Skip non-GET requests and API calls
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // For HTML / Navigation requests: NETWORK FIRST to prevent white screen with stale index.html
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/archweb_offline.html') || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/html' } });
          });
        })
    );
    return;
  }

  // For static assets: Cache First with Network Fallback
  e.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && request.url.startsWith(self.location.origin)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
