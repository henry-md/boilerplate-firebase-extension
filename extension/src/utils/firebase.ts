// src/utils/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth/web-extension';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase config after you've created Firebase web app
const firebaseConfig = {
  apiKey: "AIzaSyAdLtyjcY6ViX-F6Q7abg_01jTr4fxIWMQ",
  authDomain: "boilerplate-firebase-extension.firebaseapp.com",
  projectId: "boilerplate-firebase-extension",
  storageBucket: "boilerplate-firebase-extension.firebasestorage.app",
  messagingSenderId: "402550927987",
  appId: "1:402550927987:web:43abc6f943e64838503006",
  measurementId: "G-6WWXNXMLY3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth for Web Extension
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };