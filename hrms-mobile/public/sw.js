const BUILD_HASH = new URL(self.location.href).searchParams.get('build') || 'dev';
const CACHE_NAME = `hrms-elite-${BUILD_HASH}`;
const STATIC_CACHE = `hrms-static-${BUILD_HASH}`;
const DYNAMIC_CACHE = `hrms-dynamic-${BUILD_HASH}`;

const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png',
];

const API_CACHE_PATTERNS = [
  /\/api\/employees/,
  /\/api\/attendance/,
  /\/api\/documents/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip caching for auth endpoints
  if (url.pathname.startsWith('/api/auth/') || url.pathname.startsWith('/auth/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(fetch(request));
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle other requests
  event.respondWith(handleOtherRequest(request));
});

// API requests are fetched directly without caching

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    const cacheControl = networkResponse.headers.get('Cache-Control') || '';
    if (networkResponse.ok && !cacheControl.includes('no-store') && !cacheControl.includes('no-cache')) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Static request failed', error);
    return new Response('Offline', { status: 503 });
  }
}

// Handle other requests with network-first strategy
async function handleOtherRequest(request) {
  try {
    const networkResponse = await fetch(request);
    const contentType = networkResponse.headers.get('Content-Type') || '';
    const cacheControl = networkResponse.headers.get('Cache-Control') || '';
    const isJson = contentType.includes('application/json');

    if (networkResponse.ok && !isJson && !cacheControl.includes('no-store') && !cacheControl.includes('no-cache')) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Other request failed', error);

    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/');
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending offline actions
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await syncAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync action', action, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Helper functions for background sync
async function getPendingActions() {
  // This would typically read from IndexedDB
  return [];
}

async function syncAction(action) {
  // This would typically make the actual API call
}

async function removePendingAction(actionId) {
  // This would typically remove from IndexedDB
}

// Push notification handling
self.addEventListener('push', (event) => {
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from HRMS Elite',
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/assets/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/images/xmark.png'
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