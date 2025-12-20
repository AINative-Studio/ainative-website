/**
 * Quantum Service - Backend integration for Quantum Computing Dashboard
 * Integrates with quantum computing endpoints for job management and circuit execution
 */

import apiClient from './api-client';

// Types
export interface QuantumJob {
  id: string;
  name: string;
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  backendId: string;
  backendName: string;
  backendType: 'simulator' | 'hardware';
  circuitId?: string;
  circuitCode?: string;
  qubits: number;
  shots: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  results?: QuantumJobResults;
  error?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface QuantumJobResults {
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  measurements: number[][];
  metadata: {
    executionTime: number;
    queueTime: number;
    circuitDepth: number;
    gateCount: number;
  };
}

export interface QuantumBackend {
  id: string;
  name: string;
  provider: 'ibm' | 'rigetti' | 'ionq' | 'simulator';
  type: 'simulator' | 'hardware';
  status: 'online' | 'offline' | 'maintenance';
  qubits: number;
  connectivity: string[][];
  features: string[];
  queueDepth: number;
  avgWaitTime?: number;
  costPerShot?: number;
  description: string;
  capabilities: {
    maxQubits: number;
    maxShots: number;
    supportedGates: string[];
    hasErrorCorrection: boolean;
    fidelity?: number;
  };
}

export interface QuantumCircuit {
  id: string;
  name: string;
  description: string;
  qubits: number;
  depth: number;
  gates: QuantumGate[];
  code: string;
  codeFormat: 'qasm' | 'qiskit' | 'cirq' | 'quil';
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPublic: boolean;
}

export interface QuantumGate {
  type: string;
  qubits: number[];
  parameters?: number[];
}

export interface CreateJobRequest {
  name: string;
  backendId: string;
  circuitId?: string;
  circuitCode?: string;
  codeFormat?: 'qasm' | 'qiskit' | 'cirq' | 'quil';
  qubits: number;
  shots: number;
  optimization?: {
    level: 0 | 1 | 2 | 3;
    transpile: boolean;
  };
}

export interface CreateCircuitRequest {
  name: string;
  description?: string;
  code: string;
  codeFormat: 'qasm' | 'qiskit' | 'cirq' | 'quil';
  qubits: number;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateCircuitRequest {
  name?: string;
  description?: string;
  code?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface JobStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  totalShots: number;
  totalCost: number;
  avgExecutionTime: number;
  successRate: number;
}

// Quantum Service
const quantumService = {
  /**
   * Get list of all quantum jobs
   */
  async getJobs(params?: {
    status?: string;
    backendId?: string;
    limit?: number;
    offset?: number;
  }): Promise<QuantumJob[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.backendId) queryParams.append('backendId', params.backendId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString() ? `?${queryParams}` : '';
    const response = await apiClient.get<{ jobs: QuantumJob[] }>(`/v1/quantum/jobs${query}`);
    return response.data.jobs || [];
  },

  /**
   * Submit a new quantum job
   */
  async createJob(request: CreateJobRequest): Promise<QuantumJob> {
    const response = await apiClient.post<QuantumJob>('/v1/quantum/jobs', request);
    return response.data;
  },

  /**
   * Get job status and results
   */
  async getJob(jobId: string): Promise<QuantumJob> {
    const response = await apiClient.get<QuantumJob>(`/v1/quantum/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Cancel a running job
   */
  async cancelJob(jobId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(`/v1/quantum/jobs/${jobId}/cancel`);
    return response.data;
  },

  /**
   * Delete a job
   */
  async deleteJob(jobId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/v1/quantum/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Get available quantum backends
   */
  async getBackends(params?: {
    type?: 'simulator' | 'hardware';
    provider?: string;
    status?: 'online' | 'offline' | 'maintenance';
  }): Promise<QuantumBackend[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.provider) queryParams.append('provider', params.provider);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString() ? `?${queryParams}` : '';
    const response = await apiClient.get<{ backends: QuantumBackend[] }>(`/v1/quantum/backends${query}`);
    return response.data.backends || [];
  },

  /**
   * Get backend details
   */
  async getBackend(backendId: string): Promise<QuantumBackend> {
    const response = await apiClient.get<QuantumBackend>(`/v1/quantum/backends/${backendId}`);
    return response.data;
  },

  /**
   * Get saved circuits
   */
  async getCircuits(params?: {
    isPublic?: boolean;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<QuantumCircuit[]> {
    const queryParams = new URLSearchParams();
    if (params?.isPublic !== undefined) queryParams.append('isPublic', params.isPublic.toString());
    if (params?.tags) queryParams.append('tags', params.tags.join(','));
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString() ? `?${queryParams}` : '';
    const response = await apiClient.get<{ circuits: QuantumCircuit[] }>(`/v1/quantum/circuits${query}`);
    return response.data.circuits || [];
  },

  /**
   * Get circuit details
   */
  async getCircuit(circuitId: string): Promise<QuantumCircuit> {
    const response = await apiClient.get<QuantumCircuit>(`/v1/quantum/circuits/${circuitId}`);
    return response.data;
  },

  /**
   * Save a new circuit
   */
  async createCircuit(request: CreateCircuitRequest): Promise<QuantumCircuit> {
    const response = await apiClient.post<QuantumCircuit>('/v1/quantum/circuits', request);
    return response.data;
  },

  /**
   * Update an existing circuit
   */
  async updateCircuit(circuitId: string, request: UpdateCircuitRequest): Promise<QuantumCircuit> {
    const response = await apiClient.put<QuantumCircuit>(`/v1/quantum/circuits/${circuitId}`, request);
    return response.data;
  },

  /**
   * Delete a circuit
   */
  async deleteCircuit(circuitId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/v1/quantum/circuits/${circuitId}`);
    return response.data;
  },

  /**
   * Get job statistics
   */
  async getJobStats(params?: {
    startDate?: string;
    endDate?: string;
    backendId?: string;
  }): Promise<JobStats> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.backendId) queryParams.append('backendId', params.backendId);

    const query = queryParams.toString() ? `?${queryParams}` : '';
    const response = await apiClient.get<JobStats>(`/v1/quantum/jobs/stats${query}`);
    return response.data;
  },

  /**
   * Validate circuit code
   */
  async validateCircuit(code: string, codeFormat: string): Promise<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
    qubits?: number;
    depth?: number;
  }> {
    const response = await apiClient.post<{
      valid: boolean;
      errors?: string[];
      warnings?: string[];
      qubits?: number;
      depth?: number;
    }>('/v1/quantum/circuits/validate', { code, codeFormat });
    return response.data;
  },
};

export default quantumService;
