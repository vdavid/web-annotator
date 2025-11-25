package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCORSMiddleware(t *testing.T) {
	tests := []struct {
		name           string
		method         string
		expectedStatus int
		checkHeaders   bool
	}{
		{
			name:           "OPTIONS preflight request",
			method:         http.MethodOptions,
			expectedStatus: http.StatusNoContent,
			checkHeaders:   true,
		},
		{
			name:           "GET request with CORS headers",
			method:         http.MethodGet,
			expectedStatus: http.StatusOK,
			checkHeaders:   true,
		},
		{
			name:           "POST request with CORS headers",
			method:         http.MethodPost,
			expectedStatus: http.StatusOK,
			checkHeaders:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			handler := CORSMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
			}))

			req := httptest.NewRequest(tt.method, "/test", nil)
			rr := httptest.NewRecorder()

			handler.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, rr.Code)
			}

			if tt.checkHeaders {
				if rr.Header().Get("Access-Control-Allow-Origin") != "*" {
					t.Errorf("Expected Access-Control-Allow-Origin header to be '*'")
				}
				if rr.Header().Get("Access-Control-Allow-Methods") == "" {
					t.Errorf("Expected Access-Control-Allow-Methods header")
				}
				if rr.Header().Get("Access-Control-Allow-Headers") == "" {
					t.Errorf("Expected Access-Control-Allow-Headers header")
				}
			}
		})
	}
}
