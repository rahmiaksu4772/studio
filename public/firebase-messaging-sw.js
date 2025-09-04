// This file should be in the public folder

importScripts('https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// More info: https://firebase.google.com/docs/cloud-messaging/js/client
const firebaseConfig = {
  apiKey: "AIzaSyCJ3G_aB6dj3gvxgjg3sygeMnMNnEcXywE",
  authDomain: "takip-k0hdb.firebaseapp.com",
  projectId: "takip-k0hdb",
  storageBucket: "takip-k0hdb.appspot.com",
  messagingSenderId: "1093335320755",
  appId: "1:1093335320755:web:b029a206cb0fe66f7408c6"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // Optional: Add an icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
