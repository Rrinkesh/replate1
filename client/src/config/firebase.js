import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyDummyKeyForDevelopmentModeOnly123",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "replate-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "replate-dev",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "replate-dev.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

// Initialize Firebase App singleton safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Set local persistence explicitly
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("Firebase persistence warning:", error.message);
});

export default app;
