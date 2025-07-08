# Boilerplate Chrome extension with Firebase OAuth

## Tutorial

Original:

https://dev.to/lvn1/google-authentication-in-a-chrome-extension-with-firebase-2bmo

My hosted clone, in case that goes down:

https://henry-md.github.io/hosting/sites/tutorial-firebase-chrome-extension-oauth/index.html


## Amendments to tutorial

This tutorial is not perfect! Maybe it worked at the time, but it doesn't currently — it has it's own small bugs that need to be addressed.

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

- Added .gitignore files in /extension/, and root of project (.gitignore is configured by default with firebase in /web)

```
# /extension/.gitignore

node_modules
dist
build
*.zip
todo
todo.md

# /.gitignore

.cursorrules
temp
temp.txt
todo
todo.md
```

- Added .cursorrules in project root, useful if you use Cursor to give extra context to the LLM.

## Summary of non-code configurations (in tutorial, but compiled here)

#### Chrome web store

https://chrome.google.com/webstore/devconsole

- Create project (doesn't need to be published) so that you can get the ID. Note that we need to upload a zip file to even draft a chrome extension, so we can just zip a dummy chrome extension and upload that at first, and re-upload later.
- The ID of the drafted chrome extension should be added to /extension/public/manifest.json in key property to *deterministically* generate the ID of your local chrome extension.

#### Firebase Console

https://console.firebase.google.com

- Set up project, & web page within that project
- Set a sign-in method of google, and within that sign-in method, safelist the ID of your chrome webstore extension with a url like `chrome-extension://<chrome-webstore-extension-id>`
- Should then the configuration code you can navigate to with `Project Settings > Your Apps` into `/web/public/signInWithPopup.js`

#### Google Cloud Console

https://console.developers.google.com/apis/credentials

- Create OAuth credentials: Create credentials > OAuth client ID > Chrome Extension. Add the ID of your chrome webstore extension in item ID. Click Create.
- Should then add the Client ID under the Additional Information section into `/extension/publc/manifest.json` under `oauth2.client_id`

## OAuth flow

#### Outline of flow
- Popup.js sends chrome runtime message `{ action: 'SignIn' }`
- Caught by background, which creates offscreen document from offscreen.js, and sends runtime message `{ action: "getAuth", target: "offscreen" }`
- Caught by offscreen document, which in turn sends message to the iframe Firebase web page that it contained in an iframe in its own body. Sends that iframe message `{ initAuth: true }`
- Web element in iframe calls signInWithPopup and sends back user data

#### Simplified flow
- Popup.js -> Background.js creates offscreen document w/ iframe of Firebase web, which calls signInWithPopup from firebase auth.

#### Why ts has to be so complicated
- SignInWithPopup (Google OAuth) is fundamentally incompatible with chrome extensions V3 because it loads external code (loads content from accounts.google.com). So it must happen in the iframe of an offscreen document (offscreen document provides DOM context for the iframe)
