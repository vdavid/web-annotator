import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { StarRating } from './StarRating'

describe('StarRating', () => {
    it('renders 10 stars', () => {
        const onRate = vi.fn()
        render(<StarRating rating={0} onRate={onRate} />)

        const stars = screen.getAllByRole('button')
        expect(stars).toHaveLength(10)
    })

    it('calls onRate when a star is clicked', async () => {
        const user = userEvent.setup()
        const onRate = vi.fn()
        render(<StarRating rating={0} onRate={onRate} />)

        const fifthStar = screen.getAllByRole('button')[4]
        await user.click(fifthStar)

        expect(onRate).toHaveBeenCalledWith(5)
    })

    it('highlights stars up to the current rating', () => {
        const onRate = vi.fn()
        const { container } = render(<StarRating rating={7} onRate={onRate} />)

        const stars = container.querySelectorAll('svg')
        // First 7 stars should be yellow, last 3 should be gray
        expect(stars[0].parentElement?.className).toContain('text-yellow-400')
        expect(stars[6].parentElement?.className).toContain('text-yellow-400')
        expect(stars[7].parentElement?.className).toContain('text-gray-300')
    })

    it('disables interaction when disabled prop is true', () => {
        const onRate = vi.fn()
        render(<StarRating rating={0} onRate={onRate} disabled={true} />)

        const stars = screen.getAllByRole('button')
        stars.forEach((star) => {
            expect(star).toBeDisabled()
        })
    })
})
