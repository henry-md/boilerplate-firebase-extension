# Chrome Extension

- Vite + React + TS Template
- Tailwind Configuration

## Configuring React project:

1. npm create vite@latest boiler-chrome-extension -- --template react-ts
2. cd boiler-chrome-extension && npm install

## Configuring Tailwind

- https://tailwindcss.com/docs/installation/using-vite

## Configuring chrome extension

- https://medium.com/@5tigerjelly/creating-a-chrome-extension-with-react-and-vite-boilerplate-provided-db3d14473bf6

## Other changes made

- Configured background & content scripts
  - Create background.ts & content.ts in src/scripts/
  - vite.config.ts: add `background` and `content` rollupOptions.input options; specify rollupOptions.output (to specify how the extension will be compiled to the build folder)
  - manifest.json: add `activeTab` & `scripting` permissions; add background & content_scripts rules (to specify the chrome extension injection rules once compiled to the build folder)
- Allow importing in background & content scripts
  - Content script: add "... && esbuild src/scripts/content.ts --bundle --outfile=build/content.js" to package.json build command, and remove content.ts from rollupOptions.input so that we don't compile it twice.
  - Background script: in manifest.json add "type": "module" to background