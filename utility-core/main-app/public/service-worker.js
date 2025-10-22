/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Azora OS advanced service worker: caching, push, update, and background sync

const CACHE_NAME = 'azora-os-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add more static assets here
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Update flow: show prompt when new SW is available
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Background sync event for offline actions (e.g. queued API calls)
self.addEventListener('sync', event => {
  if (event.tag === 'azora-sync') {
    event.waitUntil(
      // TODO: implement background sync (e.g. send queued requests)
      Promise.resolve(console.log('Background sync triggered'))
    );
  }
});

// Push notification event (Firebase-compatible)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: "Azora Notification", body: "New event" };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: "window"}).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
