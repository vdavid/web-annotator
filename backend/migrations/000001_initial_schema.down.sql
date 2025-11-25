-- Drop indexes first
DROP INDEX IF EXISTS idx_ratings_page_id;
DROP INDEX IF EXISTS idx_ratings_user_id;
DROP INDEX IF EXISTS idx_pages_url_hash;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS users;

