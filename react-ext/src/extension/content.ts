import { format } from 'date-fns'

// Test imports
const testDate = new Date();
console.log('Hello from content.ts @', format(testDate, 'yyyy-MM-dd HH:mm:ss'));

// You can add DOM manipulation or other content script functionality here
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded in content script");
});
