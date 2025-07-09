const CACHE_VERSION = 'v13.0.7';
const CACHE_NAME = `soulcode-${CACHE_VERSION}`;

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
    let affirmationText = 'Your daily affirmation is ready!';
    
    try {
        if (event.data) {
            const payload = event.data.json();
            
            // 🔧 Use Version 1's working logic with Version 2's clean structure
            affirmationText = payload?.notification?.body || 
                            payload?.body || 
                            payload?.data?.affirmation || 
                            'Your daily affirmation is ready!';
        }
    } catch (e) {
        console.error('Error parsing push payload:', e);
    }

    // 🎨 Version 2's nice notification structure
    const options = {
        body: affirmationText,
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
            self.skipWaiting(),
            caches.open(CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
        ])
    );
});

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

self.addEventListener('fetch', event => {
    if (!event.request.url.startsWith(self.location.origin)) return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }
                
                return fetch(event.request)
                    .then(networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        } else if (event.request.destination === 'image') {
                            return new Response(
                                `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="100" height="100" fill="#cdb2e3"/>
                                    <text x="50" y="50" text-anchor="middle" dy=".3em" fill="#4c135d">✨</text>
                                </svg>`,
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                    });
            })
    );
});

console.log('Service Worker: Loaded successfully');
