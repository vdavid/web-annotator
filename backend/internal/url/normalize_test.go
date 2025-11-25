package url

import (
	"testing"
)

func TestNormalize(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
		wantErr  bool
	}{
		{
			name:     "basic url",
			input:    "https://example.com/article",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "uppercase host",
			input:    "HTTPS://EXAMPLE.COM/article",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "www prefix removal",
			input:    "https://www.example.com/article",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "trailing slash removal",
			input:    "https://example.com/article/",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "fragment removal",
			input:    "https://example.com/article#comments",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "utm parameters removal",
			input:    "https://example.com/article?utm_source=twitter&utm_medium=social",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "gclid and fbclid removal",
			input:    "https://example.com/article?gclid=123&fbclid=456",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "ref and source removal",
			input:    "https://example.com/article?ref=homepage&source=newsletter",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "keep other parameters",
			input:    "https://example.com/article?id=123&page=2",
			expected: "https://example.com/article?id=123&page=2",
			wantErr:  false,
		},
		{
			name:     "sort query parameters",
			input:    "https://example.com/article?b=2&a=1",
			expected: "https://example.com/article?a=1&b=2",
			wantErr:  false,
		},
		{
			name:     "combined normalization",
			input:    "HTTPS://WWW.EXAMPLE.COM/article/?utm_source=twitter&id=123#comments",
			expected: "https://example.com/article?id=123",
			wantErr:  false,
		},
		{
			name:     "http to https conversion",
			input:    "http://example.com/article",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "multiple utm parameters",
			input:    "https://example.com/article?utm_source=twitter&utm_campaign=summer&utm_medium=social",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "share parameter removal",
			input:    "https://example.com/article?share=facebook",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "empty query string",
			input:    "https://example.com/article?",
			expected: "https://example.com/article",
			wantErr:  false,
		},
		{
			name:     "root path with trailing slash",
			input:    "https://example.com/",
			expected: "https://example.com",
			wantErr:  false,
		},
		{
			name:     "invalid url - no scheme",
			input:    "example.com/article",
			expected: "",
			wantErr:  true,
		},
		{
			name:     "invalid url - no host",
			input:    "https:///article",
			expected: "",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Normalize(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("Normalize() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.expected {
				t.Errorf("Normalize() = %v, want %v", got, tt.expected)
			}
		})
	}
}
