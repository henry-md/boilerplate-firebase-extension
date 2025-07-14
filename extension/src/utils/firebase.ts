// src/utils/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth/web-extension';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDkqMBHwrNO2AyJiaay9k-ijgeVSZFuzEc",
  authDomain: "boilerplate-chrome-extension-2.firebaseapp.com",
  projectId: "boilerplate-chrome-extension-2",
  storageBucket: "boilerplate-chrome-extension-2.firebasestorage.app",
  messagingSenderId: "480449432531",
  appId: "1:480449432531:web:c30dd192323d45f528bd26",
  measurementId: "G-Y43FGSN8J2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth for Web Extension
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };