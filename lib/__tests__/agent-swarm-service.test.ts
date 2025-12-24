/**
 * Agent Swarm Service Tests
 * TDD tests for agent swarm project orchestration
 */

import apiClient from '../api-client';
import agentSwarmService, {
  healthCheck,
  createProject,
  getAllProjects,
  getProject,
  getProjectStatus,
  getProjectAgents,
  stopProject,
  restartProject,
  getProjectLogs,
  getMetrics,
  getProjectGitHubStatus,
  type AgentSwarmProject,
  type CreateProjectRequest,
  type ProjectLog,
  type ProjectMetrics,
} from '../agent-swarm-service';

// Mock the apiClient
jest.mock('../api-client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Agent Swarm Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const mockResponse = { status: 'healthy', message: 'Agent swarm service is running' };
      mockApiClient.get.mockResolvedValue({ data: mockResponse, status: 200, statusText: 'OK' });

      const result = await healthCheck();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/health');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const projectConfig: CreateProjectRequest = {
        project_type: 'web',
        description: 'Build a web application',
        features: ['auth', 'dashboard'],
        technologies: ['react', 'nodejs'],
      };

      const mockResponse = {
        project_id: 'proj-123',
        name: 'Web App',
        status: 'analyzing',
        progress: 0,
        created_at: '2025-01-01T00:00:00Z',
        agents: [],
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse, status: 200, statusText: 'OK' });

      const result = await createProject(projectConfig);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/agent-swarms/orchestrate', projectConfig);
      expect(result.id).toBe('proj-123');
      expect(result.status).toBe('analyzing');
    });

    it('should transform in_progress status to building', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {
          project_id: 'proj-456',
          status: 'in_progress',
          progress: 50,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await createProject({
        project_type: 'api',
        description: 'Build an API',
      });

      expect(result.status).toBe('building');
    });
  });

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      const mockProjects = [
        { project_id: 'proj-1', name: 'Project 1', status: 'completed', progress: 100 },
        { project_id: 'proj-2', name: 'Project 2', status: 'building', progress: 50 },
      ];

      mockApiClient.get.mockResolvedValue({ data: { projects: mockProjects }, status: 200, statusText: 'OK' });

      const result = await getAllProjects();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/projects');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('proj-1');
      expect(result[1].id).toBe('proj-2');
    });

    it('should return empty array on error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await getAllProjects();

      expect(result).toEqual([]);
    });
  });

  describe('getProject', () => {
    it('should return project details', async () => {
      const mockProject = {
        project_id: 'proj-123',
        name: 'Test Project',
        description: 'A test project',
        status: 'completed',
        progress: 100,
        agents: [
          { name: 'CodeAgent', status: 'completed', progress: 100 },
        ],
      };

      mockApiClient.get.mockResolvedValue({ data: mockProject, status: 200, statusText: 'OK' });

      const result = await getProject('proj-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/projects/proj-123');
      expect(result.id).toBe('proj-123');
      expect(result.agents).toHaveLength(1);
    });
  });

  describe('getProjectStatus', () => {
    it('should return project status', async () => {
      const mockStatus = {
        status: 'building',
        progress: 75,
        stage: 'code_generation',
        updated_at: '2025-01-01T12:00:00Z',
      };

      mockApiClient.get.mockResolvedValue({ data: mockStatus, status: 200, statusText: 'OK' });

      const result = await getProjectStatus('proj-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/projects/proj-123/status');
      expect(result.progress).toBe(75);
    });
  });

  describe('getProjectAgents', () => {
    it('should return agents for a project', async () => {
      const mockAgents = [
        { name: 'ArchitectAgent', status: 'completed', progress: 100 },
        { name: 'CodeAgent', status: 'working', progress: 60, current_task: 'Writing components' },
      ];

      mockApiClient.get.mockResolvedValue({ data: { agents: mockAgents }, status: 200, statusText: 'OK' });

      const result = await getProjectAgents('proj-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/projects/proj-123/agents');
      expect(result).toHaveLength(2);
    });

    it('should return empty array on error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await getProjectAgents('proj-123');

      expect(result).toEqual([]);
    });
  });

  describe('stopProject', () => {
    it('should stop a running project', async () => {
      mockApiClient.post.mockResolvedValue({ data: { message: 'Project stopped successfully' }, status: 200, statusText: 'OK' });

      const result = await stopProject('proj-123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/agent-swarms/projects/proj-123/stop');
      expect(result.message).toContain('stopped');
    });
  });

  describe('restartProject', () => {
    it('should restart a paused project', async () => {
      mockApiClient.post.mockResolvedValue({ data: { message: 'Project restarted successfully' }, status: 200, statusText: 'OK' });

      const result = await restartProject('proj-123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/agent-swarms/projects/proj-123/restart');
      expect(result.message).toContain('restarted');
    });
  });

  describe('getProjectLogs', () => {
    it('should return project logs', async () => {
      const mockLogs: ProjectLog[] = [
        { id: 'log-1', timestamp: '2025-01-01T10:00:00Z', level: 'info', message: 'Started analysis' },
        { id: 'log-2', timestamp: '2025-01-01T10:01:00Z', level: 'success', message: 'Analysis complete', agent: 'ArchitectAgent' },
      ];

      mockApiClient.get.mockResolvedValue({ data: { logs: mockLogs }, status: 200, statusText: 'OK' });

      const result = await getProjectLogs('proj-123', 50);

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/projects/proj-123/logs?limit=50');
      expect(result).toHaveLength(2);
    });

    it('should use default limit of 100', async () => {
      mockApiClient.get.mockResolvedValue({ data: { logs: [] }, status: 200, statusText: 'OK' });

      await getProjectLogs('proj-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/projects/proj-123/logs?limit=100');
    });

    it('should return empty array on error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await getProjectLogs('proj-123');

      expect(result).toEqual([]);
    });
  });

  describe('getMetrics', () => {
    it('should return project metrics', async () => {
      const mockMetrics: ProjectMetrics = {
        total_projects: 10,
        active_projects: 3,
        completed_projects: 6,
        failed_projects: 1,
        avg_completion_time: 3600,
      };

      mockApiClient.get.mockResolvedValue({ data: mockMetrics, status: 200, statusText: 'OK' });

      const result = await getMetrics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/metrics');
      expect(result.total_projects).toBe(10);
    });
  });

  describe('getProjectGitHubStatus', () => {
    it('should return GitHub status for a project', async () => {
      const mockGitHubStatus = {
        repository_url: 'https://github.com/user/repo',
        branch: 'main',
        last_commit: {
          sha: 'abc123',
          message: 'Initial commit',
          author: 'user',
          timestamp: '2025-01-01T00:00:00Z',
        },
        build_status: 'success' as const,
      };

      mockApiClient.get.mockResolvedValue({ data: mockGitHubStatus, status: 200, statusText: 'OK' });

      const result = await getProjectGitHubStatus('proj-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/agent-swarms/projects/proj-123/github');
      expect(result.repository_url).toBe('https://github.com/user/repo');
    });

    it('should return empty object when project has no GitHub integration', async () => {
      mockApiClient.get.mockRejectedValue({ response: { status: 404 } });

      const result = await getProjectGitHubStatus('proj-123');

      expect(result).toEqual({});
    });
  });

  describe('default export', () => {
    it('should export all methods', () => {
      expect(agentSwarmService.healthCheck).toBe(healthCheck);
      expect(agentSwarmService.createProject).toBe(createProject);
      expect(agentSwarmService.getAllProjects).toBe(getAllProjects);
      expect(agentSwarmService.getProject).toBe(getProject);
      expect(agentSwarmService.getProjectStatus).toBe(getProjectStatus);
      expect(agentSwarmService.getProjectAgents).toBe(getProjectAgents);
      expect(agentSwarmService.stopProject).toBe(stopProject);
      expect(agentSwarmService.restartProject).toBe(restartProject);
      expect(agentSwarmService.getProjectLogs).toBe(getProjectLogs);
      expect(agentSwarmService.getMetrics).toBe(getMetrics);
      expect(agentSwarmService.getProjectGitHubStatus).toBe(getProjectGitHubStatus);
    });
  });
});
