package models

// Page represents a normalized page URL in the database.
type Page struct {
	ID            int64  `db:"id"`
	URLHash       string `db:"url_hash"`
	NormalizedURL string `db:"normalized_url"`
	CreatedAt     string `db:"created_at"`
}
