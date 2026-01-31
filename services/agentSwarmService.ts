import apiClient from '@/utils/apiClient';

// API Response interfaces for type safety
interface ApiProjectResponse {
  project_id?: string;
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  progress?: number;
  created_at?: string;
  createdAt?: string;
  completed_at?: string;
  completedAt?: string;
  agents?: AgentStatus[];
  prd_file?: string;
  project_type?: string;
  projectType?: string;
  features?: string[];
  technologies?: string[];
}

interface ApiProjectsListResponse {
  projects?: ApiProjectResponse[];
  total?: number;
  limit?: number;
  skip?: number;
}

interface GitHubStatusResponse {
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
}

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
      const response = await apiClient.get(`${this.baseUrl}/health`);
      return response.data as { status: string; message: string };
    } catch (error) {
      console.error('Agent swarm health check failed:', error);
      throw error;
    }
  }

  /**
   * Create a new agent swarm project
   * @param projectConfig - Project configuration including PRD details
   */
  async createProject(projectConfig: CreateProjectRequest): Promise<AgentSwarmProject> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/orchestrate`, projectConfig);
      return this.transformProject(response.data as ApiProjectResponse);
    } catch (error) {
      console.error('Failed to create agent swarm project:', error);
      throw error;
    }
  }

  /**
   * Upload PRD file and create project
   * @param file - PRD file (PDF, MD, TXT, or DOCX)
   * @param projectType - Type of project (web, mobile, api, etc.)
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
        deployment: additionalConfig?.deployment || {}
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
      const response = await apiClient.get(`${this.baseUrl}/projects`);
      // API returns { projects: [], total: number, limit: number, skip: number }
      const data = response.data as ApiProjectsListResponse;
      const projects = data.projects || [];
      return projects.map((project: ApiProjectResponse) => this.transformProject(project));
    } catch (error) {
      console.error('Failed to get projects:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  /**
   * Get details for a specific project
   * @param projectId - Project ID
   */
  async getProject(projectId: string): Promise<AgentSwarmProject> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}`);
      return this.transformProject(response.data as ApiProjectResponse);
    } catch (error) {
      console.error(`Failed to get project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get real-time status for a project
   * @param projectId - Project ID
   */
  async getProjectStatus(projectId: string): Promise<{
    status: string;
    progress: number;
    stage: string;
    updated_at: string;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/status`);
      return response.data as { status: string; progress: number; stage: string; updated_at: string };
    } catch (error) {
      console.error(`Failed to get status for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get agents working on a project
   * @param projectId - Project ID
   */
  async getProjectAgents(projectId: string): Promise<AgentStatus[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/agents`);
      return (response.data as { agents?: AgentStatus[] }).agents || [];
    } catch (error) {
      console.error(`Failed to get agents for project ${projectId}:`, error);
      return [];
    }
  }

  /**
   * Stop a running project
   * @param projectId - Project ID
   */
  async stopProject(projectId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/projects/${projectId}/stop`);
      return response.data as { message: string };
    } catch (error) {
      console.error(`Failed to stop project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Restart a paused or failed project
   * @param projectId - Project ID
   */
  async restartProject(projectId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/projects/${projectId}/restart`);
      return response.data as { message: string };
    } catch (error) {
      console.error(`Failed to restart project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get project logs
   * @param projectId - Project ID
   * @param limit - Maximum number of logs to retrieve
   */
  async getProjectLogs(projectId: string, limit: number = 100): Promise<ProjectLog[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/logs?limit=${limit}`);
      return (response.data as { logs?: ProjectLog[] }).logs || [];
    } catch (error) {
      console.error(`Failed to get logs for project ${projectId}:`, error);
      return [];
    }
  }

  /**
   * Download project artifacts as ZIP
   * @param projectId - Project ID
   */
  async downloadProjectArtifacts(projectId: string): Promise<Blob> {
    try {
      // Cast to any to support responseType config option
      const response = await (apiClient.get as (url: string, config?: { responseType?: string }) => Promise<{ data: Blob }>)(
        `${this.baseUrl}/projects/${projectId}/download`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to download artifacts for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get metrics for all agent swarm projects
   */
  async getMetrics(): Promise<ProjectMetrics> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/metrics`);
      return response.data as ProjectMetrics;
    } catch (error) {
      console.error('Failed to get agent swarm metrics:', error);
      throw error;
    }
  }

  /**
   * Get GitHub integration status for a project
   * @param projectId - Project ID
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
      const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/github`);
      return response.data as GitHubStatusResponse;
    } catch (error: unknown) {
      // Handle 404 gracefully - project may not have GitHub integration
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 404) {
        console.log(`Project ${projectId} does not have GitHub integration`);
        return {};
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
  private transformProject(apiResponse: ApiProjectResponse): AgentSwarmProject {
    return {
      id: apiResponse.project_id || apiResponse.id || '',
      name: apiResponse.name || `Project ${apiResponse.project_id?.slice(0, 8)}`,
      description: apiResponse.description || '',
      status: this.mapStatus(apiResponse.status || ''),
      progress: apiResponse.progress || 0,
      createdAt: apiResponse.created_at || apiResponse.createdAt || new Date().toISOString(),
      completedAt: apiResponse.completed_at || apiResponse.completedAt,
      agents: apiResponse.agents || [],
      prdFile: apiResponse.prd_file || '',
      projectType: apiResponse.project_type || apiResponse.projectType,
      features: apiResponse.features || [],
      technologies: apiResponse.technologies || []
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
      'stopped': 'paused'
    };
    return statusMap[apiStatus] || 'analyzing';
  }
}

// Export singleton instance
export const agentSwarmService = new AgentSwarmService();
