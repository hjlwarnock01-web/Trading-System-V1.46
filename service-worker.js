// Service Worker for Harvey Trading System PWA
const CACHE_NAME = 'harvey-trading-v3';

const urlsToCache = [
  '/Trading-System-V1.46/index.html',
  '/Trading-System-V1.46/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for notifications (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  console.log('Syncing notifications...');
  // This could be expanded to handle offline notification queue
}

// Push notifications - Enhanced for task notifications
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received:', event);

  const data = event.data ? event.data.json() : {};
  const title = data.title || '⏰ Tasks Ready';
  const options = {
    body: data.body || 'You have tasks due now',
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%232563eb%22/><text x=%2250%22 y=%2270%22 text-anchor=%22middle%22 font-size=%2260%22 fill=%22white%22>💹</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✓</text></svg>',
    vibrate: [300, 100, 300, 100, 300],
    tag: data.tag || 'task-notification',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open Tasks', icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✓</text></svg>' },
      { action: 'dismiss', title: 'Dismiss', icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✖</text></svg>' }
    ],
    data: data,
    timestamp: Date.now()
  };

  console.log('📤 Showing notification:', title, options);

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks - Enhanced with deep linking
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action, event.notification.data);

  event.notification.close();

  if (event.action === 'dismiss') {
    console.log('❌ User dismissed notification');
    return;
  }

  // Determine URL based on notification data
  let targetUrl = '/Trading-System-V1.46/index.html';
  if (event.notification.data) {
    const data = event.notification.data;
    if (data.group) {
      targetUrl = `/Trading-System-V1.46/index.html?page=tasks&group=${data.group}`;
    } else if (data.url) {
      targetUrl = data.url;
    }
  }

  console.log('🔗 Opening URL:', targetUrl);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('📱 Focusing existing window');
            return client.focus().then(client => {
              // Send message to open specific page
              if (event.notification.data) {
                client.postMessage({
                  type: 'NAVIGATE_TO_TASKS',
                  data: event.notification.data
                });
              }
              return client;
            });
          }
        }
        // No window open, open new one
        console.log('🆕 Opening new window');
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
