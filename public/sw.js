// Zeylab HRMS Service Worker
const CACHE_NAME = 'zeylab-hrms-v1.0.0';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('HRMS Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('HRMS Service Worker: Skip waiting');
        return self.skipWaiting();
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
            console.log('HRMS Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('HRMS Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests (let them go to network)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          console.log('HRMS Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('HRMS Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      }
    )
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('HRMS Service Worker: Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من نظام الموارد البشرية',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'فتح التطبيق',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/icons/icon-192x192.png'
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Zeylab HRMS', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('HRMS Service Worker: Notification click received');
  
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    event.notification.close();
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('HRMS Service Worker: Background sync triggered');
  
  if (event.tag === 'attendance-sync') {
    event.waitUntil(syncAttendanceData());
  }
});

// Sync attendance data when back online
async function syncAttendanceData() {
  try {
    // Get offline attendance data from IndexedDB
    const attendanceData = await getOfflineAttendanceData();
    
    if (attendanceData.length > 0) {
      // Send to server
      for (const record of attendanceData) {
        await fetch('/api/attendance/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(record)
        });
      }
      
      // Clear offline data after successful sync
      await clearOfflineAttendanceData();
      console.log('HRMS Service Worker: Attendance data synced successfully');
    }
  } catch (error) {
    console.error('HRMS Service Worker: Error syncing attendance data:', error);
  }
}

// Helper functions for offline data management
async function getOfflineAttendanceData() {
  // Implementation would use IndexedDB
  return [];
}

async function clearOfflineAttendanceData() {
  // Implementation would clear IndexedDB
}