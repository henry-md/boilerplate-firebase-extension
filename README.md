# Boilerplate Chrome extension with Firebase OAuth

- React + TS + Tailwind
- Firebase backend w/ OAuth
- Module background & content scripts

## Setup & Develoment

### Install dependencies

```
pnpm install
```

You need a bit of non-code configurations to get Firebase OAuth to work. They're listed in a lot of detail in the [tutorial](#configure-firebase-oauth) discussed below, but I've also compiled the steps here

### Chrome web store

https://chrome.google.com/webstore/devconsole

- Create project (doesn't need to be published) so that you can get the ID. Note that we need to upload a zip file to even draft a chrome extension, so we can just zip a dummy chrome extension and upload that at first, and re-upload later.
- The ID of the drafted chrome extension should be added to /extension/public/manifest.json in key property to _deterministically_ generate the ID of your local chrome extension.

### Firebase Console

https://console.firebase.google.com

- Set up project, & web page within that project
- Set a sign-in method of google, and within that sign-in method, safelist the ID of your chrome webstore extension with a url like `chrome-extension://<chrome-webstore-extension-id>`
- Should then the configuration code you can navigate to with `Project Settings > Your Apps` into `/web/public/signInWithPopup.js`

### Google Cloud Console

https://console.developers.google.com/apis/credentials

- Create OAuth credentials: Create credentials > OAuth client ID > Chrome Extension. Add the ID of your chrome webstore extension in item ID. Click Create.
- Should then add the Client ID under the Additional Information section into `/extension/publc/manifest.json` under `oauth2.client_id`

## Build for Chrome Extension

```
pnpm run build
```

- The build output will be in `build/`. This should be unpacked in your extension manager, which you can access at `chrome://extensions/`. If you're new to chrome extensions, you will want to look at a tutorial for "unpacking" custom extensions.

## For Reference: How this Boilerplate Was Created

I've included a set of tutorials and steps that outline everything I did in this project.

### Configure React-TS project with Vite:

`npm create vite@latest boiler-chrome-extension -- --template react-ts`

### Configure Tailwind

https://tailwindcss.com/docs/installation/using-vite

### Configure React Project as Chrome Extension

https://medium.com/@5tigerjelly/creating-a-chrome-extension-with-react-and-vite-boilerplate-provided-db3d14473bf6

### Configure Module Background & Content Scripts

Add background & content scripts

- Create background.ts & content.ts in src/scripts/
- vite.config.ts: add `background` and `content` rollupOptions.input options; specify rollupOptions.output (to specify how the extension will be compiled to the build folder)
- manifest.json: add `activeTab` & `scripting` permissions; add background & content_scripts rules (to specify the chrome extension injection rules once compiled to the build folder)

Configure scripts as modules

- Content script: add "... && esbuild src/scripts/content.ts --bundle --outfile=build/content.js" to package.json build command, and remove content.ts from rollupOptions.input so that we don't compile it twice.
- Background script: in manifest.json add "type": "module" to background

### Configure Firebase OAuth

To follow most easily, I would recommend following the tutorial in a separate project first, and then integrating with the existing React project later.

Original tutorial:

https://dev.to/lvn1/google-authentication-in-a-chrome-extension-with-firebase-2bmo

An identical tutorial hosted by me, in case that goes down:

https://henry-md.github.io/hosting/sites/tutorial-firebase-chrome-extension-oauth/index.html

### Amendments to Tutorial

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

### Additions to Tutorial to Integrate with Existing React Project

If you're combining the tutorial project with the React project after the fact, I would recommend bringing the logic from the Firebase OAuth project into the React project, as opposed to bringing the React project into the Firebase OAuth project. The following are changes I made to the React-TS-TWC Vite project:

- Web folder can go in root of project directory as it was in tutorial
- In manifest.json, include permissions, etc. mentioned in React project. The new manifest folder should essentially be the sum of the configuration options of our existing React & tutorial configurations.
- create `/extension/src/scripts/firebase-config.js` with content from background.js in the Firebase OAuth tutorial. Import this logic in our background.ts script to separate logic.
- Create `/extension/src/pages/Popup.tsx`, which reworks popup.html & popup.jsx into a jsx functional component
- Serve <Popup /> from App.tsx
- In vite.config.js, add `build.minify` and `build.sourcemap` options.

## OAuth flow

### Outline of flow

Popup.jsx sends chrome runtime message `{ action: 'SignIn' }`

Caught by background script (firebase-config.js), which creates offscreen document from offscreen.html and offscreen.js, and sends runtime message `{ action: "getAuth", target: "offscreen" }` to that offscreen document it just created

Caught by offscreen document, which in turn sends message to the Firebase web page that it contained in an iframe in its own body. Sends that iframe message `{ initAuth: true }`

Web element in iframe calls signInWithPopup and sends back user data to the offscreen document, which goes back to the background script (firebase-config.js), which stores the user object in `chrome.storage.local`

### Why ts has to be so complicated

SignInWithPopup (Google OAuth) is fundamentally incompatible with chrome extensions V3 because it loads external code (loads content from accounts.google.com). So it must happen in the iframe of an offscreen document (offscreen document provides DOM context for the iframe)
