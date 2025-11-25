package repository

import (
	"context"

	"github.com/vdavid/web-annotator/backend/internal/models"
)

// PagesRepositoryInterface defines the interface for page repository operations.
type PagesRepositoryInterface interface {
	GetOrCreatePage(ctx context.Context, normalizedURL string) (int64, error)
	GetPageStats(ctx context.Context, urlHash string) (*models.PageStats, error)
	GetUserRating(ctx context.Context, urlHash string, userID string) (*models.UserRating, error)
}

// RatingsRepositoryInterface defines the interface for ratings repository operations.
type RatingsRepositoryInterface interface {
	UpsertRating(ctx context.Context, pageID int64, userID string, score int, comment *string) error
	GetPageStatsAfterRating(ctx context.Context, pageID int64) (*models.PageStats, error)
}

// UsersRepositoryInterface defines the interface for users repository operations.
type UsersRepositoryInterface interface {
	GetOrCreateUser(ctx context.Context, userID string) error
}
