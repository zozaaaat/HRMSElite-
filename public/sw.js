// Service Worker for Zeylab HRMS PWA
const CACHE_NAME = 'zeylab-hrms-v1.0.0';
const STATIC_CACHE = 'zeylab-static-v1';
const RUNTIME_CACHE = 'zeylab-runtime-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\/companies/,
  /^\/api\/employees/,
  /^\/api\/system\/health/,
  /^\/api\/quick-stats/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache successful API responses
            if (response.status === 200) {
              const responseClone = response.clone();
              
              // Only cache specific API patterns
              const shouldCache = API_CACHE_PATTERNS.some(pattern => 
                pattern.test(url.pathname)
              );
              
              if (shouldCache) {
                cache.put(request, responseClone);
              }
            }
            return response;
          })
          .catch(() => {
            // Return cached API response if offline
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline fallback for API
              return new Response(
                JSON.stringify({
                  error: 'Offline',
                  message: 'لا يوجد اتصال بالإنترنت',
                  cached: true
                }),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
          });
      })
    );
    return;
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cache new resources
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      }).catch(() => {
        // Return offline page if available
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'hrms-data-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Push notifications for HRMS updates
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.message || 'تحديث جديد في نظام إدارة الموارد البشرية',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'فتح التطبيق',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/icons/icon-72x72.png'
      }
    ],
    requireInteraction: true,
    tag: 'hrms-notification'
  };

  event.waitUntil(
    self.registration.showNotification('Zeylab HRMS', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if no existing window
      return clients.openWindow(event.notification.data || '/');
    })
  );
});

// Helper function to sync offline data
async function syncOfflineData() {
  try {
    // Get offline stored data and sync with server
    const cache = await caches.open(RUNTIME_CACHE);
    const requests = await cache.keys();
    
    console.log('Service Worker: Syncing offline data...');
    
    // Here you could implement logic to sync offline changes
    // with the server when connection is restored
    
  } catch (error) {
    console.error('Service Worker: Sync failed:', error);
  }
}