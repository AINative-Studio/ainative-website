/**
 * Agent Service - Backend integration for Agent Framework Dashboard
 * Integrates with all backend agent endpoints
 */

import apiClient from './api-client';

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

// API base paths matching backend structure
const ORCHESTRATION_BASE = '/v1/public/agent-orchestration';
const BRIDGE_BASE = '/v1/public/agent-bridge';

// Agent Service
const agentService = {
  /**
   * Get list of all agents
   */
  async getAgents(): Promise<Agent[]> {
    const response = await apiClient.get<{ agents: Agent[] }>(`${ORCHESTRATION_BASE}/agents`);
    return response.data.agents || [];
  },

  /**
   * Create a new agent
   */
  async createAgent(request: CreateAgentRequest): Promise<Agent> {
    const response = await apiClient.post<Agent>(`${ORCHESTRATION_BASE}/agents`, request);
    return response.data;
  },

  /**
   * Get agent details
   */
  async getAgent(agentId: string): Promise<Agent> {
    const response = await apiClient.get<Agent>(`${ORCHESTRATION_BASE}/agents/${agentId}`);
    return response.data;
  },

  /**
   * Update an agent
   */
  async updateAgent(agentId: string, request: UpdateAgentRequest): Promise<Agent> {
    const response = await apiClient.put<Agent>(`${ORCHESTRATION_BASE}/agents/${agentId}`, request);
    return response.data;
  },

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`${ORCHESTRATION_BASE}/agents/${agentId}`);
    return response.data;
  },

  /**
   * Run an agent (creates a task via orchestration)
   */
  async runAgent(agentId: string, request: RunAgentRequest): Promise<AgentRun> {
    const response = await apiClient.post<AgentRun>(`${ORCHESTRATION_BASE}/tasks`, {
      agent_id: agentId,
      ...request,
    });
    return response.data;
  },

  /**
   * Get agent run history (tasks for this agent)
   */
  async getAgentRuns(agentId: string): Promise<AgentRun[]> {
    const response = await apiClient.get<{ runs: AgentRun[] }>(`${ORCHESTRATION_BASE}/tasks?agent_id=${agentId}`);
    return response.data.runs || [];
  },

  /**
   * Get agent logs via bridge metrics
   */
  async getAgentLogs(agentId: string, runId?: string): Promise<AgentLog[]> {
    const endpoint = runId
      ? `${BRIDGE_BASE}/metrics?agent_id=${agentId}&run_id=${runId}`
      : `${BRIDGE_BASE}/metrics?agent_id=${agentId}`;
    const response = await apiClient.get<{ logs: AgentLog[] }>(endpoint);
    return response.data.logs || [];
  },

  /**
   * Get available agent templates (via bridge endpoints)
   */
  async getTemplates(): Promise<AgentTemplate[]> {
    const response = await apiClient.get<{ templates: AgentTemplate[] }>(`${BRIDGE_BASE}/endpoints`);
    return response.data.templates || [];
  },

  /**
   * Cancel a running agent task
   */
  async cancelRun(agentId: string, runId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(`${ORCHESTRATION_BASE}/tasks/${runId}/cancel`);
    return response.data;
  },

  /**
   * Get bridge status for agents
   */
  async getBridgeStatus(): Promise<{ status: string; agents: number }> {
    const response = await apiClient.get<{ status: string; agents: number }>(`${BRIDGE_BASE}/status`);
    return response.data;
  },
};

export default agentService;
