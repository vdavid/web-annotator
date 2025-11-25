package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/vdavid/web-annotator/backend/internal/db"
	"github.com/vdavid/web-annotator/backend/internal/models"
	"github.com/vdavid/web-annotator/backend/internal/utils"
)

// PagesRepository handles database operations for pages.
type PagesRepository struct {
	pool *db.Pool
}

// NewPagesRepository creates a new pages repository.
func NewPagesRepository(pool *db.Pool) *PagesRepository {
	return &PagesRepository{pool: pool}
}

// GetOrCreatePage ensures a page exists in the database and returns its ID.
// If the page already exists (by url_hash), it returns the existing ID.
// Otherwise, it creates a new page and returns the new ID.
func (r *PagesRepository) GetOrCreatePage(ctx context.Context, normalizedURL string) (int64, error) {
	urlHash := utils.HashURL(normalizedURL)

	var pageID int64
	err := r.pool.QueryRow(ctx,
		`INSERT INTO pages (url_hash, normalized_url) 
		 VALUES ($1, $2) 
		 ON CONFLICT (url_hash) DO NOTHING 
		 RETURNING id`,
		urlHash, normalizedURL).Scan(&pageID)

	if err == pgx.ErrNoRows {
		// Page already exists, fetch its ID
		err = r.pool.QueryRow(ctx,
			`SELECT id FROM pages WHERE url_hash = $1`,
			urlHash).Scan(&pageID)
		if err != nil {
			return 0, fmt.Errorf("failed to get existing page: %w", err)
		}
		return pageID, nil
	}

	if err != nil {
		return 0, fmt.Errorf("failed to create page: %w", err)
	}

	return pageID, nil
}

// GetPageStats retrieves aggregated statistics for a page by its URL hash.
func (r *PagesRepository) GetPageStats(ctx context.Context, urlHash string) (*models.PageStats, error) {
	var stats models.PageStats
	err := r.pool.QueryRow(ctx,
		`SELECT 
			COUNT(r.id)::int as total_ratings,
			COALESCE(AVG(r.score), 0)::float as avg_score
		FROM pages p
		LEFT JOIN ratings r ON p.id = r.page_id
		WHERE p.url_hash = $1
		GROUP BY p.id`,
		urlHash).Scan(&stats.TotalRatings, &stats.AverageScore)

	if err == pgx.ErrNoRows {
		// Page doesn't exist yet, return zero stats
		return &models.PageStats{
			TotalRatings: 0,
			AverageScore: 0,
		}, nil
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get page stats: %w", err)
	}

	return &stats, nil
}

// GetUserRating retrieves the current user's rating for a page, if it exists.
func (r *PagesRepository) GetUserRating(ctx context.Context, urlHash string, userID string) (*models.UserRating, error) {
	var userRating models.UserRating
	var score *int
	var comment *string

	err := r.pool.QueryRow(ctx,
		`SELECT r.score, r.comment
		FROM pages p
		INNER JOIN ratings r ON p.id = r.page_id
		WHERE p.url_hash = $1 AND r.user_id = $2`,
		urlHash, userID).Scan(&score, &comment)

	if err == pgx.ErrNoRows {
		// User hasn't rated this page
		return &models.UserRating{
			HasRated: false,
			Score:    nil,
			Comment:  nil,
		}, nil
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get user rating: %w", err)
	}

	userRating.HasRated = true
	userRating.Score = score
	userRating.Comment = comment

	return &userRating, nil
}
