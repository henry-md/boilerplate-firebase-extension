import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDaUAaJcMF3Bw8RIySWICEn3cEPdy-NL4I",
  authDomain: "boilerplate-chrome-extension.firebaseapp.com",
  projectId: "boilerplate-chrome-extension",
  storageBucket: "boilerplate-chrome-extension.firebasestorage.app",
  messagingSenderId: "81618600668",
  appId: "1:81618600668:web:37f8044381bb6eacf42a19",
  measurementId: "G-NZCXXST6CX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();

const PARENT_FRAME = document.location.ancestorOrigins[0];

function sendResponse(result) {
  globalThis.parent.self.postMessage(JSON.stringify(result), PARENT_FRAME);
}

globalThis.addEventListener('message', function({data}) {
  if (data.initAuth) {
    signInWithPopup(auth, provider)
      .then(sendResponse)
      .catch(sendResponse);
  }
});