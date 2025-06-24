// Background script for Chrome extension
console.log("Hello from background");

// Listen for when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed/updated");
});
