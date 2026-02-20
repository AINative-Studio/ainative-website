/**
 * Agent Service Tests
 * Tests for the agent service API client methods
 *
 * Refs #558
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import agentService, {
  Agent,
  AgentTemplate,
  AgentTask,
  CreateAgentRequest,
  CreateAgentTaskRequest,
  UpdateAgentRequest,
  RunAgentRequest,
} from '@/lib/agent-service';
import apiClient from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Agent Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Agent Orchestration Endpoints', () => {
    describe('getAgents', () => {
      it('should fetch agents from correct endpoint', async () => {
        const mockAgents: Agent[] = [
          {
            id: 'agent-1',
            name: 'Test Agent',
            description: 'Test description',
            type: 'conversational',
            status: 'idle',
            config: {
              model: 'claude-3-5-sonnet-20241022',
              temperature: 0.7,
              maxTokens: 4096,
            },
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            runCount: 0,
          },
        ];

        mockedApiClient.get.mockResolvedValue({
          data: { agents: mockAgents },
          status: 200,
          statusText: 'OK',
          headers: {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          config: {} as any,
        });

        const result = await agentService.getAgents();

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/v1/public/agent-orchestration/agents'
        );
        expect(result).toEqual(mockAgents);
      });

      it('should handle empty agents list', async () => {
        mockedApiClient.get.mockResolvedValue({
          data: { agents: [] },
          status: 200,
          statusText: 'OK',
          headers: {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          config: {} as any,
        });

        const result = await agentService.getAgents();

        expect(result).toEqual([]);
      });

      it('should throw error on API failure', async () => {
        mockedApiClient.get.mockRejectedValue(new Error('API Error'));

        await expect(agentService.getAgents()).rejects.toThrow('API Error');
      });
    });

    describe('createAgent', () => {
      it('should create agent at correct endpoint', async () => {
        const request: CreateAgentRequest = {
          name: 'New Agent',
          description: 'New agent description',
          type: 'task-based',
          config: {
            model: 'claude-3-5-sonnet-20241022',
            temperature: 0.7,
            maxTokens: 4096,
          },
        };

        const mockAgent: Agent = {
          id: 'agent-2',
          ...request,
          status: 'idle',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          runCount: 0,
        };

        mockedApiClient.post.mockResolvedValue({
          data: mockAgent,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.createAgent(request);

        expect(mockedApiClient.post).toHaveBeenCalledWith(
          '/v1/public/agent-orchestration/agents',
          request
        );
        expect(result).toEqual(mockAgent);
      });
    });

    describe('getAgent', () => {
      it('should fetch agent details from correct endpoint', async () => {
        const mockAgent: Agent = {
          id: 'agent-1',
          name: 'Test Agent',
          description: 'Test description',
          type: 'conversational',
          status: 'idle',
          config: {},
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          runCount: 0,
        };

        mockedApiClient.get.mockResolvedValue({
          data: mockAgent,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.getAgent('agent-1');

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/v1/public/agent-orchestration/agents/agent-1'
        );
        expect(result).toEqual(mockAgent);
      });
    });

    describe('updateAgent', () => {
      it('should update agent at correct endpoint', async () => {
        const request: UpdateAgentRequest = {
          name: 'Updated Name',
          description: 'Updated description',
        };

        const mockAgent: Agent = {
          id: 'agent-1',
          name: 'Updated Name',
          description: 'Updated description',
          type: 'conversational',
          status: 'idle',
          config: {},
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          runCount: 0,
        };

        mockedApiClient.put.mockResolvedValue({
          data: mockAgent,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.updateAgent('agent-1', request);

        expect(mockedApiClient.put).toHaveBeenCalledWith(
          '/v1/public/agent-orchestration/agents/agent-1',
          request
        );
        expect(result).toEqual(mockAgent);
      });
    });

    describe('deleteAgent', () => {
      it('should delete agent at correct endpoint', async () => {
        mockedApiClient.delete.mockResolvedValue({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.deleteAgent('agent-1');

        expect(mockedApiClient.delete).toHaveBeenCalledWith(
          '/v1/public/agent-orchestration/agents/agent-1'
        );
        expect(result).toEqual({ success: true });
      });
    });

    describe('getTemplates', () => {
      it('should fetch templates from correct endpoint', async () => {
        const mockTemplates: AgentTemplate[] = [
          {
            id: 'template-1',
            name: 'Customer Support',
            description: 'Customer support template',
            category: 'customer-service',
            icon: 'headset',
            defaultConfig: {
              model: 'claude-3-5-sonnet-20241022',
              temperature: 0.7,
              maxTokens: 4096,
              systemPrompt: 'You are a helpful customer support agent.',
              tools: [],
              capabilities: [],
            },
            tags: ['support', 'customer'],
          },
        ];

        mockedApiClient.get.mockResolvedValue({
          data: { templates: mockTemplates },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.getTemplates();

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/v1/public/agent-orchestration/templates'
        );
        expect(result).toEqual(mockTemplates);
      });
    });
  });

  describe('Agent Task Endpoints', () => {
    describe('createTask', () => {
      it('should create task at correct endpoint', async () => {
        const request: CreateAgentTaskRequest = {
          agentId: 'agent-1',
          input: 'Test input',
          config: {
            temperature: 0.7,
            maxTokens: 2048,
          },
        };

        const mockTask: AgentTask = {
          id: 'task-1',
          agentId: 'agent-1',
          status: 'pending',
          input: 'Test input',
          createdAt: '2025-01-01T00:00:00Z',
        };

        mockedApiClient.post.mockResolvedValue({
          data: mockTask,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.createTask(request);

        expect(mockedApiClient.post).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/',
          request
        );
        expect(result).toEqual(mockTask);
      });
    });

    describe('executeTask', () => {
      it('should execute task at correct endpoint', async () => {
        const mockTask: AgentTask = {
          id: 'task-1',
          agentId: 'agent-1',
          status: 'running',
          input: 'Test input',
          createdAt: '2025-01-01T00:00:00Z',
          startedAt: '2025-01-01T00:00:01Z',
        };

        mockedApiClient.post.mockResolvedValue({
          data: mockTask,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.executeTask('task-1');

        expect(mockedApiClient.post).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/task-1/execute'
        );
        expect(result).toEqual(mockTask);
      });
    });

    describe('getTask', () => {
      it('should fetch task details from correct endpoint', async () => {
        const mockTask: AgentTask = {
          id: 'task-1',
          agentId: 'agent-1',
          status: 'completed',
          input: 'Test input',
          output: 'Test output',
          createdAt: '2025-01-01T00:00:00Z',
          startedAt: '2025-01-01T00:00:01Z',
          completedAt: '2025-01-01T00:00:05Z',
          duration: 4000,
        };

        mockedApiClient.get.mockResolvedValue({
          data: mockTask,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.getTask('task-1');

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/task-1'
        );
        expect(result).toEqual(mockTask);
      });
    });

    describe('getTasks', () => {
      it('should fetch all tasks when no agentId provided', async () => {
        const mockTasks: AgentTask[] = [
          {
            id: 'task-1',
            agentId: 'agent-1',
            status: 'completed',
            createdAt: '2025-01-01T00:00:00Z',
          },
          {
            id: 'task-2',
            agentId: 'agent-2',
            status: 'running',
            createdAt: '2025-01-01T00:01:00Z',
          },
        ];

        mockedApiClient.get.mockResolvedValue({
          data: { tasks: mockTasks },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.getTasks();

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/'
        );
        expect(result).toEqual(mockTasks);
      });

      it('should fetch tasks for specific agent when agentId provided', async () => {
        const mockTasks: AgentTask[] = [
          {
            id: 'task-1',
            agentId: 'agent-1',
            status: 'completed',
            createdAt: '2025-01-01T00:00:00Z',
          },
        ];

        mockedApiClient.get.mockResolvedValue({
          data: { tasks: mockTasks },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.getTasks('agent-1');

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/?agent_id=agent-1'
        );
        expect(result).toEqual(mockTasks);
      });
    });

    describe('cancelTask', () => {
      it('should cancel task at correct endpoint', async () => {
        mockedApiClient.post.mockResolvedValue({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.cancelTask('task-1');

        expect(mockedApiClient.post).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/task-1/cancel'
        );
        expect(result).toEqual({ success: true });
      });
    });

    describe('getTaskLogs', () => {
      it('should fetch task logs from correct endpoint', async () => {
        const mockLogs = [
          {
            id: 'log-1',
            taskId: 'task-1',
            timestamp: '2025-01-01T00:00:00Z',
            level: 'info' as const,
            message: 'Task started',
          },
          {
            id: 'log-2',
            taskId: 'task-1',
            timestamp: '2025-01-01T00:00:01Z',
            level: 'debug' as const,
            message: 'Processing input',
          },
        ];

        mockedApiClient.get.mockResolvedValue({
          data: { logs: mockLogs },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.getTaskLogs('task-1');

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/task-1/logs'
        );
        expect(result).toEqual(mockLogs);
      });
    });
  });

  describe('Legacy Methods (Backward Compatibility)', () => {
    describe('runAgent', () => {
      it('should create and execute task using legacy method', async () => {
        const request: RunAgentRequest = {
          input: 'Test input',
          config: {
            temperature: 0.7,
          },
        };

        const mockCreatedTask: AgentTask = {
          id: 'task-1',
          agentId: 'agent-1',
          status: 'pending',
          input: 'Test input',
          createdAt: '2025-01-01T00:00:00Z',
        };

        const mockExecutedTask: AgentTask = {
          ...mockCreatedTask,
          status: 'running',
          startedAt: '2025-01-01T00:00:01Z',
        };

        mockedApiClient.post
          .mockResolvedValueOnce({
            data: mockCreatedTask,
            status: 201,
            statusText: 'Created',
            headers: {},
            config: {} as any,
          })
          .mockResolvedValueOnce({
            data: mockExecutedTask,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any,
          });

        const result = await agentService.runAgent('agent-1', request);

        expect(mockedApiClient.post).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/',
          {
            agentId: 'agent-1',
            input: request.input,
            config: request.config,
          }
        );
        expect(mockedApiClient.post).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/task-1/execute'
        );
        expect(result).toEqual(mockExecutedTask);
      });
    });

    describe('getAgentRuns', () => {
      it('should fetch tasks using legacy method', async () => {
        const mockTasks: AgentTask[] = [
          {
            id: 'task-1',
            agentId: 'agent-1',
            status: 'completed',
            createdAt: '2025-01-01T00:00:00Z',
          },
        ];

        mockedApiClient.get.mockResolvedValue({
          data: { tasks: mockTasks },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.getAgentRuns('agent-1');

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/?agent_id=agent-1'
        );
        expect(result).toEqual(mockTasks);
      });
    });

    describe('getAgentLogs', () => {
      it('should fetch logs for specific run using legacy method', async () => {
        const mockLogs = [
          {
            id: 'log-1',
            taskId: 'task-1',
            timestamp: '2025-01-01T00:00:00Z',
            level: 'info' as const,
            message: 'Task started',
          },
        ];

        mockedApiClient.get.mockResolvedValue({
          data: { logs: mockLogs },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.getAgentLogs('agent-1', 'task-1');

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/task-1/logs'
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('agentId', 'agent-1');
        expect(result[0]).toHaveProperty('runId', 'task-1');
      });

      it('should fetch logs for most recent task when no runId provided', async () => {
        const mockTasks: AgentTask[] = [
          {
            id: 'task-2',
            agentId: 'agent-1',
            status: 'completed',
            createdAt: '2025-01-01T00:02:00Z',
          },
          {
            id: 'task-1',
            agentId: 'agent-1',
            status: 'completed',
            createdAt: '2025-01-01T00:01:00Z',
          },
        ];

        const mockLogs = [
          {
            id: 'log-1',
            taskId: 'task-2',
            timestamp: '2025-01-01T00:02:00Z',
            level: 'info' as const,
            message: 'Task started',
          },
        ];

        mockedApiClient.get
          .mockResolvedValueOnce({
            data: { tasks: mockTasks },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any,
          })
          .mockResolvedValueOnce({
            data: { logs: mockLogs },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any,
          });

        const result = await agentService.getAgentLogs('agent-1');

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/?agent_id=agent-1'
        );
        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/task-2/logs'
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('runId', 'task-2');
      });

      it('should return empty array when no tasks exist', async () => {
        mockedApiClient.get.mockResolvedValue({
          data: { tasks: [] },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.getAgentLogs('agent-1');

        expect(result).toEqual([]);
      });
    });

    describe('cancelRun', () => {
      it('should cancel task using legacy method', async () => {
        mockedApiClient.post.mockResolvedValue({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agentService.cancelRun('agent-1', 'task-1');

        expect(mockedApiClient.post).toHaveBeenCalledWith(
          '/v1/public/agent-tasks/task-1/cancel'
        );
        expect(result).toEqual({ success: true });
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw meaningful error messages', async () => {
      const errorMessage = 'Network error occurred';
      mockedApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(agentService.getAgents()).rejects.toThrow(errorMessage);
    });

    it('should handle non-Error exceptions', async () => {
      mockedApiClient.get.mockRejectedValue('String error');

      await expect(agentService.getAgents()).rejects.toThrow(
        'Failed to fetch agents from API'
      );
    });
  });
});
