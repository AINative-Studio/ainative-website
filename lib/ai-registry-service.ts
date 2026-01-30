/**
 * AI Registry Service
 * Handles all AI model registry, usage analytics, and orchestration API calls
 *
 * Backend API Endpoints Reference:
 * - /v1/public/ai-usage/aggregate - Usage summary/aggregation
 * - /v1/public/ai-usage/costs - Cost data
 * - /v1/public/ai-usage/export - Export usage data
 * - /v1/public/ai-usage/logs - Usage logs
 * - /v1/public/ai-usage/requests - Usage requests
 * - /v1/public/ai-context/contexts - Context loading
 * - /v1/public/ai-context/conversations - Conversation contexts
 * - /v1/public/ai-orchestration/requests - Orchestration requests
 * - /v1/public/multi-model/models - Model listing
 * - /v1/public/multi-model/providers - Provider listing
 */

import apiClient from './api-client';

// Type definitions for AI Model Registry
export interface AIModel {
  id: number;
  name: string;
  provider: string;
  model_identifier: string;
  capabilities: string[];
  is_default: boolean;
  max_tokens: number;
  created_at: string;
  updated_at?: string;
  usage_count?: number;
}

export interface ModelsResponse {
  models: AIModel[];
  total: number;
}

export interface RegisterModelData {
  name: string;
  provider: string;
  model_identifier: string;
  capabilities: string[];
  max_tokens: number;
  api_key?: string;
}

export interface SwitchModelResponse {
  message: string;
  previous_default_id: number;
  new_default_id: number;
}

// Type definitions for Usage Analytics
export interface UsagePeriod {
  start_date: string;
  end_date: string;
}

export interface ProviderUsage {
  provider: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface UsageSummary {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  period: UsagePeriod;
  by_provider: ProviderUsage[];
}

export interface UsageQueryParams {
  start_date?: string;
  end_date?: string;
}

export interface ModelUsage {
  model_id: number;
  model_name: string;
  provider: string;
  requests: number;
  tokens: number;
  cost: number;
  avg_tokens_per_request: number;
}

export interface UsageByModelResponse {
  usage: ModelUsage[];
  total: number;
}

export interface DailyUsageEntry {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface DailyUsageResponse {
  daily_usage: DailyUsageEntry[];
  period: UsagePeriod;
}

export interface ExportUsageParams {
  start_date?: string;
  end_date?: string;
  format?: string;
  include_models?: boolean;
}

export interface ExportResponse {
  export_id: string;
  download_url: string;
  format: string;
  created_at: string;
  expires_at: string;
}

// Type definitions for AI Context
export interface ContextQuery {
  query: string;
  max_results: number;
  filters?: Record<string, unknown>;
}

export interface ContextResult {
  id: string;
  content: string;
  relevance_score: number;
  source: string;
}

export interface ContextResponse {
  contexts: ContextResult[];
  query: string;
  total_results: number;
}

// Type definitions for Multi-Model Inference
export interface MultiModelInferenceRequest {
  prompt: string;
  model_ids: number[];
  strategy: string;
  consensus_threshold?: number;
}

export interface InferenceResult {
  model_id: number;
  model_name: string;
  response: string;
  tokens_used: number;
  latency_ms: number;
}

export interface MultiModelInferenceResponse {
  request_id: string;
  results: InferenceResult[];
  strategy_used: string;
  total_latency_ms: number;
  total_tokens: number;
  consensus_result?: string;
  consensus_confidence?: number;
}

/**
 * AI Registry Service class
 */
class AIRegistryService {
  // ===== AI Model Registry Endpoints =====

  /**
   * List all registered AI models
   * Backend endpoint: GET /v1/public/multi-model/models
   * Note: Response structure may differ from frontend interface
   */
  async listModels(): Promise<ModelsResponse> {
    const response = await apiClient.get<ModelsResponse>('/v1/public/multi-model/models');
    return response.data;
  }

  /**
   * Register a new AI model
   * Backend endpoint: POST /v1/public/multi-model/models
   * Note: Response structure may differ from frontend interface
   */
  async registerModel(data: RegisterModelData): Promise<AIModel> {
    const response = await apiClient.post<AIModel>('/v1/public/multi-model/models', data);
    return response.data;
  }

  /**
   * Get model details by ID
   * Backend endpoint: GET /v1/public/multi-model/models/{id}
   * Note: Response structure may differ from frontend interface
   */
  async getModelDetails(id: number): Promise<AIModel> {
    const response = await apiClient.get<AIModel>(`/v1/public/multi-model/models/${id}`);
    return response.data;
  }

  /**
   * Switch the default AI model
   * Backend endpoint: POST /v1/public/multi-model/models/{id}/switch
   * TODO: Verify this endpoint exists on the backend - may need adjustment
   * Note: Response structure may differ from frontend interface
   */
  async switchDefaultModel(id: number): Promise<SwitchModelResponse> {
    const response = await apiClient.post<SwitchModelResponse>(
      `/v1/public/multi-model/models/${id}/switch`,
      {}
    );
    return response.data;
  }

  // ===== Usage Analytics Endpoints =====

  /**
   * Get usage summary with optional date range
   * Backend endpoint: GET /v1/public/ai-usage/aggregate
   * Note: Response structure may differ - backend returns aggregate data
   */
  async getUsageSummary(params: UsageQueryParams = {}): Promise<UsageSummary> {
    const queryParams = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    );
    const endpoint = queryParams.toString()
      ? `/v1/public/ai-usage/aggregate?${queryParams.toString()}`
      : '/v1/public/ai-usage/aggregate';
    const response = await apiClient.get<UsageSummary>(endpoint);
    return response.data;
  }

  /**
   * Get usage breakdown by model
   * TODO: No direct backend endpoint for model-specific usage breakdown
   * Using /v1/public/ai-usage/costs as closest alternative
   * Note: Response structure may differ significantly - may need data transformation
   */
  async getUsageByModel(params: UsageQueryParams = {}): Promise<UsageByModelResponse> {
    const queryParams = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    );
    const endpoint = queryParams.toString()
      ? `/v1/public/ai-usage/costs?${queryParams.toString()}`
      : '/v1/public/ai-usage/costs';
    const response = await apiClient.get<UsageByModelResponse>(endpoint);
    return response.data;
  }

  /**
   * Get daily usage trends
   * TODO: No direct backend endpoint for daily usage trends
   * Using /v1/public/ai-usage/logs as closest alternative
   * Note: Response structure will differ - backend returns logs, not daily aggregates
   * Frontend may need to aggregate log data by date for daily trends
   */
  async getDailyUsage(params: UsageQueryParams = {}): Promise<DailyUsageResponse> {
    const queryParams = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    );
    const endpoint = queryParams.toString()
      ? `/v1/public/ai-usage/logs?${queryParams.toString()}`
      : '/v1/public/ai-usage/logs';
    const response = await apiClient.get<DailyUsageResponse>(endpoint);
    return response.data;
  }

  /**
   * Export usage data
   * Backend endpoint: POST /v1/public/ai-usage/export
   * Note: Response structure may differ from frontend interface
   */
  async exportUsageData(params: ExportUsageParams): Promise<ExportResponse> {
    const response = await apiClient.post<ExportResponse>('/v1/public/ai-usage/export', params);
    return response.data;
  }

  // ===== AI Context Endpoints =====

  /**
   * Load context from vector database
   * Backend endpoint: POST /v1/public/ai-context/contexts
   * Note: Response structure may differ from frontend interface
   */
  async loadContext(query: ContextQuery): Promise<ContextResponse> {
    const response = await apiClient.post<ContextResponse>('/v1/public/ai-context/contexts', query);
    return response.data;
  }

  // ===== AI Orchestration Endpoints =====

  /**
   * Perform multi-model inference
   * Backend endpoint: POST /v1/public/ai-orchestration/requests
   * Note: Response structure may differ from frontend interface
   */
  async multiModelInference(request: MultiModelInferenceRequest): Promise<MultiModelInferenceResponse> {
    const response = await apiClient.post<MultiModelInferenceResponse>(
      '/v1/public/ai-orchestration/requests',
      request
    );
    return response.data;
  }
}

// Export singleton instance
export const aiRegistryService = new AIRegistryService();
