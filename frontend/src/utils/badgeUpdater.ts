import { isArticleURL } from './articleDetector'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:52181'
const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000'

export interface CheckPageResponse {
    can_rate: boolean
    stats: {
        total_ratings: number
        average_score: number
    }
    user_rating: {
        has_rated: boolean
        score?: number
        comment?: string
    }
}

export interface ChromeAction {
    setBadgeText: (details: { text: string }) => void
    setBadgeBackgroundColor: (details: { color: string }) => void
}

/**
 * Fetches page statistics from the API.
 */
export async function fetchPageStats(url: string): Promise<CheckPageResponse | null> {
    try {
        const response = await fetch(`${API_BASE}/api/v1/pages/check?url=${encodeURIComponent(url)}`, {
            headers: {
                'X-User-ID': MOCK_USER_ID,
            },
        })

        if (!response.ok) {
            return null
        }

        return (await response.json()) as CheckPageResponse
    } catch {
        return null
    }
}

/**
 * Calculates the badge text from total ratings count.
 * Returns empty string if count is 0, "99+" if count > 99, otherwise the count as string.
 */
export function calculateBadgeText(totalRatings: number): string {
    if (totalRatings === 0) {
        return ''
    }
    return totalRatings > 99 ? '99+' : String(totalRatings)
}

/**
 * Updates the extension badge with rating count for a given URL.
 * If the URL is not an article or there's an error, clears the badge.
 */
export async function updateBadgeForUrl(
    url: string | undefined,
    chromeAction: ChromeAction | undefined,
): Promise<void> {
    if (!url || !chromeAction) {
        return
    }

    // Check if URL is an article using URL structure heuristic
    if (!isArticleURL(url)) {
        chromeAction.setBadgeText({ text: '' })
        return
    }

    const data = await fetchPageStats(url)

    if (!data) {
        chromeAction.setBadgeText({ text: '' })
        return
    }

    const totalRatings = data.stats.total_ratings
    const badgeText = calculateBadgeText(totalRatings)

    chromeAction.setBadgeText({ text: badgeText })

    if (totalRatings > 0) {
        chromeAction.setBadgeBackgroundColor({ color: '#3b82f6' })
    }
}
