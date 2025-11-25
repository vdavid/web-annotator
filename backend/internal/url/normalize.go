package url

import (
	"errors"
	"net/url"
	"sort"
	"strings"
)

var ErrInvalidURL = errors.New("invalid URL: missing scheme or host")

// Normalize normalizes a URL according to the project's ruleset.
// It converts the URL to lowercase, forces https, removes www prefix,
// removes trailing slashes, removes fragments, and filters/sorts query parameters.
func Normalize(rawURL string) (string, error) {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return "", err
	}

	// Validate that we have a scheme and host (required for a valid URL)
	if parsed.Scheme == "" || parsed.Host == "" {
		return "", ErrInvalidURL
	}

	// Force https scheme
	parsed.Scheme = "https"

	// Lowercase host and remove www prefix
	host := strings.ToLower(parsed.Host)
	if strings.HasPrefix(host, "www.") {
		host = host[4:]
	}
	parsed.Host = host

	// Remove trailing slashes from path
	path := strings.TrimSuffix(parsed.Path, "/")
	parsed.Path = path

	// Remove fragment
	parsed.Fragment = ""

	// Filter and sort query parameters
	query := parsed.Query()
	filtered := make(url.Values)
	keysToRemove := map[string]bool{
		"gclid":  true,
		"fbclid": true,
		"ref":    true,
		"source": true,
		"share":  true,
	}

	for key, values := range query {
		lowerKey := strings.ToLower(key)
		// Skip utm_* parameters
		if strings.HasPrefix(lowerKey, "utm_") {
			continue
		}
		// Skip keys in removal list
		if keysToRemove[lowerKey] {
			continue
		}
		// Keep other parameters
		filtered[lowerKey] = values
	}

	// Sort keys alphabetically
	keys := make([]string, 0, len(filtered))
	for k := range filtered {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	// Rebuild query string with sorted keys
	if len(keys) > 0 {
		sortedQuery := make(url.Values)
		for _, k := range keys {
			sortedQuery[k] = filtered[k]
		}
		parsed.RawQuery = sortedQuery.Encode()
	} else {
		parsed.RawQuery = ""
	}

	result := parsed.String()
	// Remove trailing "?" if present (can happen with empty query strings)
	result = strings.TrimSuffix(result, "?")
	return result, nil
}
