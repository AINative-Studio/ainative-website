/**
 * Admin Enterprise Service
 * Handles enterprise features, team management, and collaboration
 */

import { adminApi } from './client';
import type {
  TeamActivity,
  ProjectAnalytics,
  SecurityMetrics,
  CollaborationData,
} from './types';

/**
 * Admin service for enterprise and team management
 */
export class AdminEnterpriseService {
  private readonly basePath = 'enterprise';

  /**
   * Get team activity metrics
   */
  async getTeamActivity(filters?: { days?: number; team_id?: string }): Promise<TeamActivity> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<TeamActivity>(
        `${this.basePath}/team-activity${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch team activity');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching team activity:', error);
      throw error;
    }
  }

  /**
   * Get project analytics
   */
  async getProjectAnalytics(filters?: {
    days?: number;
    project_id?: string;
  }): Promise<ProjectAnalytics> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<ProjectAnalytics>(
        `${this.basePath}/project-analytics${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch project analytics');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching project analytics:', error);
      throw error;
    }
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(filters?: { days?: number }): Promise<SecurityMetrics> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<SecurityMetrics>(
        `${this.basePath}/security-metrics${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch security metrics');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      throw error;
    }
  }

  /**
   * Get collaboration data
   */
  async getCollaborationData(filters?: {
    days?: number;
    team_id?: string;
  }): Promise<CollaborationData> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<CollaborationData>(
        `${this.basePath}/collaboration-data${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch collaboration data');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching collaboration data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminEnterpriseService = new AdminEnterpriseService();
