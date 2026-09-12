// Soniq Service Worker
const CACHE_NAME = 'soniq-cache-v2';

// Em desenvolvimento local (localhost / 127.0.0.1), limpa caches e desregistra imediatamente
if (typeof self !== 'undefined' && self.location && (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1')) {
  self.addEventListener('install', () => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => {
        return self.registration.unregister();
      })
    );
  });
} else {
  const ASSETS_TO_CACHE = [
    '/',
    '/manifest.webmanifest',
    '/soniq-icon.svg',
    '/favicon.svg'
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
          })
        );
      })
    );
    self.clients.claim();
  });

  self.addEventListener('fetch', (event) => {
    if (
      event.request.url.includes('youtube.com') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('ytimg.com') ||
      event.request.url.includes('googlevideo.com') ||
      event.request.method !== 'GET'
    ) {
      return;
    }

    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            if (response && response.status === 200 && event.request.url.startsWith(self.location.origin)) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
        );
      })
    );
  });
}
