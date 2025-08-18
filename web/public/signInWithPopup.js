// Avoid a build step by using the CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

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