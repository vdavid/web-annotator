import { useState } from 'react'

interface StarRatingProps {
    rating: number
    onRate: (rating: number) => void
    disabled?: boolean
}

export function StarRating({ rating, onRate, disabled = false }: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0)

    const handleClick = (value: number) => {
        if (!disabled) {
            onRate(value)
        }
    }

    const handleMouseEnter = (value: number) => {
        if (!disabled) {
            setHoverRating(value)
        }
    }

    const handleMouseLeave = () => {
        if (!disabled) {
            setHoverRating(0)
        }
    }

    const getStarColor = (index: number) => {
        const displayRating = hoverRating || rating
        if (index <= displayRating) {
            return 'text-yellow-400'
        }
        return 'text-gray-300'
    }

    return (
        <div className='flex gap-1'>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                    key={value}
                    type='button'
                    onClick={() => {
                        handleClick(value)
                    }}
                    onMouseEnter={() => {
                        handleMouseEnter(value)
                    }}
                    onMouseLeave={handleMouseLeave}
                    disabled={disabled}
                    className={`${getStarColor(value)} transition-colors duration-200 ${
                        disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                    }`}
                    aria-label={`Rate ${String(value)} out of 10`}
                >
                    <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                </button>
            ))}
        </div>
    )
}
