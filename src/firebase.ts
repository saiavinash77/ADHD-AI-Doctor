import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBLrUwPK8-HdFx9Thfd7_c4GadlqJIzs6M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0507708242.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0507708242",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0507708242.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "244082406529",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:244082406529:web:6de8474f3ab5eb09844980"
};

const app = initializeApp(firebaseConfig);

// Firestore only - Auth now handled by Clerk
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, "ai-studio-aiadhddoctor-8b6f7a75-61bf-4dbd-b170-d5deeb7839b5");
