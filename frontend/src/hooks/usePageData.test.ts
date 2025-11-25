import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { usePageData } from './usePageData'

describe('usePageData', () => {
    beforeEach(() => {
        window.fetch = vi.fn() as typeof fetch
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('starts in LOADING state', () => {
        // Mock fetch to return a promise that never resolves (for this test)
        vi.mocked(window.fetch).mockImplementation(
            () => new Promise(() => {}), // Never resolves
        )

        const { result } = renderHook(() => usePageData('https://example.com/article'))

        expect(result.current.status).toBe('LOADING')
    })

    it('fetches page data on mount', async () => {
        const mockData = {
            can_rate: true,
            stats: {
                total_ratings: 10,
                average_score: 8.5,
            },
            user_rating: {
                has_rated: false,
            },
        }

        vi.mocked(window.fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        } as Response)

        const { result } = renderHook(() => usePageData('https://example.com/article'))

        await waitFor(() => {
            expect(result.current.status).toBe('IDLE')
        })

        expect(result.current.data).toEqual(mockData)
        expect(window.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/v1/pages/check'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'X-User-ID': expect.any(String),
                }),
            }),
        )
    })

    it('handles fetch errors', async () => {
        vi.mocked(window.fetch).mockRejectedValueOnce(new Error('Network error'))

        const { result } = renderHook(() => usePageData('https://example.com/article'))

        await waitFor(() => {
            expect(result.current.status).toBe('ERROR')
        })

        expect(result.current.error).toBe('Network error')
    })

    it('handles HTTP errors', async () => {
        vi.mocked(window.fetch).mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: 'Invalid URL' }),
        } as Response)

        const { result } = renderHook(() => usePageData('https://example.com/article'))

        await waitFor(() => {
            expect(result.current.status).toBe('ERROR')
        })

        expect(result.current.error).toBe('Invalid URL')
    })

    it('submits rating successfully', async () => {
        const mockCheckData = {
            can_rate: true,
            stats: {
                total_ratings: 5,
                average_score: 7.0,
            },
            user_rating: {
                has_rated: false,
            },
        }

        const mockSubmitResponse = {
            stats: {
                total_ratings: 6,
                average_score: 7.5,
            },
        }

        vi.mocked(window.fetch)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockCheckData,
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSubmitResponse,
            } as Response)

        const { result } = renderHook(() => usePageData('https://example.com/article'))

        await waitFor(() => {
            expect(result.current.status).toBe('IDLE')
        })

        await result.current.submitRating(8, 'Great article!')

        await waitFor(() => {
            expect(result.current.status).toBe('SUCCESS')
        })

        expect(window.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/v1/ratings'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'X-User-ID': expect.any(String),
                }),
                body: expect.stringContaining('"score":8'),
            }),
        )
    })

    it('handles rating submission errors', async () => {
        const mockCheckData = {
            can_rate: true,
            stats: {
                total_ratings: 5,
                average_score: 7.0,
            },
            user_rating: {
                has_rated: false,
            },
        }

        vi.mocked(window.fetch)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockCheckData,
            } as Response)
            .mockRejectedValueOnce(new Error('Submission failed'))

        const { result } = renderHook(() => usePageData('https://example.com/article'))

        await waitFor(() => {
            expect(result.current.status).toBe('IDLE')
        })

        await result.current.submitRating(8, 'Great article!')

        await waitFor(() => {
            expect(result.current.status).toBe('ERROR')
        })

        expect(result.current.error).toBe('Submission failed')
    })

    it('returns IDLE state when currentUrl is null', () => {
        const { result } = renderHook(() => usePageData(null))

        expect(result.current.status).toBe('IDLE')
    })
})
