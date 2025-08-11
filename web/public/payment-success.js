// This script is on a public page and redirects back to the extension

const EXTENSION_ID = "enghnmokllhjfcoacepnappacemdifno"; // TODO: Replace with your actual extension ID

document.addEventListener("DOMContentLoaded", () => {
  const extensionUrl = `chrome-extension://${EXTENSION_ID}/success.html`;
  window.location.replace(extensionUrl);
});
