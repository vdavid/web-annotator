import { usePageData } from '../hooks/usePageData'

import { Loader } from './Loader'
import { ReviewForm } from './ReviewForm'
import { StatsBadge } from './StatsBadge'

interface PopupProps {
    currentUrl: string | null
}

export function Popup({ currentUrl }: PopupProps) {
    const { status, data, error, submitRating } = usePageData(currentUrl)

    if (status === 'LOADING') {
        return (
            <div className='p-6 bg-white dark:bg-gray-900'>
                <Loader />
            </div>
        )
    }

    if (status === 'ERROR') {
        return (
            <div className='p-6 bg-white dark:bg-gray-900'>
                <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4'>
                    <p className='text-red-800 dark:text-red-200 text-sm'>{error || 'An error occurred'}</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className='p-6 bg-white dark:bg-gray-900'>
                <p className='text-gray-600 dark:text-gray-400'>No data available</p>
            </div>
        )
    }

    const isSubmitting = status === 'SUBMITTING'
    const showSuccess = status === 'SUCCESS'

    return (
        <div className='p-6 max-w-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'>
            <h1 className='text-xl font-bold mb-4'>WebAnnotator</h1>

            {showSuccess && (
                <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 mb-4'>
                    <p className='text-green-800 dark:text-green-200 text-sm'>Rating submitted successfully!</p>
                </div>
            )}

            <div className='mb-6'>
                <StatsBadge totalRatings={data.stats.total_ratings} averageScore={data.stats.average_score} />
            </div>

            <div className='border-t border-gray-200 dark:border-gray-700 pt-6'>
                <ReviewForm
                    initialRating={data.user_rating.score || 0}
                    initialComment={data.user_rating.comment || ''}
                    onSubmit={(score, comment) => {
                        void submitRating(score, comment)
                    }}
                    disabled={isSubmitting}
                />
            </div>
        </div>
    )
}
