/**
 * Centralized API client for making HTTP requests
 * Uses native fetch with interceptors-like functionality
 *
 * PERMANENT FIX FOR RECURRING 401 ERRORS:
 * - Automatically attempts token refresh on 401 errors
 * - Retries original request after successful refresh
 * - Clears all auth data (cookies + localStorage) on failed refresh
 * - Redirects to login page when auth cannot be recovered
 * - Prevents infinite retry loops
 */

import { appConfig } from './config/app';
import { getAuthToken, clearAuthData } from '@/utils/authCookies';
import { authService } from '@/services/authService';

interface RequestConfig extends RequestInit {
  timeout?: number;
  _isRetry?: boolean; // Internal flag to prevent infinite retry loops
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private isRefreshing = false; // Prevent concurrent refresh attempts
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.baseUrl = appConfig.api.baseUrl;
    this.timeout = appConfig.api.timeout;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Use the centralized auth token getter which handles both cookies and localStorage
    return getAuthToken();
  }

  /**
   * Attempt to refresh the access token
   * Prevents concurrent refresh attempts by using a shared promise
   */
  private async refreshToken(): Promise<string | null> {
    // If already refreshing, wait for that attempt to complete
    if (this.isRefreshing && this.refreshPromise) {
      console.log('🔄 [ApiClient] Token refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = authService.refreshAccessToken()
      .then((newToken) => {
        this.isRefreshing = false;
        this.refreshPromise = null;
        return newToken;
      })
      .catch((error) => {
        this.isRefreshing = false;
        this.refreshPromise = null;
        console.error('🔄 [ApiClient] Token refresh failed:', error);
        return null;
      });

    return this.refreshPromise;
  }

  /**
   * Handle 401 Unauthorized errors with automatic token refresh
   * If refresh succeeds, retries the original request
   * If refresh fails, clears auth and redirects to login
   */
  private async handle401Error<T>(
    endpoint: string,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    console.warn('🔒 [ApiClient] 401 Unauthorized - Attempting token refresh...');

    // Don't retry if this is already a retry attempt (prevent infinite loops)
    if (config._isRetry) {
      console.error('🔒 [ApiClient] Token refresh failed on retry - clearing auth and redirecting');
      this.clearAuthAndRedirect();
      throw new Error('Authentication failed. Please log in again.');
    }

    // Attempt to refresh the token
    const newToken = await this.refreshToken();

    if (newToken) {
      // Refresh succeeded! Retry the original request with new token
      console.log('✅ [ApiClient] Token refreshed successfully - retrying request');
      return this.request<T>(endpoint, { ...config, _isRetry: true });
    } else {
      // Refresh failed - clear auth and redirect to login
      console.error('❌ [ApiClient] Token refresh failed - clearing auth and redirecting');
      this.clearAuthAndRedirect();
      throw new Error('Session expired. Please log in again.');
    }
  }

  /**
   * Clear all authentication data and redirect to login page
   * Preserves current URL for post-login redirect
   */
  private clearAuthAndRedirect(): void {
    if (typeof window === 'undefined') return;

    // Clear ALL auth data (cookies + localStorage)
    clearAuthData();

    // Build login URL with return path
    const currentPath = window.location.pathname + window.location.search;
    const loginUrl = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;

    console.log('🔐 [ApiClient] Redirecting to login:', loginUrl);

    // Redirect to login page
    window.location.href = loginUrl;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = this.timeout, ...fetchConfig } = config;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    // Don't set Content-Type for FormData - browser will set it with boundary
    const isFormData = fetchConfig.body instanceof FormData;

    const headers: HeadersInit = {
      ...(fetchConfig.headers || {}),
    };

    // Only set Content-Type for JSON requests
    if (!isFormData) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      // Handle 401 unauthorized with automatic token refresh
      if (response.status === 401) {
        console.warn('🔒 [ApiClient] Received 401 Unauthorized for:', endpoint);
        return this.handle401Error<T>(endpoint, config);
      }

      // Throw error for non-OK responses
      if (!response.ok) {
        // Log full error details for debugging (especially 422 validation errors)
        if (response.status === 422) {
          console.error('🚨 [ApiClient] Validation Error (422):', {
            endpoint,
            status: response.status,
            fullErrorResponse: data,
          });
        }

        let errorMessage: string;
        if (typeof data === 'object' && typeof data?.message === 'string') {
          errorMessage = data.message;
        } else if (typeof data === 'object' && typeof data?.detail === 'string') {
          errorMessage = data.detail;
        } else if (typeof data === 'object' && data?.detail && typeof data.detail === 'object') {
          errorMessage = typeof data.detail.message === 'string'
            ? data.detail.message
            : Array.isArray(data.detail)
            ? data.detail.map((d: { msg?: string }) => d.msg || String(d)).join('; ')
            : JSON.stringify(data.detail);
        } else if (typeof data === 'object' && data?.message && typeof data.message === 'object') {
          errorMessage = JSON.stringify(data.message);
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      throw error;
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
