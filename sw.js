const CACHE_NAME = 'neochosen-v2';
const OFFLINE_URLS = [
  '/',
  '/about-us',
  '/donations',
  '/get-involved',
  '/raffle',
  '/social-media-links',
  '/sponsors',
  '/sponsorship-opportunities',
  '/thank-you',
  '/manifest.webmanifest',
  '/images/favicon.png',
  '/images/hero.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const pathname = requestUrl.pathname;

  if (requestUrl.origin === self.location.origin && pathname.endsWith('.html') && pathname !== '/index.html') {
    const cleanPath = pathname.replace(/\.html$/, '');
    const cleanUrl = `${requestUrl.origin}${cleanPath}${requestUrl.search}${requestUrl.hash}`;
    event.respondWith(Response.redirect(cleanUrl, 301));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() => caches.match('/'));
    })
  );
});
