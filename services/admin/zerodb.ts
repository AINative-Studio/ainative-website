/**
 * Admin ZeroDB Service
 * Handles ZeroDB administration, statistics, and project management
 */

import { adminApi } from './client';
import type {
  ZeroDBStats,
  ZeroDBProject,
  ZeroDBUsageAnalytics,
  PaginatedResponse,
} from './types';

/**
 * Admin service for ZeroDB management
 */
export class AdminZeroDBService {
  private readonly basePath = 'zerodb';

  /**
   * Get ZeroDB statistics
   */
  async getStats(): Promise<ZeroDBStats> {
    try {
      const response = await adminApi.get<ZeroDBStats>(`${this.basePath}/stats`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch ZeroDB stats');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching ZeroDB stats:', error);
      throw error;
    }
  }

  /**
   * List all ZeroDB projects
   */
  async listProjects(filters?: {
    limit?: number;
    offset?: number;
    sort_by?: string;
  }): Promise<PaginatedResponse<ZeroDBProject>> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<PaginatedResponse<ZeroDBProject>>(
        `${this.basePath}/projects${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch ZeroDB projects');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching ZeroDB projects:', error);
      throw error;
    }
  }

  /**
   * Get ZeroDB usage analytics
   */
  async getUsageAnalytics(filters?: {
    days?: number;
    project_id?: string;
  }): Promise<ZeroDBUsageAnalytics> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<ZeroDBUsageAnalytics>(
        `${this.basePath}/usage/analytics${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch ZeroDB usage analytics');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching ZeroDB usage analytics:', error);
      throw error;
    }
  }

  /**
   * Get project details
   */
  async getProject(projectId: string): Promise<ZeroDBProject> {
    try {
      const response = await adminApi.get<ZeroDBProject>(`${this.basePath}/projects/${projectId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch ZeroDB project');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching ZeroDB project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get collection statistics for a project
   */
  async getCollections(projectId: string): Promise<
    Array<{
      collection_id: string;
      name: string;
      vector_count: number;
      last_updated: string;
    }>
  > {
    try {
      const response = await adminApi.get<{
        collections: Array<{
          collection_id: string;
          name: string;
          vector_count: number;
          last_updated: string;
        }>;
      }>(`${this.basePath}/projects/${projectId}/collections`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch collections');
      }

      return response.data.collections || [];
    } catch (error) {
      console.error(`Error fetching collections for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get ZeroDB usage by user
   */
  async getUserUsage(userId: string): Promise<{
    total_projects: number;
    total_vectors: number;
    total_storage_mb: number;
    total_queries: number;
  }> {
    try {
      const response = await adminApi.get<{
        total_projects: number;
        total_vectors: number;
        total_storage_mb: number;
        total_queries: number;
      }>(`${this.basePath}/users/${userId}/usage`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user ZeroDB usage');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching ZeroDB usage for user ${userId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminZeroDBService = new AdminZeroDBService();
