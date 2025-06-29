'SoulCode Affirmation';
  const notificationOptions = {
    body: typeof payload.notification?.body === 'string' ? payload.notification.body : 'Your daily affirmation is ready!',
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
// Notification click handler
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification clicked', event);
  
  event.notification.close();
  
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
            type: 'OPEN_RECENT_AFFIRMATIONS'
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
