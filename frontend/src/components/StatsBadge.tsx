interface StatsBadgeProps {
    totalRatings: number
    averageScore: number
}

export function StatsBadge({ totalRatings, averageScore }: StatsBadgeProps) {
    if (totalRatings === 0) {
        return <div className='text-sm text-gray-600 dark:text-gray-400'>No ratings yet</div>
    }

    return (
        <div className='text-sm text-gray-700 dark:text-gray-300'>
            <span className='font-semibold'>{averageScore.toFixed(1)}</span>
            <span className='text-gray-500 dark:text-gray-400'>/10</span>
            <span className='text-gray-500 dark:text-gray-400 ml-2'>
                ({totalRatings} {totalRatings === 1 ? 'vote' : 'votes'})
            </span>
        </div>
    )
}
