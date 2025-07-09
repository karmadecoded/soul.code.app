const CACHE_VERSION = 'v15.0.5';
const CACHE_NAME = soulcode-${CACHE_VERSION};
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];
self.addEventListener('push', event => {
    const options = {
        body: event.data ? (event.data.json().notification?.body || event.data.json().body || 'Your daily affirmation is ready!') : 'Default notification message',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    event.waitUntil(
        self.registration.showNotification('Soul Code', options)
    );
});

self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            // Force immediate activation
            self.skipWaiting(),
            // Cache resources
            caches.open(CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
        ])
    );
});



// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith('soulcode-') && cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            clients.claim()
        ])
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }
                
                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    })
                    .catch(() => {
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Handle failed network requests
self.addEventListener('fetch', event => {
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request).catch(() => {
                    return new Response(
                        '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#cdb2e3"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#4c135d">✨</text></svg>',
                        { headers: { 'Content-Type': 'image/svg+xml' } }
                    );
                });
            })
        );
    }
});

console.log('Service Worker: Loaded successfully')
