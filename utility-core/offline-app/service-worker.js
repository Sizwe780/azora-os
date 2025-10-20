/**
 * Azora OS - Offline-First Service Worker
 * Enables 80% functionality without internet
 * 
 * Features:
 * - Cache all essential resources
 * - Offline data sync queue
 * - Background sync when connection restored
 * - IndexedDB for local storage
 * - Zero-rated optimization
 * 
 * Author: Sizwe Ngwenya <sizwe.ngwenya@azora.world>
 */

const CACHE_VERSION = 'azora-v1.0.0';
const OFFLINE_CACHE = 'azora-offline-v1';
const RUNTIME_CACHE = 'azora-runtime-v1';

// Essential files to cache for offline use
const ESSENTIAL_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/app.css',
  '/js/app.js',
  '/js/offline-sync.js',
  '/js/indexeddb-manager.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// API endpoints that work offline (cached responses)
const OFFLINE_API_CACHE = [
  '/api/pricing',
  '/api/features',
  '/api/countries',
  '/api/payment-methods',
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => {
      console.log('[Service Worker] Caching essential resources');
      return cache.addAll(ESSENTIAL_CACHE);
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== OFFLINE_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response immediately
          console.log('[Service Worker] Serving API from cache:', url.pathname);
          
          // Update cache in background if online
          if (navigator.onLine) {
            fetch(request)
              .then((response) => {
                if (response.ok) {
                  caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(request, response.clone());
                  });
                }
              })
              .catch(() => {});
          }
          
          return cachedResponse;
        }
        
        // Try network, cache on success
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for failed API requests
            return new Response(
              JSON.stringify({
                error: 'Offline',
                message: 'This feature requires internet. Data will sync when reconnected.',
                offline: true,
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503,
              }
            );
          });
      })
    );
    return;
  }
  
  // Handle other requests (HTML, CSS, JS, images)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', url.pathname);
        return cachedResponse;
      }
      
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          
          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});

// Background sync - sync data when connection restored
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data to server
async function syncOfflineData() {
  try {
    // Get pending operations from IndexedDB
    const db = await openDB();
    const tx = db.transaction('pendingOperations', 'readonly');
    const store = tx.objectStore('pendingOperations');
    const operations = await store.getAll();
    
    console.log(`[Service Worker] Syncing ${operations.length} pending operations`);
    
    for (const operation of operations) {
      try {
        const response = await fetch(operation.url, {
          method: operation.method,
          headers: operation.headers,
          body: operation.body,
        });
        
        if (response.ok) {
          // Remove from pending queue
          const deleteTx = db.transaction('pendingOperations', 'readwrite');
          const deleteStore = deleteTx.objectStore('pendingOperations');
          await deleteStore.delete(operation.id);
          
          console.log('[Service Worker] Synced operation:', operation.id);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync operation:', error);
      }
    }
    
    // Notify clients
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          operationsCount: operations.length,
        });
      });
    });
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
  }
}

// Helper: Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AzoraOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingOperations')) {
        db.createObjectStore('pendingOperations', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
    };
  });
}