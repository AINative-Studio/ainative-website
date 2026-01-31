/**
 * Admin Agent Service Tests
 */

import { adminAgentService } from '@/services/admin/agents';
import { adminApi } from '@/services/admin/client';

jest.mock('@/services/admin/client');

describe('AdminAgentService', () => {
  const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listProjects', () => {
    it('should list agent swarm projects', async () => {
      const mockProjects = {
        items: [
          {
            id: 'proj1',
            name: 'Test Project',
            created_at: '2024-01-01T00:00:00Z',
            status: 'active' as const,
            agent_count: 5,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        hasMore: false,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockProjects,
      });

      const result = await adminAgentService.listProjects();
      expect(result.items).toHaveLength(1);
    });
  });

  describe('orchestrate', () => {
    it('should orchestrate an agent swarm task', async () => {
      const request = {
        project_id: 'proj1',
        task_description: 'Build a feature',
      };

      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Task created',
        data: { task_id: 'task123', status: 'pending', agents_assigned: 3 },
      });

      const result = await adminAgentService.orchestrate(request);
      expect(result.task_id).toBe('task123');
    });
  });

  describe('getAgentTypes', () => {
    it('should fetch available agent types', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { agent_types: [] },
      });

      const result = await adminAgentService.getAgentTypes();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getMetrics', () => {
    it('should fetch agent swarm metrics', async () => {
      const mockMetrics = {
        total_executions: 100,
        successful_executions: 95,
        avg_execution_time_seconds: 120,
        cost_today: 50,
        active_agents: 10,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockMetrics,
      });

      const result = await adminAgentService.getMetrics();
      expect(result.total_executions).toBe(100);
    });
  });

  describe('getTaskStatus', () => {
    it('should fetch task status', async () => {
      const mockStatus = {
        task_id: 'task123',
        status: 'completed' as const,
        progress: 100,
        agents: [],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockStatus,
      });

      const result = await adminAgentService.getTaskStatus('task123');
      expect(result.status).toBe('completed');
    });
  });

  describe('cancelTask', () => {
    it('should cancel a task', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Task cancelled',
        data: null,
      });

      const result = await adminAgentService.cancelTask('task123');
      expect(result.success).toBe(true);
    });
  });
});
