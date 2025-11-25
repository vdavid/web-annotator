import React, { useState } from 'react'

import { StarRating } from './StarRating'

interface ReviewFormProps {
    initialRating?: number
    initialComment?: string
    onSubmit: (rating: number, comment: string) => void
    disabled?: boolean
}

export function ReviewForm({ initialRating = 0, initialComment = '', onSubmit, disabled = false }: ReviewFormProps) {
    const [rating, setRating] = useState(initialRating)
    const [comment, setComment] = useState(initialComment)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (rating > 0) {
            onSubmit(rating, comment)
        }
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Your rating</label>
                <StarRating rating={rating} onRate={setRating} disabled={disabled} />
            </div>

            <div>
                <label htmlFor='comment' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Your review (optional)
                </label>
                <textarea
                    id='comment'
                    value={comment}
                    onChange={(e) => {
                        setComment(e.target.value)
                    }}
                    disabled={disabled}
                    rows={4}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed placeholder:text-gray-400 dark:placeholder:text-gray-500'
                    placeholder='Share your thoughts about this article...'
                />
            </div>

            <button
                type='submit'
                disabled={disabled || rating === 0}
                className='w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200'
            >
                {disabled ? 'Submitting...' : 'Submit rating'}
            </button>
        </form>
    )
}
