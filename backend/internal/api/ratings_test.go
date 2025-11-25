package api

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/vdavid/web-annotator/backend/internal/middleware"
	"github.com/vdavid/web-annotator/backend/internal/models"
)

// mockPagesRepositoryForRatings is a mock for ratings handler tests.
type mockPagesRepositoryForRatings struct {
	getOrCreatePageFunc func(ctx context.Context, normalizedURL string) (int64, error)
}

func (m *mockPagesRepositoryForRatings) GetOrCreatePage(ctx context.Context, normalizedURL string) (int64, error) {
	if m.getOrCreatePageFunc != nil {
		return m.getOrCreatePageFunc(ctx, normalizedURL)
	}
	return 0, nil
}

func (m *mockPagesRepositoryForRatings) GetPageStats(context.Context, string) (*models.PageStats, error) {
	return nil, nil
}

func (m *mockPagesRepositoryForRatings) GetUserRating(context.Context, string, string) (*models.UserRating, error) {
	return nil, nil
}

// mockRatingsRepository is a mock implementation for ratings tests.
type mockRatingsRepository struct {
	upsertRatingFunc            func(ctx context.Context, pageID int64, userID string, score int, comment *string) error
	getPageStatsAfterRatingFunc func(ctx context.Context, pageID int64) (*models.PageStats, error)
}

func (m *mockRatingsRepository) UpsertRating(ctx context.Context, pageID int64, userID string, score int, comment *string) error {
	if m.upsertRatingFunc != nil {
		return m.upsertRatingFunc(ctx, pageID, userID, score, comment)
	}
	return nil
}

func (m *mockRatingsRepository) GetPageStatsAfterRating(ctx context.Context, pageID int64) (*models.PageStats, error) {
	if m.getPageStatsAfterRatingFunc != nil {
		return m.getPageStatsAfterRatingFunc(ctx, pageID)
	}
	return nil, nil
}

// mockUsersRepository is a mock implementation for users tests.
type mockUsersRepository struct {
	getOrCreateUserFunc func(ctx context.Context, userID string) error
}

func (m *mockUsersRepository) GetOrCreateUser(ctx context.Context, userID string) error {
	if m.getOrCreateUserFunc != nil {
		return m.getOrCreateUserFunc(ctx, userID)
	}
	return nil
}

func TestRatingsHandler_Submit(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    SubmitRatingRequest
		userID         string
		expectedStatus int
		mockPageID     int64
		mockStats      *models.PageStats
	}{
		{
			name: "successful rating submission",
			requestBody: SubmitRatingRequest{
				URL:     "https://example.com/article",
				Score:   8,
				Comment: stringPtr("Great article!"),
			},
			userID:         "test-user-id",
			expectedStatus: http.StatusOK,
			mockPageID:     1,
			mockStats: &models.PageStats{
				TotalRatings: 1,
				AverageScore: 8.0,
			},
		},
		{
			name: "successful rating without comment",
			requestBody: SubmitRatingRequest{
				URL:   "https://example.com/article",
				Score: 9,
			},
			userID:         "test-user-id",
			expectedStatus: http.StatusOK,
			mockPageID:     1,
			mockStats: &models.PageStats{
				TotalRatings: 1,
				AverageScore: 9.0,
			},
		},
		{
			name: "invalid score too low",
			requestBody: SubmitRatingRequest{
				URL:   "https://example.com/article",
				Score: 0,
			},
			userID:         "test-user-id",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "invalid score too high",
			requestBody: SubmitRatingRequest{
				URL:   "https://example.com/article",
				Score: 11,
			},
			userID:         "test-user-id",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "invalid url",
			requestBody: SubmitRatingRequest{
				URL:   "not-a-url",
				Score: 8,
			},
			userID:         "test-user-id",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "missing user ID",
			requestBody: SubmitRatingRequest{
				URL:   "https://example.com/article",
				Score: 8,
			},
			userID:         "",
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockPagesRepo := &mockPagesRepositoryForRatings{
				getOrCreatePageFunc: func(ctx context.Context, normalizedURL string) (int64, error) {
					return tt.mockPageID, nil
				},
			}

			mockRatingsRepo := &mockRatingsRepository{
				upsertRatingFunc: func(ctx context.Context, pageID int64, userID string, score int, comment *string) error {
					return nil
				},
				getPageStatsAfterRatingFunc: func(ctx context.Context, pageID int64) (*models.PageStats, error) {
					return tt.mockStats, nil
				},
			}

			mockUsersRepo := &mockUsersRepository{
				getOrCreateUserFunc: func(ctx context.Context, userID string) error {
					return nil
				},
			}

			handler := NewRatingsHandler(mockPagesRepo, mockRatingsRepo, mockUsersRepo)
			handlerFunc := middleware.AuthMiddleware(http.HandlerFunc(handler.Submit))

			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/api/v1/ratings", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
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
