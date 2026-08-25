// Service Worker for LifeLink Hospital Web
// Provides offline support, push notifications, and caching

const CACHE_NAME = 'lifelink-v2.1';
const STATIC_CACHE = 'lifelink-static-v2.1';
const DYNAMIC_CACHE = 'lifelink-dynamic-v2.1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon-32.png',
  '/favicon-16.png',
  '/apple-touch-icon.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Supabase API requests - always go to network
  if (url.hostname.includes('supabase.co') || url.pathname.startsWith('/rest/') || url.pathname.startsWith('/realtime/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Skip WebSocket connections
  if (url.protocol === 'wss:' || url.protocol === 'ws:') {
    return;
  }

  // Static assets - cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages - network first with cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: network first
  event.respondWith(networkFirst(request));
});

// Network first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Offline fallback for HTML
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, response));
      }
    }).catch(() => {});
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline page for HTML
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/index.html');
    }
    throw error;
  }
}

function isStaticAsset(pathname) {
  return (
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.ttf') ||
    pathname.endsWith('.eot')
  );
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Emergency blood request',
    icon: '/favicon-32.png',
    badge: '/favicon-16.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'lifelink-emergency',
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'respond', title: 'I\'ll Donate' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || '🩸 LifeLink Emergency', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'respond') {
    // Open app to donor response page
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Focus existing window if open
          for (const client of clientList) {
            if (client.url.includes('/donor') && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow('/donor');
          }
        })
    );
  } else if (event.action === 'dismiss') {
    // Just close notification
    return;
  } else {
    // Default click - open app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if ('focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'donor-response') {
    event.waitUntil(syncDonorResponses());
  }
});

async function syncDonorResponses() {
  // Get pending responses from IndexedDB
  // This would require a more complex implementation
  console.log('[SW] Syncing donor responses...');
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(event.data.urls))
    );
  }
});

console.log('[SW] LifeLink Service Worker loaded');