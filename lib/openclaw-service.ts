import type {
  OpenClawAgent,
  OpenClawAgentListResponse,
  CreateAgentRequest,
  UpdateAgentSettingsRequest,
} from '@/types/openclaw';
import { MOCK_AGENTS } from './openclaw-mock-data';

class OpenClawService {
  private baseUrl = '/v1/agent-swarm/agents';

  async listAgents(
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<OpenClawAgentListResponse> {
    // TODO: Replace with real API call
    // const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    // if (status) params.set('status', status);
    // const response = await apiClient.get<OpenClawAgentListResponse>(`${this.baseUrl}?${params}`);
    // return response.data;
    let agents = [...MOCK_AGENTS];
    if (status) {
      agents = agents.filter(a => a.status === status);
    }
    return {
      agents: agents.slice(offset, offset + limit),
      total: agents.length,
      limit,
      offset,
    };
  }

  async getAgent(agentId: string): Promise<OpenClawAgent> {
    // TODO: Replace with real API call
    // const response = await apiClient.get<OpenClawAgent>(`${this.baseUrl}/${agentId}`);
    // return response.data;
    const agent = MOCK_AGENTS.find(a => a.id === agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    return agent;
  }

  async createAgent(data: CreateAgentRequest): Promise<OpenClawAgent> {
    // TODO: Replace with real API call
    // const response = await apiClient.post<OpenClawAgent>(this.baseUrl, data);
    // return response.data;
    const newAgent: OpenClawAgent = {
      id: `agent-${Date.now()}`,
      name: data.name,
      persona: data.persona || null,
      model: data.model,
      userId: 'user-001',
      status: 'provisioning',
      openclawSessionKey: null,
      openclawAgentId: null,
      heartbeatEnabled: data.heartbeat?.enabled ?? false,
      heartbeatInterval: data.heartbeat?.interval ?? null,
      heartbeatChecklist: data.heartbeat?.checklist ?? null,
      lastHeartbeatAt: null,
      nextHeartbeatAt: null,
      configuration: data.configuration ?? null,
      errorMessage: null,
      errorCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      provisionedAt: null,
      pausedAt: null,
      stoppedAt: null,
    };
    MOCK_AGENTS.push(newAgent);
    return newAgent;
  }

  async provisionAgent(agentId: string): Promise<OpenClawAgent> {
    // TODO: Replace with real API call
    // const response = await apiClient.post<OpenClawAgent>(`${this.baseUrl}/${agentId}/provision`);
    // return response.data;
    const agent = MOCK_AGENTS.find(a => a.id === agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    agent.status = 'running';
    agent.provisionedAt = new Date().toISOString();
    return agent;
  }

  async pauseAgent(agentId: string): Promise<OpenClawAgent> {
    // TODO: Replace with real API call
    const agent = MOCK_AGENTS.find(a => a.id === agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    agent.status = 'paused';
    agent.pausedAt = new Date().toISOString();
    return agent;
  }

  async resumeAgent(agentId: string): Promise<OpenClawAgent> {
    // TODO: Replace with real API call
    const agent = MOCK_AGENTS.find(a => a.id === agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    agent.status = 'running';
    agent.pausedAt = null;
    return agent;
  }

  async updateSettings(agentId: string, data: UpdateAgentSettingsRequest): Promise<OpenClawAgent> {
    // TODO: Replace with real API call
    const agent = MOCK_AGENTS.find(a => a.id === agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    if (data.persona !== undefined) agent.persona = data.persona;
    if (data.model !== undefined) agent.model = data.model;
    if (data.heartbeat) {
      agent.heartbeatEnabled = data.heartbeat.enabled;
      if (data.heartbeat.interval) agent.heartbeatInterval = data.heartbeat.interval;
      if (data.heartbeat.checklist) agent.heartbeatChecklist = data.heartbeat.checklist;
    }
    agent.updatedAt = new Date().toISOString();
    return agent;
  }

  async deleteAgent(agentId: string): Promise<void> {
    // TODO: Replace with real API call
    const index = MOCK_AGENTS.findIndex(a => a.id === agentId);
    if (index !== -1) MOCK_AGENTS.splice(index, 1);
  }

  async executeHeartbeat(agentId: string): Promise<{ status: string; message: string }> {
    // TODO: Replace with real API call
    return { status: 'completed', message: 'Heartbeat executed successfully' };
  }
}

const openClawService = new OpenClawService();
export default openClawService;
