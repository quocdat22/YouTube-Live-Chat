// Background script for YouTube Live Chat Fullscreen Extension

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);
  
  if (request.action === 'checkLiveStream') {
    // This could be expanded to perform API calls or other background tasks
    // For now, just respond with a basic message
    sendResponse({ success: true });
  }
  
  return true; // Indicates we wish to send a response asynchronously
}); 
