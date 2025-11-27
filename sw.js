// Service Worker for Harvey Trading System PWA
const CACHE_NAME = 'harvey-trading-v1';
const TELEGRAM_BOT_TOKEN = '8526702374:AAFPdx6Cufhs4ebgf9jkWzVVtgAPmUdTReI';
const TELEGRAM_CHAT_ID = '5279215525';

const urlsToCache = [
  '/index.html',
  '/manifest.json'
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

// Handle wake trigger webhook from iOS Shortcuts
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname === '/api/wake-trigger' && event.request.method === 'POST') {
    event.respondWith(handleWakeTrigger());
  }
});

async function handleWakeTrigger() {
  const now = new Date();
  const UTC_OFFSET = 7; // UTC+7
  const localTime = new Date(now.getTime() + (UTC_OFFSET * 60 * 60 * 1000));
  const hour = localTime.getUTCHours();
  const today = localTime.toISOString().split('T')[0];

  // Check if time is between 3am and 12pm (local time UTC+7)
  if (hour < 3 || hour >= 12) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Outside allowed time window (3am-12pm)'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check localStorage via clients
  const clients = await self.clients.matchAll();
  let alreadyTriggered = false;

  for (const client of clients) {
    const response = await client.postMessage({
      type: 'CHECK_WAKE_TRIGGER',
      today: today
    });
  }

  if (alreadyTriggered) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Already triggered today'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Trigger wake alarm
  for (const client of clients) {
    client.postMessage({
      type: 'TRIGGER_WAKE_ALARM'
    });
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Wake alarm triggered successfully'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

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

// Push notifications (for future enhancement)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Harvey Trading System';
  const options = {
    body: data.body || 'Notification from your trading system',
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💹</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💹</text></svg>',
    vibrate: [200, 100, 200],
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
