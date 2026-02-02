/**
 * AI Registry Service
 * Handles all AI model registry, usage analytics, and orchestration API calls
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
 * Default models for fallback when API is unavailable
 */
const DEFAULT_MODELS: AIModel[] = [
  {
    id: 1,
    name: 'GPT-4 Turbo',
    provider: 'openai',
    model_identifier: 'gpt-4-turbo-preview',
    capabilities: ['text-generation', 'reasoning', 'code'],
    is_default: true,
    max_tokens: 128000,
    created_at: new Date().toISOString(),
    usage_count: 0,
  },
  {
    id: 2,
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    model_identifier: 'claude-3-opus-20240229',
    capabilities: ['text-generation', 'reasoning', 'vision', 'code'],
    is_default: false,
    max_tokens: 200000,
    created_at: new Date().toISOString(),
    usage_count: 0,
  },
];

/**
 * AI Registry Service class
 */
class AIRegistryService {
  // ===== AI Model Registry Endpoints =====

  /**
   * List all registered AI models
   * Returns default models if API is unavailable
   */
  async listModels(): Promise<ModelsResponse> {
    try {
      const response = await apiClient.get<ModelsResponse>('/v1/public/multi-model/models');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch AI models, using defaults:', error);
      return { models: DEFAULT_MODELS, total: DEFAULT_MODELS.length };
    }
  }

  /**
   * Register a new AI model
   * Throws descriptive error on failure
   */
  async registerModel(data: RegisterModelData): Promise<AIModel> {
    try {
      const response = await apiClient.post<AIModel>('/v1/public/multi-model/models', data);
      return response.data;
    } catch (error) {
      console.error('Failed to register AI model:', error);
      // Extract meaningful error message
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to register model. Please check your connection and try again.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get model details by ID
   */
  async getModelDetails(id: number): Promise<AIModel> {
    try {
      const response = await apiClient.get<AIModel>(`/v1/public/multi-model/models/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch model ${id}:`, error);
      // Return default model as fallback
      const defaultModel = DEFAULT_MODELS.find(m => m.id === id) || DEFAULT_MODELS[0];
      return defaultModel;
    }
  }

  /**
   * Switch the default AI model
   * Throws descriptive error on failure
   */
  async switchDefaultModel(id: number): Promise<SwitchModelResponse> {
    try {
      const response = await apiClient.post<SwitchModelResponse>(
        `/v1/public/multi-model/models/${id}/switch`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Failed to switch default model:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update default model. Please try again.';
      throw new Error(errorMessage);
    }
  }

  // ===== Usage Analytics Endpoints =====

  /**
   * Get usage summary with optional date range
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
      ? `/v1/public/ai-usage/by-model?${queryParams.toString()}`
      : '/v1/public/ai-usage/by-model';
    const response = await apiClient.get<UsageByModelResponse>(endpoint);
    return response.data;
  }

  /**
   * Get daily usage trends
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
      ? `/v1/public/ai-usage/daily?${queryParams.toString()}`
      : '/v1/public/ai-usage/daily';
    const response = await apiClient.get<DailyUsageResponse>(endpoint);
    return response.data;
  }

  /**
   * Export usage data
   */
  async exportUsageData(params: ExportUsageParams): Promise<ExportResponse> {
    const response = await apiClient.post<ExportResponse>('/v1/public/ai-usage/export', params);
    return response.data;
  }

  // ===== AI Context Endpoints =====

  /**
   * Load context from vector database
   */
  async loadContext(query: ContextQuery): Promise<ContextResponse> {
    const response = await apiClient.post<ContextResponse>('/v1/public/ai-context/contexts', query);
    return response.data;
  }

  // ===== AI Orchestration Endpoints =====

  /**
   * Perform multi-model inference
   */
  async multiModelInference(request: MultiModelInferenceRequest): Promise<MultiModelInferenceResponse> {
    const response = await apiClient.post<MultiModelInferenceResponse>(
      '/v1/public/multi-model/inference',
      request
    );
    return response.data;
  }
}

// Export singleton instance
export const aiRegistryService = new AIRegistryService();
