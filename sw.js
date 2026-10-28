/* Offline support. Pages, styles and scripts: network first, so a new deploy shows up at once, with the cache as the offline fallback.
   Fonts and the QR library: cache first. The class API is never cached. */
const CACHE = 'sisyphus-v4';
const PAGES = ['', 'heroes.html', 'journal.html', 'progress.html', 'idea.html', 'worldviews.html', 'class.html', 'present.html'];
const SCRIPTS = ['main', 'pages', 'present', 'nav', 'store', 'ui', 'i18n', 'data', 'data-en', 'data-ro', 'scene', 'audio', 'features', 'share', 'classroom'];
const CORE = [
  ...PAGES.map((p) => '/' + p), ...PAGES.map((p) => '/ro/' + p),
  '/styles.css', '/favicon.svg', '/icon-192.png', '/manifest.webmanifest',
  ...SCRIPTS.map((s) => '/js/' + s + '.js'),
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.pathname.startsWith('/api/')) return;
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match(url.pathname.startsWith('/ro/') ? '/ro/' : '/'))));
    return;
  }
  if (/(^|\.)fonts\.(googleapis|gstatic)\.com$|^cdnjs\.cloudflare\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res;
    })));
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const open = list.find((c) => 'focus' in c);
    return open ? open.focus() : self.clients.openWindow('/');
  }));
});
