/**
 * Unit tests for Unsplash Cache
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { unsplashCache } from '@/services/unsplashCache';
import type { UnsplashImage } from '@/services/types/unsplash.types';

describe('UnsplashCache', () => {
  beforeEach(() => {
    unsplashCache.clear();
  });

  afterEach(() => {
    unsplashCache.stopCleanup();
  });

  const mockImage: UnsplashImage = {
    url: 'https://images.unsplash.com/photo-test?w=800&h=600',
    photoId: 'test-id',
    cached: false,
    timestamp: Date.now(),
  };

  describe('set and get', () => {
    it('should store and retrieve image', () => {
      unsplashCache.set(1, 800, 600, mockImage);

      const result = unsplashCache.get(1, 800, 600);

      expect(result).toBeDefined();
      expect(result?.url).toBe(mockImage.url);
      expect(result?.cached).toBe(true);
    });

    it('should return null for non-existent entry', () => {
      const result = unsplashCache.get(999, 800, 600);

      expect(result).toBeNull();
    });

    it('should differentiate by dimensions', () => {
      const image1 = { ...mockImage, url: 'url1' };
      const image2 = { ...mockImage, url: 'url2' };

      unsplashCache.set(1, 800, 600, image1);
      unsplashCache.set(1, 400, 300, image2);

      expect(unsplashCache.get(1, 800, 600)?.url).toBe('url1');
      expect(unsplashCache.get(1, 400, 300)?.url).toBe('url2');
    });

    it('should differentiate by quality', () => {
      const image1 = { ...mockImage, url: 'url-q80' };
      const image2 = { ...mockImage, url: 'url-q90' };

      unsplashCache.set(1, 800, 600, { ...image1, url: 'url1?q=80' });
      unsplashCache.set(1, 800, 600, { ...image2, url: 'url2?q=90' });

      const result80 = unsplashCache.get(1, 800, 600, 80);
      const result90 = unsplashCache.get(1, 800, 600, 90);

      expect(result80?.url).toContain('url1');
      expect(result90?.url).toContain('url2');
    });
  });

  describe('expiration', () => {
    it('should expire entries after TTL', (done) => {
      const shortTTL = 100; // 100ms

      unsplashCache.set(1, 800, 600, mockImage, shortTTL);

      // Should exist immediately
      expect(unsplashCache.get(1, 800, 600)).toBeDefined();

      // Should expire after TTL
      setTimeout(() => {
        expect(unsplashCache.get(1, 800, 600)).toBeNull();
        done();
      }, shortTTL + 50);
    }, 10000);

    it('should not expire entries before TTL', () => {
      const longTTL = 10000; // 10 seconds

      unsplashCache.set(1, 800, 600, mockImage, longTTL);

      expect(unsplashCache.get(1, 800, 600)).toBeDefined();
    });
  });

  describe('eviction', () => {
    it('should evict oldest entry when cache is full', () => {
      // Fill cache to max size
      for (let i = 0; i < 500; i++) {
        unsplashCache.set(i, 800, 600, mockImage);
      }

      // Add one more (should evict first entry)
      unsplashCache.set(500, 800, 600, mockImage);

      expect(unsplashCache.size).toBeLessThanOrEqual(500);
    });

    it('should prioritize evicting entries with fewer hits', () => {
      unsplashCache.set(1, 800, 600, mockImage);
      unsplashCache.set(2, 800, 600, mockImage);

      // Access first entry multiple times
      for (let i = 0; i < 10; i++) {
        unsplashCache.get(1, 800, 600);
      }

      // Fill cache
      for (let i = 3; i < 502; i++) {
        unsplashCache.set(i, 800, 600, mockImage);
      }

      // Entry 1 should still exist (high hit count)
      expect(unsplashCache.get(1, 800, 600)).toBeDefined();
    });
  });

  describe('has', () => {
    it('should return true for existing entry', () => {
      unsplashCache.set(1, 800, 600, mockImage);

      expect(unsplashCache.has(1, 800, 600)).toBe(true);
    });

    it('should return false for non-existent entry', () => {
      expect(unsplashCache.has(999, 800, 600)).toBe(false);
    });

    it('should return false for expired entry', (done) => {
      const shortTTL = 100;

      unsplashCache.set(1, 800, 600, mockImage, shortTTL);

      setTimeout(() => {
        expect(unsplashCache.has(1, 800, 600)).toBe(false);
        done();
      }, shortTTL + 50);
    }, 10000);
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      unsplashCache.set(1, 800, 600, mockImage);
      unsplashCache.set(2, 800, 600, mockImage);

      unsplashCache.clear();

      expect(unsplashCache.size).toBe(0);
      expect(unsplashCache.get(1, 800, 600)).toBeNull();
    });

    it('should reset statistics', () => {
      unsplashCache.set(1, 800, 600, mockImage);
      unsplashCache.get(1, 800, 600);

      unsplashCache.clear();

      const stats = unsplashCache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should track hits and misses', () => {
      unsplashCache.set(1, 800, 600, mockImage);

      unsplashCache.get(1, 800, 600); // hit
      unsplashCache.get(2, 800, 600); // miss
      unsplashCache.get(1, 800, 600); // hit

      const stats = unsplashCache.getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(2 / 3, 2);
    });

    it('should track cache size', () => {
      unsplashCache.set(1, 800, 600, mockImage);
      unsplashCache.set(2, 800, 600, mockImage);

      const stats = unsplashCache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(500);
    });

    it('should track evictions', () => {
      // Fill cache beyond capacity
      for (let i = 0; i < 502; i++) {
        unsplashCache.set(i, 800, 600, mockImage);
      }

      const stats = unsplashCache.getStats();

      expect(stats.evictions).toBeGreaterThan(0);
    });
  });

  describe('hit count tracking', () => {
    it('should increment hit count on access', () => {
      unsplashCache.set(1, 800, 600, mockImage);

      // Access multiple times
      for (let i = 0; i < 5; i++) {
        unsplashCache.get(1, 800, 600);
      }

      const stats = unsplashCache.getStats();
      expect(stats.hits).toBe(5);
    });

    it('should not increment hit count with has()', () => {
      unsplashCache.set(1, 800, 600, mockImage);

      unsplashCache.has(1, 800, 600);
      unsplashCache.has(1, 800, 600);

      const stats = unsplashCache.getStats();
      expect(stats.hits).toBe(0);
    });
  });
});
