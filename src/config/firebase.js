import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import { envValue } from './env';

const firebaseConfig = {
  apiKey: envValue('VITE_FIREBASE_API_KEY'),
  authDomain: envValue('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: envValue('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: envValue('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: envValue('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: envValue('VITE_FIREBASE_APP_ID'),
};

const measurementId = envValue('VITE_FIREBASE_MEASUREMENT_ID');
if (measurementId) firebaseConfig.measurementId = measurementId;

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  console.error(
    `Firebase config eksik: ${missing.join(', ')}. Worker değişkenlerini veya .env dosyasını kontrol edin.`,
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Messaging yalnızca desteklenen ortamlarda başlatılır
export const messagingPromise = isSupported().then((ok) => ok ? getMessaging(app) : null);

