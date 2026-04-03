importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
  projectId: "gen-lang-client-0085440574",
  appId: "1:495444334874:web:99d054cd575b23988374a3",
  apiKey: "AIzaSyA9NcrTiHFJf0zP8YkuPhtobkDa7opDWgI",
  authDomain: "gen-lang-client-0085440574.firebaseapp.com",
  messagingSenderId: "495444334874",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
