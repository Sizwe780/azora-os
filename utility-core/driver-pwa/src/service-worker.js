/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open('azora-cache').then((cache) => cache.add('/')));
  });
  self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then((resp) => resp || fetch(e.request)));
  });
  