// API Polling & Storage logic
console.log("Background script initialized");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
