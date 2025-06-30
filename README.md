# Chrome Extension

#### Tech stack:
- Vite + React + TS Template
- Tailwind Configuration
- Firebase backend

#### Features:
- Basic sign-in, sign-up with Firebase OAuth

## Configure React project

1. npm create vite@latest boiler-chrome-extension -- --template react-ts
2. cd boiler-chrome-extension && npm install

## Configure Tailwind

- https://tailwindcss.com/docs/installation/using-vite

## Configure chrome extension

- https://medium.com/@5tigerjelly/creating-a-chrome-extension-with-react-and-vite-boilerplate-provided-db3d14473bf6

## Configure Background & Content Scripts as modules

1. Configure background & content scripts
  - Create background.ts & content.ts in src/extension/
  - vite.config.ts: add `background` and `content` rollupOptions.input options; specify rollupOptions.output (to specify how the extension will be compiled to the build folder)
  - manifest.json: add `activeTab` & `scripting` permissions; add background & content_scripts rules (to specify the chrome extension injection rules once compiled to the build folder)
2. Allow importing in background & content scripts
  - Content script: add "... && esbuild src/extension/content.ts --bundle --outfile=build/content.js" to package.json build command, and remove content.ts from rollupOptions.input so that we don't compile it twice.
  - Background script: in manifest.json add "type": "module" to background

## Configure Firebase
[need to fill in]



## Configure Miscellaneous
  - Autocomplete with chrome's api: `npm install --save-dev chrome-types`
