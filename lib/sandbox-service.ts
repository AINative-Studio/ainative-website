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

// Default environments returned when the API is unavailable or the endpoint does
// not exist yet. These mirror the runtimes shown in the code-editor sample snippets.
const DEFAULT_ENVIRONMENTS: SandboxEnvironment[] = [
  {
    id: 'python-3.11',
    name: 'Python 3.11',
    language: 'python',
    version: '3.11',
    description: 'Python runtime with standard library and common AI/ML packages',
    available: true,
    timeout: 30,
    memoryLimit: 512,
  },
  {
    id: 'node-20',
    name: 'Node.js 20',
    language: 'javascript',
    version: '20',
    description: 'Node.js LTS runtime with npm package support',
    available: true,
    timeout: 30,
    memoryLimit: 512,
  },
  {
    id: 'rust-1.75',
    name: 'Rust 1.75',
    language: 'rust',
    version: '1.75',
    description: 'Rust stable toolchain for high-performance code',
    available: true,
    timeout: 60,
    memoryLimit: 1024,
  },
];

// API Service
const sandboxService = {
  /**
   * List available sandbox environments.
   * GET /v1/public/sandbox/environments
   *
   * Falls back to DEFAULT_ENVIRONMENTS when the endpoint is unavailable so
   * that the UI remains functional while the backend feature is under
   * development.
   */
  async listEnvironments(): Promise<SandboxEnvironment[]> {
    try {
      const response = await apiClient.get<SandboxEnvironment[]>('/api/v1/public/sandbox/environments');
      const data = response.data;
      // Guard against an empty or malformed response from the server.
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return DEFAULT_ENVIRONMENTS;
    } catch (error) {
      console.warn('Sandbox environments endpoint unavailable, using defaults:', error);
      return DEFAULT_ENVIRONMENTS;
    }
  },

  /**
   * Create a new sandbox environment
   * POST /v1/public/sandbox/create
   */
  async createSandbox(request: CreateSandboxRequest): Promise<Sandbox> {
    try {
      const response = await apiClient.post<Sandbox>('/api/v1/public/sandbox/create', request);
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
      const response = await apiClient.get(`/api/v1/public/sandbox/${sandboxId}`);
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
      await apiClient.delete(`/api/v1/public/sandbox/${sandboxId}`);
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
        `/api/v1/public/sandbox/${sandboxId}/execute`,
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
        `/api/v1/public/sandbox/${sandboxId}/history?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get execution history for sandbox ${sandboxId}:`, error);
      throw error;
    }
  },
};

export default sandboxService;
