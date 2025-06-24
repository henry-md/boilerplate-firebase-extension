import { format } from 'date-fns'

// Content script that runs in the context of web pages
console.log("Content script loaded");

// Test the format import
const testDate = new Date();
console.log('testing format method:', format(testDate, 'yyyy-MM-dd HH:mm:ss'));

// You can add DOM manipulation or other content script functionality here
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded in content script");
});
