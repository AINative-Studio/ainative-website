/**
 * Admin Evaluation Service
 * Handles model evaluation, performance analysis, and quality testing
 */

import { adminApi } from './client';
import type {
  EvaluationAnalytics,
  RunEvaluationRequest,
  RecentEvaluation,
  PerformanceAnalysis,
  QualityTrends,
  SecurityAssessment,
  TestCoverage,
  OperationResult,
} from './types';

/**
 * Admin service for model evaluation and quality assurance
 */
export class AdminEvaluationService {
  private readonly basePath = 'evaluation/evaluation';

  /**
   * Get evaluation analytics overview
   */
  async getAnalytics(): Promise<EvaluationAnalytics> {
    try {
      const response = await adminApi.get<EvaluationAnalytics>(`${this.basePath}/analytics`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch evaluation analytics');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching evaluation analytics:', error);
      throw error;
    }
  }

  /**
   * Run a new evaluation
   */
  async runEvaluation(
    evaluationData: RunEvaluationRequest
  ): Promise<{ evaluation_id: string; status: string }> {
    try {
      const response = await adminApi.post<{ evaluation_id: string; status: string }>(
        `${this.basePath}/run-evaluation`,
        evaluationData
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to run evaluation');
      }

      return response.data;
    } catch (error) {
      console.error('Error running evaluation:', error);
      throw error;
    }
  }

  /**
   * Get recent evaluations
   */
  async getRecentEvaluations(limit?: number): Promise<RecentEvaluation[]> {
    try {
      const queryString = limit ? `?limit=${limit}` : '';
      const response = await adminApi.get<{ evaluations: RecentEvaluation[] }>(
        `${this.basePath}/recent-evaluations${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch recent evaluations');
      }

      return response.data.evaluations || [];
    } catch (error) {
      console.error('Error fetching recent evaluations:', error);
      throw error;
    }
  }

  /**
   * Get performance analysis
   */
  async getPerformanceAnalysis(filters?: {
    model_id?: string;
    days?: number;
  }): Promise<PerformanceAnalysis> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<PerformanceAnalysis>(
        `${this.basePath}/performance-analysis${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch performance analysis');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching performance analysis:', error);
      throw error;
    }
  }

  /**
   * Get quality trends over time
   */
  async getQualityTrends(filters?: {
    model_id?: string;
    days?: number;
  }): Promise<QualityTrends> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<QualityTrends>(
        `${this.basePath}/quality-trends${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch quality trends');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching quality trends:', error);
      throw error;
    }
  }

  /**
   * Get security assessment
   */
  async getSecurityAssessment(modelId?: string): Promise<SecurityAssessment> {
    try {
      const queryString = modelId ? `?model_id=${modelId}` : '';
      const response = await adminApi.get<SecurityAssessment>(
        `${this.basePath}/security-assessment${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch security assessment');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching security assessment:', error);
      throw error;
    }
  }

  /**
   * Get test coverage metrics
   */
  async getTestCoverage(projectId?: string): Promise<TestCoverage> {
    try {
      const queryString = projectId ? `?project_id=${projectId}` : '';
      const response = await adminApi.get<TestCoverage>(
        `${this.basePath}/test-coverage${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch test coverage');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching test coverage:', error);
      throw error;
    }
  }

  /**
   * Get evaluation details by ID
   */
  async getEvaluationDetails(evaluationId: string): Promise<{
    id: string;
    model_name: string;
    status: 'passed' | 'failed' | 'pending' | 'running';
    overall_score: number;
    started_at: string;
    completed_at?: string;
    results: Array<{
      test_name: string;
      score: number;
      passed: boolean;
      details?: string;
    }>;
  }> {
    try {
      const response = await adminApi.get<{
        id: string;
        model_name: string;
        status: 'passed' | 'failed' | 'pending' | 'running';
        overall_score: number;
        started_at: string;
        completed_at?: string;
        results: Array<{
          test_name: string;
          score: number;
          passed: boolean;
          details?: string;
        }>;
      }>(`${this.basePath}/evaluations/${evaluationId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch evaluation details');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching evaluation ${evaluationId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a running evaluation
   */
  async cancelEvaluation(evaluationId: string): Promise<OperationResult> {
    try {
      const response = await adminApi.post<void>(
        `${this.basePath}/evaluations/${evaluationId}/cancel`
      );

      return {
        success: response.success,
        message: response.message || 'Evaluation cancelled successfully',
      };
    } catch (error) {
      console.error(`Error cancelling evaluation ${evaluationId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminEvaluationService = new AdminEvaluationService();
