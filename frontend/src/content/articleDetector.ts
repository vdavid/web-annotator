// Content script that runs in the page context
// This allows us to use the actual isArticle() function with access to the page's DOM
import { isArticle } from '../utils/articleDetector'

// Listen for messages from popup or background script
if (typeof chrome !== 'undefined') {
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
        const typedRequest = request as { action?: string }
        if (typedRequest.action === 'checkIsArticle') {
            try {
                const result = isArticle() // Use the actual function!
                sendResponse({ isArticle: result })
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                const errorStack = error instanceof Error ? error.stack : undefined
                sendResponse({
                    isArticle: false,
                    error: errorMessage,
                    stack: errorStack,
                })
            }
            return true // Keep the message channel open for async response
        }
        return false
    })
}
