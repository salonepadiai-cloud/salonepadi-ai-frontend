const CACHE_NAME = 'app-cache-v1';

// Install event - force new service worker to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - take control of all pages immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Fetch event - fetch live network data first, fall back to cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
