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
  private readonly adminBaseUrl = '/v1/admin/agent-swarm';

  /**
   * Health check for agent swarms module
   * Note: Health endpoint only exists on admin path
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      // Health check is admin-only endpoint
      const response = await apiClient.get<{ status: string; message: string }>(`${this.adminBaseUrl}/health`);
      return response.data;
    } catch (error) {
      // Gracefully handle if user doesn't have admin access
      console.warn('Agent swarm health check failed (may require admin access):', error);
      return { status: 'unknown', message: 'Health check unavailable' };
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
   * Note: Uses swarm_id endpoint as there's no direct project/{id} endpoint
   */
  async getProject(projectId: string): Promise<AgentSwarmProject> {
    try {
      // Try public swarm endpoint first
      const response = await apiClient.get(`${this.baseUrl}/${projectId}`);
      return this.transformProject(response.data);
    } catch (error) {
      // Fallback to admin endpoint
      try {
        const adminResponse = await apiClient.get(`${this.adminBaseUrl}/projects/${projectId}`);
        return this.transformProject(adminResponse.data);
      } catch {
        console.error(`Failed to get project ${projectId}:`, error);
        throw error;
      }
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
   * Note: Logs endpoint is admin-only
   */
  async getProjectLogs(projectId: string, limit: number = 100): Promise<ProjectLog[]> {
    try {
      // Logs are admin-only endpoint
      const endpoint = `${this.adminBaseUrl}/projects/${projectId}/logs?limit=${limit}`;
      const response = await apiClient.get<{ logs: ProjectLog[] }>(endpoint);
      return response.data.logs || [];
    } catch (error) {
      console.warn(`Failed to get logs for project ${projectId} (may require admin access):`, error);
      return [];
    }
  }

  /**
   * Stop a running project
   * Note: Stop endpoint is admin-only
   */
  async stopProject(projectId: string): Promise<{ message: string }> {
    try {
      // Stop is admin-only endpoint
      const response = await apiClient.post<{ message: string }>(`${this.adminBaseUrl}/projects/${projectId}/stop`);
      return response.data;
    } catch (error) {
      console.error(`Failed to stop project ${projectId} (may require admin access):`, error);
      throw error;
    }
  }

  /**
   * Restart a paused or failed project
   * Note: Restart endpoint is admin-only
   */
  async restartProject(projectId: string): Promise<{ message: string }> {
    try {
      // Restart is admin-only endpoint
      const response = await apiClient.post<{ message: string }>(`${this.adminBaseUrl}/projects/${projectId}/restart`);
      return response.data;
    } catch (error) {
      console.error(`Failed to restart project ${projectId} (may require admin access):`, error);
      throw error;
    }
  }

  /**
   * Get metrics for all agent swarm projects
   * Note: Metrics endpoint is admin-only
   */
  async getMetrics(): Promise<ProjectMetrics> {
    try {
      // Metrics are admin-only endpoint
      const response = await apiClient.get<ProjectMetrics>(`${this.adminBaseUrl}/metrics`);
      return response.data;
    } catch (error) {
      console.warn('Failed to get agent swarm metrics (may require admin access):', error);
      // Return empty metrics on failure
      return {
        total_projects: 0,
        active_projects: 0,
        completed_projects: 0,
        failed_projects: 0,
      };
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
