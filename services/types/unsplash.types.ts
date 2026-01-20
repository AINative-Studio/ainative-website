/**
 * TypeScript interfaces and types for Unsplash integration
 */

/**
 * Options for generating Unsplash image URLs
 */
export interface UnsplashImageOptions {
  /** Content ID for deterministic image selection */
  id: number;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** JPEG quality (1-100), default 80 */
  quality?: number;
  /** Output format, default 'jpg' */
  format?: 'jpg' | 'webp' | 'avif';
  /** Fit mode, default 'crop' */
  fit?: 'crop' | 'max' | 'min';
}

/**
 * Unsplash image with metadata
 */
export interface UnsplashImage {
  /** Full URL to the image */
  url: string;
  /** Photographer name (if available) */
  photographer?: string;
  /** URL to photographer's Unsplash profile */
  photographerUrl?: string;
  /** URL to the photo on Unsplash */
  photoUrl?: string;
  /** Whether this URL was retrieved from cache */
  cached: boolean;
  /** Photo ID used */
  photoId: string;
  /** Timestamp of URL generation */
  timestamp: number;
}

/**
 * Unsplash photo metadata
 */
export interface UnsplashPhotoMetadata {
  /** Photo ID from Unsplash */
  id: string;
  /** Description/category of the photo */
  description: string;
  /** Photographer name */
  photographer?: string;
  /** Photographer Unsplash username */
  photographerUsername?: string;
}

/**
 * Cache entry structure
 */
export interface UnsplashCacheEntry {
  /** Cached image data */
  image: UnsplashImage;
  /** Cache expiration timestamp */
  expiresAt: number;
  /** Number of times this entry was accessed */
  hitCount: number;
}

/**
 * Rate limiter state
 */
export interface RateLimiterState {
  /** Number of requests made in current window */
  requestCount: number;
  /** Timestamp of window start */
  windowStart: number;
  /** Queue of pending requests */
  queue: Array<() => void>;
}

/**
 * Service statistics
 */
export interface UnsplashServiceStats {
  /** Total requests made */
  totalRequests: number;
  /** Requests served from cache */
  cacheHits: number;
  /** Cache miss rate */
  cacheMisses: number;
  /** Requests rate limited */
  rateLimited: number;
  /** Errors encountered */
  errors: number;
  /** Cache size */
  cacheSize: number;
  /** Uptime in milliseconds */
  uptime: number;
}

/**
 * Error types for Unsplash service
 */
export enum UnsplashErrorType {
  INVALID_INPUT = 'INVALID_INPUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  CACHE_ERROR = 'CACHE_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom error class for Unsplash service
 */
export class UnsplashError extends Error {
  constructor(
    public type: UnsplashErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'UnsplashError';
  }
}
