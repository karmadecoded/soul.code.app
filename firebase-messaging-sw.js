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
    return self.registration.showNotification('SoulCode', {
        body: payload.data?.affirmation || "Your daily affirmation is ready!",body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'soulcode-affirmation'
    });
});

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
