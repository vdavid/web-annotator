// Content script that runs in the page context
// This allows us to use the actual isArticle() function with access to the page's DOM
import { isArticle } from '../utils/articleDetector';

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'checkIsArticle') {
    try {
      const result = isArticle(); // Use the actual function!
      sendResponse({ isArticle: result });
    } catch (error) {
      console.error('[WebAnnotator] Error checking if article:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      sendResponse({ 
        isArticle: false, 
        error: errorMessage,
        stack: errorStack
      });
    }
    return true; // Keep the message channel open for async response
  }
  return false;
});
