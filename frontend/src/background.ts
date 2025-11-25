// Service worker for the Chrome extension
if (typeof chrome !== 'undefined') {
    chrome.runtime.onInstalled.addListener(() => {
        // Extension installed
    })
}
