import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { ReviewForm } from './ReviewForm'

describe('ReviewForm', () => {
    it('renders with initial rating and comment', () => {
        const onSubmit = vi.fn()
        render(<ReviewForm initialRating={8} initialComment='Great article!' onSubmit={onSubmit} />)

        const textarea = screen.getByLabelText(/your review/i)
        expect(textarea).toHaveValue('Great article!')
    })

    it('calls onSubmit with rating and comment when submitted', async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()
        render(<ReviewForm initialRating={5} onSubmit={onSubmit} />)

        const textarea = screen.getByLabelText(/your review/i)
        await user.type(textarea, 'This is a test comment')

        const submitButton = screen.getByRole('button', { name: /submit rating/i })
        await user.click(submitButton)

        expect(onSubmit).toHaveBeenCalledWith(5, 'This is a test comment')
    })

    it('disables submit button when rating is 0', () => {
        const onSubmit = vi.fn()
        render(<ReviewForm initialRating={0} onSubmit={onSubmit} />)

        const submitButton = screen.getByRole('button', { name: /submit rating/i })
        expect(submitButton).toBeDisabled()
    })

    it('disables form when disabled prop is true', () => {
        const onSubmit = vi.fn()
        render(<ReviewForm initialRating={8} onSubmit={onSubmit} disabled={true} />)

        const textarea = screen.getByLabelText(/your review/i)
        const submitButton = screen.getByRole('button', { name: /submitting/i })

        expect(textarea).toBeDisabled()
        expect(submitButton).toBeDisabled()
        expect(submitButton).toHaveTextContent('Submitting...')
    })
})
