/**
 * Admin RLHF Service Tests
 * Tests for RLHF dashboard and model management
 */

import { adminRLHFService } from '@/services/admin/rlhf';
import { adminApi } from '@/services/admin/client';

jest.mock('@/services/admin/client');

describe('AdminRLHFService', () => {
  const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('should fetch RLHF dashboard overview', async () => {
      const mockOverview = {
        total_feedback: 5000,
        active_models: 12,
        avg_quality_score: 8.5,
        improvement_rate: 15.2,
        pending_reviews: 45,
        recent_deployments: 3,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockOverview,
      });

      const result = await adminRLHFService.getOverview();

      expect(mockAdminApi.get).toHaveBeenCalledWith('rlhf/dashboard/overview');
      expect(result).toEqual(mockOverview);
    });

    it('should throw error on failure', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: false,
        message: 'Service unavailable',
        data: null,
      });

      await expect(adminRLHFService.getOverview()).rejects.toThrow('Service unavailable');
    });
  });

  describe('getDeployments', () => {
    it('should fetch RLHF model deployments', async () => {
      const mockDeployments = {
        deployments: [
          {
            id: 'deploy1',
            model_name: 'GPT-4',
            version: '1.2.0',
            deployed_at: '2024-01-01T00:00:00Z',
            status: 'active' as const,
            performance_metrics: {
              accuracy: 95.5,
              latency_ms: 120,
              throughput: 1000,
            },
          },
          {
            id: 'deploy2',
            model_name: 'Claude-3',
            version: '2.0.1',
            deployed_at: '2024-01-10T00:00:00Z',
            status: 'staging' as const,
            performance_metrics: {
              accuracy: 96.2,
              latency_ms: 110,
              throughput: 1200,
            },
          },
        ],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockDeployments,
      });

      const result = await adminRLHFService.getDeployments();

      expect(mockAdminApi.get).toHaveBeenCalledWith('rlhf/dashboard/deployments');
      expect(result).toHaveLength(2);
      expect(result[0].model_name).toBe('GPT-4');
    });

    it('should return empty array when no deployments', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { deployments: undefined },
      });

      const result = await adminRLHFService.getDeployments();

      expect(result).toEqual([]);
    });
  });

  describe('getQualityInsights', () => {
    it('should fetch quality insights', async () => {
      const mockInsights = {
        overall_quality_score: 8.7,
        trend: 'improving' as const,
        top_issues: [
          { category: 'hallucination', count: 15, severity: 'high' as const },
          { category: 'coherence', count: 8, severity: 'medium' as const },
        ],
        recommendations: [
          'Increase training data diversity',
          'Implement better context handling',
        ],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockInsights,
      });

      const result = await adminRLHFService.getQualityInsights();

      expect(mockAdminApi.get).toHaveBeenCalledWith('rlhf/dashboard/quality/insights');
      expect(result.trend).toBe('improving');
      expect(result.top_issues).toHaveLength(2);
    });
  });

  describe('getRealtimeStatus', () => {
    it('should fetch realtime RLHF status', async () => {
      const mockStatus = {
        active_sessions: 150,
        feedback_rate: 25.5,
        processing_queue: 12,
        system_health: 'healthy' as const,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockStatus,
      });

      const result = await adminRLHFService.getRealtimeStatus();

      expect(mockAdminApi.get).toHaveBeenCalledWith('rlhf/dashboard/realtime/status');
      expect(result.system_health).toBe('healthy');
    });

    it('should handle degraded system health', async () => {
      const mockStatus = {
        active_sessions: 50,
        feedback_rate: 5.2,
        processing_queue: 250,
        system_health: 'degraded' as const,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockStatus,
      });

      const result = await adminRLHFService.getRealtimeStatus();

      expect(result.system_health).toBe('degraded');
      expect(result.processing_queue).toBe(250);
    });
  });

  describe('createExperiment', () => {
    it('should create a new RLHF experiment', async () => {
      const experimentData = {
        name: 'Test Experiment',
        description: 'Testing new model improvements',
        model_id: 'model123',
        test_prompts: ['Prompt 1', 'Prompt 2', 'Prompt 3'],
        comparison_model_id: 'baseline_model',
      };

      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Experiment created',
        data: { experiment_id: 'exp123' },
      });

      const result = await adminRLHFService.createExperiment(experimentData);

      expect(mockAdminApi.post).toHaveBeenCalledWith(
        'rlhf/dashboard/experiments/create',
        experimentData
      );
      expect(result.experiment_id).toBe('exp123');
    });

    it('should throw error when experiment creation fails', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: false,
        message: 'Invalid model ID',
        data: null,
      });

      await expect(
        adminRLHFService.createExperiment({
          name: 'Test',
          model_id: 'invalid',
          test_prompts: [],
        })
      ).rejects.toThrow('Invalid model ID');
    });
  });

  describe('deployModel', () => {
    it('should deploy a model to production', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Model deployed successfully',
        data: null,
      });

      const result = await adminRLHFService.deployModel('model123', '2.0.0');

      expect(mockAdminApi.post).toHaveBeenCalledWith('rlhf/dashboard/models/model123/deploy', {
        version: '2.0.0',
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Model deployed successfully');
    });

    it('should handle deployment errors', async () => {
      mockAdminApi.post.mockRejectedValue(new Error('Deployment failed'));

      await expect(adminRLHFService.deployModel('model123', '2.0.0')).rejects.toThrow(
        'Deployment failed'
      );
    });
  });

  describe('getFeedbackHistory', () => {
    it('should fetch feedback history for a model', async () => {
      const mockFeedback = {
        feedback: [
          {
            id: 'fb1',
            timestamp: '2024-01-15T10:00:00Z',
            rating: 9,
            comment: 'Excellent response',
            user_id: 'user123',
          },
          {
            id: 'fb2',
            timestamp: '2024-01-15T11:00:00Z',
            rating: 7,
            user_id: 'user456',
          },
        ],
        total: 2,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockFeedback,
      });

      const result = await adminRLHFService.getFeedbackHistory('model123');

      expect(mockAdminApi.get).toHaveBeenCalledWith('rlhf/dashboard/models/model123/feedback');
      expect(result.feedback).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should apply pagination filters', async () => {
      mockAdminApi.buildQueryString.mockReturnValue('?limit=50&offset=100');
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { feedback: [], total: 0 },
      });

      await adminRLHFService.getFeedbackHistory('model123', { limit: 50, offset: 100 });

      expect(mockAdminApi.get).toHaveBeenCalledWith(
        'rlhf/dashboard/models/model123/feedback?limit=50&offset=100'
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockAdminApi.get.mockRejectedValue(new Error('Network timeout'));

      await expect(adminRLHFService.getOverview()).rejects.toThrow('Network timeout');
    });

    it('should handle unauthorized access', async () => {
      mockAdminApi.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(adminRLHFService.getDeployments()).rejects.toThrow('Unauthorized');
    });
  });
});
