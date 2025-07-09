import "./firebase-config";
import { format } from 'date-fns'

// Test imports
const testDate = new Date();
console.log('Hello from background.ts @', format(testDate, 'yyyy-MM-dd HH:mm:ss'));

// Listen for when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed/updated");
});
