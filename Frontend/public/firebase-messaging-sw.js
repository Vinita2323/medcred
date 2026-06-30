importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDvK3NGW3clyhJWFHx-1IjErais3J1nhac",
  authDomain: "medcred-e979e.firebaseapp.com",
  projectId: "medcred-e979e",
  storageBucket: "medcred-e979e.firebasestorage.app",
  messagingSenderId: "913121843388",
  appId: "1:913121843388:web:951a87b805eb01b50518b9",
  measurementId: "G-DPQKH1Q3FB"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
