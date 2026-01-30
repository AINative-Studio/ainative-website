/**
 * MCP Service - Backend integration for MCP Server Hosting
 * Integrates with all backend MCP endpoints
 */

import apiClient from './api-client';

// Base paths for MCP endpoints
const PUBLIC_BASE_PATH = '/v1/public/mcp';
const PRIVATE_BASE_PATH = '/v1/mcp';

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

export interface MCPBillingSummary {
    totalCost: number;
    periodStart: string;
    periodEnd: string;
    instances: Array<{
        instanceId: string;
        cost: number;
    }>;
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

export interface MCPCategory {
    id: string;
    name: string;
    description: string;
    serverCount: number;
}

export interface MCPRegistryStatistics {
    totalServers: number;
    totalInstances: number;
    totalCategories: number;
    popularServers: Array<{
        id: string;
        name: string;
        deployments: number;
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

/**
 * Helper to create a "not implemented" error response
 */
function createNotImplementedError(endpoint: string): Error {
    const error = new Error(`Endpoint not yet implemented: ${endpoint}`);
    error.name = 'NotImplementedError';
    return error;
}

// MCP Service
const mcpService = {
    /**
     * Get catalog of available MCP servers
     * Endpoint: GET /v1/public/mcp/catalog
     */
    async getCatalog(): Promise<MCPServer[]> {
        const response = await apiClient.get<{ servers: MCPServer[] }>(
            `${PUBLIC_BASE_PATH}/catalog`
        );
        return response.data.servers || [];
    },

    /**
     * Get available MCP categories
     * Endpoint: GET /v1/public/mcp/categories
     */
    async getCategories(): Promise<MCPCategory[]> {
        const response = await apiClient.get<{ categories: MCPCategory[] }>(
            `${PUBLIC_BASE_PATH}/categories`
        );
        return response.data.categories || [];
    },

    /**
     * Get registry statistics
     * Endpoint: GET /v1/public/mcp/registry/statistics
     */
    async getRegistryStatistics(): Promise<MCPRegistryStatistics> {
        const response = await apiClient.get<MCPRegistryStatistics>(
            `${PUBLIC_BASE_PATH}/registry/statistics`
        );
        return response.data;
    },

    /**
     * Deploy a new MCP server instance
     * TODO: Backend endpoint not yet available. Implement when /v1/mcp/deploy is ready.
     */
    async deploy(request: DeployMCPRequest): Promise<MCPInstance> {
        // TODO: Endpoint /v1/mcp/deploy not yet implemented in backend
        console.warn('MCP deploy endpoint not yet implemented', request);
        throw createNotImplementedError('/v1/mcp/deploy');
    },

    /**
     * Get details of a specific server instance
     * TODO: Backend endpoint not yet available. Implement when /v1/mcp/{id} is ready.
     */
    async getServer(id: string): Promise<MCPInstance> {
        // TODO: Endpoint /v1/mcp/{id} not yet implemented in backend
        console.warn('MCP getServer endpoint not yet implemented', { id });
        throw createNotImplementedError(`/v1/mcp/${id}`);
    },

    /**
     * Delete a server instance
     * TODO: Backend endpoint not yet available. Implement when DELETE /v1/mcp/{id} is ready.
     */
    async deleteServer(id: string): Promise<void> {
        // TODO: Endpoint DELETE /v1/mcp/{id} not yet implemented in backend
        console.warn('MCP deleteServer endpoint not yet implemented', { id });
        throw createNotImplementedError(`DELETE /v1/mcp/${id}`);
    },

    /**
     * Get server status/health
     * TODO: Backend endpoint not yet available. Implement when /v1/mcp/{id}/status is ready.
     */
    async getServerStatus(id: string): Promise<MCPServerStatus> {
        // TODO: Endpoint /v1/mcp/{id}/status not yet implemented in backend
        console.warn('MCP getServerStatus endpoint not yet implemented', { id });
        throw createNotImplementedError(`/v1/mcp/${id}/status`);
    },

    /**
     * Get server logs
     * TODO: Backend endpoint not yet available. Implement when /v1/mcp/{id}/logs is ready.
     */
    async getServerLogs(
        id: string,
        options?: { limit?: number; level?: string }
    ): Promise<MCPServerLog[]> {
        // TODO: Endpoint /v1/mcp/{id}/logs not yet implemented in backend
        console.warn('MCP getServerLogs endpoint not yet implemented', { id, options });
        throw createNotImplementedError(`/v1/mcp/${id}/logs`);
    },

    /**
     * Restart a server instance
     * TODO: Backend endpoint not yet available. Implement when /v1/mcp/{id}/restart is ready.
     */
    async restartServer(id: string): Promise<{ status: string }> {
        // TODO: Endpoint /v1/mcp/{id}/restart not yet implemented in backend
        console.warn('MCP restartServer endpoint not yet implemented', { id });
        throw createNotImplementedError(`/v1/mcp/${id}/restart`);
    },

    /**
     * Get list of user's MCP instances
     * Endpoint: GET /v1/public/mcp/instances
     */
    async getInstances(): Promise<MCPInstance[]> {
        const response = await apiClient.get<{ instances: MCPInstance[] }>(
            `${PUBLIC_BASE_PATH}/instances`
        );
        return response.data.instances || [];
    },

    /**
     * Get usage metrics for a server
     * TODO: Backend endpoint not yet available. Implement when /v1/mcp/{id}/usage is ready.
     */
    async getUsageMetrics(id: string, period?: string): Promise<MCPUsageMetrics> {
        // TODO: Endpoint /v1/mcp/{id}/usage not yet implemented in backend
        console.warn('MCP getUsageMetrics endpoint not yet implemented', { id, period });
        throw createNotImplementedError(`/v1/mcp/${id}/usage`);
    },

    /**
     * Get billing summary for MCP services
     * Endpoint: GET /v1/public/mcp/billing/summary
     * Note: This replaces the per-instance billing endpoint
     */
    async getBillingSummary(): Promise<MCPBillingSummary> {
        const response = await apiClient.get<MCPBillingSummary>(
            `${PUBLIC_BASE_PATH}/billing/summary`
        );
        return response.data;
    },

    /**
     * Get billing info for a specific server instance
     * Maps to: GET /v1/public/mcp/billing/summary (returns summary for all instances)
     * @deprecated Use getBillingSummary() instead for complete billing data
     */
    async getBillingInfo(id: string): Promise<MCPBillingInfo> {
        // Map to billing summary endpoint and extract instance-specific data
        const summary = await this.getBillingSummary();
        const instanceBilling = summary.instances.find(
            (inst) => inst.instanceId === id
        );

        return {
            instanceId: id,
            currentPeriod: {
                start: summary.periodStart,
                end: summary.periodEnd,
            },
            usage: {
                requests: 0, // Not available from summary endpoint
                cost: instanceBilling?.cost || 0,
            },
            projectedCost: instanceBilling?.cost || 0,
        };
    },

    /**
     * Get cost breakdown across all instances
     * TODO: Backend endpoint not yet available. Implement when /v1/mcp/costs is ready.
     */
    async getCostBreakdown(): Promise<MCPCostBreakdown> {
        // TODO: Endpoint /v1/mcp/costs not yet implemented in backend
        // Consider using getBillingSummary() as a partial alternative
        console.warn('MCP getCostBreakdown endpoint not yet implemented');
        throw createNotImplementedError('/v1/mcp/costs');
    },

    /**
     * Scale server capacity
     * TODO: Backend endpoint not yet available. Implement when /v1/mcp/capacity is ready.
     */
    async scaleCapacity(
        request: CapacityRequest
    ): Promise<{ success: boolean; message: string }> {
        // TODO: Endpoint /v1/mcp/capacity not yet implemented in backend
        console.warn('MCP scaleCapacity endpoint not yet implemented', request);
        throw createNotImplementedError('/v1/mcp/capacity');
    },

    /**
     * Get performance metrics for a server
     * TODO: Backend endpoint not yet available. Implement when /v1/mcp/{id}/performance is ready.
     */
    async getPerformanceMetrics(
        id: string,
        timeRange?: string
    ): Promise<MCPPerformanceMetrics> {
        // TODO: Endpoint /v1/mcp/{id}/performance not yet implemented in backend
        console.warn('MCP getPerformanceMetrics endpoint not yet implemented', {
            id,
            timeRange,
        });
        throw createNotImplementedError(`/v1/mcp/${id}/performance`);
    },

    /**
     * Get MCP servers list (private endpoint)
     * Endpoint: GET /v1/mcp/servers
     */
    async getServers(): Promise<MCPServer[]> {
        const response = await apiClient.get<{ servers: MCPServer[] }>(
            `${PRIVATE_BASE_PATH}/servers`
        );
        return response.data.servers || [];
    },

    /**
     * Get MCP settings (private endpoint)
     * Endpoint: GET /v1/mcp/settings
     */
    async getSettings(): Promise<Record<string, unknown>> {
        const response = await apiClient.get<Record<string, unknown>>(
            `${PRIVATE_BASE_PATH}/settings`
        );
        return response.data;
    },

    /**
     * Update MCP settings (private endpoint)
     * Endpoint: PUT /v1/mcp/settings
     */
    async updateSettings(
        settings: Record<string, unknown>
    ): Promise<Record<string, unknown>> {
        const response = await apiClient.put<Record<string, unknown>>(
            `${PRIVATE_BASE_PATH}/settings`,
            settings
        );
        return response.data;
    },
};

export default mcpService;
