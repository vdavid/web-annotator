import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isArticle } from './articleDetector';

describe('articleDetector', () => {
  let originalLocation: Location;

  beforeEach(() => {
    // Save original location
    originalLocation = window.location;
    // Clear document
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('isArticle', () => {
    it('returns true when og:type meta tag is present', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:type');
      meta.setAttribute('content', 'article');
      document.head.appendChild(meta);

      expect(isArticle()).toBe(true);
    });

    it('returns true when JSON-LD contains Article type', () => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@type': 'Article',
        headline: 'Test Article',
      });
      document.head.appendChild(script);

      // Mock location
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, pathname: '/' },
        writable: true,
      });

      expect(isArticle()).toBe(true);
    });

    it('returns true when JSON-LD contains NewsArticle type', () => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@type': 'NewsArticle',
        headline: 'Test News',
      });
      document.head.appendChild(script);

      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, pathname: '/' },
        writable: true,
      });

      expect(isArticle()).toBe(true);
    });

    it('returns true when JSON-LD is an array with Article type', () => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify([
        { '@type': 'Organization', name: 'Test' },
        { '@type': 'Article', headline: 'Test Article' },
      ]);
      document.head.appendChild(script);

      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, pathname: '/' },
        writable: true,
      });

      expect(isArticle()).toBe(true);
    });

    it('returns true when URL path depth is > 2', () => {
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, pathname: '/2025/10/my-post' },
        writable: true,
      });

      expect(isArticle()).toBe(true);
    });

    it('returns false when path depth is exactly 2', () => {
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, pathname: '/2025/article' },
        writable: true,
      });

      expect(isArticle()).toBe(false);
    });

    it('returns false when path depth is 1', () => {
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, pathname: '/article' },
        writable: true,
      });

      expect(isArticle()).toBe(false);
    });

    it('returns false when path is root', () => {
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, pathname: '/' },
        writable: true,
      });

      expect(isArticle()).toBe(false);
    });

    it('returns false when none of the conditions are met', () => {
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, pathname: '/' },
        writable: true,
      });

      expect(isArticle()).toBe(false);
    });

    it('handles invalid JSON-LD gracefully', () => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = 'invalid json {';
      document.head.appendChild(script);

      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, pathname: '/' },
        writable: true,
      });

      expect(isArticle()).toBe(false);
    });

    it('handles empty JSON-LD scripts', () => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = '';
      document.head.appendChild(script);

      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, pathname: '/' },
        writable: true,
      });

      expect(isArticle()).toBe(false);
    });
  });
});
