import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
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
export const db = getFirestore(app);
export const auth = getAuth(app);