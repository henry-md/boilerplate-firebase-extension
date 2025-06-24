import { format } from 'date-fns'

// Background script for Chrome extension
console.log("Hello from background");

const testDate = new Date();
console.log('testing format method:', format(testDate, 'yyyy-MM-dd HH:mm:ss'));

// Listen for when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed/updated");
});
