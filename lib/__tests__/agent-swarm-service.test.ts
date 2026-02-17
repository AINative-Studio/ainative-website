/**
 * Agent Swarm Service Tests
 * Following TDD methodology - Tests written FIRST
 */

import apiClient from '../api-client';

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

// Import service after mock is set up
import { agentSwarmService, AgentSwarmProject, CreateProjectRequest } from '../agent-swarm-service';

describe('AgentSwarmService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should report healthy when /projects endpoint responds', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { projects: [] },
        status: 200,
        statusText: 'OK',
      });

      const result = await agentSwarmService.healthCheck();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/projects');
      expect(result.status).toBe('healthy');
    });

    it('should throw when /projects endpoint fails', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Service unavailable'));

      await expect(agentSwarmService.healthCheck()).rejects.toThrow('Service unavailable');
    });
  });

  describe('createProject', () => {
    it('should create a new agent swarm project via orchestrate endpoint', async () => {
      const createRequest: CreateProjectRequest = {
        project_type: 'web_app',
        description: 'Build a todo app',
        features: ['user_auth', 'crud_operations'],
        technologies: ['React', 'FastAPI'],
      };

      const mockResponse = {
        project_id: 'proj-123',
        name: 'Project proj-123',
        status: 'analyzing',
        progress: 0,
        created_at: '2025-12-23T10:00:00Z',
        agents: [],
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await agentSwarmService.createProject(createRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/public/agent-swarms/orchestrate',
        createRequest
      );
      expect(result.id).toBe('proj-123');
      expect(result.status).toBe('analyzing');
    });

    it('should handle project creation errors', async () => {
      const createRequest: CreateProjectRequest = {
        project_type: 'web_app',
        description: 'Test',
      };

      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid project configuration'));

      await expect(agentSwarmService.createProject(createRequest)).rejects.toThrow(
        'Invalid project configuration'
      );
    });
  });

  describe('getAllProjects', () => {
    it('should fetch all agent swarm projects', async () => {
      const mockProjects = {
        projects: [
          {
            project_id: 'proj-1',
            name: 'Web App',
            status: 'building',
            progress: 50,
            created_at: '2025-12-23T10:00:00Z',
            agents: [
              { name: 'Frontend Engineer', status: 'working', progress: 60 },
              { name: 'Backend Engineer', status: 'working', progress: 40 },
            ],
          },
        ],
        total: 1,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockProjects,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentSwarmService.getAllProjects();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/projects');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('proj-1');
      expect(result[0].status).toBe('building');
    });

    it('should return empty array on error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await agentSwarmService.getAllProjects();

      expect(result).toEqual([]);
    });
  });

  describe('getProject', () => {
    it('should fetch a specific project by ID', async () => {
      const mockProject = {
        project_id: 'proj-1',
        name: 'Web App',
        status: 'building',
        progress: 75,
        created_at: '2025-12-23T10:00:00Z',
        agents: [],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockProject,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentSwarmService.getProject('proj-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/projects/proj-1');
      expect(result.id).toBe('proj-1');
      expect(result.progress).toBe(75);
    });

    it('should handle project not found errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Project not found'));

      await expect(agentSwarmService.getProject('invalid-id')).rejects.toThrow(
        'Project not found'
      );
    });
  });

  describe('getProjectStatus', () => {
    it('should fetch real-time project status', async () => {
      const mockStatus = {
        status: 'building',
        progress: 65,
        stage: 'feature_development',
        updated_at: '2025-12-23T11:00:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockStatus,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentSwarmService.getProjectStatus('proj-1');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/v1/public/agent-swarms/projects/proj-1/status'
      );
      expect(result.progress).toBe(65);
      expect(result.stage).toBe('feature_development');
    });

    it('should handle status fetch errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Status unavailable'));

      await expect(agentSwarmService.getProjectStatus('proj-1')).rejects.toThrow(
        'Status unavailable'
      );
    });
  });

  describe('getProjectLogs', () => {
    it('should fetch project execution logs', async () => {
      const mockLogs = {
        logs: [
          {
            id: 'log-1',
            timestamp: '2025-12-23T10:00:00Z',
            level: 'info',
            message: 'Project analysis started',
            agent: 'System Architect',
          },
          {
            id: 'log-2',
            timestamp: '2025-12-23T10:05:00Z',
            level: 'success',
            message: 'Data model generated',
            agent: 'System Architect',
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockLogs,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentSwarmService.getProjectLogs('proj-1', 50);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/v1/public/agent-swarms/projects/proj-1/logs?limit=50'
      );
      expect(result).toHaveLength(2);
      expect(result[0].message).toBe('Project analysis started');
    });

    it('should use default limit when not specified', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { logs: [] },
        status: 200,
        statusText: 'OK',
      });

      await agentSwarmService.getProjectLogs('proj-1');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/v1/public/agent-swarms/projects/proj-1/logs?limit=100'
      );
    });

    it('should return empty array on error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Logs unavailable'));

      const result = await agentSwarmService.getProjectLogs('proj-1');

      expect(result).toEqual([]);
    });
  });

  describe('stopProject', () => {
    it('should stop a running project', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { message: 'Project stopped successfully' },
        status: 200,
        statusText: 'OK',
      });

      const result = await agentSwarmService.stopProject('proj-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/public/agent-swarms/projects/proj-1/stop'
      );
      expect(result.message).toBe('Project stopped successfully');
    });

    it('should handle stop errors', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Cannot stop completed project'));

      await expect(agentSwarmService.stopProject('proj-1')).rejects.toThrow(
        'Cannot stop completed project'
      );
    });
  });

  describe('restartProject', () => {
    it('should restart a paused project', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { message: 'Project restarted successfully' },
        status: 200,
        statusText: 'OK',
      });

      const result = await agentSwarmService.restartProject('proj-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/public/agent-swarms/projects/proj-1/restart'
      );
      expect(result.message).toBe('Project restarted successfully');
    });
  });

  describe('uploadPRDAndCreateProject', () => {
    it('should upload PRD file and create project', async () => {
      const mockFile = new File(['# PRD Content'], 'prd.md', { type: 'text/markdown' });

      const mockResponse = {
        project_id: 'proj-new',
        status: 'analyzing',
        progress: 0,
        created_at: '2025-12-23T12:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await agentSwarmService.uploadPRDAndCreateProject(
        mockFile,
        'web_app',
        { features: ['authentication'] }
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/public/agent-swarms/orchestrate',
        expect.objectContaining({
          project_type: 'web_app',
          description: '# PRD Content',
          features: ['authentication'],
        })
      );
      expect(result.id).toBe('proj-new');
    });
  });

  describe('getMetrics', () => {
    it('should fetch agent swarm metrics', async () => {
      const mockMetrics = {
        total_projects: 25,
        active_projects: 5,
        completed_projects: 18,
        failed_projects: 2,
        avg_completion_time: 45,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockMetrics,
        status: 200,
        statusText: 'OK',
      });

      const result = await agentSwarmService.getMetrics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/metrics');
      expect(result.total_projects).toBe(25);
      expect(result.avg_completion_time).toBe(45);
    });
  });

  describe('status mapping', () => {
    it('should map API statuses to UI statuses correctly', async () => {
      const testCases = [
        { apiStatus: 'analyzing', expected: 'analyzing' },
        { apiStatus: 'in_progress', expected: 'building' },
        { apiStatus: 'active', expected: 'building' },
        { apiStatus: 'completed', expected: 'completed' },
        { apiStatus: 'success', expected: 'completed' },
        { apiStatus: 'failed', expected: 'failed' },
        { apiStatus: 'error', expected: 'failed' },
        { apiStatus: 'paused', expected: 'paused' },
        { apiStatus: 'stopped', expected: 'paused' },
        { apiStatus: 'unknown', expected: 'analyzing' },
      ];

      for (const { apiStatus, expected } of testCases) {
        mockApiClient.get.mockResolvedValueOnce({
          data: {
            project_id: 'test',
            status: apiStatus,
            progress: 0,
            created_at: '2025-12-23T10:00:00Z',
          },
          status: 200,
          statusText: 'OK',
        });

        const result = await agentSwarmService.getProject('test');
        expect(result.status).toBe(expected);
      }
    });
  });
});
