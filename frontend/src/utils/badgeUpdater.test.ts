import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { calculateBadgeText, fetchPageStats, updateBadgeForUrl, type ChromeAction } from './badgeUpdater'

describe('badgeUpdater', () => {
    describe('calculateBadgeText', () => {
        it('returns empty string for zero ratings', () => {
            expect(calculateBadgeText(0)).toBe('')
        })

        it('returns count as string for ratings 1-99', () => {
            expect(calculateBadgeText(1)).toBe('1')
            expect(calculateBadgeText(50)).toBe('50')
            expect(calculateBadgeText(99)).toBe('99')
        })

        it('returns "99+" for ratings over 99', () => {
            expect(calculateBadgeText(100)).toBe('99+')
            expect(calculateBadgeText(500)).toBe('99+')
            expect(calculateBadgeText(1000)).toBe('99+')
        })
    })

    describe('fetchPageStats', () => {
        beforeEach(() => {
            window.fetch = vi.fn() as typeof fetch
        })

        afterEach(() => {
            vi.restoreAllMocks()
        })

        it('returns page stats on successful API call', async () => {
            const mockResponse = {
                can_rate: true,
                stats: {
                    total_ratings: 5,
                    average_score: 8.5,
                },
                user_rating: {
                    has_rated: false,
                },
            }

            vi.mocked(window.fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response)

            const result = await fetchPageStats('https://example.com/article')

            expect(result).toEqual(mockResponse)
            expect(window.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/pages/check?url='),
                expect.objectContaining({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    headers: expect.objectContaining({
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        'X-User-ID': expect.any(String),
                    }),
                }),
            )
        })

        it('returns null on API error', async () => {
            vi.mocked(window.fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
            } as Response)

            const result = await fetchPageStats('https://example.com/article')

            expect(result).toBeNull()
        })

        it('returns null on network error', async () => {
            vi.mocked(window.fetch).mockRejectedValueOnce(new Error('Network error'))

            const result = await fetchPageStats('https://example.com/article')

            expect(result).toBeNull()
        })
    })

    describe('updateBadgeForUrl', () => {
        let mockChromeAction: ChromeAction

        beforeEach(() => {
            window.fetch = vi.fn() as typeof fetch
            mockChromeAction = {
                setBadgeText: vi.fn(),
                setBadgeBackgroundColor: vi.fn(),
            }
        })

        afterEach(() => {
            vi.restoreAllMocks()
        })

        it('does nothing when URL is undefined', async () => {
            await updateBadgeForUrl(undefined, mockChromeAction)

            expect(mockChromeAction.setBadgeText).not.toHaveBeenCalled()
        })

        it('does nothing when chromeAction is undefined', async () => {
            await updateBadgeForUrl('https://example.com/article', undefined)

            expect(window.fetch).not.toHaveBeenCalled()
        })

        it('clears badge for non-article URLs', async () => {
            await updateBadgeForUrl('https://example.com', mockChromeAction)

            expect(mockChromeAction.setBadgeText).toHaveBeenCalledWith({ text: '' })
            expect(window.fetch).not.toHaveBeenCalled()
        })

        it('clears badge when API returns null', async () => {
            vi.mocked(window.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response)

            await updateBadgeForUrl('https://example.com/2025/01/article', mockChromeAction)

            expect(mockChromeAction.setBadgeText).toHaveBeenCalledWith({ text: '' })
            expect(mockChromeAction.setBadgeBackgroundColor).not.toHaveBeenCalled()
        })

        it('sets badge text and color for articles with ratings', async () => {
            const mockResponse = {
                can_rate: true,
                stats: {
                    total_ratings: 5,
                    average_score: 8.5,
                },
                user_rating: {
                    has_rated: false,
                },
            }

            vi.mocked(window.fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response)

            await updateBadgeForUrl('https://example.com/2025/01/article', mockChromeAction)

            expect(mockChromeAction.setBadgeText).toHaveBeenCalledWith({ text: '5' })
            expect(mockChromeAction.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#3b82f6' })
        })

        it('clears badge for articles with zero ratings', async () => {
            const mockResponse = {
                can_rate: true,
                stats: {
                    total_ratings: 0,
                    average_score: 0,
                },
                user_rating: {
                    has_rated: false,
                },
            }

            vi.mocked(window.fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response)

            await updateBadgeForUrl('https://example.com/2025/01/article', mockChromeAction)

            expect(mockChromeAction.setBadgeText).toHaveBeenCalledWith({ text: '' })
            expect(mockChromeAction.setBadgeBackgroundColor).not.toHaveBeenCalled()
        })

        it('shows "99+" for articles with more than 99 ratings', async () => {
            const mockResponse = {
                can_rate: true,
                stats: {
                    total_ratings: 150,
                    average_score: 8.5,
                },
                user_rating: {
                    has_rated: false,
                },
            }

            vi.mocked(window.fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response)

            await updateBadgeForUrl('https://example.com/2025/01/article', mockChromeAction)

            expect(mockChromeAction.setBadgeText).toHaveBeenCalledWith({ text: '99+' })
            expect(mockChromeAction.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#3b82f6' })
        })
    })

    describe('integration: updateBadgeForUrl end-to-end', () => {
        let mockChromeAction: ChromeAction
        let badgeTextCalls: Array<{ text: string }>
        let badgeColorCalls: Array<{ color: string }>

        beforeEach(() => {
            window.fetch = vi.fn() as typeof fetch
            badgeTextCalls = []
            badgeColorCalls = []
            mockChromeAction = {
                setBadgeText: vi.fn((details: { text: string }) => {
                    badgeTextCalls.push(details)
                }),
                setBadgeBackgroundColor: vi.fn((details: { color: string }) => {
                    badgeColorCalls.push(details)
                }),
            }
        })

        afterEach(() => {
            vi.restoreAllMocks()
        })

        it('handles complete flow: article URL -> API call -> badge update', async () => {
            const articleUrl = 'https://example.com/2025/01/interesting-article'
            const mockResponse = {
                can_rate: true,
                stats: {
                    total_ratings: 42,
                    average_score: 8.2,
                },
                user_rating: {
                    has_rated: false,
                },
            }

            vi.mocked(window.fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response)

            await updateBadgeForUrl(articleUrl, mockChromeAction)

            // Verify API was called with correct URL
            expect(window.fetch).toHaveBeenCalledTimes(1)
            const fetchCall = vi.mocked(window.fetch).mock.calls[0]
            if (typeof fetchCall[0] === 'string') {
                expect(fetchCall[0]).toContain('/api/v1/pages/check')
                expect(fetchCall[0]).toContain(encodeURIComponent(articleUrl))
            }
            if (typeof fetchCall[1] === 'object' && 'headers' in fetchCall[1]) {
                const headers = fetchCall[1].headers as Record<string, string>
                expect(headers).toHaveProperty('X-User-ID')
            }

            // Verify badge was updated correctly
            expect(badgeTextCalls).toHaveLength(1)
            expect(badgeTextCalls[0]).toEqual({ text: '42' })
            expect(badgeColorCalls).toHaveLength(1)
            expect(badgeColorCalls[0]).toEqual({ color: '#3b82f6' })
        })

        it('handles non-article URL without API call', async () => {
            const nonArticleUrl = 'https://example.com'

            await updateBadgeForUrl(nonArticleUrl, mockChromeAction)

            // Verify API was not called
            expect(window.fetch).not.toHaveBeenCalled()

            // Verify badge was cleared
            expect(badgeTextCalls).toHaveLength(1)
            expect(badgeTextCalls[0]).toEqual({ text: '' })
            expect(badgeColorCalls).toHaveLength(0)
        })

        it('handles API error gracefully', async () => {
            const articleUrl = 'https://example.com/2025/01/article'

            vi.mocked(window.fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
            } as Response)

            await updateBadgeForUrl(articleUrl, mockChromeAction)

            // Verify API was called
            expect(window.fetch).toHaveBeenCalledTimes(1)

            // Verify badge was cleared on error
            expect(badgeTextCalls).toHaveLength(1)
            expect(badgeTextCalls[0]).toEqual({ text: '' })
            expect(badgeColorCalls).toHaveLength(0)
        })
    })
})
