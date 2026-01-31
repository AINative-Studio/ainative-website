/**
 * Admin Agent Swarm Service
 * Handles agent orchestration, swarm management, and agent metrics
 */

import { adminApi } from './client';
import type {
  AgentSwarmProject,
  OrchestrateRequest,
  AgentType,
  AgentSwarmMetrics,
  PaginatedResponse,
  OperationResult,
} from './types';

/**
 * Admin service for agent swarm management
 */
export class AdminAgentService {
  private readonly basePath = 'agent-swarm';

  /**
   * List all agent swarm projects
   */
  async listProjects(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<AgentSwarmProject>> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<PaginatedResponse<AgentSwarmProject>>(
        `${this.basePath}/projects${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch projects');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching agent swarm projects:', error);
      throw error;
    }
  }

  /**
   * Orchestrate an agent swarm task
   */
  async orchestrate(request: OrchestrateRequest): Promise<{
    task_id: string;
    status: string;
    agents_assigned: number;
  }> {
    try {
      const response = await adminApi.post<{
        task_id: string;
        status: string;
        agents_assigned: number;
      }>(`${this.basePath}/orchestrate`, request);

      if (!response.success) {
        throw new Error(response.message || 'Failed to orchestrate task');
      }

      return response.data;
    } catch (error) {
      console.error('Error orchestrating agent swarm:', error);
      throw error;
    }
  }

  /**
   * Get available agent types
   */
  async getAgentTypes(): Promise<AgentType[]> {
    try {
      const response = await adminApi.get<{ agent_types: AgentType[] }>(
        `${this.basePath}/agent-types`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch agent types');
      }

      return response.data.agent_types || [];
    } catch (error) {
      console.error('Error fetching agent types:', error);
      throw error;
    }
  }

  /**
   * Get agent swarm metrics
   */
  async getMetrics(filters?: { days?: number; project_id?: string }): Promise<AgentSwarmMetrics> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<AgentSwarmMetrics>(
        `${this.basePath}/metrics${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch agent swarm metrics');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching agent swarm metrics:', error);
      throw error;
    }
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<{
    task_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    agents: Array<{
      agent_id: string;
      agent_type: string;
      status: string;
    }>;
    result?: Record<string, unknown>;
  }> {
    try {
      const response = await adminApi.get<{
        task_id: string;
        status: 'pending' | 'running' | 'completed' | 'failed';
        progress: number;
        agents: Array<{
          agent_id: string;
          agent_type: string;
          status: string;
        }>;
        result?: Record<string, unknown>;
      }>(`${this.basePath}/tasks/${taskId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch task status');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching task status ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a running task
   */
  async cancelTask(taskId: string): Promise<OperationResult> {
    try {
      const response = await adminApi.post<void>(`${this.basePath}/tasks/${taskId}/cancel`);

      return {
        success: response.success,
        message: response.message || 'Task cancelled successfully',
      };
    } catch (error) {
      console.error(`Error cancelling task ${taskId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminAgentService = new AdminAgentService();
