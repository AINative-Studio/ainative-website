/**
 * Sandbox Service - Backend integration for API Sandbox
 * Integrates with all backend sandbox endpoints
 *
 * NOTE: Currently only /v1/public/sandbox/environments is implemented on the backend.
 * Other endpoints (create, execute, history) return graceful errors until implemented.
 */

import apiClient from './api-client';

// Base path for sandbox API endpoints
const SANDBOX_BASE_PATH = '/v1/public/sandbox';

// Types
export interface SandboxEnvironment {
  id: string;
  name: string;
  language: string;
  version: string;
  description: string;
  available: boolean;
  timeout: number; // seconds
  memoryLimit: number; // MB
}

export interface Sandbox {
  id: string;
  environmentId: string;
  status: 'creating' | 'ready' | 'running' | 'stopped' | 'error';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  expiresAt?: string;
  metadata?: {
    name?: string;
    description?: string;
    tags?: string[];
  };
}

export interface ExecutionRequest {
  code: string;
  input?: string;
  timeout?: number;
  environment?: {
    variables?: Record<string, string>;
  };
}

export interface ExecutionResult {
  executionId: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  output?: string;
  error?: string;
  exitCode?: number;
  executionTime: number; // milliseconds
  memoryUsed?: number; // MB
  timestamp: string;
}

export interface CreateSandboxRequest {
  environmentId: string;
  name?: string;
  description?: string;
  tags?: string[];
  ttl?: number; // seconds
}

// API Service
const sandboxService = {
  /**
   * List available sandbox environments
   * GET /v1/public/sandbox/environments
   */
  async listEnvironments(): Promise<SandboxEnvironment[]> {
    try {
      const response = await apiClient.get<SandboxEnvironment[]>(`${SANDBOX_BASE_PATH}/environments`);
      return response.data;
    } catch (error) {
      console.error('Failed to list sandbox environments:', error);
      throw error;
    }
  },

  /**
   * Create a new sandbox environment
   * POST /v1/public/sandbox/create
   *
   * TODO: Backend endpoint not yet implemented. Returns mock response.
   * Remove mock when backend endpoint is available.
   */
  async createSandbox(request: CreateSandboxRequest): Promise<Sandbox> {
    // TODO: Uncomment when backend endpoint is implemented
    // try {
    //   const response = await apiClient.post<Sandbox>(`${SANDBOX_BASE_PATH}/create`, request);
    //   return response.data;
    // } catch (error) {
    //   console.error('Failed to create sandbox:', error);
    //   throw error;
    // }

    // Return mock sandbox until backend is implemented
    console.warn('Sandbox creation endpoint not yet implemented. Returning mock response.');
    return {
      id: `sandbox-${Date.now()}`,
      environmentId: request.environmentId,
      status: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'demo-user',
      metadata: {
        name: request.name,
        description: request.description,
        tags: request.tags,
      },
    };
  },

  /**
   * Get sandbox status and details
   * GET /v1/public/sandbox/{sandbox_id}
   *
   * TODO: Backend endpoint not yet implemented. Returns mock response.
   * Remove mock when backend endpoint is available.
   */
  async getSandbox(sandboxId: string): Promise<Sandbox> {
    // TODO: Uncomment when backend endpoint is implemented
    // try {
    //   const response = await apiClient.get<Sandbox>(`${SANDBOX_BASE_PATH}/${sandboxId}`);
    //   return response.data;
    // } catch (error) {
    //   console.error(`Failed to get sandbox ${sandboxId}:`, error);
    //   throw error;
    // }

    // Return mock sandbox until backend is implemented
    console.warn(`Get sandbox endpoint not yet implemented. Returning mock response for ${sandboxId}.`);
    return {
      id: sandboxId,
      environmentId: 'python-3.11',
      status: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'demo-user',
    };
  },

  /**
   * Delete a sandbox environment
   * DELETE /v1/public/sandbox/{sandbox_id}
   *
   * TODO: Backend endpoint not yet implemented. Returns success silently.
   * Remove mock when backend endpoint is available.
   */
  async deleteSandbox(sandboxId: string): Promise<void> {
    // TODO: Uncomment when backend endpoint is implemented
    // try {
    //   await apiClient.delete(`${SANDBOX_BASE_PATH}/${sandboxId}`);
    // } catch (error) {
    //   console.error(`Failed to delete sandbox ${sandboxId}:`, error);
    //   throw error;
    // }

    // No-op until backend is implemented
    console.warn(`Delete sandbox endpoint not yet implemented. Sandbox ${sandboxId} not deleted.`);
  },

  /**
   * Execute code in a sandbox
   * POST /v1/public/sandbox/{sandbox_id}/execute
   *
   * TODO: Backend endpoint not yet implemented. Returns mock execution result.
   * Remove mock when backend endpoint is available.
   */
  async execute(sandboxId: string, request: ExecutionRequest): Promise<ExecutionResult> {
    // TODO: Uncomment when backend endpoint is implemented
    // try {
    //   const response = await apiClient.post<ExecutionResult>(
    //     `${SANDBOX_BASE_PATH}/${sandboxId}/execute`,
    //     request
    //   );
    //   return response.data;
    // } catch (error) {
    //   console.error(`Failed to execute code in sandbox ${sandboxId}:`, error);
    //   throw error;
    // }

    // Return mock execution result until backend is implemented
    console.warn(`Execute endpoint not yet implemented. Returning mock result for sandbox ${sandboxId}.`);
    return {
      executionId: `exec-${Date.now()}`,
      status: 'completed',
      output: '# Code execution is not yet available.\n# The sandbox execute endpoint is under development.',
      executionTime: 0,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Get execution history for a sandbox
   * GET /v1/public/sandbox/{sandbox_id}/history
   *
   * TODO: Backend endpoint not yet implemented. Returns empty history.
   * Remove mock when backend endpoint is available.
   */
  async getExecutionHistory(sandboxId: string, limit = 20): Promise<ExecutionResult[]> {
    // TODO: Uncomment when backend endpoint is implemented
    // try {
    //   const response = await apiClient.get<ExecutionResult[]>(
    //     `${SANDBOX_BASE_PATH}/${sandboxId}/history?limit=${limit}`
    //   );
    //   return response.data;
    // } catch (error) {
    //   console.error(`Failed to get execution history for sandbox ${sandboxId}:`, error);
    //   throw error;
    // }

    // Return empty history until backend is implemented
    console.warn(`Execution history endpoint not yet implemented. Returning empty history for sandbox ${sandboxId}. (limit: ${limit})`);
    return [];
  },
};

export default sandboxService;
