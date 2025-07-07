importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

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
  console.log('=== DEBUG PAYLOAD ===');
  console.log('Full payload:', JSON.stringify(payload, null, 2));
  console.log('notification.title:', payload.notification?.title);
  console.log('notification.body:', payload.notification?.body);
  console.log('data object:', payload.data);
  console.log('=== END DEBUG ===');

  fetch('/notification-config.json')
    .then(response => response.json())
    .then(config => {
      const androidConfig = config.notification_settings;
      const notificationTitle = payload.notification?.title || 'SoulCode Affirmation';
      const notificationOptions = {
        body: typeof payload.notification?.body === 'string' ? payload.notification.body : 'Your daily affirmation is ready!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        data: payload.data || {},
        actions: [
          { action: 'explore', title: 'Open App', icon: '/icon-192.png' },
          { action: 'close', title: 'Close', icon: '/icon-192.png' }
        ],
        android: androidConfig,
        requireInteraction: true,
        renotify: true,
        tag: 'soul-code-notification'
      };
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
});

self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification clicked', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'OPEN_RECENT_AFFIRMATIONS'
          });
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow('/?page=recent-affirmations');
      }
    })
  );
});
