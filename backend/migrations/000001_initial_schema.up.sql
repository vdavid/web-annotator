-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL
);

COMMENT ON TABLE users IS 'Stores user accounts. Currently mocked for MVP.';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user (UUID).';
COMMENT ON COLUMN users.username IS 'Display name for the user. Currently just "Test User" for MVP.';

-- Create pages table
CREATE TABLE pages (
    id BIGSERIAL PRIMARY KEY,
    url_hash VARCHAR(64) UNIQUE NOT NULL,
    normalized_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE pages IS 'Stores normalized page URLs. Each page represents a unique article URL after normalization.';
COMMENT ON COLUMN pages.id IS 'Auto-incrementing primary key.';
COMMENT ON COLUMN pages.url_hash IS 'SHA256 hash of the normalized URL. Used for fast lookups and uniqueness constraint.';
COMMENT ON COLUMN pages.normalized_url IS 'Human-readable normalized URL (lowercase, https, no www, no trailing slash, no fragments, filtered query params).';
COMMENT ON COLUMN pages.created_at IS 'Timestamp when the page was first recorded in the system.';

-- Create ratings table
CREATE TABLE ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    page_id BIGINT REFERENCES pages(id),
    score INT CHECK (score >= 1 AND score <= 10),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, page_id)
);

COMMENT ON TABLE ratings IS 'Stores user ratings and comments for pages. One rating per user per page.';
COMMENT ON COLUMN ratings.id IS 'Auto-incrementing primary key.';
COMMENT ON COLUMN ratings.user_id IS 'Foreign key to users table. Identifies who submitted the rating.';
COMMENT ON COLUMN ratings.page_id IS 'Foreign key to pages table. Identifies which page was rated.';
COMMENT ON COLUMN ratings.score IS 'Rating score from 1 to 10 stars.';
COMMENT ON COLUMN ratings.comment IS 'Optional text review or summary. Can be NULL.';
COMMENT ON COLUMN ratings.created_at IS 'Timestamp when the rating was first created.';
COMMENT ON COLUMN ratings.updated_at IS 'Timestamp when the rating was last updated.';

-- Create index on url_hash for faster lookups
CREATE INDEX idx_pages_url_hash ON pages(url_hash);

-- Create index on user_id for faster queries
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- Create index on page_id for faster queries
CREATE INDEX idx_ratings_page_id ON ratings(page_id);

