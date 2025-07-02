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
  if (payload.data && payload.data.handled) {
    return;
  }
  
  // Add handled flag
  if (payload.data) {
    payload.data.handled = true;
  }

  const notificationTitle = payload.notification?.title || 'SoulCode Affirmation';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [
      { action: 'explore', title: 'Open App', icon: '/icon-192.png' },
      { action: 'close', title: 'Close', icon: '/icon-192.png' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

  
  // Open the Recent Affirmations page instead of main app
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navigate to recent affirmations page
          client.postMessage({
  command: 'openRecentAffirmations'
});
          return client.focus();
        }
      }
      
      // If app is not open, open it with recent affirmations page
      if (clients.openWindow) {
        return clients.openWindow('/?page=recent-affirmations');
      }
    })
  );
});
