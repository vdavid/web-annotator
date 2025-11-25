package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAuthMiddleware(t *testing.T) {
	tests := []struct {
		name           string
		headerValue    string
		expectedStatus int
		expectedUserID string
		shouldHaveID   bool
	}{
		{
			name:           "valid user ID header",
			headerValue:    "123e4567-e89b-12d3-a456-426614174000",
			expectedStatus: http.StatusOK,
			expectedUserID: "123e4567-e89b-12d3-a456-426614174000",
			shouldHaveID:   true,
		},
		{
			name:           "missing header",
			headerValue:    "",
			expectedStatus: http.StatusUnauthorized,
			expectedUserID: "",
			shouldHaveID:   false,
		},
		{
			name:           "empty header value",
			headerValue:    "   ",
			expectedStatus: http.StatusUnauthorized,
			expectedUserID: "",
			shouldHaveID:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			handler := AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				userID, ok := UserIDFromContext(r.Context())
				if tt.shouldHaveID && !ok {
					t.Errorf("Expected user ID in context, but not found")
					return
				}
				if !tt.shouldHaveID && ok {
					t.Errorf("Expected no user ID in context, but found: %s", userID)
					return
				}
				if tt.shouldHaveID && userID != tt.expectedUserID {
					t.Errorf("Expected user ID %s, got %s", tt.expectedUserID, userID)
					return
				}
				w.WriteHeader(http.StatusOK)
			}))

			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			if tt.headerValue != "" {
				req.Header.Set("X-User-ID", tt.headerValue)
			}

			rr := httptest.NewRecorder()
			handler.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, rr.Code)
			}
		})
	}
}

func TestUserIDFromContext(t *testing.T) {
	tests := []struct {
		name        string
		ctx         context.Context
		expectedID  string
		shouldExist bool
	}{
		{
			name:        "user ID in context",
			ctx:         context.WithValue(context.Background(), userIDKey, "test-user-id"),
			expectedID:  "test-user-id",
			shouldExist: true,
		},
		{
			name:        "no user ID in context",
			ctx:         context.Background(),
			expectedID:  "",
			shouldExist: false,
		},
		{
			name:        "wrong type in context",
			ctx:         context.WithValue(context.Background(), userIDKey, 123),
			expectedID:  "",
			shouldExist: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userID, ok := UserIDFromContext(tt.ctx)
			if ok != tt.shouldExist {
				t.Errorf("Expected exists=%v, got exists=%v", tt.shouldExist, ok)
			}
			if ok && userID != tt.expectedID {
				t.Errorf("Expected user ID %s, got %s", tt.expectedID, userID)
			}
		})
	}
}
