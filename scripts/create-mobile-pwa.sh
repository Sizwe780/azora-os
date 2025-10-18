#!/bin/bash
set -e
echo "📱 Creating Mobile PWA..."

mkdir -p frontend/public/icons frontend/src/pages

# Create manifest
cat > frontend/public/manifest.json << 'MANIFEST'
{
  "name": "Azora OS",
  "short_name": "Azora",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1e1b4b",
  "theme_color": "#06b6d4",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
MANIFEST

# Create service worker
cat > frontend/public/sw.js << 'SW'
/* eslint-disable no-undef */
const CACHE = 'azora-v2';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
SW

# Create offline page
cat > frontend/public/offline.html << 'OFFLINE'
<!DOCTYPE html>
<html>
<head><title>Offline - Azora</title></head>
<body style="background:#1e1b4b;color:white;text-align:center;padding:50px;">
  <h1>📡 Offline</h1>
  <p>You're offline. Reconnect to continue.</p>
</body>
</html>
OFFLINE

echo "✅ Mobile PWA created"
