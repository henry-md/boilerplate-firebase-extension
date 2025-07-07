// Avoid a build step by using the CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyDkqMBHwrNO2AyJiaay9k-ijgeVSZFuzEc",
  authDomain: "boilerplate-chrome-extension-2.firebaseapp.com",
  projectId: "boilerplate-chrome-extension-2",
  storageBucket: "boilerplate-chrome-extension-2.firebasestorage.app",
  messagingSenderId: "480449432531",
  appId: "1:480449432531:web:c30dd192323d45f528bd26",
  measurementId: "G-Y43FGSN8J2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

// This gives you a reference to the parent frame, i.e. the offscreen document.
const PARENT_FRAME = document.location.ancestorOrigins[0];

const PROVIDER = new GoogleAuthProvider();

function sendResponse(result) {
  window.parent.postMessage(JSON.stringify(result), PARENT_FRAME);
}

window.addEventListener('message', function({data}) {
  if (data.initAuth) {
    signInWithPopup(auth, PROVIDER)
      .then(sendResponse)
      .catch(sendResponse);
  }
});