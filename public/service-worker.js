/* eslint-env serviceworker */
/* global self, caches, clients, Response, URL, location, fetch */

/**
 * Azora OS Service Worker
 * Offline-first Progressive Web App
 * 
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 * Built for 40% offline functionality across all devices
 */

const CACHE_NAME = 'azora-os-v1.0.0';
const OFFLINE_CACHE = 'azora-offline-v1.0.0';

// Critical resources for 40% offline functionality
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/manifest.json',
];

// Install service worker and cache core assets
self.addEventListener('install', (event) => {
  console.log('[Azora SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Azora SW] Caching core assets for offline use');
      return cache.addAll(CORE_ASSETS);
    }).then(() => {
      console.log('[Azora SW] Core assets cached - 40% offline capability enabled');
      return self.skipWaiting();
    })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Azora SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => {
            console.log('[Azora SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[Azora SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch strategy: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests: Try network, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log('[Azora SW] Serving cached API response (offline mode)');
              return cached;
            }
            
            // Return offline response
            return new Response(
              JSON.stringify({
                offline: true,
                message: 'You are currently offline. Some features may be limited.',
                timestamp: Date.now(),
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
              }
            );
          });
        })
    );
    return;
  }

  // Static assets: Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached, but update in background
        fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response);
            });
          }
        }).catch(() => {
          // Network error, ignore (we're returning cache anyway)
        });
        
        return cached;
      }

      // Not in cache, fetch from network
      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Network failed and not in cache
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
        
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Azora SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-tracking-data') {
    event.waitUntil(syncTrackingData());
  } else if (event.tag === 'sync-ai-queries') {
    event.waitUntil(syncAIQueries());
  }
});

// Sync tracking data when back online
async function syncTrackingData() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/tracking/')) {
        try {
          await fetch(request);
          await cache.delete(request);
          console.log('[Azora SW] Synced tracking data:', request.url);
        } catch (error) {
          console.error('[Azora SW] Failed to sync:', error);
        }
      }
    }
  } catch (error) {
    console.error('[Azora SW] Sync failed:', error);
  }
}

// Sync AI queries when back online
async function syncAIQueries() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/ai/')) {
        try {
          await fetch(request);
          await cache.delete(request);
          console.log('[Azora SW] Synced AI query:', request.url);
        } catch (error) {
          console.error('[Azora SW] Failed to sync:', error);
        }
      }
    }
  } catch (error) {
    console.error('[Azora SW] Sync failed:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New notification from Azora OS',
    icon: '/logo-premium.svg',
    badge: '/logo-premium.svg',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Azora OS', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

console.log('[Azora SW] Service worker loaded - Made in South Africa by Sizwe Ngwenya 🇿🇦');
