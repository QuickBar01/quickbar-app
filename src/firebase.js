import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBxcUWhfCubVScAN2jyL3AVrwW1dhX7mZ4",
  authDomain: "quickbarsnclub.firebaseapp.com",
  projectId: "quickbarsnclub",
  storageBucket: "quickbarsnclub.firebasestorage.app",
  messagingSenderId: "856351316525",
  appId: "1:856351316525:web:03d208f1a30731aa5176a4"
};

const app = initializeApp(firebaseConfig);

// FORCER HTTP au lieu de QUIC
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false
});

const auth = getAuth(app);

export { db, auth };