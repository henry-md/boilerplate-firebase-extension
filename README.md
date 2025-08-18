# Boilerplate Chrome extension with Firebase OAuth & Stripe

- React, TS, Tailwind, Vite app
- Firebase backend w/ Google OAuth
- Stripe integration
- Module background & content scripts

## DevOps Integrations

https://www.youtube.com/watch?v=n09p8Y7XfNI

- Make sure you've replaced everything listed // TODO: Replace ..., as well as
  - extension/public/icons; extension/public/manifest.json name, description, icons, oauth2.client_id, key (shown in video tutorial as well); web/.firebaserc
- Safelist your firebase web app in Firebase authentication. Go to "Safelist client IDs" and add something like boilerplate-firebase-extension.firebaseapp.com & .web.app

To get from Test to Live mode
- After transactions run well in test, Repeat the steps to create a Stripe api key and webhook, but outside of Test mode [2:45 - 3:38, 3:55 - 4:47]. Replace those keys in your Firebase Extension.
- Copy your product in Stripe from the Test environment to the live environment. It's an option under menu of the product, so should just be one click.

Note:
- When uploading to chrome web store, you need to delete key in manifest.json. Then when you reload locally, add it back again so that you keep your constant extension id, which is required for redirection url to work in Stripe.

### Setup & Development

```
cd extension
pnpm install
pnpm build

cd web
firebase deploy
```

- The build output will be in `build/`. This should be unpacked in your extension manager, which you can access at `chrome://extensions/`.
