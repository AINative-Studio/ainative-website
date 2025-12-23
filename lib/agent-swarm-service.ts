/**
 * Agent Swarm Service
 * Handles API communication for Agent Swarm orchestration
 * Based on existing service in Vite SPA but adapted for Next.js
 */

import apiClient from './api-client';

// Types
export interface AgentStatus {
  name: string;
  status: 'idle' | 'working' | 'completed' | 'failed';
  progress: number;
  current_task?: string;
}

export interface AgentSwarmProject {
  id: string;
  name: string;
  description?: string;
  status: 'analyzing' | 'building' | 'completed' | 'failed' | 'paused';
  progress: number;
  createdAt: string;
  completedAt?: string;
  agents: AgentStatus[];
  prdFile: string;
  githubRepo?: string;
  projectType?: string;
  features?: string[];
  technologies?: string[];
}

export interface CreateProjectRequest {
  project_type: string;
  description: string;
  features?: string[];
  technologies?: string[];
  deployment?: Record<string, unknown>;
}

export interface ProjectLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  agent?: string;
}

export interface ProjectMetrics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  failed_projects: number;
  avg_completion_time?: number;
}

/**
 * Agent Swarm Service
 * Handles all API communication for agent swarm projects
 */
export class AgentSwarmService {
  private readonly baseUrl = '/v1/public/agent-swarms';

  /**
   * Health check for agent swarms module
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await apiClient.get<{ status: string; message: string }>(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('Agent swarm health check failed:', error);
      throw error;
    }
  }

  /**
   * Create a new agent swarm project via orchestrate endpoint
   */
  async createProject(projectConfig: CreateProjectRequest): Promise<AgentSwarmProject> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/orchestrate`, projectConfig);
      return this.transformProject(response.data);
    } catch (error) {
      console.error('Failed to create agent swarm project:', error);
      throw error;
    }
  }

  /**
   * Upload PRD file and create project
   */
  async uploadPRDAndCreateProject(
    file: File,
    projectType: string,
    additionalConfig?: Partial<CreateProjectRequest>
  ): Promise<AgentSwarmProject> {
    try {
      // Read file content
      const fileContent = await this.readFileAsText(file);

      // Create project with PRD content as description
      const projectConfig: CreateProjectRequest = {
        project_type: projectType,
        description: fileContent,
        features: additionalConfig?.features || [],
        technologies: additionalConfig?.technologies || [],
        deployment: additionalConfig?.deployment || {},
      };

      return await this.createProject(projectConfig);
    } catch (error) {
      console.error('Failed to upload PRD and create project:', error);
      throw error;
    }
  }

  /**
   * Get all projects for the current user
   */
  async getAllProjects(): Promise<AgentSwarmProject[]> {
    try {
      const response = await apiClient.get<{ projects?: unknown[]; [key: string]: unknown }>(`${this.baseUrl}/projects`);
      // API returns { projects: [], total: number, limit: number, skip: number }
      const projects = response.data.projects || (Array.isArray(response.data) ? response.data : []);
      return projects.map((project: unknown) => this.transformProject(project));
    } catch (error) {
      console.error('Failed to get projects:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  /**
   * Get details for a specific project
   */
  async getProject(projectId: string): Promise<AgentSwarmProject> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}`);
      return this.transformProject(response.data);
    } catch (error) {
      console.error(`Failed to get project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get real-time status for a project
   */
  async getProjectStatus(projectId: string): Promise<{
    status: string;
    progress: number;
    stage: string;
    updated_at: string;
  }> {
    try {
      const response = await apiClient.get<{
        status: string;
        progress: number;
        stage: string;
        updated_at: string;
      }>(`${this.baseUrl}/projects/${projectId}/status`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get status for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get project logs
   */
  async getProjectLogs(projectId: string, limit: number = 100): Promise<ProjectLog[]> {
    try {
      const endpoint = `${this.baseUrl}/projects/${projectId}/logs?limit=${limit}`;
      const response = await apiClient.get<{ logs: ProjectLog[] }>(endpoint);
      return response.data.logs || [];
    } catch (error) {
      console.error(`Failed to get logs for project ${projectId}:`, error);
      return [];
    }
  }

  /**
   * Stop a running project
   */
  async stopProject(projectId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(`${this.baseUrl}/projects/${projectId}/stop`);
      return response.data;
    } catch (error) {
      console.error(`Failed to stop project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Restart a paused or failed project
   */
  async restartProject(projectId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(`${this.baseUrl}/projects/${projectId}/restart`);
      return response.data;
    } catch (error) {
      console.error(`Failed to restart project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get metrics for all agent swarm projects
   */
  async getMetrics(): Promise<ProjectMetrics> {
    try {
      const response = await apiClient.get<ProjectMetrics>(`${this.baseUrl}/metrics`);
      return response.data;
    } catch (error) {
      console.error('Failed to get agent swarm metrics:', error);
      throw error;
    }
  }

  /**
   * Get GitHub integration status for a project
   */
  async getProjectGitHubStatus(projectId: string): Promise<{
    repository_url?: string;
    branch?: string;
    last_commit?: {
      sha?: string;
      message?: string;
      author?: string;
      timestamp?: string;
    };
    build_status?: 'pending' | 'running' | 'success' | 'failed';
    pull_request_url?: string;
  }> {
    try {
      const response = await apiClient.get<{
        repository_url?: string;
        branch?: string;
        last_commit?: {
          sha?: string;
          message?: string;
          author?: string;
          timestamp?: string;
        };
        build_status?: 'pending' | 'running' | 'success' | 'failed';
        pull_request_url?: string;
      }>(`${this.baseUrl}/projects/${projectId}/github`);
      return response.data;
    } catch (error: unknown) {
      // Handle 404 gracefully - project may not have GitHub integration
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          console.log(`Project ${projectId} does not have GitHub integration`);
          return {};
        }
      }
      console.error(`Failed to get GitHub status for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Helper: Read file content as text
   */
  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Helper: Transform API response to AgentSwarmProject interface
   */
  private transformProject(apiResponse: unknown): AgentSwarmProject {
    // Type guard for API response
    const response = apiResponse as Record<string, unknown>;

    return {
      id: (response.project_id as string) || (response.id as string),
      name: (response.name as string) || `Project ${(response.project_id as string)?.slice(0, 8)}`,
      description: response.description as string | undefined,
      status: this.mapStatus(response.status as string),
      progress: (response.progress as number) || 0,
      createdAt: (response.created_at as string) || (response.createdAt as string) || new Date().toISOString(),
      completedAt: (response.completed_at as string) || (response.completedAt as string) || undefined,
      agents: (response.agents as AgentStatus[]) || [],
      prdFile: (response.prd_file as string) || '',
      githubRepo: response.github_repository as string | undefined,
      projectType: (response.project_type as string) || (response.projectType as string) || undefined,
      features: (response.features as string[]) || [],
      technologies: (response.technologies as string[]) || [],
    };
  }

  /**
   * Helper: Map API status to UI status
   */
  private mapStatus(apiStatus: string): 'analyzing' | 'building' | 'completed' | 'failed' | 'paused' {
    const statusMap: Record<string, 'analyzing' | 'building' | 'completed' | 'failed' | 'paused'> = {
      'analyzing': 'analyzing',
      'building': 'building',
      'in_progress': 'building',
      'active': 'building',
      'completed': 'completed',
      'success': 'completed',
      'failed': 'failed',
      'error': 'failed',
      'paused': 'paused',
      'stopped': 'paused',
    };
    return statusMap[apiStatus] || 'analyzing';
  }
}

// Export singleton instance
export const agentSwarmService = new AgentSwarmService();
