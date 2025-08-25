// Service Worker caching static assets only
const BUILD_HASH = new URL(self.location.href).searchParams.get('build') || 'dev';
const STATIC_CACHE = `hrms-static-v${BUILD_HASH}`;

const ALLOWLIST = [
  '/api/v1/public/health',
  '/api/v1/public/dictionary'
];
const API_TTL_MS = 5 * 60 * 1000; // 5 min فقط
const MAX_ENTRIES = 100;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC_CACHE));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isStatic = url.pathname.match(/\.(?:css|js|woff2?|ttf|png|jpg|jpeg|webp|svg)$/);
  if (!isStatic) return;
  e.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(e.request);
      if (cached) return cached;
      const res = await fetch(e.request, { credentials: 'omit' });
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // لا تكاش أي طلب عليه credentials أو هيدر Authorization
  if (event.request.credentials === 'include') return;
  if (event.request.headers.get('authorization')) return;

  // اسمح فقط بنقاط Endpoints عامة محددة
  if (url.pathname && ALLOWLIST.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(
      (async () => {
        const cache = await caches.open('hrms-public-v1');
        const cached = await cache.match(event.request);
        if (cached) {
          const date = cached.headers.get('date');
          if (date && Date.now() - new Date(date).getTime() <= API_TTL_MS) {
            return cached;
          }
          await cache.delete(event.request);
        }

        const res = await fetch(event.request);
        // لا تكاش لو الرد private/no-store
        const cc = res.headers.get('cache-control') || '';
        if (/no-store|no-cache|private/i.test(cc)) return res;

        // enforce TTL + quota
        await cache.put(event.request, res.clone());
        // تنظيف بسيط للكوته (عينة)
        const keys = await cache.keys();
        if (keys.length > MAX_ENTRIES) await cache.delete(keys[0]);

        return res;
      })()
    );
  }
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'HRMS Elite Notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-72x72.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-72x72.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('HRMS Elite', options));
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Implement background sync logic here
    console.info('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

