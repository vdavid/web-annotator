interface StatsBadgeProps {
  totalRatings: number;
  averageScore: number;
}

export function StatsBadge({ totalRatings, averageScore }: StatsBadgeProps) {
  if (totalRatings === 0) {
    return <div className="text-sm text-gray-600">No ratings yet</div>;
  }

  return (
    <div className="text-sm text-gray-700">
      <span className="font-semibold">{averageScore.toFixed(1)}</span>
      <span className="text-gray-500">/10</span>
      <span className="text-gray-500 ml-2">
        ({totalRatings} {totalRatings === 1 ? 'vote' : 'votes'})
      </span>
    </div>
  );
}
