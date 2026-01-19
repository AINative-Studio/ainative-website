/**
 * Rate Limiting Configuration
 *
 * Defines rate limits for different endpoint types to prevent API abuse,
 * DDoS attacks, and ensure fair usage across all API endpoints.
 */

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Human-readable description of the rate limit
   */
  description: string;
}

export type RateLimitTier =
  | 'auth'
  | 'payment'
  | 'apiKey'
  | 'api'
  | 'search'
  | 'readonly'
  | 'default';

/**
 * Rate limit configurations per endpoint type
 */
export const RATE_LIMIT_CONFIGS: Record<RateLimitTier, RateLimitConfig> = {
  /**
   * Auth endpoints: 5 requests/minute
   * Strict limit to prevent brute force attacks
   */
  auth: {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
    description: '5 requests per minute',
  },

  /**
   * Payment endpoints: 10 requests/minute
   * Moderate limit for financial operations
   */
  payment: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
    description: '10 requests per minute',
  },

  /**
   * API key operations: 20 requests/minute
   * Moderate limit for API key management
   */
  apiKey: {
    limit: 20,
    windowMs: 60 * 1000, // 1 minute
    description: '20 requests per minute',
  },

  /**
   * API proxy endpoints: 60 requests/minute
   * Higher limit for proxied API calls
   */
  api: {
    limit: 60,
    windowMs: 60 * 1000, // 1 minute
    description: '60 requests per minute',
  },

  /**
   * Search/query endpoints: 30 requests/minute
   * Higher limit for search operations
   */
  search: {
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
    description: '30 requests per minute',
  },

  /**
   * Read-only endpoints: 60 requests/minute
   * Highest limit for read operations
   */
  readonly: {
    limit: 60,
    windowMs: 60 * 1000, // 1 minute
    description: '60 requests per minute',
  },

  /**
   * Default: 30 requests/minute
   * Fallback for uncategorized endpoints
   */
  default: {
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
    description: '30 requests per minute',
  },
};

/**
 * Whitelisted IPs that bypass rate limiting
 * Useful for development, monitoring, and trusted services
 */
export const WHITELISTED_IPS = process.env.RATE_LIMIT_WHITELIST_IPS
  ? process.env.RATE_LIMIT_WHITELIST_IPS.split(',').map(ip => ip.trim())
  : ['127.0.0.1', '::1', 'localhost'];

/**
 * Enable/disable rate limiting globally
 */
export const RATE_LIMITING_ENABLED =
  process.env.RATE_LIMITING_ENABLED !== 'false';

/**
 * Block IP after exceeding rate limit N times in abuse detection window
 */
export const ABUSE_DETECTION_THRESHOLD =
  parseInt(process.env.RATE_LIMIT_ABUSE_THRESHOLD || '10', 10);

/**
 * Time window for abuse detection (default: 1 hour)
 */
export const ABUSE_DETECTION_WINDOW_MS =
  parseInt(process.env.RATE_LIMIT_ABUSE_WINDOW_MS || String(60 * 60 * 1000), 10);

/**
 * Duration to block an IP after abuse detection (default: 24 hours)
 */
export const IP_BLOCK_DURATION_MS =
  parseInt(process.env.RATE_LIMIT_BLOCK_DURATION_MS || String(24 * 60 * 60 * 1000), 10);
