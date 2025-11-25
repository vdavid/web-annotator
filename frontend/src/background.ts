// Service worker for the Chrome extension
import { updateBadgeForUrl } from './utils/badgeUpdater'

if (typeof chrome !== 'undefined') {
    const chromeAction = chrome.action

    // Update badge when extension is installed
    chrome.runtime.onInstalled.addListener(() => {
        // Get current active tab and update badge
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.url) {
                void updateBadgeForUrl(tabs[0].url, chromeAction)
            }
        })
    })

    // Update badge when tab is updated (navigation)
    chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
        // Only update when navigation is complete
        if (changeInfo.status === 'complete' && tab.url) {
            void updateBadgeForUrl(tab.url, chromeAction)
        }
    })

    // Update badge when active tab changes
    chrome.tabs.onActivated.addListener((activeInfo) => {
        chrome.tabs.get(activeInfo.tabId, (tab) => {
            if (tab.url) {
                void updateBadgeForUrl(tab.url, chromeAction)
            }
        })
    })
}
