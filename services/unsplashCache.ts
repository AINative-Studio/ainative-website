/**
 * In-memory cache for Unsplash image URLs
 * Reduces redundant requests and improves performance
 */

import type { UnsplashImage, UnsplashCacheEntry } from './types/unsplash.types';

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  /** Maximum number of entries in cache */
  MAX_ENTRIES: 500,
  /** Default TTL in milliseconds (24 hours) */
  DEFAULT_TTL: 24 * 60 * 60 * 1000,
  /** Cleanup interval in milliseconds (1 hour) */
  CLEANUP_INTERVAL: 60 * 60 * 1000,
};

/**
 * In-memory cache for Unsplash images
 */
class UnsplashCache {
  private cache: Map<string, UnsplashCacheEntry> = new Map();
  private cleanupTimer?: NodeJS.Timeout;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  constructor() {
    this.startCleanup();
  }

  /**
   * Generate cache key from image options
   */
  private generateKey(id: number, width: number, height: number, quality?: number): string {
    return `${id}:${width}:${height}:${quality || 80}`;
  }

  /**
   * Get image from cache
   */
  get(id: number, width: number, height: number, quality?: number): UnsplashImage | null {
    const key = this.generateKey(id, width, height, quality);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update hit count and stats
    entry.hitCount++;
    this.stats.hits++;

    return entry.image;
  }

  /**
   * Set image in cache
   */
  set(
    id: number,
    width: number,
    height: number,
    image: UnsplashImage,
    ttl: number = CACHE_CONFIG.DEFAULT_TTL
  ): void {
    const key = this.generateKey(id, width, height, image.url.includes('q=') ?
      parseInt(image.url.match(/q=(\d+)/)?.[1] || '80') : 80);

    // Evict oldest entry if cache is full
    if (this.cache.size >= CACHE_CONFIG.MAX_ENTRIES) {
      this.evictOldest();
    }

    const entry: UnsplashCacheEntry = {
      image: { ...image, cached: true },
      expiresAt: Date.now() + ttl,
      hitCount: 0,
    };

    this.cache.set(key, entry);
  }

  /**
   * Evict the oldest (least recently used) entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    let lowestHitCount = Infinity;

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      // Prioritize evicting entries with fewer hits
      if (entry.hitCount < lowestHitCount ||
          (entry.hitCount === lowestHitCount && entry.expiresAt < oldestTime)) {
        oldestKey = key;
        oldestTime = entry.expiresAt;
        lowestHitCount = entry.hitCount;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Clear all expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[UnsplashCache] Cleaned up ${removed} expired entries`);
    }
  }

  /**
   * Start automatic cleanup
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);

    // Ensure cleanup runs even if Node.js keeps running
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: CACHE_CONFIG.MAX_ENTRIES,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      evictions: this.stats.evictions,
    };
  }

  /**
   * Check if cache has entry (without updating stats)
   */
  has(id: number, width: number, height: number, quality?: number): boolean {
    const key = this.generateKey(id, width, height, quality);
    const entry = this.cache.get(key);

    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const unsplashCache = new UnsplashCache();
