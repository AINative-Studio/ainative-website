/**
 * Admin RLHF Dashboard Service
 * Handles all RLHF (Reinforcement Learning from Human Feedback) operations
 */

import { adminApi } from './client';
import type {
  RLHFOverview,
  RLHFDeployment,
  RLHFQualityInsights,
  RLHFRealtimeStatus,
  CreateRLHFExperimentRequest,
  OperationResult,
} from './types';

/**
 * Admin service for RLHF dashboard and model management
 */
export class AdminRLHFService {
  private readonly basePath = 'rlhf/dashboard';

  /**
   * Get RLHF dashboard overview metrics
   */
  async getOverview(): Promise<RLHFOverview> {
    try {
      const response = await adminApi.get<RLHFOverview>(`${this.basePath}/overview`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch RLHF overview');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching RLHF overview:', error);
      throw error;
    }
  }

  /**
   * Get list of RLHF model deployments
   */
  async getDeployments(): Promise<RLHFDeployment[]> {
    try {
      const response = await adminApi.get<{ deployments: RLHFDeployment[] }>(
        `${this.basePath}/deployments`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch deployments');
      }

      return response.data.deployments || [];
    } catch (error) {
      console.error('Error fetching RLHF deployments:', error);
      throw error;
    }
  }

  /**
   * Get quality insights for RLHF models
   */
  async getQualityInsights(): Promise<RLHFQualityInsights> {
    try {
      const response = await adminApi.get<RLHFQualityInsights>(
        `${this.basePath}/quality/insights`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch quality insights');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching quality insights:', error);
      throw error;
    }
  }

  /**
   * Get realtime status of RLHF system
   */
  async getRealtimeStatus(): Promise<RLHFRealtimeStatus> {
    try {
      const response = await adminApi.get<RLHFRealtimeStatus>(
        `${this.basePath}/realtime/status`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch realtime status');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching realtime status:', error);
      throw error;
    }
  }

  /**
   * Create a new RLHF experiment
   */
  async createExperiment(
    experimentData: CreateRLHFExperimentRequest
  ): Promise<{ experiment_id: string }> {
    try {
      const response = await adminApi.post<{ experiment_id: string }>(
        `${this.basePath}/experiments/create`,
        experimentData
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to create experiment');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating RLHF experiment:', error);
      throw error;
    }
  }

  /**
   * Deploy a model to production
   */
  async deployModel(modelId: string, version: string): Promise<OperationResult> {
    try {
      const response = await adminApi.post<void>(`${this.basePath}/models/${modelId}/deploy`, {
        version,
      });

      return {
        success: response.success,
        message: response.message || 'Model deployed successfully',
      };
    } catch (error) {
      console.error(`Error deploying model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Get feedback history for a model
   */
  async getFeedbackHistory(
    modelId: string,
    filters?: { limit?: number; offset?: number }
  ): Promise<{
    feedback: Array<{
      id: string;
      timestamp: string;
      rating: number;
      comment?: string;
      user_id: string;
    }>;
    total: number;
  }> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<{
        feedback: Array<{
          id: string;
          timestamp: string;
          rating: number;
          comment?: string;
          user_id: string;
        }>;
        total: number;
      }>(`${this.basePath}/models/${modelId}/feedback${queryString}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch feedback history');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback for model ${modelId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminRLHFService = new AdminRLHFService();
