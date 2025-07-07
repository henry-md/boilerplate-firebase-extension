## Tutorial

- https://dev.to/lvn1/google-authentication-in-a-chrome-extension-with-firebase-2bmo


## Amendments to tutorial

- In web/public/signInWithPopup.js, import from the CDN instead of firebase packages so that you don't have to add a build step. This is common practice for Firebase web apps:

```
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
```
- Put public folder in /extension/ instead of /extension/src/
- In extension/webpack.config.js, added a non-default source map tool that didn't use eval, because eval statements are not allowed in chrome extensions:

```
devtool: "cheap-module-source-map"
```

- in extension/public/manifest.json, added tab and window permission. These allow use to use the chrome.tabs and chrome.windows APIs, which I use in background.js to bring the popup into focus

- in extension/src/background/background.js, added event listener to bring offscreen document into focus (so it isn't behind the current window and the user doesn't notice anything):

```
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && (
    changeInfo.url.includes('accounts.google.com/o/oauth2') ||
    changeInfo.url.includes('accounts.google.com/signin') ||
    changeInfo.url.includes(FIREBASE_HOSTING_URL)
  )) {
    chrome.windows.update(tab.windowId, { focused: true });
  }
});
```

- In extension/public/offscreen.js, added extra if statement in `handleIframeMessage` function so that we don't throw unnecessary errors and dirty the console logs by trying to parse internal Firebase messages that we shouldn't care about:

```
if (typeof data === "string" && data.startsWith("!_")) {
  return;
}
```

## OAuth flow

#### Outline of flow
- Popup.js sends chrome runtime message { action: 'SignIn' }
- Caught by background, which creates offscreen document from offscreen.js, and sends runtime message { action: "getAuth", target: "offscreen" }
- Caught by offscreen document, which in turn sends message to the iframe Firebase web page that it contained in an iframe in its own body. Sends that iframe message { initAuth: true }
- web element in iframe calls signInWithPopup and sends back user data

#### Simplified flow
- Popup.js -> Background.js creates offscreen document w/ iframe of Firebase web, which calls signInWithPopup from firebase auth.

#### Why ts has to be so complicated
- SignInWithPopup (Google OAuth) is fundamentally incompatible with chrome extensions V3 because it loads external code (loads content from accounts.google.com). So it must happen in the iframe of an offscreen document (offscreen document provides DOM context for the iframe)
