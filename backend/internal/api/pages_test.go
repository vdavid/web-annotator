package api

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/vdavid/web-annotator/backend/internal/middleware"
	"github.com/vdavid/web-annotator/backend/internal/models"
)

// mockPagesRepository is a mock implementation of PagesRepositoryInterface for testing.
type mockPagesRepository struct {
	getPageStatsFunc  func(ctx context.Context, urlHash string) (*models.PageStats, error)
	getUserRatingFunc func(ctx context.Context, urlHash string, userID string) (*models.UserRating, error)
}

func (m *mockPagesRepository) GetOrCreatePage(context.Context, string) (int64, error) {
	return 0, nil
}

func (m *mockPagesRepository) GetPageStats(ctx context.Context, urlHash string) (*models.PageStats, error) {
	if m.getPageStatsFunc != nil {
		return m.getPageStatsFunc(ctx, urlHash)
	}
	return nil, nil
}

func (m *mockPagesRepository) GetUserRating(ctx context.Context, urlHash string, userID string) (*models.UserRating, error) {
	if m.getUserRatingFunc != nil {
		return m.getUserRatingFunc(ctx, urlHash, userID)
	}
	return nil, nil
}

func TestPagesHandler_Check(t *testing.T) {
	tests := []struct {
		name           string
		url            string
		userID         string
		mockStats      *models.PageStats
		mockUserRating *models.UserRating
		expectedStatus int
	}{
		{
			name:   "successful check with existing rating",
			url:    "https://example.com/article",
			userID: "test-user-id",
			mockStats: &models.PageStats{
				TotalRatings: 10,
				AverageScore: 8.5,
			},
			mockUserRating: &models.UserRating{
				HasRated: true,
				Score:    intPtr(9),
				Comment:  stringPtr("Great article!"),
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:   "successful check without user rating",
			url:    "https://example.com/article",
			userID: "test-user-id",
			mockStats: &models.PageStats{
				TotalRatings: 5,
				AverageScore: 7.2,
			},
			mockUserRating: &models.UserRating{
				HasRated: false,
				Score:    nil,
				Comment:  nil,
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "missing url parameter",
			url:            "",
			userID:         "test-user-id",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "invalid url",
			url:            "not-a-url",
			userID:         "test-user-id",
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockPagesRepository{
				getPageStatsFunc: func(ctx context.Context, urlHash string) (*models.PageStats, error) {
					return tt.mockStats, nil
				},
				getUserRatingFunc: func(ctx context.Context, urlHash string, userID string) (*models.UserRating, error) {
					return tt.mockUserRating, nil
				},
			}

			handler := NewPagesHandler(mockRepo)
			handlerFunc := middleware.AuthMiddleware(http.HandlerFunc(handler.Check))

			req := httptest.NewRequest(http.MethodGet, "/api/v1/pages/check?url="+tt.url, nil)
			if tt.userID != "" {
				req.Header.Set("X-User-ID", tt.userID)
			}

			rr := httptest.NewRecorder()
			handlerFunc.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, rr.Code)
			}
		})
	}
}

// Helper functions for creating pointers
func intPtr(i int) *int {
	return &i
}

func stringPtr(s string) *string {
	return &s
}
