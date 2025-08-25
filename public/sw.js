// Service Worker caching static assets only
const BUILD_HASH = new URL(self.location.href).searchParams.get('build') || 'dev';
const STATIC_CACHE = `hrms-static-v${BUILD_HASH}`;

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

