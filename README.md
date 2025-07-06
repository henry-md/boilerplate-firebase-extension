
OAuth flow:
- Popup.js sends chrome runtime message { action: 'SignIn' }
- Caught by background, which creates offscreen document from offscreen.js, and sends runtime message { action: "getAuth", target: "offscreen" }
- Caught by offscreen document, which in turn sends message to the iframe Firebase web page that it contained in an iframe in its own body. Sends that iframe message { initAuth: true }
- web element in iframe calls signInWithPopup and sends back user data

Basically:
- Popup.js -> Background.js creates offscreen document w/ iframe of Firebase web, which calls signInWithPopup from firebase auth.

Why is it this complicated:
- SignInWithPopup (Google OAuth) is fundamentally incompatible with chrome extensions V3 because it loads external code. So it must happen in 