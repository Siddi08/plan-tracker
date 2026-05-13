/* Plan Tracker Service Worker
   Bump CACHE_NAME whenever you push a new build — clients will auto-update. */
const CACHE_NAME = 'plan-tracker-v2';
const PRECACHE = ['./', './index.html', './manifest.json', './icon.svg'];

// Install: cache core shell, then activate immediately
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete old caches, claim all clients right away
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: serve from cache, refresh cache in background (stale-while-revalidate)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(e.request);
      const networkFetch = fetch(e.request).then(response => {
        if (response.ok) cache.put(e.request, response.clone());
        return response;
      }).catch(() => cached); // offline fallback
      return cached ?? networkFetch;
    })
  );
});
