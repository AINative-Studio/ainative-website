/**
 * Sandbox Service - Backend integration for API Sandbox
 * Integrates with all backend sandbox endpoints
 */

import apiClient from './api-client';

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
      const response = await apiClient.get<SandboxEnvironment[]>('/v1/public/sandbox/environments');
      return response.data;
    } catch (error) {
      console.error('Failed to list sandbox environments:', error);
      throw error;
    }
  },

  /**
   * Create a new sandbox environment
   * POST /v1/public/sandbox/create
   */
  async createSandbox(request: CreateSandboxRequest): Promise<Sandbox> {
    try {
      const response = await apiClient.post<Sandbox>('/v1/public/sandbox/create', request);
      return response.data;
    } catch (error) {
      console.error('Failed to create sandbox:', error);
      throw error;
    }
  },

  /**
   * Get sandbox status and details
   * GET /v1/public/sandbox/{sandbox_id}
   */
  async getSandbox(sandboxId: string): Promise<Sandbox> {
    try {
      const response = await apiClient.get<Sandbox>(`/v1/public/sandbox/${sandboxId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get sandbox ${sandboxId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a sandbox environment
   * DELETE /v1/public/sandbox/{sandbox_id}
   */
  async deleteSandbox(sandboxId: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/public/sandbox/${sandboxId}`);
    } catch (error) {
      console.error(`Failed to delete sandbox ${sandboxId}:`, error);
      throw error;
    }
  },

  /**
   * Execute code in a sandbox
   * POST /v1/public/sandbox/{sandbox_id}/execute
   */
  async execute(sandboxId: string, request: ExecutionRequest): Promise<ExecutionResult> {
    try {
      const response = await apiClient.post<ExecutionResult>(
        `/v1/public/sandbox/${sandboxId}/execute`,
        request
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to execute code in sandbox ${sandboxId}:`, error);
      throw error;
    }
  },

  /**
   * Get execution history for a sandbox
   * GET /v1/public/sandbox/{sandbox_id}/history
   */
  async getExecutionHistory(sandboxId: string, limit = 20): Promise<ExecutionResult[]> {
    try {
      const response = await apiClient.get<ExecutionResult[]>(
        `/v1/public/sandbox/${sandboxId}/history?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get execution history for sandbox ${sandboxId}:`, error);
      throw error;
    }
  },
};

export default sandboxService;
