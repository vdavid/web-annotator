package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool holds the database connection pool.
type Pool struct {
	*pgxpool.Pool
}

// NewPool creates a new database connection pool.
func NewPool(ctx context.Context) (*Pool, error) {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		host := os.Getenv("DB_HOST")
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")
		if host == "" || port == "" || user == "" || password == "" || dbname == "" {
			return nil, fmt.Errorf("database configuration missing: set DATABASE_URL or DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME")
		}
		connStr = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
			user, password, host, port, dbname)
	}

	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &Pool{pool}, nil
}

// Close closes the database connection pool.
func (p *Pool) Close() {
	p.Pool.Close()
}
