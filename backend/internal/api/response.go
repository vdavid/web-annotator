package api

import (
	"encoding/json"
	"net/http"
)

// JSONResponse writes a JSON response with the given status code.
func JSONResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

// ErrorResponse represents an error response.
type ErrorResponse struct {
	Error string `json:"error"`
}

// Error writes an error response as JSON.
func Error(w http.ResponseWriter, statusCode int, message string) {
	JSONResponse(w, statusCode, ErrorResponse{Error: message})
}
