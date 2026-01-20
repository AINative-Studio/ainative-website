/**
 * Unit tests for Unsplash Service
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { unsplashService } from '@/services/unsplashService';
import { unsplashCache } from '@/services/unsplashCache';
import { unsplashRateLimiter } from '@/services/unsplashRateLimit';
import { UnsplashError, UnsplashErrorType } from '@/services/types/unsplash.types';

describe('UnsplashService', () => {
  beforeEach(() => {
    // Clear cache and reset state before each test
    unsplashService.reset();
  });

  afterEach(() => {
    // Cleanup after each test
    unsplashCache.stopCleanup();
  });

  describe('getImage', () => {
    it('should return image data with valid inputs', async () => {
      const result = await unsplashService.getImage({
        id: 1,
        width: 800,
        height: 600,
      });

      expect(result).toBeDefined();
      expect(result.url).toContain('images.unsplash.com');
      expect(result.photoId).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.cached).toBe(false);
    });

    it('should include attribution data', async () => {
      const result = await unsplashService.getImage({
        id: 1,
        width: 800,
        height: 600,
      });

      expect(result.photographer).toBeDefined();
      expect(result.photographerUrl).toContain('unsplash.com/@');
      expect(result.photoUrl).toContain('unsplash.com/photos');
    });

    it('should cache results', async () => {
      const first = await unsplashService.getImage({
        id: 1,
        width: 800,
        height: 600,
      });

      const second = await unsplashService.getImage({
        id: 1,
        width: 800,
        height: 600,
      });

      expect(second.cached).toBe(true);
      expect(second.url).toBe(first.url);
    });

    it('should throw error for invalid ID', async () => {
      await expect(
        unsplashService.getImage({
          id: -1,
          width: 800,
          height: 600,
        })
      ).rejects.toThrow(UnsplashError);
    });

    it('should throw error for invalid width', async () => {
      await expect(
        unsplashService.getImage({
          id: 1,
          width: 0,
          height: 600,
        })
      ).rejects.toThrow(UnsplashError);
    });

    it('should throw error for invalid height', async () => {
      await expect(
        unsplashService.getImage({
          id: 1,
          width: 800,
          height: 6000,
        })
      ).rejects.toThrow(UnsplashError);
    });

    it('should throw error for invalid quality', async () => {
      await expect(
        unsplashService.getImage({
          id: 1,
          width: 800,
          height: 600,
          quality: 150,
        })
      ).rejects.toThrow(UnsplashError);
    });

    it('should apply custom quality parameter', async () => {
      const result = await unsplashService.getImage({
        id: 1,
        width: 800,
        height: 600,
        quality: 90,
      });

      expect(result.url).toContain('q=90');
    });

    it('should use different photos for different IDs', async () => {
      const first = await unsplashService.getImage({
        id: 1,
        width: 800,
        height: 600,
      });

      const second = await unsplashService.getImage({
        id: 100,
        width: 800,
        height: 600,
      });

      expect(first.photoId).not.toBe(second.photoId);
    });
  });

  describe('getImageUrl', () => {
    it('should return URL string', async () => {
      const url = await unsplashService.getImageUrl(1, 800, 600);

      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
      expect(url).toContain('images.unsplash.com');
    });

    it('should return fallback on error', async () => {
      const url = await unsplashService.getImageUrl(-1, 800, 600);

      expect(url).toBeDefined();
      expect(url).toContain('data:image/svg+xml');
    });
  });

  describe('getImageUrlSync', () => {
    it('should return URL string synchronously', () => {
      const url = unsplashService.getImageUrlSync(1, 800, 600);

      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
      expect(url).toContain('images.unsplash.com');
    });

    it('should use cached URL if available', async () => {
      // First request to populate cache
      await unsplashService.getImage({
        id: 1,
        width: 800,
        height: 600,
      });

      // Sync request should use cache
      const url = unsplashService.getImageUrlSync(1, 800, 600);

      expect(url).toContain('images.unsplash.com');
    });

    it('should return fallback on error', () => {
      const url = unsplashService.getImageUrlSync(-1, 800, 600);

      expect(url).toContain('data:image/svg+xml');
    });
  });

  describe('preloadImages', () => {
    it('should preload multiple images', async () => {
      const requests = [
        { id: 1, width: 800, height: 600 },
        { id: 2, width: 800, height: 600 },
        { id: 3, width: 800, height: 600 },
      ];

      await unsplashService.preloadImages(requests);

      // Check all images are cached
      expect(unsplashCache.has(1, 800, 600)).toBe(true);
      expect(unsplashCache.has(2, 800, 600)).toBe(true);
      expect(unsplashCache.has(3, 800, 600)).toBe(true);
    });

    it('should handle preload errors gracefully', async () => {
      const requests = [
        { id: 1, width: 800, height: 600 },
        { id: -1, width: 800, height: 600 }, // Invalid
        { id: 3, width: 800, height: 600 },
      ];

      await expect(unsplashService.preloadImages(requests)).resolves.not.toThrow();
    });
  });

  describe('getStats', () => {
    it('should return service statistics', async () => {
      await unsplashService.getImage({ id: 1, width: 800, height: 600 });
      await unsplashService.getImage({ id: 1, width: 800, height: 600 });

      const stats = unsplashService.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalRequests).toBe(2);
      expect(stats.cacheHits).toBe(1);
      expect(stats.cacheMisses).toBe(1);
      expect(stats.uptime).toBeGreaterThan(0);
    });
  });

  describe('getPhotoMetadata', () => {
    it('should return photo metadata', () => {
      const metadata = unsplashService.getPhotoMetadata(1);

      expect(metadata).toBeDefined();
      expect(metadata?.id).toBeDefined();
      expect(metadata?.description).toBeDefined();
    });
  });

  describe('reset', () => {
    it('should reset all stats and cache', async () => {
      await unsplashService.getImage({ id: 1, width: 800, height: 600 });

      unsplashService.reset();

      const stats = unsplashService.getStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.cacheHits).toBe(0);
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe('URL format', () => {
    it('should generate correct URL format', async () => {
      const result = await unsplashService.getImage({
        id: 1,
        width: 800,
        height: 600,
        quality: 85,
      });

      expect(result.url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
      expect(result.url).toContain('ixlib=rb-4.0.3');
      expect(result.url).toContain('w=800');
      expect(result.url).toContain('h=600');
      expect(result.url).toContain('q=85');
      expect(result.url).toContain('fit=crop');
      expect(result.url).toContain('fm=jpg');
    });
  });

  describe('Photo selection', () => {
    it('should cycle through photos predictably', async () => {
      const photos: string[] = [];

      for (let i = 0; i < 20; i++) {
        const result = await unsplashService.getImage({
          id: i,
          width: 800,
          height: 600,
        });
        photos.push(result.photoId);
      }

      // Should have at most 9 unique photos (PHOTO_IDS length)
      const unique = new Set(photos);
      expect(unique.size).toBeLessThanOrEqual(9);

      // Should repeat pattern
      expect(photos[0]).toBe(photos[9]);
      expect(photos[1]).toBe(photos[10]);
    });
  });
});
