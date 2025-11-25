/**
 * Checks if a URL represents an article based on heuristics.
 * This version works with a URL string rather than the current page.
 * Returns true if ANY of these conditions are met:
 * 1. Meta tag: Page has <meta property="og:type" content="article" />
 * 2. Schema.org: Page contains JSON-LD with "@type": "Article" or "NewsArticle"
 * 3. URL structure: The path depth is > 2 (e.g., nytimes.com/2025/10/my-post)
 */
export function isArticle(): boolean {
    // Check meta tag
    if (checkMetaTag()) {
        return true
    }

    // Check JSON-LD schema
    if (checkJsonLdSchema()) {
        return true
    }

    // Check URL structure
    return checkUrlStructure()
}

/**
 * Checks if a URL string represents an article based on URL structure.
 * This is a simplified check that can work without DOM access.
 */
export function isArticleURL(url: string): boolean {
    try {
        const urlObj = new URL(url)
        const path = urlObj.pathname
        // Remove leading and trailing slashes, then split
        const parts = path.split('/').filter((part) => part.length > 0)
        return parts.length > 2
    } catch {
        return false
    }
}

/**
 * Checks for Open Graph meta tag indicating an article.
 */
function checkMetaTag(): boolean {
    const metaTag = document.querySelector('meta[property="og:type"][content="article"]')
    return metaTag !== null
}

/**
 * Checks for JSON-LD schema with Article or NewsArticle type.
 */
function checkJsonLdSchema(): boolean {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')

    for (const script of scripts) {
        try {
            const content = script.textContent
            if (!content) {
                continue
            }

            const data = JSON.parse(content) as unknown

            // Handle both single objects and arrays
            const items = Array.isArray(data) ? data : [data]

            for (const item of items) {
                const typedItem = item as { '@type'?: string }
                if (typedItem['@type'] === 'Article' || typedItem['@type'] === 'NewsArticle') {
                    return true
                }
            }
        } catch {
            // Invalid JSON, skip
        }
    }

    return false
}

/**
 * Checks if URL path depth is > 2.
 * Example: nytimes.com/2025/10/my-post has depth 3 (2025, 10, my-post)
 */
function checkUrlStructure(): boolean {
    const path = window.location.pathname
    // Remove leading and trailing slashes, then split
    const parts = path.split('/').filter((part) => part.length > 0)
    return parts.length > 2
}
