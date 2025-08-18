// This script is on a public page and redirects back to the extension

// TODO: Replace with your local extension ID
const EXTENSION_ID = "enghnmokllhjfcoacepnappacemdifno";

document.addEventListener("DOMContentLoaded", () => {
  const extensionUrl = `chrome-extension://${EXTENSION_ID}/success.html`;
  window.location.replace(extensionUrl);
});
