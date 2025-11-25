package middleware

import (
	"context"
	"net/http"
	"strings"
)

type contextKey string

const userIDKey contextKey = "userID"

// UserIDFromContext extracts the user ID from the request context.
func UserIDFromContext(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(userIDKey).(string)
	return userID, ok
}

// AuthMiddleware reads the X-User-ID header and injects it into the request context.
// This is a mock authentication middleware for MVP. It can be swapped for real Auth0 later.
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := strings.TrimSpace(r.Header.Get("X-User-ID"))
		if userID == "" {
			http.Error(w, "Missing X-User-ID header", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
