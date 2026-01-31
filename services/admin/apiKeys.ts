/**
 * Admin API Keys Management Service
 * Handles all API key administration operations
 */

import { adminApi } from './client';
import type {
  AdminApiKey,
  ApiKeyListFilters,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ApiKeyUsageStats,
  PaginatedResponse,
  OperationResult,
} from './types';

/**
 * Admin service for managing API keys across all users
 */
export class AdminApiKeyService {
  private readonly basePath = 'keys';

  /**
   * List all API keys with optional filtering and pagination
   */
  async listApiKeys(filters?: ApiKeyListFilters): Promise<PaginatedResponse<AdminApiKey>> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<PaginatedResponse<AdminApiKey>>(
        `${this.basePath}${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch API keys');
      }

      return response.data;
    } catch (error) {
      console.error('Error listing API keys:', error);
      throw error;
    }
  }

  /**
   * Get a single API key by ID
   */
  async getApiKey(keyId: string): Promise<AdminApiKey> {
    try {
      const response = await adminApi.get<AdminApiKey>(`${this.basePath}/${keyId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch API key');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching API key ${keyId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new API key for a user
   */
  async createApiKey(
    userId: string,
    keyData: CreateApiKeyRequest
  ): Promise<CreateApiKeyResponse> {
    try {
      const response = await adminApi.post<CreateApiKeyResponse>(this.basePath, {
        user_id: userId,
        ...keyData,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create API key');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId: string): Promise<OperationResult> {
    try {
      const response = await adminApi.delete<void>(`${this.basePath}/${keyId}`);

      return {
        success: response.success,
        message: response.message || 'API key revoked successfully',
      };
    } catch (error) {
      console.error(`Error revoking API key ${keyId}:`, error);
      throw error;
    }
  }

  /**
   * Get API key usage statistics
   */
  async getApiKeyUsage(keyId: string): Promise<ApiKeyUsageStats> {
    try {
      const response = await adminApi.get<ApiKeyUsageStats>(
        `${this.basePath}/${keyId}/usage`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch API key usage');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching API key usage ${keyId}:`, error);
      throw error;
    }
  }

  /**
   * Get aggregated usage statistics for all API keys
   */
  async getUsageStats(filters?: { user_id?: string; days?: number }): Promise<{
    total_requests: number;
    requests_today: number;
    active_keys: number;
    top_keys: Array<{ key_id: string; key_name: string; requests: number }>;
  }> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<{
        total_requests: number;
        requests_today: number;
        active_keys: number;
        top_keys: Array<{ key_id: string; key_name: string; requests: number }>;
      }>(`${this.basePath}/usage/stats${queryString}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch usage stats');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      throw error;
    }
  }

  /**
   * Update API key rate limit
   */
  async updateRateLimit(keyId: string, rateLimit: number): Promise<OperationResult> {
    try {
      const response = await adminApi.patch<void>(`${this.basePath}/${keyId}/rate-limit`, {
        rate_limit: rateLimit,
      });

      return {
        success: response.success,
        message: response.message || 'Rate limit updated successfully',
      };
    } catch (error) {
      console.error(`Error updating rate limit for API key ${keyId}:`, error);
      throw error;
    }
  }

  /**
   * Activate an API key
   */
  async activateApiKey(keyId: string): Promise<OperationResult> {
    try {
      const response = await adminApi.post<void>(`${this.basePath}/${keyId}/activate`);

      return {
        success: response.success,
        message: response.message || 'API key activated successfully',
      };
    } catch (error) {
      console.error(`Error activating API key ${keyId}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate an API key
   */
  async deactivateApiKey(keyId: string): Promise<OperationResult> {
    try {
      const response = await adminApi.post<void>(`${this.basePath}/${keyId}/deactivate`);

      return {
        success: response.success,
        message: response.message || 'API key deactivated successfully',
      };
    } catch (error) {
      console.error(`Error deactivating API key ${keyId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminApiKeyService = new AdminApiKeyService();
