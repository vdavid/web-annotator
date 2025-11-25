package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/vdavid/web-annotator/backend/internal/db"
	"github.com/vdavid/web-annotator/backend/internal/models"
)

// RatingsRepository handles database operations for ratings.
type RatingsRepository struct {
	pool *db.Pool
}

// NewRatingsRepository creates a new ratings repository.
func NewRatingsRepository(pool *db.Pool) *RatingsRepository {
	return &RatingsRepository{pool: pool}
}

// UpsertRating creates or updates a user's rating for a page.
// It uses a transaction to ensure atomicity.
func (r *RatingsRepository) UpsertRating(ctx context.Context, pageID int64, userID string, score int, comment *string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func(tx pgx.Tx, ctx context.Context) {
		err := tx.Rollback(ctx)
		if err != nil {
			fmt.Printf("Failed to rollback transaction: %v\n", err)
		}
	}(tx, ctx)

	_, err = tx.Exec(ctx,
		`INSERT INTO ratings (user_id, page_id, score, comment, updated_at)
		 VALUES ($1, $2, $3, $4, NOW())
		 ON CONFLICT (user_id, page_id) 
		 DO UPDATE SET 
			score = EXCLUDED.score,
			comment = EXCLUDED.comment,
			updated_at = NOW()`,
		userID, pageID, score, comment)

	if err != nil {
		return fmt.Errorf("failed to upsert rating: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetPageStatsAfterRating recalculates page statistics after a rating change.
func (r *RatingsRepository) GetPageStatsAfterRating(ctx context.Context, pageID int64) (*models.PageStats, error) {
	var stats models.PageStats
	err := r.pool.QueryRow(ctx,
		`SELECT 
			COUNT(id)::int as total_ratings,
			COALESCE(AVG(score), 0)::float as avg_score
		FROM ratings
		WHERE page_id = $1`,
		pageID).Scan(&stats.TotalRatings, &stats.AverageScore)

	if err != nil {
		return nil, fmt.Errorf("failed to get page stats: %w", err)
	}

	return &stats, nil
}
