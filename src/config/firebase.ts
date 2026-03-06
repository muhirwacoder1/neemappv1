import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
// @ts-ignore – getReactNativePersistence exists at runtime in firebase/auth
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ═══════════════════════════════════════════════════════════════
// 🔑  Paste your Firebase config here
//     Firebase Console → Project Settings → Your apps → Web app
// ═══════════════════════════════════════════════════════════════
const firebaseConfig = {
    apiKey: 'AIzaSyDaFuSQ9lz-3An-5GQ9q8ztzxy91NHAceY',
    authDomain: 'neem-app-e042d.firebaseapp.com',
    projectId: 'neem-app-e042d',
    storageBucket: 'neem-app-e042d.firebasestorage.app',
    messagingSenderId: '333411713540',
    appId: '1:333411713540:web:e165f70e1bbcfad1d52b51',
    measurementId: 'G-1N2R0K9XHM',
};

const app = initializeApp(firebaseConfig);

// Auth with persistent login (survives app restart)
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore database
export const db = getFirestore(app);

// Storage for images/files
export const storage = getStorage(app);
