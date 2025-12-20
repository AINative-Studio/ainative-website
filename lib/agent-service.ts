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

// Agent Service
const agentService = {
  /**
   * Get list of all agents
   */
  async getAgents(): Promise<Agent[]> {
    const response = await apiClient.get<{ agents: Agent[] }>('/v1/agents');
    return response.data.agents || [];
  },

  /**
   * Create a new agent
   */
  async createAgent(request: CreateAgentRequest): Promise<Agent> {
    const response = await apiClient.post<Agent>('/v1/agents', request);
    return response.data;
  },

  /**
   * Get agent details
   */
  async getAgent(agentId: string): Promise<Agent> {
    const response = await apiClient.get<Agent>(`/v1/agents/${agentId}`);
    return response.data;
  },

  /**
   * Update an agent
   */
  async updateAgent(agentId: string, request: UpdateAgentRequest): Promise<Agent> {
    const response = await apiClient.put<Agent>(`/v1/agents/${agentId}`, request);
    return response.data;
  },

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/v1/agents/${agentId}`);
    return response.data;
  },

  /**
   * Run an agent
   */
  async runAgent(agentId: string, request: RunAgentRequest): Promise<AgentRun> {
    const response = await apiClient.post<AgentRun>(`/v1/agents/${agentId}/run`, request);
    return response.data;
  },

  /**
   * Get agent run history
   */
  async getAgentRuns(agentId: string): Promise<AgentRun[]> {
    const response = await apiClient.get<{ runs: AgentRun[] }>(`/v1/agents/${agentId}/runs`);
    return response.data.runs || [];
  },

  /**
   * Get agent logs
   */
  async getAgentLogs(agentId: string, runId?: string): Promise<AgentLog[]> {
    const endpoint = runId
      ? `/v1/agents/${agentId}/logs?runId=${runId}`
      : `/v1/agents/${agentId}/logs`;
    const response = await apiClient.get<{ logs: AgentLog[] }>(endpoint);
    return response.data.logs || [];
  },

  /**
   * Get available agent templates
   */
  async getTemplates(): Promise<AgentTemplate[]> {
    const response = await apiClient.get<{ templates: AgentTemplate[] }>('/v1/agents/templates');
    return response.data.templates || [];
  },

  /**
   * Cancel a running agent
   */
  async cancelRun(agentId: string, runId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(`/v1/agents/${agentId}/runs/${runId}/cancel`);
    return response.data;
  },
};

export default agentService;
