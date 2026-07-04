import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import dotenv from 'dotenv';
dotenv.config();

let app;
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  app = initializeApp({
    credential: cert(serviceAccount)
  });
} catch (err) {
  console.warn("Firebase Admin Initialization Error:", err.message);
}

export default {
  messaging: () => getMessaging(app)
};
