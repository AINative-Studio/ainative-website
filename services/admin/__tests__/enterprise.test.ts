/**
 * Admin Enterprise Service Tests
 */

import { adminEnterpriseService } from '@/services/admin/enterprise';
import { adminApi } from '@/services/admin/client';

jest.mock('@/services/admin/client');

describe('AdminEnterpriseService', () => {
  const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTeamActivity', () => {
    it('should fetch team activity', async () => {
      const mockActivity = {
        total_members: 10,
        active_members_today: 8,
        total_actions: 150,
        collaboration_score: 85,
        recent_activities: [],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockActivity,
      });

      const result = await adminEnterpriseService.getTeamActivity();
      expect(result.total_members).toBe(10);
    });

    it('should apply filters', async () => {
      mockAdminApi.buildQueryString.mockReturnValue('?days=7');
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: {
          total_members: 10,
          active_members_today: 5,
          total_actions: 50,
          collaboration_score: 80,
          recent_activities: [],
        },
      });

      await adminEnterpriseService.getTeamActivity({ days: 7 });
      expect(mockAdminApi.get).toHaveBeenCalledWith('enterprise/team-activity?days=7');
    });
  });

  describe('getProjectAnalytics', () => {
    it('should fetch project analytics', async () => {
      const mockAnalytics = {
        total_projects: 25,
        active_projects: 18,
        total_api_calls: 100000,
        total_tokens_used: 5000000,
        cost_analysis: { total_cost: 1500, cost_by_project: {} },
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockAnalytics,
      });

      const result = await adminEnterpriseService.getProjectAnalytics();
      expect(result.total_projects).toBe(25);
    });
  });

  describe('getSecurityMetrics', () => {
    it('should fetch security metrics', async () => {
      const mockMetrics = {
        failed_login_attempts: 5,
        active_sessions: 50,
        suspicious_activities: 0,
        mfa_enabled_users: 40,
        mfa_disabled_users: 10,
        password_strength_score: 85,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockMetrics,
      });

      const result = await adminEnterpriseService.getSecurityMetrics();
      expect(result.mfa_enabled_users).toBe(40);
    });
  });

  describe('getCollaborationData', () => {
    it('should fetch collaboration data', async () => {
      const mockData = {
        shared_resources: 100,
        team_messages: 500,
        code_reviews: 25,
        pair_programming_sessions: 10,
        knowledge_base_articles: 50,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockData,
      });

      const result = await adminEnterpriseService.getCollaborationData();
      expect(result.shared_resources).toBe(100);
    });
  });
});
