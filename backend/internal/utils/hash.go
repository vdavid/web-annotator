package utils

import (
	"crypto/sha256"
	"encoding/hex"
)

// HashURL computes the SHA256 hash of a normalized URL.
func HashURL(normalizedURL string) string {
	hash := sha256.Sum256([]byte(normalizedURL))
	return hex.EncodeToString(hash[:])
}
