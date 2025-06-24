// Content script that runs in the context of web pages
console.log("Content script loaded");

// You can add DOM manipulation or other content script functionality here
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded in content script");
});
