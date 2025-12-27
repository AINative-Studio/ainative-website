import apiClient from '../../utils/apiClient';

// Type for Axios-like error response
interface AxiosErrorLike {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

// Helper function to extract error message from unknown error
function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosErrorLike;
  return axiosError.response?.data?.detail || axiosError.message || 'Unknown error';
}

// Agent analytics response type
interface AgentAnalytics {
  execution_count: number;
  success_rate: number;
  average_execution_time_ms: number;
  memory_records_created: number;
  usage_by_day: Array<{ date: string; executions: number; success_rate: number }>;
  error_distribution: Record<string, number>;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'mcp' | 'custom' | 'openai' | 'anthropic';
  config: Record<string, unknown>;
  status: 'active' | 'inactive' | 'error' | 'training';
  capabilities: string[];
  memory_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  usage_count: number;
  metadata?: Record<string, unknown>;
}

export interface AgentCreateRequest {
  name: string;
  description: string;
  type: 'mcp' | 'custom' | 'openai' | 'anthropic';
  config: Record<string, unknown>;
  capabilities?: string[];
  memory_enabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface MemoryRecord {
  id: string;
  agent_id: string;
  session_id?: string;
  memory_type: 'conversation' | 'fact' | 'procedure' | 'episodic';
  content: string;
  embeddings?: number[];
  importance_score: number;
  created_at: string;
  accessed_at: string;
  access_count: number;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface MemoryCreateRequest {
  agent_id: string;
  session_id?: string;
  memory_type: 'conversation' | 'fact' | 'procedure' | 'episodic';
  content: string;
  importance_score?: number;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface AgentExecution {
  id: string;
  agent_id: string;
  session_id?: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  execution_time_ms?: number;
  error_message?: string;
  memory_records_created?: number;
}

export interface AgentExecutionRequest {
  agent_id: string;
  input: Record<string, unknown>;
  session_id?: string;
  use_memory?: boolean;
  context?: Record<string, unknown>;
}

export class AgentService {
  private static readonly BASE_PATH = '/v1/public/zerodb/agents';
  private static readonly MEMORY_PATH = '/v1/public/zerodb/memory';

  // Agent Management
  static async getAgents(): Promise<Agent[]> {
    try {
      const response = await apiClient.get(this.BASE_PATH);
      return response.data as Agent[];
    } catch (error: unknown) {
      throw new Error(`Failed to fetch agents: ${getErrorMessage(error)}`);
    }
  }

  static async createAgent(request: AgentCreateRequest): Promise<Agent> {
    try {
      const response = await apiClient.post(this.BASE_PATH, request);
      return response.data as Agent;
    } catch (error: unknown) {
      throw new Error(`Failed to create agent: ${getErrorMessage(error)}`);
    }
  }

  static async getAgent(agentId: string): Promise<Agent> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/${agentId}`);
      return response.data as Agent;
    } catch (error: unknown) {
      throw new Error(`Failed to fetch agent: ${getErrorMessage(error)}`);
    }
  }

  static async updateAgent(agentId: string, updates: Partial<AgentCreateRequest>): Promise<Agent> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/${agentId}`, updates);
      return response.data as Agent;
    } catch (error: unknown) {
      throw new Error(`Failed to update agent: ${getErrorMessage(error)}`);
    }
  }

  static async deleteAgent(agentId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${agentId}`);
    } catch (error: unknown) {
      throw new Error(`Failed to delete agent: ${getErrorMessage(error)}`);
    }
  }

  // Agent Execution
  static async executeAgent(request: AgentExecutionRequest): Promise<AgentExecution> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/${request.agent_id}/execute`, request);
      return response.data as AgentExecution;
    } catch (error: unknown) {
      throw new Error(`Agent execution failed: ${getErrorMessage(error)}`);
    }
  }

  static async getExecution(executionId: string): Promise<AgentExecution> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/executions/${executionId}`);
      return response.data as AgentExecution;
    } catch (error: unknown) {
      throw new Error(`Failed to fetch execution: ${getErrorMessage(error)}`);
    }
  }

  static async getAgentExecutions(agentId: string, limit?: number): Promise<AgentExecution[]> {
    try {
      const queryString = limit ? `?limit=${limit}` : '';
      const response = await apiClient.get(`${this.BASE_PATH}/${agentId}/executions${queryString}`);
      return response.data as AgentExecution[];
    } catch (error: unknown) {
      throw new Error(`Failed to fetch agent executions: ${getErrorMessage(error)}`);
    }
  }

  // Memory Management
  static async getMemoryRecords(params?: {
    agent_id?: string;
    session_id?: string;
    memory_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ records: MemoryRecord[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
      if (params?.session_id) queryParams.append('session_id', params.session_id);
      if (params?.memory_type) queryParams.append('memory_type', params.memory_type);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      const queryString = queryParams.toString() ? `?${queryParams}` : '';
      const response = await apiClient.get(`${this.MEMORY_PATH}/records${queryString}`);
      return response.data as { records: MemoryRecord[]; total: number };
    } catch (error: unknown) {
      throw new Error(`Failed to fetch memory records: ${getErrorMessage(error)}`);
    }
  }

  static async createMemoryRecord(request: MemoryCreateRequest): Promise<MemoryRecord> {
    try {
      const response = await apiClient.post(`${this.MEMORY_PATH}/records`, request);
      return response.data as MemoryRecord;
    } catch (error: unknown) {
      throw new Error(`Failed to create memory record: ${getErrorMessage(error)}`);
    }
  }

  static async getMemoryRecord(recordId: string): Promise<MemoryRecord> {
    try {
      const response = await apiClient.get(`${this.MEMORY_PATH}/records/${recordId}`);
      return response.data as MemoryRecord;
    } catch (error: unknown) {
      throw new Error(`Failed to fetch memory record: ${getErrorMessage(error)}`);
    }
  }

  static async updateMemoryRecord(recordId: string, updates: Partial<MemoryCreateRequest>): Promise<MemoryRecord> {
    try {
      const response = await apiClient.put(`${this.MEMORY_PATH}/records/${recordId}`, updates);
      return response.data as MemoryRecord;
    } catch (error: unknown) {
      throw new Error(`Failed to update memory record: ${getErrorMessage(error)}`);
    }
  }

  static async deleteMemoryRecord(recordId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.MEMORY_PATH}/records/${recordId}`);
    } catch (error: unknown) {
      throw new Error(`Failed to delete memory record: ${getErrorMessage(error)}`);
    }
  }

  // Memory Search
  static async searchMemory(
    agentId: string,
    query: string,
    options?: {
      memory_type?: string;
      session_id?: string;
      limit?: number;
      min_similarity?: number;
    }
  ): Promise<{ records: MemoryRecord[]; similarities: number[] }> {
    try {
      const response = await apiClient.post(`${this.MEMORY_PATH}/search`, {
        agent_id: agentId,
        query,
        ...options
      });
      return response.data as { records: MemoryRecord[]; similarities: number[] };
    } catch (error: unknown) {
      throw new Error(`Memory search failed: ${getErrorMessage(error)}`);
    }
  }

  // Agent Training & Learning
  static async trainAgent(
    agentId: string,
    trainingData: Array<{ input: Record<string, unknown>; expected_output: Record<string, unknown> }>
  ): Promise<{ job_id: string; status: string }> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/${agentId}/train`, {
        training_data: trainingData
      });
      return response.data as { job_id: string; status: string };
    } catch (error: unknown) {
      throw new Error(`Agent training failed: ${getErrorMessage(error)}`);
    }
  }

  static async getTrainingStatus(jobId: string): Promise<{
    job_id: string;
    status: string;
    progress: number;
    error_message?: string;
    metrics?: Record<string, unknown>;
  }> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/training/${jobId}`);
      return response.data as { job_id: string; status: string; progress: number; error_message?: string; metrics?: Record<string, unknown> };
    } catch (error: unknown) {
      throw new Error(`Failed to fetch training status: ${getErrorMessage(error)}`);
    }
  }

  // Agent Analytics
  static async getAgentAnalytics(agentId: string, timeRange?: string): Promise<AgentAnalytics> {
    try {
      const queryString = timeRange ? `?time_range=${encodeURIComponent(timeRange)}` : '';
      const response = await apiClient.get(`${this.BASE_PATH}/${agentId}/analytics${queryString}`);
      return response.data as AgentAnalytics;
    } catch (error: unknown) {
      throw new Error(`Failed to fetch agent analytics: ${getErrorMessage(error)}`);
    }
  }

  // Session Management
  static async createSession(agentId: string, sessionId?: string): Promise<{ session_id: string; agent_id: string }> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/${agentId}/sessions`, { session_id: sessionId });
      return response.data as { session_id: string; agent_id: string };
    } catch (error: unknown) {
      throw new Error(`Failed to create session: ${getErrorMessage(error)}`);
    }
  }

  static async endSession(sessionId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/sessions/${sessionId}`);
    } catch (error: unknown) {
      throw new Error(`Failed to end session: ${getErrorMessage(error)}`);
    }
  }
}