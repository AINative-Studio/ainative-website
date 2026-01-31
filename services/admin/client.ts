/**
 * Admin API Client
 * Base HTTP client for all admin dashboard API calls
 * Automatically prefixes endpoints with /admin
 */

import apiClient from '@/lib/api-client';
import type { ApiResponse } from './types';

/**
 * Admin API client with automatic /admin prefix
 * Wraps the base apiClient with admin-specific defaults
 */
class AdminApiClient {
  private readonly prefix = '/admin';

  /**
   * Constructs the full admin API path
   */
  private getPath(path: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.prefix}/${cleanPath}`;
  }

  /**
   * GET request to admin API
   */
  async get<T>(path: string, config?: RequestInit): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(this.getPath(path), config);
    return response.data;
  }

  /**
   * POST request to admin API
   */
  async post<T>(path: string, data?: any, config?: RequestInit): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(this.getPath(path), data, config);
    return response.data;
  }

  /**
   * PUT request to admin API
   */
  async put<T>(path: string, data?: any, config?: RequestInit): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(this.getPath(path), data, config);
    return response.data;
  }

  /**
   * PATCH request to admin API
   */
  async patch<T>(path: string, data?: any, config?: RequestInit): Promise<ApiResponse<T>> {
    const response = await apiClient.patch<ApiResponse<T>>(this.getPath(path), data, config);
    return response.data;
  }

  /**
   * DELETE request to admin API
   */
  async delete<T>(path: string, config?: RequestInit): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<ApiResponse<T>>(this.getPath(path), config);
    return response.data;
  }

  /**
   * Build query string from parameters object
   */
  buildQueryString(params: Record<string, any>): string {
    const filtered = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

    return filtered.length > 0 ? `?${filtered.join('&')}` : '';
  }
}

// Export singleton instance
export const adminApi = new AdminApiClient();
