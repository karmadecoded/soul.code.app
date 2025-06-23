importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging.js');

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

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'SoulCode Affirmation';
  const notificationOptions = {
    body: payload.notification?.body || 'Your daily affirmation is ready!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

const CACHE_NAME = 'soulcode-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.log('Service Worker: Cache failed', err);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }
                
                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync for notifications
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'affirmation-sync') {
        event.waitUntil(sendScheduledAffirmations());
    }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();

    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.matchAll().then(clientList => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main app
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        scheduleNotification(event.data.payload);
    }
    
    if (event.data && event.data.type === 'CLEAR_NOTIFICATIONS') {
        clearScheduledNotifications();
    }
});

// Schedule notification function
function scheduleNotification(payload) {
    const { time, affirmation, category } = payload;
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const delay = scheduledTime.getTime() - now.getTime();
    
    setTimeout(() => {
        self.registration.showNotification('SoulCode Affirmation', {
            body: affirmation,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'soulcode-affirmation',
            requireInteraction: false,
            silent: false,
            data: {
                category: category,
                affirmation: affirmation,
                time: time
            }
        });
        
        // Schedule for next day
        setInterval(() => {
            self.registration.showNotification('SoulCode Affirmation', {
                body: affirmation,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'soulcode-affirmation',
                data: {
                    category: category,
                    affirmation: affirmation,
                    time: time
                }
            });
        }, 24 * 60 * 60 * 1000); // 24 hours
        
    }, delay);
}

// Clear scheduled notifications
function clearScheduledNotifications() {
    self.registration.getNotifications().then(notifications => {
        notifications.forEach(notification => {
            if (notification.tag === 'soulcode-affirmation') {
                notification.close();
            }
        });
    });
}

// Send scheduled affirmations (for background sync)
async function sendScheduledAffirmations() {
    try {
        // Get user data from IndexedDB or cache
        const userData = await getUserData();
        
        if (userData && userData.selectedAffirmationCategories.length > 0) {
            const randomCategory = userData.selectedAffirmationCategories[
                Math.floor(Math.random() * userData.selectedAffirmationCategories.length)
            ];
            
            const affirmation = getRandomAffirmation(randomCategory);
            
            await self.registration.showNotification('SoulCode Affirmation', {
                body: affirmation,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'soulcode-affirmation',
                data: {
                    category: randomCategory,
                    affirmation: affirmation
                }
            });
        }
    } catch (error) {
        console.error('Service Worker: Error sending affirmation', error);
    }
}

// Get user data helper function
async function getUserData() {
    try {
        // Try to get from cache first
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match('/user-data');
        
        if (response) {
            return await response.json();
        }
        
        // Fallback to localStorage simulation
        return null;
    } catch (error) {
        console.error('Service Worker: Error getting user data', error);
        return null;
    }
}

// Get random affirmation helper function
function getRandomAffirmation(category) {
    const defaultAffirmations = {
        "Think Positively": [
            "I choose to see the good in every situation.",
            "My thoughts create my reality, and I choose positivity.",
            "Each day brings new opportunities and reasons to smile.",
            "I focus on what I can control and let go of what I can't.",
            "I am surrounded by positive energy and uplifting people."
        ],
        "Build Self-Confidence": [
            "I believe in myself and my abilities.",
            "I am confident, capable, and strong.",
            "I trust myself to make the right decisions.",
            "I am proud of who I am becoming.",
            "I have everything I need within me to succeed."
        ]
    };
    
    const affirmations = defaultAffirmations[category] || [
        `I am growing stronger in ${category.toLowerCase()}.`,
        `Each day I improve in ${category.toLowerCase()}.`,
        `I embrace positive change in ${category.toLowerCase()}.`
    ];
    
    return affirmations[Math.floor(Math.random() * affirmations.length)];
}

// Update cache when new version is available
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'UPDATE_CACHE') {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(urlsToCache);
            })
        );
    }
});

// Handle failed network requests for images
self.addEventListener('fetch', event => {
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request).catch(() => {
                    // Return placeholder image if image fails to load
                    return new Response(
                        '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect fill="#ccc" width="100" height="100"/><text x="50" y="50" font-size="12" text-anchor="middle" fill="#555" dy=".3em">Image not found</text></svg>',
                        { headers: { 'Content-Type': 'image/svg+xml' } }
                    );
                });
            })
        );
    }
});
