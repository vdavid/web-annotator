import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { StatsBadge } from './StatsBadge'

describe('StatsBadge', () => {
    it('shows "No ratings yet" when totalRatings is 0', () => {
        render(<StatsBadge totalRatings={0} averageScore={0} />)
        expect(screen.getByText('No ratings yet')).toBeInTheDocument()
    })

    it('displays average score and total ratings', () => {
        render(<StatsBadge totalRatings={15} averageScore={8.4} />)
        expect(screen.getByText(/8\.4/)).toBeInTheDocument()
        expect(screen.getByText(/15 votes/)).toBeInTheDocument()
    })

    it('uses singular "vote" when totalRatings is 1', () => {
        render(<StatsBadge totalRatings={1} averageScore={9.0} />)
        expect(screen.getByText(/1 vote/)).toBeInTheDocument()
    })

    it('uses plural "votes" when totalRatings is greater than 1', () => {
        render(<StatsBadge totalRatings={2} averageScore={7.5} />)
        expect(screen.getByText(/2 votes/)).toBeInTheDocument()
    })
})
