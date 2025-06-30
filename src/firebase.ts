// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth/web-extension';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDaUAaJcMF3Bw8RIySWICEn3cEPdy-NL4I",
  authDomain: "boilerplate-chrome-extension.firebaseapp.com",
  projectId: "boilerplate-chrome-extension",
  storageBucket: "boilerplate-chrome-extension.firebasestorage.app",
  messagingSenderId: "81618600668",
  appId: "1:81618600668:web:37f8044381bb6eacf42a19",
  measurementId: "G-NZCXXST6CX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// App is only a strictly necessary parameter if you have multiple apps
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword };
