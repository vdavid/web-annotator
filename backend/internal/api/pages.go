package api

import (
	"net/http"

	"github.com/vdavid/web-annotator/backend/internal/middleware"
	"github.com/vdavid/web-annotator/backend/internal/repository"
	"github.com/vdavid/web-annotator/backend/internal/url"
	"github.com/vdavid/web-annotator/backend/internal/utils"
)

// PagesHandler handles page-related API endpoints.
type PagesHandler struct {
	pagesRepo repository.PagesRepositoryInterface
}

// NewPagesHandler creates a new pages handler.
func NewPagesHandler(pagesRepo repository.PagesRepositoryInterface) *PagesHandler {
	return &PagesHandler{pagesRepo: pagesRepo}
}

// CheckPageResponse represents the response for the check endpoint.
type CheckPageResponse struct {
	CanRate    bool               `json:"can_rate"`
	Stats      PageStatsResponse  `json:"stats"`
	UserRating UserRatingResponse `json:"user_rating"`
}

// PageStatsResponse contains aggregated statistics for a page.
type PageStatsResponse struct {
	TotalRatings int     `json:"total_ratings"`
	AverageScore float64 `json:"average_score"`
}

// UserRatingResponse contains the current user's rating for a page.
type UserRatingResponse struct {
	HasRated bool    `json:"has_rated"`
	Score    *int    `json:"score,omitempty"`
	Comment  *string `json:"comment,omitempty"`
}

// Check handles GET /api/v1/pages/check.
// It returns page statistics and the current user's rating (if any).
func (h *PagesHandler) Check(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		Error(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	rawURL := r.URL.Query().Get("url")
	if rawURL == "" {
		Error(w, http.StatusBadRequest, "Missing url query parameter")
		return
	}

	// Normalize the URL
	normalizedURL, err := url.Normalize(rawURL)
	if err != nil {
		Error(w, http.StatusBadRequest, "Invalid URL")
		return
	}

	urlHash := utils.HashURL(normalizedURL)
	ctx := r.Context()

	// Get user ID from context (set by auth middleware)
	userID, ok := middleware.UserIDFromContext(ctx)
	if !ok {
		Error(w, http.StatusUnauthorized, "Missing user ID")
		return
	}

	// Fetch page statistics
	stats, err := h.pagesRepo.GetPageStats(ctx, urlHash)
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to fetch page statistics")
		return
	}

	// Fetch user's rating
	userRating, err := h.pagesRepo.GetUserRating(ctx, urlHash, userID)
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to fetch user rating")
		return
	}

	response := CheckPageResponse{
		CanRate: true, // Server-side validation can be added here if needed
		Stats: PageStatsResponse{
			TotalRatings: stats.TotalRatings,
			AverageScore: stats.AverageScore,
		},
		UserRating: UserRatingResponse{
			HasRated: userRating.HasRated,
			Score:    userRating.Score,
			Comment:  userRating.Comment,
		},
	}

	JSONResponse(w, http.StatusOK, response)
}
