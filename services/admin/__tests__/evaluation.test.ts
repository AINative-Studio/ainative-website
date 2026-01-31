/**
 * Admin Evaluation Service Tests
 */

import { adminEvaluationService } from '@/services/admin/evaluation';
import { adminApi } from '@/services/admin/client';

jest.mock('@/services/admin/client');

describe('AdminEvaluationService', () => {
  const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAnalytics', () => {
    it('should fetch evaluation analytics', async () => {
      const mockAnalytics = {
        total_evaluations: 100,
        avg_score: 8.5,
        pass_rate: 92,
        recent_trend: 'improving' as const,
        category_breakdown: { performance: 45, security: 30, quality: 25 },
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockAnalytics,
      });

      const result = await adminEvaluationService.getAnalytics();
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('runEvaluation', () => {
    it('should start a new evaluation', async () => {
      const request = {
        model_id: 'model123',
        evaluation_criteria: ['accuracy', 'latency'],
      };

      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Evaluation started',
        data: { evaluation_id: 'eval123', status: 'running' },
      });

      const result = await adminEvaluationService.runEvaluation(request);
      expect(result.evaluation_id).toBe('eval123');
    });
  });

  describe('getRecentEvaluations', () => {
    it('should fetch recent evaluations', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { evaluations: [] },
      });

      const result = await adminEvaluationService.getRecentEvaluations();
      expect(result).toEqual([]);
    });
  });

  describe('getPerformanceAnalysis', () => {
    it('should fetch performance analysis', async () => {
      const mockAnalysis = {
        avg_latency_ms: 120,
        p95_latency_ms: 200,
        p99_latency_ms: 350,
        throughput_rps: 1000,
        error_rate: 0.5,
        bottlenecks: [],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockAnalysis,
      });

      const result = await adminEvaluationService.getPerformanceAnalysis();
      expect(result.avg_latency_ms).toBe(120);
    });
  });

  describe('getQualityTrends', () => {
    it('should fetch quality trends', async () => {
      const mockTrends = {
        time_series: [],
        improvement_areas: ['response accuracy'],
        regression_areas: [],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockTrends,
      });

      const result = await adminEvaluationService.getQualityTrends();
      expect(result).toEqual(mockTrends);
    });
  });

  describe('getSecurityAssessment', () => {
    it('should fetch security assessment', async () => {
      const mockAssessment = {
        overall_score: 95,
        vulnerabilities: [],
        compliance_status: { gdpr: true, hipaa: true },
        recommendations: [],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockAssessment,
      });

      const result = await adminEvaluationService.getSecurityAssessment();
      expect(result.overall_score).toBe(95);
    });
  });

  describe('getTestCoverage', () => {
    it('should fetch test coverage', async () => {
      const mockCoverage = {
        overall_percentage: 85,
        unit_test_coverage: 90,
        integration_test_coverage: 80,
        e2e_test_coverage: 75,
        uncovered_components: [],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockCoverage,
      });

      const result = await adminEvaluationService.getTestCoverage();
      expect(result.overall_percentage).toBe(85);
    });
  });

  describe('getEvaluationDetails', () => {
    it('should fetch evaluation details', async () => {
      const mockDetails = {
        id: 'eval123',
        model_name: 'Test Model',
        status: 'passed' as const,
        overall_score: 90,
        started_at: '2024-01-01T00:00:00Z',
        results: [],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockDetails,
      });

      const result = await adminEvaluationService.getEvaluationDetails('eval123');
      expect(result.status).toBe('passed');
    });
  });

  describe('cancelEvaluation', () => {
    it('should cancel an evaluation', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Evaluation cancelled',
        data: null,
      });

      const result = await adminEvaluationService.cancelEvaluation('eval123');
      expect(result.success).toBe(true);
    });
  });
});
