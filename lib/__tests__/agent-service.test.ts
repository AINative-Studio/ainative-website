import apiClient from '../api-client';
import agentService from '../agent-service';

// Mock the apiClient
jest.mock('../api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('AgentService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAgents', () => {
    it('fetches all agents', async () => {
      const mockAgents = {
        agents: [
          {
            id: 'agent-1',
            name: 'Code Assistant',
            description: 'Helps with coding tasks',
            type: 'conversational',
            status: 'idle',
            config: { model: 'gpt-4', temperature: 0.7 },
            createdAt: '2025-12-21T10:00:00Z',
            updatedAt: '2025-12-21T10:00:00Z',
            runCount: 5,
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockAgents,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.getAgents();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/agents');
      expect(result).toEqual(mockAgents.agents);
    });

    it('returns empty array when no agents', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.getAgents();

      expect(result).toEqual([]);
    });

    it('handles errors when fetching agents', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(agentService.getAgents()).rejects.toThrow('Network error');
    });
  });

  describe('createAgent', () => {
    it('creates a new agent', async () => {
      const createRequest = {
        name: 'New Agent',
        description: 'A new agent',
        type: 'task-based' as const,
        config: {
          model: 'gpt-4',
          temperature: 0.5,
        },
      };

      const mockAgent = {
        id: 'agent-new',
        ...createRequest,
        status: 'idle',
        createdAt: '2025-12-21T12:00:00Z',
        updatedAt: '2025-12-21T12:00:00Z',
        runCount: 0,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockAgent,
        status: 201,
        statusText: 'Created',
      });

      const result = await agentService.createAgent(createRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/agents', createRequest);
      expect(result).toEqual(mockAgent);
    });

    it('creates agent from template', async () => {
      const createRequest = {
        name: 'Template Agent',
        type: 'workflow' as const,
        templateId: 'template-1',
        config: {},
      };

      const mockAgent = {
        id: 'agent-template',
        ...createRequest,
        status: 'idle',
        createdAt: '2025-12-21T12:00:00Z',
        updatedAt: '2025-12-21T12:00:00Z',
        runCount: 0,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockAgent,
        status: 201,
        statusText: 'Created',
      });

      const result = await agentService.createAgent(createRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/agents', createRequest);
      expect(result.templateId).toBe('template-1');
    });

    it('handles errors when creating agent', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Validation failed'));

      await expect(
        agentService.createAgent({
          name: 'Bad Agent',
          type: 'conversational',
          config: {},
        })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('getAgent', () => {
    it('fetches agent by id', async () => {
      const mockAgent = {
        id: 'agent-1',
        name: 'Code Assistant',
        description: 'Helps with coding tasks',
        type: 'conversational',
        status: 'idle',
        config: { model: 'gpt-4' },
        createdAt: '2025-12-21T10:00:00Z',
        updatedAt: '2025-12-21T10:00:00Z',
        runCount: 5,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockAgent,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.getAgent('agent-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/agents/agent-1');
      expect(result).toEqual(mockAgent);
    });

    it('handles errors when fetching agent', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Agent not found'));

      await expect(agentService.getAgent('invalid-id')).rejects.toThrow('Agent not found');
    });
  });

  describe('updateAgent', () => {
    it('updates an agent', async () => {
      const updateRequest = {
        name: 'Updated Agent',
        config: {
          temperature: 0.9,
        },
      };

      const mockAgent = {
        id: 'agent-1',
        name: 'Updated Agent',
        description: 'Helps with coding tasks',
        type: 'conversational',
        status: 'idle',
        config: { model: 'gpt-4', temperature: 0.9 },
        createdAt: '2025-12-21T10:00:00Z',
        updatedAt: '2025-12-21T14:00:00Z',
        runCount: 5,
      };

      mockApiClient.put.mockResolvedValueOnce({
        data: mockAgent,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.updateAgent('agent-1', updateRequest);

      expect(mockApiClient.put).toHaveBeenCalledWith('/v1/agents/agent-1', updateRequest);
      expect(result.name).toBe('Updated Agent');
    });

    it('handles errors when updating agent', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        agentService.updateAgent('agent-1', { name: 'Bad Update' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteAgent', () => {
    it('deletes an agent', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.deleteAgent('agent-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/agents/agent-1');
      expect(result.success).toBe(true);
    });

    it('handles errors when deleting agent', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(agentService.deleteAgent('agent-1')).rejects.toThrow('Delete failed');
    });
  });

  describe('runAgent', () => {
    it('runs an agent', async () => {
      const runRequest = {
        input: 'Write a hello world function',
        config: { temperature: 0.5 },
      };

      const mockRun = {
        id: 'run-1',
        agentId: 'agent-1',
        agentName: 'Code Assistant',
        status: 'running',
        input: 'Write a hello world function',
        startedAt: '2025-12-21T14:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockRun,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.runAgent('agent-1', runRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/agents/agent-1/run', runRequest);
      expect(result.status).toBe('running');
    });

    it('handles errors when running agent', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Agent is busy'));

      await expect(
        agentService.runAgent('agent-1', { input: 'test' })
      ).rejects.toThrow('Agent is busy');
    });
  });

  describe('getAgentRuns', () => {
    it('fetches agent run history', async () => {
      const mockRuns = {
        runs: [
          {
            id: 'run-1',
            agentId: 'agent-1',
            agentName: 'Code Assistant',
            status: 'completed',
            input: 'Hello',
            output: 'Hi there!',
            startedAt: '2025-12-21T10:00:00Z',
            completedAt: '2025-12-21T10:01:00Z',
            duration: 60000,
            tokensUsed: 150,
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockRuns,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.getAgentRuns('agent-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/agents/agent-1/runs');
      expect(result).toEqual(mockRuns.runs);
    });

    it('returns empty array when no runs', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.getAgentRuns('agent-1');

      expect(result).toEqual([]);
    });
  });

  describe('getAgentLogs', () => {
    it('fetches agent logs', async () => {
      const mockLogs = {
        logs: [
          {
            id: 'log-1',
            agentId: 'agent-1',
            runId: 'run-1',
            timestamp: '2025-12-21T10:00:00Z',
            level: 'info',
            message: 'Agent started',
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockLogs,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.getAgentLogs('agent-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/agents/agent-1/logs');
      expect(result).toEqual(mockLogs.logs);
    });

    it('fetches logs for specific run', async () => {
      const mockLogs = {
        logs: [
          {
            id: 'log-1',
            agentId: 'agent-1',
            runId: 'run-1',
            timestamp: '2025-12-21T10:00:00Z',
            level: 'info',
            message: 'Agent started',
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockLogs,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.getAgentLogs('agent-1', 'run-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/agents/agent-1/logs?runId=run-1');
      expect(result).toEqual(mockLogs.logs);
    });

    it('returns empty array when no logs', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.getAgentLogs('agent-1');

      expect(result).toEqual([]);
    });
  });

  describe('getTemplates', () => {
    it('fetches available templates', async () => {
      const mockTemplates = {
        templates: [
          {
            id: 'template-1',
            name: 'Code Assistant',
            description: 'A helpful coding assistant',
            category: 'development',
            icon: 'code',
            defaultConfig: {
              model: 'gpt-4',
              temperature: 0.7,
              maxTokens: 4000,
              systemPrompt: 'You are a helpful coding assistant',
              tools: ['code-interpreter'],
              capabilities: ['code-generation'],
            },
            tags: ['coding', 'development'],
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockTemplates,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.getTemplates();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/agents/templates');
      expect(result).toEqual(mockTemplates.templates);
    });

    it('returns empty array when no templates', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.getTemplates();

      expect(result).toEqual([]);
    });
  });

  describe('cancelRun', () => {
    it('cancels a running agent', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
      });

      const result = await agentService.cancelRun('agent-1', 'run-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/agents/agent-1/runs/run-1/cancel');
      expect(result.success).toBe(true);
    });

    it('handles errors when cancelling run', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Run already completed'));

      await expect(
        agentService.cancelRun('agent-1', 'run-1')
      ).rejects.toThrow('Run already completed');
    });
  });
});
