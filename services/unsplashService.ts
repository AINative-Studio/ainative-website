/**
 * Comprehensive Unsplash Service
 * Handles image retrieval with caching, rate limiting, error handling, and attribution
 */

import type {
  UnsplashImage,
  UnsplashImageOptions,
  UnsplashServiceStats,
} from './types/unsplash.types';
import { UnsplashError, UnsplashErrorType } from './types/unsplash.types';
import { unsplashCache } from './unsplashCache';
import { unsplashRateLimiter } from './unsplashRateLimit';
import { getPhotoAttribution, getPhotographerUrl, getPhotoUrl } from './unsplashAttribution';

/**
 * Photo IDs from Unsplash business/tech categories
 */
const PHOTO_IDS = [
  '1497366216548-37526070297c', // office workspace
  '1498050108023-c5249f4df085', // coding on laptop
  '1522071820081-009f0129c71c', // team collaboration
  '1484480974693-6ca0a78fb36b', // laptop and coffee
  '1497366412874-3415097a27e7', // startup office
  '1460925895917-afdab827c52f', // data visualization
  '1504384308090-c894fdcc538d', // modern workspace
  '1519389950473-47ba0277781c', // technology
  '1517245386807-bb43f82c33c4', // business meeting
];

/**
 * Default image options
 */
const DEFAULT_OPTIONS = {
  quality: 80,
  format: 'jpg' as const,
  fit: 'crop' as const,
};

/**
 * Service statistics
 */
const serviceStats = {
  startTime: Date.now(),
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  rateLimited: 0,
  errors: 0,
};

/**
 * Unsplash Service Class
 */
class UnsplashService {
  /**
   * Validate input parameters
   */
  private validateInput(options: UnsplashImageOptions): void {
    const { id, width, height, quality } = options;

    if (!Number.isInteger(id) || id < 0) {
      throw new UnsplashError(
        UnsplashErrorType.INVALID_INPUT,
        `Invalid ID: ${id}. Must be a non-negative integer.`
      );
    }

    if (!Number.isInteger(width) || width < 1 || width > 5000) {
      throw new UnsplashError(
        UnsplashErrorType.INVALID_INPUT,
        `Invalid width: ${width}. Must be between 1 and 5000 pixels.`
      );
    }

    if (!Number.isInteger(height) || height < 1 || height > 5000) {
      throw new UnsplashError(
        UnsplashErrorType.INVALID_INPUT,
        `Invalid height: ${height}. Must be between 1 and 5000 pixels.`
      );
    }

    if (quality !== undefined && (!Number.isInteger(quality) || quality < 1 || quality > 100)) {
      throw new UnsplashError(
        UnsplashErrorType.INVALID_INPUT,
        `Invalid quality: ${quality}. Must be between 1 and 100.`
      );
    }
  }

  /**
   * Select photo ID based on content ID
   */
  private selectPhotoId(id: number): string {
    return PHOTO_IDS[id % PHOTO_IDS.length];
  }

  /**
   * Build Unsplash CDN URL
   */
  private buildUrl(photoId: string, options: UnsplashImageOptions): string {
    const { width, height, quality, format, fit } = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const params = new URLSearchParams({
      ixlib: 'rb-4.0.3',
      w: width.toString(),
      h: height.toString(),
      fit: fit,
      q: quality.toString(),
      fm: format,
    });

    return `https://images.unsplash.com/photo-${photoId}?${params.toString()}`;
  }

  /**
   * Generate fallback gradient URL (data URI)
   */
  private generateFallback(id: number, width: number, height: number): string {
    // Generate gradient based on ID for variety
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];

    const gradient = gradients[id % gradients.length];

    // Return SVG data URI
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4B6FED;stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:#8A63F4;stop-opacity:0.2" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad)"/>
      </svg>
    `.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  /**
   * Get image with all features (caching, rate limiting, error handling)
   */
  async getImage(options: UnsplashImageOptions): Promise<UnsplashImage> {
    serviceStats.totalRequests++;

    try {
      // Validate input
      this.validateInput(options);

      const { id, width, height, quality } = options;

      // Check cache first
      const cached = unsplashCache.get(id, width, height, quality);
      if (cached) {
        serviceStats.cacheHits++;
        return cached;
      }

      serviceStats.cacheMisses++;

      // Apply rate limiting
      return await unsplashRateLimiter.execute(async () => {
        const photoId = this.selectPhotoId(id);
        const url = this.buildUrl(photoId, options);
        const attribution = getPhotoAttribution(photoId);

        const image: UnsplashImage = {
          url,
          photoId,
          cached: false,
          timestamp: Date.now(),
          photographer: attribution?.photographer,
          photographerUrl: attribution?.photographerUsername
            ? getPhotographerUrl(attribution.photographerUsername)
            : undefined,
          photoUrl: getPhotoUrl(photoId),
        };

        // Cache the result
        unsplashCache.set(id, width, height, image);

        return image;
      });
    } catch (error) {
      serviceStats.errors++;

      // If it's already an UnsplashError, rethrow
      if (error instanceof UnsplashError) {
        throw error;
      }

      // If rate limited, track it
      if (error instanceof Error && error.message.includes('Rate limit')) {
        serviceStats.rateLimited++;
        throw new UnsplashError(
          UnsplashErrorType.RATE_LIMITED,
          'Rate limit exceeded. Please try again later.',
          error
        );
      }

      // Unknown error
      throw new UnsplashError(
        UnsplashErrorType.UNKNOWN,
        `Failed to get image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get image URL only (backward compatible with lib/unsplash.ts)
   */
  async getImageUrl(id: number, width: number, height: number, quality?: number): Promise<string> {
    try {
      const image = await this.getImage({ id, width, height, quality });
      return image.url;
    } catch (error) {
      // Return fallback on error
      console.error('[UnsplashService] Error getting image:', error);
      return this.generateFallback(id, width, height);
    }
  }

  /**
   * Get image URL synchronously (uses cache, generates fallback if not cached)
   */
  getImageUrlSync(id: number, width: number, height: number, quality?: number): string {
    try {
      this.validateInput({ id, width, height, quality });

      // Check cache
      const cached = unsplashCache.get(id, width, height, quality);
      if (cached) {
        serviceStats.cacheHits++;
        return cached.url;
      }

      // Not in cache, build URL directly (bypass rate limiter for sync)
      const photoId = this.selectPhotoId(id);
      return this.buildUrl(photoId, { id, width, height, quality });
    } catch (error) {
      console.error('[UnsplashService] Error in sync mode:', error);
      return this.generateFallback(id, width, height);
    }
  }

  /**
   * Preload images into cache
   */
  async preloadImages(requests: Array<{ id: number; width: number; height: number }>): Promise<void> {
    const promises = requests.map(({ id, width, height }) =>
      this.getImage({ id, width, height }).catch(err => {
        console.warn(`[UnsplashService] Failed to preload image ${id}:`, err);
      })
    );

    await Promise.all(promises);
  }

  /**
   * Get service statistics
   */
  getStats(): UnsplashServiceStats {
    const cacheStats = unsplashCache.getStats();
    const rateLimitStats = unsplashRateLimiter.getStats();

    return {
      totalRequests: serviceStats.totalRequests,
      cacheHits: serviceStats.cacheHits,
      cacheMisses: serviceStats.cacheMisses,
      rateLimited: serviceStats.rateLimited,
      errors: serviceStats.errors,
      cacheSize: cacheStats.size,
      uptime: Date.now() - serviceStats.startTime,
    };
  }

  /**
   * Clear cache and reset stats
   */
  reset(): void {
    unsplashCache.clear();
    unsplashRateLimiter.reset();
    Object.assign(serviceStats, {
      startTime: Date.now(),
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimited: 0,
      errors: 0,
    });
  }

  /**
   * Get photo metadata
   */
  getPhotoMetadata(id: number) {
    const photoId = this.selectPhotoId(id);
    return getPhotoAttribution(photoId);
  }
}

// Export singleton instance
export const unsplashService = new UnsplashService();

// Export for backward compatibility with lib/unsplash.ts
export function getUnsplashImageUrl(id: number, width: number, height: number): string {
  return unsplashService.getImageUrlSync(id, width, height);
}
