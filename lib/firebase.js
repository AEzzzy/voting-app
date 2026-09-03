import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBILsoyQMr8pSyB4AfdVCNzTXWETP3oQaM",
  authDomain: "voting-app-4edbb.firebaseapp.com",
  projectId: "voting-app-4edbb",
  storageBucket: "voting-app-4edbb.firebasestorage.app",
  messagingSenderId: "293635140144",
  appId: "1:293635140144:web:02ce8d6c82f03eb2669bf5",
  measurementId: "G-BXZDLW9H15"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
