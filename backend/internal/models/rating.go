package models

// Rating represents a user's rating and comment for a page.
type Rating struct {
	ID        int64   `db:"id"`
	UserID    string  `db:"user_id"`
	PageID    int64   `db:"page_id"`
	Score     int     `db:"score"`
	Comment   *string `db:"comment"` // Nullable
	CreatedAt string  `db:"created_at"`
	UpdatedAt string  `db:"updated_at"`
}

// PageStats contains aggregated statistics for a page.
type PageStats struct {
	TotalRatings int     `db:"total_ratings"`
	AverageScore float64 `db:"avg_score"`
}

// UserRating contains the current user's rating for a page, if any.
type UserRating struct {
	HasRated bool    `db:"has_rated"`
	Score    *int    `db:"score"`   // Nullable
	Comment  *string `db:"comment"` // Nullable
}
