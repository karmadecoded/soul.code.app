const CACHE_VERSION = 'v21.0.4';
const CACHE_NAME = `soulcode-${CACHE_VERSION}`;

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAPCFjjC6SqtQEauTQ6Hs7Ex-B2tj6PuXM",
  authDomain: "soul-code-app.firebaseapp.com",
  projectId: "soul-code-app",
  storageBucket: "soul-code-app.firebasestorage.app",
  messagingSenderId: "339179205157",
  appId: "1:339179205157:web:e801c0ad054cbc6a1c05cc",
  measurementId: "G-C1K5PGZJB7"
});

const messaging = firebase.messaging();

const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Firebase messaging handler (for iPhone)
messaging.onBackgroundMessage(function(payload) {
    return self.registration.showNotification('SoulCode', {
        body: payload.notification.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'soulcode-affirmation'
    });
});

// Push handler (for Android)
self.addEventListener('push', event => {
    let affirmationText = 'Your daily affirmation is ready!';
    try {
        const payload = event.data?.json();
        if (payload?.notification?.body) {
            affirmationText = payload.notification.body;
        }
    } catch (e) {
        console.error('Error parsing push payload:', e);
    }

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

// Notification click handler
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({type: 'window', includeUncontrolled: true})
            .then(function(clientList) {
                if (clientList.length > 0) {
                    let client = clientList[0];
                    client.focus();
                    client.postMessage({type: 'OPEN_RECENT_AFFIRMATIONS'});
                    return;
                }
                clients.openWindow('/?page=recent-affirmations');
            })
    );
});

// Your existing caching code
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

console.log('Service Worker: Loaded successfully');
