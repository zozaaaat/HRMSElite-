// Service Worker for HRMS Elite PWA
const CACHE_NAME = 'hrms-elite-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.info('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for auth endpoints
  if (url.pathname.startsWith('/api/auth/') || url.pathname.startsWith('/auth/')) {
    // For auth endpoints, always fetch from network and don't cache
    event.respondWith(fetch(request));
    return;
  }

  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.info('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
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
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('HRMS Elite', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
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