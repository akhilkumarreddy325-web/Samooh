import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCkU-woO29TykzHDAlRRbvxmHTtN5XAjLY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "samooh1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "samooh1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "samooh1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "49307670908",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:49307670908:web:7775c301a6310a9229acf9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-D4NXHE95ZE"
};

// Initialize Firebase App safely (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
