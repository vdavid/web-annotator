package api

import (
	"encoding/json"
	"net/http"

	"github.com/vdavid/web-annotator/backend/internal/middleware"
	"github.com/vdavid/web-annotator/backend/internal/repository"
	"github.com/vdavid/web-annotator/backend/internal/url"
)

// RatingsHandler handles rating-related API endpoints.
type RatingsHandler struct {
	pagesRepo   repository.PagesRepositoryInterface
	ratingsRepo repository.RatingsRepositoryInterface
	usersRepo   repository.UsersRepositoryInterface
}

// NewRatingsHandler creates a new ratings handler.
func NewRatingsHandler(pagesRepo repository.PagesRepositoryInterface, ratingsRepo repository.RatingsRepositoryInterface, usersRepo repository.UsersRepositoryInterface) *RatingsHandler {
	return &RatingsHandler{
		pagesRepo:   pagesRepo,
		ratingsRepo: ratingsRepo,
		usersRepo:   usersRepo,
	}
}

// SubmitRatingRequest represents the request body for submitting a rating.
type SubmitRatingRequest struct {
	URL     string  `json:"url"`
	Score   int     `json:"score"`
	Comment *string `json:"comment,omitempty"`
}

// SubmitRatingResponse represents the response after submitting a rating.
type SubmitRatingResponse struct {
	Stats PageStatsResponse `json:"stats"`
}

// Submit handles POST /api/v1/ratings.
// It creates or updates a user's rating for a page.
func (h *RatingsHandler) Submit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req SubmitRatingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate score
	if req.Score < 1 || req.Score > 10 {
		Error(w, http.StatusBadRequest, "Score must be between 1 and 10")
		return
	}

	// Normalize the URL
	normalizedURL, err := url.Normalize(req.URL)
	if err != nil {
		Error(w, http.StatusBadRequest, "Invalid URL")
		return
	}

	ctx := r.Context()

	// Get user ID from context (set by auth middleware)
	userID, ok := middleware.UserIDFromContext(ctx)
	if !ok {
		Error(w, http.StatusUnauthorized, "Missing user ID")
		return
	}

	// Ensure user exists
	if err := h.usersRepo.GetOrCreateUser(ctx, userID); err != nil {
		Error(w, http.StatusInternalServerError, "Failed to create or get user")
		return
	}

	// Ensure page exists and get its ID
	pageID, err := h.pagesRepo.GetOrCreatePage(ctx, normalizedURL)
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to create or get page")
		return
	}

	// Upsert the rating
	if err := h.ratingsRepo.UpsertRating(ctx, pageID, userID, req.Score, req.Comment); err != nil {
		Error(w, http.StatusInternalServerError, "Failed to save rating")
		return
	}

	// Get updated statistics
	stats, err := h.ratingsRepo.GetPageStatsAfterRating(ctx, pageID)
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to fetch updated statistics")
		return
	}

	response := SubmitRatingResponse{
		Stats: PageStatsResponse{
			TotalRatings: stats.TotalRatings,
			AverageScore: stats.AverageScore,
		},
	}

	JSONResponse(w, http.StatusOK, response)
}
