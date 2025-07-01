console.log('FIREBASE MESSAGING SW ACTIVE');

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
  console.log('FIREBASE SW SENDING NOTIFICATION');
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'SoulCode Affirmation';
  const notificationOptions = {
    body: payload.notification?.body || 'Your daily affirmation is ready!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      ...payload.data,
      url: '/#recent-affirmations'
    },
    actions: [
      { action: 'open_app', title: 'Open App', icon: '/icon-192.png' },
      { action: 'close', title: 'Close', icon: '/icon-192.png' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
