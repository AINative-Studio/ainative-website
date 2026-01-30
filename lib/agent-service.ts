/**
 * Agent Service - Backend integration for Agent Framework Dashboard
 * Integrates with backend agent orchestration and bridge endpoints
 *
 * Backend API Structure:
 * - /v1/public/agent-orchestration/agents - Agent management
 * - /v1/public/agent-orchestration/tasks - Task management (separate from agents)
 * - /v1/public/agent-bridge/agents - Agent bridge endpoints
 * - /v1/public/agent-bridge/endpoints - Bridge endpoint configuration
 * - /v1/public/agent-bridge/metrics - Agent metrics
 * - /v1/public/agent-bridge/status - Agent status
 */

import apiClient from './api-client';

// Base paths for backend API
const ORCHESTRATION_BASE = '/v1/public/agent-orchestration';
const BRIDGE_BASE = '/v1/public/agent-bridge';

// Types
export interface Agent {
    id: string;
    name: string;
    description: string;
    type: 'conversational' | 'task-based' | 'workflow' | 'custom';
    status: 'idle' | 'running' | 'paused' | 'failed' | 'stopped';
    config: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        systemPrompt?: string;
        tools?: string[];
        capabilities?: string[];
    };
    templateId?: string;
    createdAt: string;
    updatedAt: string;
    lastRunAt?: string;
    runCount: number;
}

export interface AgentTemplate {
    id: string;
    name: string;
    description: string;
    category: 'productivity' | 'development' | 'data-analysis' | 'customer-service' | 'general';
    icon: string;
    defaultConfig: {
        model: string;
        temperature: number;
        maxTokens: number;
        systemPrompt: string;
        tools: string[];
        capabilities: string[];
    };
    tags: string[];
}

export interface AgentRun {
    id: string;
    agentId: string;
    agentName: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    input?: string;
    output?: string;
    error?: string;
    startedAt: string;
    completedAt?: string;
    duration?: number;
    tokensUsed?: number;
    cost?: number;
}

export interface AgentLog {
    id: string;
    agentId: string;
    runId: string;
    timestamp: string;
    level: 'debug' | 'info' | 'warning' | 'error';
    message: string;
    metadata?: Record<string, unknown>;
}

export interface CreateAgentRequest {
    name: string;
    description?: string;
    type: 'conversational' | 'task-based' | 'workflow' | 'custom';
    templateId?: string;
    config: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        systemPrompt?: string;
        tools?: string[];
        capabilities?: string[];
    };
}

export interface UpdateAgentRequest {
    name?: string;
    description?: string;
    config?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        systemPrompt?: string;
        tools?: string[];
        capabilities?: string[];
    };
}

export interface RunAgentRequest {
    input: string;
    config?: {
        temperature?: number;
        maxTokens?: number;
    };
}

// Backend response types for agent-bridge
export interface AgentMetrics {
    agentId: string;
    totalRuns: number;
    successRate: number;
    averageDuration: number;
    tokensUsed: number;
    lastActiveAt?: string;
}

export interface AgentStatus {
    agentId: string;
    status: 'idle' | 'running' | 'paused' | 'failed' | 'stopped';
    currentTaskId?: string;
    lastError?: string;
    healthCheck: 'healthy' | 'degraded' | 'unhealthy';
}

// Agent Service
const agentService = {
    /**
     * Get list of all agents
     * Uses: GET /v1/public/agent-orchestration/agents
     */
    async getAgents(): Promise<Agent[]> {
        const response = await apiClient.get<{ agents: Agent[] }>(`${ORCHESTRATION_BASE}/agents`);
        return response.data.agents || [];
    },

    /**
     * Create a new agent
     * Uses: POST /v1/public/agent-orchestration/agents
     */
    async createAgent(request: CreateAgentRequest): Promise<Agent> {
        const response = await apiClient.post<Agent>(`${ORCHESTRATION_BASE}/agents`, request);
        return response.data;
    },

    /**
     * Get agent details
     * Uses: GET /v1/public/agent-orchestration/agents/{agentId}
     */
    async getAgent(agentId: string): Promise<Agent> {
        const response = await apiClient.get<Agent>(`${ORCHESTRATION_BASE}/agents/${agentId}`);
        return response.data;
    },

    /**
     * Update an agent
     * Uses: PUT /v1/public/agent-orchestration/agents/{agentId}
     */
    async updateAgent(agentId: string, request: UpdateAgentRequest): Promise<Agent> {
        const response = await apiClient.put<Agent>(`${ORCHESTRATION_BASE}/agents/${agentId}`, request);
        return response.data;
    },

    /**
     * Delete an agent
     * Uses: DELETE /v1/public/agent-orchestration/agents/{agentId}
     */
    async deleteAgent(agentId: string): Promise<{ success: boolean }> {
        const response = await apiClient.delete<{ success: boolean }>(`${ORCHESTRATION_BASE}/agents/${agentId}`);
        return response.data;
    },

    /**
     * Run an agent
     * TODO: Backend uses separate /tasks endpoint for task execution.
     * This method creates a task and associates it with the agent.
     * Uses: POST /v1/public/agent-orchestration/tasks
     */
    async runAgent(agentId: string, request: RunAgentRequest): Promise<AgentRun> {
        // Backend structure: tasks are separate entities linked to agents
        // We create a task with the agentId reference
        const taskPayload = {
            agentId,
            input: request.input,
            config: request.config,
        };
        const response = await apiClient.post<AgentRun>(`${ORCHESTRATION_BASE}/tasks`, taskPayload);
        return response.data;
    },

    /**
     * Get agent run history
     * TODO: Backend does not have a direct /runs endpoint per agent.
     * Runs are tracked as tasks. Query tasks filtered by agentId.
     * Uses: GET /v1/public/agent-orchestration/tasks?agentId={agentId}
     */
    async getAgentRuns(agentId: string): Promise<AgentRun[]> {
        // Query tasks associated with this agent
        const response = await apiClient.get<{ tasks: AgentRun[] }>(
            `${ORCHESTRATION_BASE}/tasks?agentId=${agentId}`
        );
        return response.data.tasks || [];
    },

    /**
     * Get agent logs
     * TODO: Backend does not have a dedicated /logs endpoint.
     * Logs may be part of task details or available through a separate logging service.
     * Returns empty array until backend implements logging endpoint.
     */
    async getAgentLogs(agentId: string, runId?: string): Promise<AgentLog[]> {
        // TODO: Implement when backend provides logging endpoint
        // Potential future endpoint: /v1/public/agent-bridge/logs?agentId={agentId}&taskId={runId}
        console.warn(
            `[AgentService] getAgentLogs: Backend logging endpoint not yet available. ` +
            `agentId=${agentId}, runId=${runId || 'all'}`
        );
        return [];
    },

    /**
     * Get available agent templates
     * TODO: Backend does not have a /templates endpoint.
     * Templates may be managed through a different service or configured locally.
     * Returns empty array until backend implements templates endpoint.
     */
    async getTemplates(): Promise<AgentTemplate[]> {
        // TODO: Implement when backend provides templates endpoint
        // Potential future endpoint: /v1/public/agent-orchestration/templates
        console.warn('[AgentService] getTemplates: Backend templates endpoint not yet available.');
        return [];
    },

    /**
     * Cancel a running agent task
     * TODO: Backend may handle cancellation through task status update.
     * Uses: PUT /v1/public/agent-orchestration/tasks/{taskId} with status='cancelled'
     */
    async cancelRun(agentId: string, runId: string): Promise<{ success: boolean }> {
        // Cancel by updating task status
        // Note: agentId is kept for API compatibility but taskId (runId) is the primary identifier
        const response = await apiClient.put<{ success: boolean }>(
            `${ORCHESTRATION_BASE}/tasks/${runId}`,
            { status: 'cancelled' }
        );
        return response.data;
    },

    // ========================================
    // Agent Bridge API Methods
    // These methods provide access to the agent-bridge service
    // ========================================

    /**
     * Get agent metrics from bridge service
     * Uses: GET /v1/public/agent-bridge/metrics?agentId={agentId}
     */
    async getAgentMetrics(agentId: string): Promise<AgentMetrics | null> {
        try {
            const response = await apiClient.get<AgentMetrics>(
                `${BRIDGE_BASE}/metrics?agentId=${agentId}`
            );
            return response.data;
        } catch (error) {
            console.warn(`[AgentService] getAgentMetrics failed for agentId=${agentId}:`, error);
            return null;
        }
    },

    /**
     * Get agent status from bridge service
     * Uses: GET /v1/public/agent-bridge/status?agentId={agentId}
     */
    async getAgentStatus(agentId: string): Promise<AgentStatus | null> {
        try {
            const response = await apiClient.get<AgentStatus>(
                `${BRIDGE_BASE}/status?agentId=${agentId}`
            );
            return response.data;
        } catch (error) {
            console.warn(`[AgentService] getAgentStatus failed for agentId=${agentId}:`, error);
            return null;
        }
    },

    /**
     * Get all bridge endpoints configuration
     * Uses: GET /v1/public/agent-bridge/endpoints
     */
    async getBridgeEndpoints(): Promise<Record<string, string>[]> {
        try {
            const response = await apiClient.get<{ endpoints: Record<string, string>[] }>(
                `${BRIDGE_BASE}/endpoints`
            );
            return response.data.endpoints || [];
        } catch (error) {
            console.warn('[AgentService] getBridgeEndpoints failed:', error);
            return [];
        }
    },

    /**
     * Get agents from bridge service
     * Uses: GET /v1/public/agent-bridge/agents
     * Note: This may return different data than orchestration agents
     */
    async getBridgeAgents(): Promise<Agent[]> {
        try {
            const response = await apiClient.get<{ agents: Agent[] }>(`${BRIDGE_BASE}/agents`);
            return response.data.agents || [];
        } catch (error) {
            console.warn('[AgentService] getBridgeAgents failed:', error);
            return [];
        }
    },
};

export default agentService;
