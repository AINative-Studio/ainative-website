/**
 * Agent Swarm Service
 * Handles all API communication for agent swarm project orchestration
 * Ported from Vite SPA to Next.js
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

export interface GitHubStatus {
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

const BASE_URL = '/v1/public/agent-swarms';

/**
 * Transform API response to AgentSwarmProject interface
 */
function transformProject(apiResponse: Record<string, unknown>): AgentSwarmProject {
  const statusMap: Record<string, AgentSwarmProject['status']> = {
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

  const apiStatus = String(apiResponse.status || 'analyzing');

  return {
    id: String(apiResponse.project_id || apiResponse.id || ''),
    name: String(apiResponse.name || `Project ${String(apiResponse.project_id || '').slice(0, 8)}`),
    description: apiResponse.description as string | undefined,
    status: statusMap[apiStatus] || 'analyzing',
    progress: Number(apiResponse.progress) || 0,
    createdAt: String(apiResponse.created_at || apiResponse.createdAt || new Date().toISOString()),
    completedAt: apiResponse.completed_at as string | undefined || apiResponse.completedAt as string | undefined,
    agents: (apiResponse.agents as AgentStatus[]) || [],
    prdFile: String(apiResponse.prd_file || ''),
    projectType: apiResponse.project_type as string | undefined || apiResponse.projectType as string | undefined,
    features: (apiResponse.features as string[]) || [],
    technologies: (apiResponse.technologies as string[]) || []
  };
}

/**
 * Health check for agent swarms module
 */
export async function healthCheck(): Promise<{ status: string; message: string }> {
  const response = await apiClient.get<{ status: string; message: string }>(`${BASE_URL}/health`);
  return response.data;
}

/**
 * Create a new agent swarm project
 */
export async function createProject(projectConfig: CreateProjectRequest): Promise<AgentSwarmProject> {
  const response = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/orchestrate`, projectConfig);
  return transformProject(response.data);
}

/**
 * Get all projects for the current user
 */
export async function getAllProjects(): Promise<AgentSwarmProject[]> {
  try {
    const response = await apiClient.get<{ projects?: Record<string, unknown>[]; data?: Record<string, unknown>[] }>(`${BASE_URL}/projects`);
    const projects = response.data.projects || response.data.data || [];
    return projects.map(transformProject);
  } catch (error) {
    console.error('Failed to get projects:', error);
    return [];
  }
}

/**
 * Get details for a specific project
 */
export async function getProject(projectId: string): Promise<AgentSwarmProject> {
  const response = await apiClient.get<Record<string, unknown>>(`${BASE_URL}/projects/${projectId}`);
  return transformProject(response.data);
}

/**
 * Get real-time status for a project
 */
export async function getProjectStatus(projectId: string): Promise<{
  status: string;
  progress: number;
  stage: string;
  updated_at: string;
}> {
  const response = await apiClient.get<{ status: string; progress: number; stage: string; updated_at: string }>(`${BASE_URL}/projects/${projectId}/status`);
  return response.data;
}

/**
 * Get agents working on a project
 */
export async function getProjectAgents(projectId: string): Promise<AgentStatus[]> {
  try {
    const response = await apiClient.get<{ agents?: AgentStatus[] }>(`${BASE_URL}/projects/${projectId}/agents`);
    return response.data.agents || [];
  } catch (error) {
    console.error(`Failed to get agents for project ${projectId}:`, error);
    return [];
  }
}

/**
 * Stop a running project
 */
export async function stopProject(projectId: string): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(`${BASE_URL}/projects/${projectId}/stop`);
  return response.data;
}

/**
 * Restart a paused or failed project
 */
export async function restartProject(projectId: string): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(`${BASE_URL}/projects/${projectId}/restart`);
  return response.data;
}

/**
 * Get project logs
 */
export async function getProjectLogs(projectId: string, limit: number = 100): Promise<ProjectLog[]> {
  try {
    const response = await apiClient.get<{ logs?: ProjectLog[] }>(`${BASE_URL}/projects/${projectId}/logs?limit=${limit}`);
    return response.data.logs || [];
  } catch (error) {
    console.error(`Failed to get logs for project ${projectId}:`, error);
    return [];
  }
}

/**
 * Get metrics for all agent swarm projects
 */
export async function getMetrics(): Promise<ProjectMetrics> {
  const response = await apiClient.get<ProjectMetrics>(`${BASE_URL}/metrics`);
  return response.data;
}

/**
 * Get GitHub integration status for a project
 */
export async function getProjectGitHubStatus(projectId: string): Promise<GitHubStatus> {
  try {
    const response = await apiClient.get<GitHubStatus>(`${BASE_URL}/projects/${projectId}/github`);
    return response.data;
  } catch (error) {
    // Handle 404 gracefully - project may not have GitHub integration
    console.log(`Project ${projectId} may not have GitHub integration`);
    return {};
  }
}

// Default export as object for backward compatibility
const agentSwarmService = {
  healthCheck,
  createProject,
  getAllProjects,
  getProject,
  getProjectStatus,
  getProjectAgents,
  stopProject,
  restartProject,
  getProjectLogs,
  getMetrics,
  getProjectGitHubStatus,
};

export default agentSwarmService;
