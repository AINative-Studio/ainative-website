/**
 * MCP Service - Backend integration for MCP Server Hosting
 * Integrates with all backend MCP endpoints
 */

import apiClient from './api-client';

// Types
export interface MCPServer {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  icon?: string;
  features: string[];
  pricing: {
    type: 'free' | 'paid' | 'usage-based';
    basePrice?: number;
    perRequestPrice?: number;
  };
}

export interface MCPInstance {
  id: string;
  serverId: string;
  serverName: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  region: string;
  createdAt: string;
  lastActiveAt: string;
  config?: Record<string, unknown>;
}

export interface MCPServerStatus {
  instanceId: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  uptime: number;
  lastHealthCheck: string;
  metrics: {
    cpu: number;
    memory: number;
    requestsPerSecond: number;
  };
}

export interface MCPServerLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, unknown>;
}

export interface MCPUsageMetrics {
  instanceId: string;
  period: string;
  requests: number;
  errors: number;
  avgLatency: number;
  p95Latency: number;
  tokensProcessed: number;
}

export interface MCPBillingInfo {
  instanceId: string;
  currentPeriod: {
    start: string;
    end: string;
  };
  usage: {
    requests: number;
    cost: number;
  };
  projectedCost: number;
}

export interface MCPCostBreakdown {
  totalCost: number;
  byInstance: Array<{
    instanceId: string;
    name: string;
    cost: number;
    percentage: number;
  }>;
  byCategory: Array<{
    category: string;
    cost: number;
    percentage: number;
  }>;
}

export interface MCPPerformanceMetrics {
  instanceId: string;
  timeRange: string;
  dataPoints: Array<{
    timestamp: string;
    latency: number;
    throughput: number;
    errorRate: number;
  }>;
}

export interface DeployMCPRequest {
  serverId: string;
  region: string;
  config?: Record<string, unknown>;
  name?: string;
}

export interface CapacityRequest {
  instanceId: string;
  replicas: number;
  maxReplicas?: number;
}

// MCP Service
const mcpService = {
  /**
   * Get catalog of available MCP servers
   * GET /v1/public/mcp/catalog
   */
  async getCatalog(): Promise<MCPServer[]> {
    const response = await apiClient.get<{ servers: MCPServer[] }>('/v1/public/mcp/catalog');
    return response.data.servers || [];
  },

  /**
   * Deploy a new MCP server instance
   * POST /v1/public/mcp/deploy
   */
  async deploy(request: DeployMCPRequest): Promise<MCPInstance> {
    const response = await apiClient.post<MCPInstance>('/v1/public/mcp/deploy', request);
    return response.data;
  },

  /**
   * Get details of a specific server instance
   * GET /v1/public/mcp/{id}
   */
  async getServer(id: string): Promise<MCPInstance> {
    const response = await apiClient.get<MCPInstance>(`/v1/public/mcp/${id}`);
    return response.data;
  },

  /**
   * Delete a server instance
   * DELETE /v1/public/mcp/{id}
   */
  async deleteServer(id: string): Promise<void> {
    await apiClient.delete(`/v1/public/mcp/${id}`);
  },

  /**
   * Get server status/health
   * GET /v1/public/mcp/{id}/status
   */
  async getServerStatus(id: string): Promise<MCPServerStatus> {
    const response = await apiClient.get<MCPServerStatus>(`/v1/public/mcp/${id}/status`);
    return response.data;
  },

  /**
   * Get server logs
   * GET /v1/public/mcp/{id}/logs
   */
  async getServerLogs(id: string, options?: { limit?: number; level?: string }): Promise<MCPServerLog[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.level) params.append('level', options.level);

    const response = await apiClient.get<{ logs: MCPServerLog[] }>(`/v1/public/mcp/${id}/logs?${params}`);
    return response.data.logs || [];
  },

  /**
   * Restart a server instance
   * POST /v1/public/mcp/{id}/restart
   */
  async restartServer(id: string): Promise<{ status: string }> {
    const response = await apiClient.post<{ status: string }>(`/v1/public/mcp/${id}/restart`);
    return response.data;
  },

  /**
   * Get list of user's MCP instances
   * GET /v1/public/mcp/instances
   */
  async getInstances(): Promise<MCPInstance[]> {
    const response = await apiClient.get<{ instances: MCPInstance[] }>('/v1/public/mcp/instances');
    return response.data.instances || [];
  },

  /**
   * Get usage metrics for a server
   * GET /v1/public/mcp/{id}/usage
   */
  async getUsageMetrics(id: string, period?: string): Promise<MCPUsageMetrics> {
    const params = period ? `?period=${period}` : '';
    const response = await apiClient.get<MCPUsageMetrics>(`/v1/public/mcp/${id}/usage${params}`);
    return response.data;
  },

  /**
   * Get billing info for a server
   * GET /v1/public/mcp/{id}/billing
   */
  async getBillingInfo(id: string): Promise<MCPBillingInfo> {
    const response = await apiClient.get<MCPBillingInfo>(`/v1/public/mcp/${id}/billing`);
    return response.data;
  },

  /**
   * Get cost breakdown across all instances
   * GET /v1/public/mcp/costs
   */
  async getCostBreakdown(): Promise<MCPCostBreakdown> {
    const response = await apiClient.get<MCPCostBreakdown>('/v1/public/mcp/costs');
    return response.data;
  },

  /**
   * Scale server capacity
   * POST /v1/public/mcp/capacity
   */
  async scaleCapacity(request: CapacityRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/v1/public/mcp/capacity', request);
    return response.data;
  },

  /**
   * Get performance metrics for a server
   * GET /v1/public/mcp/{id}/performance
   */
  async getPerformanceMetrics(id: string, timeRange?: string): Promise<MCPPerformanceMetrics> {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    const response = await apiClient.get<MCPPerformanceMetrics>(`/v1/public/mcp/${id}/performance${params}`);
    return response.data;
  },
};

export default mcpService;
