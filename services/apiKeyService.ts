/**
 * API Key Service
 * Handles all API key management operations including CRUD and usage statistics
 */

import apiClient from '@/lib/api-client';

/**
 * Represents an API key entity from the backend
 */
export interface ApiKeyBackend {
  id: string;
  user_id?: string;
  user_email?: string;
  name: string;
  prefix: string;
  is_active: boolean;
  created_at?: string;
  last_used_at?: string | null;
  usage_count?: number;
}

/**
 * Represents an API key entity for the frontend
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
 * Standard API response wrapper
 */
export interface ApiKeyApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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
  private readonly basePath = '/v1/public/api-keys/';

  /**
   * Transform backend API key format to frontend format
   */
  private transformApiKey(backendKey: ApiKeyBackend): ApiKey {
    return {
      id: backendKey.id,
      name: backendKey.name,
      key: backendKey.prefix ? `${backendKey.prefix}...` : '',
      created: backendKey.created_at || new Date().toISOString(),
      lastUsed: backendKey.last_used_at || 'Never',
      status: backendKey.is_active ? 'active' : 'inactive'
    };
  }

  /**
   * Get all API keys for the current user
   * @returns Promise resolving to an array of API keys
   * @throws Error if the request fails or returns unsuccessful
   */
  async listApiKeys(): Promise<ApiKey[]> {
    try {
      // API returns a direct array, not wrapped in success/data
      const response = await apiClient.get<ApiKeyBackend[]>(
        this.basePath
      );

      // Debug: log response to understand structure
      console.log('API Keys response:', JSON.stringify(response.data, null, 2));

      // Handle both direct array response and wrapped response formats
      const data = response.data;

      if (Array.isArray(data)) {
        return data.map(key => this.transformApiKey(key));
      }

      // Check for wrapped response with success/data structure
      const wrappedData = data as unknown as ApiKeyApiResponse<{ keys: ApiKeyBackend[] } | ApiKeyBackend[]>;
      if (wrappedData.success) {
        // Handle { success: true, data: [...] } format
        if (Array.isArray(wrappedData.data)) {
          return (wrappedData.data as ApiKeyBackend[]).map(key => this.transformApiKey(key));
        }
        // Handle { success: true, data: { keys: [...] } } format
        if (wrappedData.data && typeof wrappedData.data === 'object' && 'keys' in wrappedData.data) {
          return (wrappedData.data as { keys: ApiKeyBackend[] }).keys.map(key => this.transformApiKey(key));
        }
      }

      console.error('Unexpected API response format:', data);
      throw new Error('Failed to fetch API keys - unexpected response format');
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
      const response = await apiClient.post<ApiKeyApiResponse<CreateApiKeyResponse>>(
        this.basePath,
        { name }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create API key');
      }

      return response.data.data;
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
      const response = await apiClient.post<ApiKeyApiResponse<RegenerateApiKeyResponse>>(
        `${this.basePath}/${id}/regenerate`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to regenerate API key');
      }

      return response.data.data;
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
      const response = await apiClient.delete<ApiKeyApiResponse<{ success: boolean }>>(
        `${this.basePath}/${id}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete API key');
      }

      return {
        success: true,
        message: response.data.message || 'API key deleted successfully',
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
      const response = await apiClient.put<ApiKeyApiResponse<ApiKey>>(
        `${this.basePath}/${id}`,
        updates
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update API key');
      }

      return response.data.data;
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
      const response = await apiClient.get<ApiKeyApiResponse<ApiKeyUsageStats>>(
        `${this.basePath}/${id}/usage`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch API key usage');
      }

      return response.data.data;
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
      const response = await apiClient.get<ApiKeyApiResponse<ApiKey>>(
        `${this.basePath}/${id}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch API key');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching API key:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiKeyService = new ApiKeyService();
