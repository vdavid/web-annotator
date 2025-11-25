package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/vdavid/web-annotator/backend/internal/db"
)

// UsersRepository handles database operations for users.
type UsersRepository struct {
	pool *db.Pool
}

// NewUsersRepository creates a new users repository.
func NewUsersRepository(pool *db.Pool) *UsersRepository {
	return &UsersRepository{pool: pool}
}

// GetOrCreateUser ensures a user exists in the database.
// If the user already exists, it returns nil (success).
// Otherwise, it creates a new user with the given ID and a default username.
func (r *UsersRepository) GetOrCreateUser(ctx context.Context, userID string) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO users (id, username) 
		 VALUES ($1, $2) 
		 ON CONFLICT (id) DO NOTHING`,
		userID, "Test User")

	if err != nil {
		// Check if it's a foreign key or other constraint error
		if errors.Is(err, pgx.ErrNoRows) {
			// User already exists (conflict), which is fine
			return nil
		}
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}
