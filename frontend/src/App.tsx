import { useEffect, useState } from 'react'

import { Popup } from './components/Popup'
import { isArticleURL } from './utils/articleDetector'

function App() {
    const [currentUrl, setCurrentUrl] = useState<string | null>(null)
    const [isArticle, setIsArticle] = useState<boolean | null>(null)

    useEffect(() => {
        // Get the current tab URL from Chrome extension API
        const chromeTabs = typeof chrome !== 'undefined' ? chrome.tabs : undefined
        if (chromeTabs) {
            chromeTabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.url && tabs[0].id) {
                    const url = tabs[0].url
                    setCurrentUrl(url)

                    // First check URL structure (fast, no DOM access needed)
                    const urlCheck = isArticleURL(url)

                    if (urlCheck) {
                        setIsArticle(true)
                    } else {
                        // URL structure doesn't suggest article, check DOM via content script
                        chromeTabs.sendMessage(tabs[0].id, { action: 'checkIsArticle' }, (response) => {
                            if (chrome.runtime.lastError) {
                                // Content script might not be loaded (e.g., chrome:// pages)
                                setIsArticle(false)
                            } else {
                                const typedResponse = response as { isArticle?: boolean } | undefined
                                setIsArticle(typedResponse?.isArticle ?? false)
                            }
                        })
                    }
                }
            })
        } else {
            // Fallback for development/testing
            const url = window.location.href
            // Use setTimeout to avoid synchronous setState in effect
            setTimeout(() => {
                setCurrentUrl(url)
                setIsArticle(isArticleURL(url))
            }, 0)
        }
    }, [])

    if (isArticle === null) {
        return (
            <div className='p-6'>
                <p className='text-gray-600'>Loading...</p>
            </div>
        )
    }

    if (!isArticle) {
        return (
            <div className='p-6 max-w-md'>
                <h1 className='text-xl font-bold mb-4'>WebAnnotator</h1>
                <div className='bg-yellow-50 border border-yellow-200 rounded-md p-4'>
                    <p className='text-yellow-800 text-sm'>Ratings are only available for articles.</p>
                </div>
            </div>
        )
    }

    return <Popup currentUrl={currentUrl} />
}

export default App
