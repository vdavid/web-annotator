import { useState, useEffect } from 'react';

// Use Vite env variable with fallback to default
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

export type ViewState = 'LOADING' | 'IDLE' | 'SUBMITTING' | 'ERROR' | 'SUCCESS';

export interface PageData {
  can_rate: boolean;
  stats: {
    total_ratings: number;
    average_score: number;
  };
  user_rating: {
    has_rated: boolean;
    score?: number;
    comment?: string;
  };
}

interface UsePageDataReturn {
  status: ViewState;
  data: PageData | null;
  error: string | null;
  submitRating: (score: number, comment: string) => Promise<void>;
}

export function usePageData(currentUrl: string | null): UsePageDataReturn {
  const [status, setStatus] = useState<ViewState>('LOADING');
  const [data, setData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch page data on mount or when URL changes
  useEffect(() => {
    if (!currentUrl) {
      setStatus('IDLE');
      return;
    }

    setStatus('LOADING');
    setError(null);

    fetch(
      `${API_BASE}/api/v1/pages/check?url=${encodeURIComponent(currentUrl)}`,
      {
        headers: {
          'X-User-ID': MOCK_USER_ID,
        },
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((responseData: PageData) => {
        setData(responseData);
        setStatus('IDLE');
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch page data');
        setStatus('ERROR');
      });
  }, [currentUrl]);

  const submitRating = async (score: number, comment: string) => {
    if (!currentUrl) {
      return;
    }

    setStatus('SUBMITTING');
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': MOCK_USER_ID,
        },
        body: JSON.stringify({
          url: currentUrl,
          score,
          comment: comment || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Update local data with new stats
      if (data) {
        setData({
          ...data,
          stats: result.stats,
          user_rating: {
            has_rated: true,
            score,
            comment: comment || undefined,
          },
        });
      }

      setStatus('SUCCESS');
      // Reset to IDLE after a brief moment
      setTimeout(() => setStatus('IDLE'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating');
      setStatus('ERROR');
    }
  };

  return { status, data, error, submitRating };
}
