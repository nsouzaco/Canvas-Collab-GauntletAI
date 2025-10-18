import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "collabcanvas-71e95.firebaseapp.com",
  databaseURL: "https://collabcanvas-71e95-default-rtdb.firebaseio.com",
  projectId: "collabcanvas-71e95",
  storageBucket: "collabcanvas-71e95.firebasestorage.app",
  messagingSenderId: "624493173361",
  appId: "1:624493173361:web:f1f904a99f1af3033a59d0",
  measurementId: "G-N3GJ2G1NYQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Debug Firebase connection
console.log('Firebase initialized:', {
  auth: !!auth,
  db: !!db,
  rtdb: !!rtdb,
  databaseURL: firebaseConfig.databaseURL
});

export default app;
