/**
 * SWR Configuration and Hooks
 *
 * Provides centralized SWR configuration and custom hooks
 * for data fetching with optimal caching strategies.
 */

import useSWR, { SWRConfiguration } from 'swr';
import { getSWRConfig } from './cache-config';

/**
 * Default SWR configuration
 */
export const defaultSWRConfig: SWRConfiguration = {
  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,

  // Revalidate on focus (for user-facing data)
  revalidateOnFocus: true,

  // Revalidate on reconnect
  revalidateOnReconnect: true,

  // Retry on error
  errorRetryCount: 3,
  errorRetryInterval: 5000,

  // Show previous data while revalidating
  keepPreviousData: true,

  // Retry on error with exponential backoff
  shouldRetryOnError: true,
};

/**
 * Generic fetcher for API calls
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object
    (error as any).info = await res.json();
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * Custom hook for user settings with optimized caching
 */
export function useUserSettings<T = any>(userId?: string) {
  const config = getSWRConfig('userSettings');

  return useSWR<T>(
    userId ? `/api/v1/users/${userId}/settings` : null,
    fetcher,
    {
      ...defaultSWRConfig,
      ...config,
    }
  );
}

/**
 * Custom hook for usage data with optimized caching
 */
export function useUsageData<T = any>(userId?: string, timeRange?: string) {
  const config = getSWRConfig('usage');
  const key = userId
    ? `/api/v1/users/${userId}/usage${timeRange ? `?range=${timeRange}` : ''}`
    : null;

  return useSWR<T>(key, fetcher, {
    ...defaultSWRConfig,
    ...config,
  });
}

/**
 * Custom hook for dashboard data with optimized caching
 */
export function useDashboardData<T = any>(userId?: string) {
  const config = getSWRConfig('dashboard');

  return useSWR<T>(
    userId ? `/api/v1/dashboard/${userId}` : null,
    fetcher,
    {
      ...defaultSWRConfig,
      ...config,
    }
  );
}

/**
 * Custom hook for pricing plans with longer cache
 */
export function usePricingPlans<T = any>() {
  const config = getSWRConfig('public');

  return useSWR<T>('/api/v1/public/pricing/plans', fetcher, {
    ...defaultSWRConfig,
    ...config,
  });
}

/**
 * Custom hook for webinars with optimized caching
 */
export function useWebinars<T = any>(filters?: Record<string, any>) {
  const config = getSWRConfig('public');
  const params = filters ? `?${new URLSearchParams(filters).toString()}` : '';

  return useSWR<T>(`/api/webinars${params}`, fetcher, {
    ...defaultSWRConfig,
    ...config,
    refreshInterval: 300000, // 5 minutes for webinar lists
  });
}

/**
 * Custom hook for a single webinar
 */
export function useWebinar<T = any>(slug?: string) {
  const config = getSWRConfig('public');

  return useSWR<T>(
    slug ? `/api/webinars/${slug}` : null,
    fetcher,
    {
      ...defaultSWRConfig,
      ...config,
      refreshInterval: 300000, // 5 minutes
    }
  );
}

/**
 * Custom hook for tutorials with optimized caching
 */
export function useTutorials<T = any>(filters?: Record<string, any>) {
  const config = getSWRConfig('public');
  const params = filters ? `?${new URLSearchParams(filters).toString()}` : '';

  return useSWR<T>(`/api/tutorials${params}`, fetcher, {
    ...defaultSWRConfig,
    ...config,
    refreshInterval: 600000, // 10 minutes
  });
}

/**
 * Custom hook for a single tutorial
 */
export function useTutorial<T = any>(slug?: string) {
  const config = getSWRConfig('public');

  return useSWR<T>(
    slug ? `/api/tutorials/${slug}` : null,
    fetcher,
    {
      ...defaultSWRConfig,
      ...config,
      refreshInterval: 600000, // 10 minutes
    }
  );
}

/**
 * Custom hook for blog posts with optimized caching
 */
export function useBlogPosts<T = any>(filters?: Record<string, any>) {
  const config = getSWRConfig('public');
  const params = filters ? `?${new URLSearchParams(filters).toString()}` : '';

  return useSWR<T>(`/api/blog${params}`, fetcher, {
    ...defaultSWRConfig,
    ...config,
    refreshInterval: 300000, // 5 minutes
  });
}

/**
 * Custom hook for a single blog post
 */
export function useBlogPost<T = any>(slug?: string) {
  const config = getSWRConfig('public');

  return useSWR<T>(
    slug ? `/api/blog/${slug}` : null,
    fetcher,
    {
      ...defaultSWRConfig,
      ...config,
      refreshInterval: 300000, // 5 minutes
    }
  );
}

/**
 * Custom hook for community videos with optimized caching
 */
export function useCommunityVideos<T = any>(filters?: Record<string, any>) {
  const config = getSWRConfig('public');
  const params = filters ? `?${new URLSearchParams(filters).toString()}` : '';

  return useSWR<T>(`/api/community/videos${params}`, fetcher, {
    ...defaultSWRConfig,
    ...config,
    refreshInterval: 900000, // 15 minutes
  });
}

/**
 * Custom hook for a single community video
 */
export function useCommunityVideo<T = any>(slug?: string) {
  const config = getSWRConfig('public');

  return useSWR<T>(
    slug ? `/api/community/videos/${slug}` : null,
    fetcher,
    {
      ...defaultSWRConfig,
      ...config,
      refreshInterval: 900000, // 15 minutes
    }
  );
}

/**
 * Generic hook with custom configuration
 */
export function useAPI<T = any>(
  key: string | null,
  config?: SWRConfiguration
) {
  return useSWR<T>(key, fetcher, {
    ...defaultSWRConfig,
    ...config,
  });
}

/**
 * Prefetch helper for server-side or initial load optimization
 */
export async function prefetch<T>(key: string): Promise<T> {
  return fetcher<T>(key);
}
