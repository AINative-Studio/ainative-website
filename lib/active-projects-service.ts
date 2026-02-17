/**
 * Active Projects service for managing AI projects
 * Handles all active-projects-related API operations
 */

import apiClient from './api-client';

export interface ActiveProject {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'stopped' | 'completed';
  created_at: string;
  updated_at: string;
  agent_count: number;
  user_id: string;
}

export interface ProjectSummary {
  total_projects: number;
  active_projects: number;
  paused_projects: number;
  completed_projects: number;
  total_agents: number;
}

export interface ActivityFeedItem {
  id: string;
  project_id: string;
  project_name: string;
  event_type: string;
  description: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface ProjectAgent {
  id: string;
  project_id: string;
  agent_name: string;
  agent_type: string;
  status: 'active' | 'idle' | 'stopped';
  created_at: string;
  updated_at: string;
  last_activity?: string;
}

export interface ProjectDetails extends ActiveProject {
  agents: ProjectAgent[];
  total_tasks?: number;
  completed_tasks?: number;
  last_activity?: string;
}

export interface ProjectActionResponse {
  success: boolean;
  message: string;
  project: ActiveProject;
}

/**
 * Active Projects Service
 */
export const activeProjectsService = {
  /**
   * List all active projects
   */
  async listProjects(): Promise<ActiveProject[]> {
    const response = await apiClient.get<ActiveProject[]>('/v1/active-projects/');
    return response.data;
  },

  /**
   * Get dashboard summary
   */
  async getSummary(): Promise<ProjectSummary> {
    const response = await apiClient.get<ProjectSummary>('/v1/active-projects/summary');
    return response.data;
  },

  /**
   * Get activity feed
   */
  async getActivityFeed(limit = 50): Promise<ActivityFeedItem[]> {
    const response = await apiClient.get<ActivityFeedItem[]>(
      `/v1/active-projects/activity/feed?limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get project details by ID
   */
  async getProject(projectId: string): Promise<ProjectDetails> {
    const response = await apiClient.get<ProjectDetails>(
      `/v1/active-projects/${projectId}`
    );
    return response.data;
  },

  /**
   * Get project agents
   */
  async getProjectAgents(projectId: string): Promise<ProjectAgent[]> {
    const response = await apiClient.get<ProjectAgent[]>(
      `/v1/active-projects/${projectId}/agents`
    );
    return response.data;
  },

  /**
   * Pause a project
   */
  async pauseProject(projectId: string): Promise<ProjectActionResponse> {
    const response = await apiClient.post<ProjectActionResponse>(
      `/v1/active-projects/${projectId}/pause`
    );
    return response.data;
  },

  /**
   * Resume a project
   */
  async resumeProject(projectId: string): Promise<ProjectActionResponse> {
    const response = await apiClient.post<ProjectActionResponse>(
      `/v1/active-projects/${projectId}/resume`
    );
    return response.data;
  },

  /**
   * Stop a project
   */
  async stopProject(projectId: string): Promise<ProjectActionResponse> {
    const response = await apiClient.post<ProjectActionResponse>(
      `/v1/active-projects/${projectId}/stop`
    );
    return response.data;
  },
};

export default activeProjectsService;
