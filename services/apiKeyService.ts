/**
 * API Key Service
 * Handles all API key management operations including CRUD and usage statistics
 */

import apiClient from '@/lib/api-client';

/**
 * Represents an API key entity
 */
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'inactive';
}

/**
 * Request payload for creating a new API key
 */
export interface CreateApiKeyRequest {
  name: string;
}

/**
 * Response payload when creating a new API key
 */
export interface CreateApiKeyResponse {
  key: string;
  id: string;
}

/**
 * Response payload when regenerating an API key
 */
export interface RegenerateApiKeyResponse {
  key: string;
}

/**
 * API key usage statistics
 */
export interface ApiKeyUsageStats {
  total_requests: number;
  requests_today: number;
  last_used: string;
  daily_usage: Array<{ date: string; requests: number }>;
}

/**
 * Payload for updating an API key
 */
export interface UpdateApiKeyRequest {
  name?: string;
  status?: 'active' | 'inactive';
}

/**
 * ApiKeyService provides methods for managing API keys
 */
export class ApiKeyService {
  private readonly basePath = '/v1/settings/api-keys';

  /**
   * Get all API keys for the current user
   * @returns Promise resolving to an array of API keys
   * @throws Error if the request fails or returns unsuccessful
   */
  async listApiKeys(): Promise<ApiKey[]> {
    try {
      const response = await apiClient.get<{ keys: ApiKey[] } | ApiKey[]>(
        this.basePath
      );

      // Handle both array response and object with keys property
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && 'keys' in data) {
        return data.keys;
      }

      return [];
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  }

  /**
   * Create a new API key
   * @param name - The name/label for the new API key
   * @returns Promise resolving to the created key details (includes the full key, shown only once)
   * @throws Error if the request fails or returns unsuccessful
   */
  async createApiKey(name: string): Promise<CreateApiKeyResponse> {
    try {
      const response = await apiClient.post<CreateApiKeyResponse>(
        this.basePath,
        { name }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }

  /**
   * Regenerate an existing API key
   * @param id - The ID of the API key to regenerate
   * @returns Promise resolving to the new key value (shown only once)
   * @throws Error if the request fails or returns unsuccessful
   */
  async regenerateApiKey(id: string): Promise<RegenerateApiKeyResponse> {
    try {
      const response = await apiClient.post<RegenerateApiKeyResponse>(
        `${this.basePath}/${id}/regenerate`
      );

      return response.data;
    } catch (error) {
      console.error('Error regenerating API key:', error);
      throw error;
    }
  }

  /**
   * Delete an API key
   * @param id - The ID of the API key to delete
   * @returns Promise resolving to success status and message
   * @throws Error if the request fails
   */
  async deleteApiKey(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);

      return {
        success: true,
        message: 'API key deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  /**
   * Update API key name or status
   * @param id - The ID of the API key to update
   * @param updates - Object containing the fields to update
   * @returns Promise resolving to the updated API key
   * @throws Error if the request fails or returns unsuccessful
   */
  async updateApiKey(id: string, updates: UpdateApiKeyRequest): Promise<ApiKey> {
    try {
      const response = await apiClient.put<ApiKey>(
        `${this.basePath}/${id}`,
        updates
      );

      return response.data;
    } catch (error) {
      console.error('Error updating API key:', error);
      throw error;
    }
  }

  /**
   * Get API key usage statistics
   * @param id - The ID of the API key to get usage for
   * @returns Promise resolving to usage statistics
   * @throws Error if the request fails or returns unsuccessful
   */
  async getApiKeyUsage(id: string): Promise<ApiKeyUsageStats> {
    try {
      const response = await apiClient.get<ApiKeyUsageStats>(
        `${this.basePath}/${id}/usage`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching API key usage:', error);
      throw error;
    }
  }

  /**
   * Get a single API key by ID
   * @param id - The ID of the API key to retrieve
   * @returns Promise resolving to the API key
   * @throws Error if the request fails or returns unsuccessful
   */
  async getApiKey(id: string): Promise<ApiKey> {
    try {
      const response = await apiClient.get<ApiKey>(
        `${this.basePath}/${id}`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching API key:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiKeyService = new ApiKeyService();
