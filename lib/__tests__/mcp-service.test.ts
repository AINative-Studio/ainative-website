import apiClient from '../api-client';
import mcpService from '../mcp-service';

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

describe('MCPService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCatalog', () => {
    it('fetches catalog of MCP servers', async () => {
      const mockServers = {
        servers: [
          {
            id: 'server-1',
            name: 'GitHub MCP',
            description: 'GitHub integration server',
            version: '1.0.0',
            category: 'integration',
            features: ['repos', 'issues', 'prs'],
            pricing: { type: 'free' },
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockServers,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getCatalog();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/catalog');
      expect(result).toEqual(mockServers.servers);
    });

    it('returns empty array when no servers', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getCatalog();

      expect(result).toEqual([]);
    });
  });

  describe('deploy', () => {
    it('deploys a new MCP server instance', async () => {
      const deployRequest = {
        serverId: 'server-1',
        region: 'us-west-2',
        config: { timeout: 30 },
        name: 'My GitHub MCP',
      };

      const mockInstance = {
        id: 'instance-1',
        serverId: 'server-1',
        serverName: 'GitHub MCP',
        status: 'starting',
        region: 'us-west-2',
        createdAt: '2025-12-21T10:00:00Z',
        lastActiveAt: '2025-12-21T10:00:00Z',
        config: { timeout: 30 },
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockInstance,
        status: 201,
        statusText: 'Created',
      });

      const result = await mcpService.deploy(deployRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/mcp/deploy', deployRequest);
      expect(result).toEqual(mockInstance);
    });

    it('handles errors when deploying', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid server'));

      await expect(
        mcpService.deploy({ serverId: 'invalid', region: 'us-west-2' })
      ).rejects.toThrow('Invalid server');
    });
  });

  describe('getServer', () => {
    it('fetches server instance details', async () => {
      const mockInstance = {
        id: 'instance-1',
        serverId: 'server-1',
        serverName: 'GitHub MCP',
        status: 'running',
        region: 'us-west-2',
        createdAt: '2025-12-21T10:00:00Z',
        lastActiveAt: '2025-12-21T14:00:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockInstance,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getServer('instance-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/instance-1');
      expect(result).toEqual(mockInstance);
    });

    it('handles errors when fetching server', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Instance not found'));

      await expect(mcpService.getServer('invalid-id')).rejects.toThrow('Instance not found');
    });
  });

  describe('deleteServer', () => {
    it('deletes a server instance', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: undefined,
        status: 204,
        statusText: 'No Content',
      });

      await mcpService.deleteServer('instance-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/public/mcp/instance-1');
    });

    it('handles errors when deleting server', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Instance not found'));

      await expect(mcpService.deleteServer('invalid-id')).rejects.toThrow('Instance not found');
    });
  });

  describe('getServerStatus', () => {
    it('fetches server health status', async () => {
      const mockStatus = {
        instanceId: 'instance-1',
        status: 'healthy',
        uptime: 86400,
        lastHealthCheck: '2025-12-21T14:00:00Z',
        metrics: {
          cpu: 25,
          memory: 512,
          requestsPerSecond: 10,
        },
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockStatus,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getServerStatus('instance-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/instance-1/status');
      expect(result).toEqual(mockStatus);
    });
  });

  describe('getServerLogs', () => {
    it('fetches server logs', async () => {
      const mockLogs = {
        logs: [
          {
            timestamp: '2025-12-21T10:00:00Z',
            level: 'info',
            message: 'Server started',
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockLogs,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getServerLogs('instance-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/instance-1/logs?');
      expect(result).toEqual(mockLogs.logs);
    });

    it('fetches logs with options', async () => {
      const mockLogs = {
        logs: [
          {
            timestamp: '2025-12-21T10:00:00Z',
            level: 'error',
            message: 'Connection failed',
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockLogs,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getServerLogs('instance-1', { limit: 50, level: 'error' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/instance-1/logs?limit=50&level=error');
      expect(result).toEqual(mockLogs.logs);
    });

    it('returns empty array when no logs', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getServerLogs('instance-1');

      expect(result).toEqual([]);
    });
  });

  describe('restartServer', () => {
    it('restarts a server instance', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { status: 'restarting' },
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.restartServer('instance-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/mcp/instance-1/restart');
      expect(result.status).toBe('restarting');
    });
  });

  describe('getInstances', () => {
    it('fetches all user instances', async () => {
      const mockInstances = {
        instances: [
          {
            id: 'instance-1',
            serverId: 'server-1',
            serverName: 'GitHub MCP',
            status: 'running',
            region: 'us-west-2',
            createdAt: '2025-12-21T10:00:00Z',
            lastActiveAt: '2025-12-21T14:00:00Z',
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockInstances,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getInstances();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/instances');
      expect(result).toEqual(mockInstances.instances);
    });

    it('returns empty array when no instances', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getInstances();

      expect(result).toEqual([]);
    });
  });

  describe('getUsageMetrics', () => {
    it('fetches usage metrics', async () => {
      const mockMetrics = {
        instanceId: 'instance-1',
        period: '24h',
        requests: 1000,
        errors: 10,
        avgLatency: 50,
        p95Latency: 100,
        tokensProcessed: 50000,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockMetrics,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getUsageMetrics('instance-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/instance-1/usage');
      expect(result).toEqual(mockMetrics);
    });

    it('fetches usage metrics with period', async () => {
      const mockMetrics = {
        instanceId: 'instance-1',
        period: '7d',
        requests: 7000,
        errors: 70,
        avgLatency: 55,
        p95Latency: 110,
        tokensProcessed: 350000,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockMetrics,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getUsageMetrics('instance-1', '7d');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/instance-1/usage?period=7d');
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getBillingInfo', () => {
    it('fetches billing information', async () => {
      const mockBilling = {
        instanceId: 'instance-1',
        currentPeriod: {
          start: '2025-12-01T00:00:00Z',
          end: '2025-12-31T23:59:59Z',
        },
        usage: {
          requests: 10000,
          cost: 49.99,
        },
        projectedCost: 75.00,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockBilling,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getBillingInfo('instance-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/instance-1/billing');
      expect(result).toEqual(mockBilling);
    });
  });

  describe('getCostBreakdown', () => {
    it('fetches cost breakdown', async () => {
      const mockCosts = {
        totalCost: 150.00,
        byInstance: [
          { instanceId: 'instance-1', name: 'GitHub MCP', cost: 100.00, percentage: 66.67 },
          { instanceId: 'instance-2', name: 'Slack MCP', cost: 50.00, percentage: 33.33 },
        ],
        byCategory: [
          { category: 'integration', cost: 150.00, percentage: 100 },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockCosts,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getCostBreakdown();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/costs');
      expect(result).toEqual(mockCosts);
    });
  });

  describe('scaleCapacity', () => {
    it('scales server capacity', async () => {
      const scaleRequest = {
        instanceId: 'instance-1',
        replicas: 3,
        maxReplicas: 10,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Scaling initiated' },
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.scaleCapacity(scaleRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/mcp/capacity', scaleRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('fetches performance metrics', async () => {
      const mockMetrics = {
        instanceId: 'instance-1',
        timeRange: '1h',
        dataPoints: [
          {
            timestamp: '2025-12-21T13:00:00Z',
            latency: 50,
            throughput: 100,
            errorRate: 0.01,
          },
          {
            timestamp: '2025-12-21T14:00:00Z',
            latency: 55,
            throughput: 120,
            errorRate: 0.02,
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockMetrics,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getPerformanceMetrics('instance-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/instance-1/performance');
      expect(result).toEqual(mockMetrics);
    });

    it('fetches performance metrics with time range', async () => {
      const mockMetrics = {
        instanceId: 'instance-1',
        timeRange: '24h',
        dataPoints: [],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockMetrics,
        status: 200,
        statusText: 'OK',
      });

      const result = await mcpService.getPerformanceMetrics('instance-1', '24h');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/mcp/instance-1/performance?timeRange=24h');
      expect(result).toEqual(mockMetrics);
    });
  });
});
