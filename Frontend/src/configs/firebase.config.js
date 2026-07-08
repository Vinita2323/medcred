import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDvK3NGW3clyhJWFHx-1IjErais3J1nhac",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "medcred-e979e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "medcred-e979e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "medcred-e979e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "913121843388",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:913121843388:web:951a87b805eb01b50518b9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DPQKH1Q3FB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);
export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BHv79JzoOJxsBFrZQz8Ela2YNoUIxkyqquyaJzbmsOtxTPZW0cyvUtvEl1ht4BAg9aDs2z9nsjKvkFX7D9NjzZw";
