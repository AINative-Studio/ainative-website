/**
 * Geo Detection Utility
 *
 * Detects user's geographic location using ipapi.co for regional pricing.
 * Implements caching to reduce API calls.
 */

/**
 * Pricing tier based on user's geographic location
 */
export type PricingTier = 'premium' | 'india';

/**
 * Geographic location information from IP-based detection
 */
export interface GeoLocation {
  country: string;
  countryCode: string;
  city: string;
  region: string;
  pricingTier: PricingTier;
}

/**
 * Cache key for localStorage
 */
const CACHE_KEY = 'user_location';

/**
 * Cache TTL in milliseconds (1 hour)
 */
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Detect user's geographic location using ipapi.co
 * Falls back to premium pricing if detection fails
 *
 * @returns Promise<GeoLocation> - User's detected location and pricing tier
 */
export async function detectUserLocation(): Promise<GeoLocation> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data = await response.json();
    const { country_name, country_code, city, region } = data;

    // If country code is missing, fall back to premium
    if (!country_code) {
      return createFallbackLocation();
    }

    return {
      country: country_name || 'Unknown',
      countryCode: country_code,
      city: city || 'Unknown',
      region: region || 'Unknown',
      pricingTier: determinePricingTier(country_code),
    };
  } catch (error) {
    console.warn('Geo-detection failed, falling back to premium pricing:', error);
    return createFallbackLocation();
  }
}

/**
 * Determine pricing tier based on country code
 * Currently supports: India (special pricing), Rest of World (premium)
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'IN', 'US')
 * @returns PricingTier - 'india' for India, 'premium' for all others
 */
function determinePricingTier(countryCode: string): PricingTier {
  // Week 1: Only India gets special pricing
  // Future: Add more tiers (emerging, developing) based on Week 1 results
  if (countryCode === 'IN') {
    return 'india';
  }

  return 'premium';
}

/**
 * Create fallback location when detection fails
 * Defaults to premium pricing to avoid revenue loss
 */
function createFallbackLocation(): GeoLocation {
  return {
    country: 'Unknown',
    countryCode: 'UNKNOWN',
    city: 'Unknown',
    region: 'Unknown',
    pricingTier: 'premium', // Safe default: premium pricing if detection fails
  };
}

/**
 * Cache user location in localStorage with timestamp
 *
 * @param location - GeoLocation to cache
 */
export function cacheLocation(location: GeoLocation): void {
  if (typeof window === 'undefined') return;

  try {
    const cacheData = {
      location,
      timestamp: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache location:', error);
  }
}

/**
 * Get cached location from localStorage if not expired
 * Returns null if cache is expired or doesn't exist
 *
 * @returns GeoLocation | null - Cached location or null if expired/missing
 */
export function getCachedLocation(): GeoLocation | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);

    if (!cached) {
      return null;
    }

    const { location, timestamp } = JSON.parse(cached);

    // Check if cache is still valid (within 1 hour)
    const now = Date.now();
    const age = now - timestamp;

    if (age > CACHE_TTL) {
      // Cache expired, remove it
      clearLocationCache();
      return null;
    }

    return location;
  } catch (error) {
    console.warn('Failed to get cached location:', error);
    clearLocationCache(); // Clear corrupted cache
    return null;
  }
}

/**
 * Clear cached location from localStorage
 */
export function clearLocationCache(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear location cache:', error);
  }
}

/**
 * Get user location with caching
 * Checks cache first, fetches from API if cache is expired/missing
 *
 * @returns Promise<GeoLocation> - User's location (from cache or fresh detection)
 */
export async function getUserLocationWithCache(): Promise<GeoLocation> {
  // Try to get from cache first
  const cached = getCachedLocation();

  if (cached) {
    return cached;
  }

  // Cache miss or expired, fetch fresh location
  const location = await detectUserLocation();

  // Cache the fresh location
  cacheLocation(location);

  return location;
}
