/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Offline-First Service Worker
 * Enables full functionality without internet connection
 */

const CACHE_VERSION = 'azora-v1-offline';
const ESSENTIAL_CACHE = 'azora-essential';
const DATA_CACHE = 'azora-data';

// Critical files needed for offline operation
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/assets/logo.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ESSENTIAL_CACHE)
      .then((cache) => {
        console.log('📦 Caching essential files for offline use');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== ESSENTIAL_CACHE && cacheName !== DATA_CACHE) {
              console.log('🗑️  Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - try network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  }
  // Static assets - cache first
  else {
    event.respondWith(cacheFirstStrategy(request));
  }
});

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    // Return cached response, but update cache in background
    updateCache(request);
    return cached;
  }

  try {
    const response = await fetch(request);
    await cacheResponse(request, response.clone());
    return response;
  } catch (error) {
    // Offline and no cache - show offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Network-first strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request, {
      timeout: 5000, // 5 second timeout
    });

    // Cache successful API responses
    if (response.ok) {
      await cacheResponse(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('📡 Network failed, using cached data');
    
    const cached = await caches.match(request);
    
    if (cached) {
      // Add header to indicate offline mode
      const offlineResponse = new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: new Headers({
          ...cached.headers,
          'X-Azora-Offline': 'true',
        }),
      });
      return offlineResponse;
    }

    // No cache - return offline response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'No internet connection and no cached data available',
      offline: true,
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Update cache in background
async function updateCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cacheResponse(request, response);
    }
  } catch (error) {
    // Silently fail - we're just updating cache
  }
}

// Cache a response
async function cacheResponse(request, response) {
  const cache = await caches.open(DATA_CACHE);
  await cache.put(request, response);
}

// Background sync - queue failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  console.log('🔄 Syncing offline transactions...');
  
  const db = await openIndexedDB();
  const transactions = await db.getAll('pending_transactions');

  for (const txn of transactions) {
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(txn),
        headers: { 'Content-Type': 'application/json' },
      });
      
      await db.delete('pending_transactions', txn.id);
      console.log('✅ Synced transaction:', txn.id);
    } catch (error) {
      console.error('❌ Failed to sync:', txn.id);
    }
  }
}

// IndexedDB helper
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AzoraDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending_transactions')) {
        db.createObjectStore('pending_transactions', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('offline_data')) {
        db.createObjectStore('offline_data', { keyPath: 'key' });
      }
    };
  });
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-mesh-peers') {
    event.waitUntil(checkMeshPeers());
  }
});

async function checkMeshPeers() {
  // Trigger mesh network discovery
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'MESH_DISCOVERY',
      timestamp: Date.now(),
    });
  });
}

// Push notifications for mesh network updates
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  if (data.type === 'MESH_UPDATE') {
    event.waitUntil(
      self.registration.showNotification('Azora OS', {
        body: 'New data synced from nearby device',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge.png',
        tag: 'mesh-sync',
      })
    );
  }
});

console.log('🌐 Azora OS Service Worker - Offline-First Mode Active');
