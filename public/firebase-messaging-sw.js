importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'REMOVED',
  authDomain: 'movie-recommendation-ac259.firebaseapp.com',
  projectId: 'movie-recommendation-ac259',
  storageBucket: 'movie-recommendation-ac259.firebasestorage.app',
  messagingSenderId: '16285997660',
  appId: '1:16285997660:web:a9b20d657f0eb82b5da499',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'FilmBul', {
    body: body || '',
    icon: icon || '/icon-192.png',
    badge: '/icon-96.png',
    data: payload.data || {},
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
