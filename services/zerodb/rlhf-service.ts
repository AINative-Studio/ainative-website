import apiClient from '../../utils/apiClient';

export interface RLHFDataset {
  id: string;
  name: string;
  description: string;
  dataset_type: 'conversation' | 'instruction' | 'preference' | 'reward';
  format: 'json' | 'jsonl' | 'parquet' | 'csv';
  size_mb: number;
  record_count: number;
  split_ratios: {
    train: number;
    validation: number;
    test: number;
  };
  quality_score?: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  tags?: string[];
  status: string;
}

export interface RLHFDatasetCreateRequest {
  name: string;
  description: string;
  dataset_type: 'conversation' | 'instruction' | 'preference' | 'reward';
  format?: 'json' | 'jsonl' | 'parquet' | 'csv';
  data?: any[];
  file_url?: string;
  split_ratios?: {
    train: number;
    validation: number;
    test: number;
  };
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface TrainingJob {
  id: string;
  name: string;
  model_name: string;
  model_type: 'llm' | 'embedding' | 'classifier' | 'reward_model';
  training_type: 'supervised' | 'reinforcement' | 'dpo' | 'rlhf';
  dataset_id: string;
  base_model?: string;
  hyperparameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_epoch?: number;
  total_epochs?: number;
  training_loss?: number;
  validation_loss?: number;
  metrics?: Record<string, number>;
  resource_usage?: {
    gpu_hours: number;
    compute_cost: number;
    memory_gb: number;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  checkpoints?: string[];
  final_model_path?: string;
}

export interface TrainingJobCreateRequest {
  name: string;
  model_name: string;
  model_type: 'llm' | 'embedding' | 'classifier' | 'reward_model';
  training_type: 'supervised' | 'reinforcement' | 'dpo' | 'rlhf';
  dataset_id: string;
  base_model?: string;
  hyperparameters?: Record<string, any>;
  resource_requirements?: {
    gpu_type?: string;
    gpu_count?: number;
    memory_gb?: number;
    max_training_time_hours?: number;
  };
}

export interface ModelEvaluation {
  id: string;
  model_id: string;
  job_id: string;
  evaluation_type: 'accuracy' | 'perplexity' | 'bleu' | 'rouge' | 'human_preference';
  benchmark_dataset: string;
  score: number;
  detailed_scores?: Record<string, number>;
  comparison_models?: Array<{ model_name: string; score: number }>;
  evaluation_config: Record<string, any>;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface HumanFeedback {
  id: string;
  dataset_id: string;
  prompt: string;
  response_a: string;
  response_b: string;
  preference: 'a' | 'b' | 'tie';
  confidence: number;
  feedback_text?: string;
  annotator_id: string;
  quality_score?: number;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface HumanFeedbackCreateRequest {
  dataset_id: string;
  prompt: string;
  response_a: string;
  response_b: string;
  preference: 'a' | 'b' | 'tie';
  confidence: number;
  feedback_text?: string;
  metadata?: Record<string, any>;
}

export class RLHFService {
  private static readonly BASE_PATH = '/v1/public/zerodb/rlhf';
  private static readonly TRAINING_PATH = '/v1/public/zerodb/training';

  // RLHF Dataset Management
  static async getDatasets(): Promise<RLHFDataset[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/datasets`);
      return response.data as RLHFDataset[];
    } catch (error: any) {
      throw new Error(`Failed to fetch RLHF datasets: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createDataset(request: RLHFDatasetCreateRequest): Promise<RLHFDataset> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/datasets`, request);
      return response.data as RLHFDataset;
    } catch (error: any) {
      throw new Error(`Failed to create RLHF dataset: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getDataset(datasetId: string): Promise<RLHFDataset> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/datasets/${datasetId}`);
      return response.data as RLHFDataset;
    } catch (error: any) {
      throw new Error(`Failed to fetch RLHF dataset: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateDataset(datasetId: string, updates: Partial<RLHFDatasetCreateRequest>): Promise<RLHFDataset> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/datasets/${datasetId}`, updates);
      return response.data as RLHFDataset;
    } catch (error: any) {
      throw new Error(`Failed to update RLHF dataset: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteDataset(datasetId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/datasets/${datasetId}`);
    } catch (error: any) {
      throw new Error(`Failed to delete RLHF dataset: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Dataset Operations
  static async uploadDataset(datasetId: string, file: File): Promise<{ upload_status: string; records_processed: number }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`${this.BASE_PATH}/datasets/${datasetId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as { upload_status: string; records_processed: number };
    } catch (error: any) {
      throw new Error(`Dataset upload failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async validateDataset(datasetId: string): Promise<{
    is_valid: boolean;
    issues: Array<{ type: string; message: string; severity: string }>;
    quality_score: number;
    recommendations: string[];
  }> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/datasets/${datasetId}/validate`);
      return response.data as {
        is_valid: boolean;
        issues: Array<{ type: string; message: string; severity: string }>;
        quality_score: number;
        recommendations: string[];
      };
    } catch (error: any) {
      throw new Error(`Dataset validation failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async previewDataset(datasetId: string, limit: number = 10): Promise<{ records: any[]; total_count: number }> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/datasets/${datasetId}/preview`, {
        params: { limit }
      } as any);
      return response.data as { records: any[]; total_count: number };
    } catch (error: any) {
      throw new Error(`Failed to preview dataset: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Training Job Management
  static async getTrainingJobs(): Promise<TrainingJob[]> {
    try {
      const response = await apiClient.get(`${this.TRAINING_PATH}/jobs`);
      return response.data as TrainingJob[];
    } catch (error: any) {
      throw new Error(`Failed to fetch training jobs: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createTrainingJob(request: TrainingJobCreateRequest): Promise<TrainingJob> {
    try {
      const response = await apiClient.post(`${this.TRAINING_PATH}/jobs`, request);
      return response.data as TrainingJob;
    } catch (error: any) {
      throw new Error(`Failed to create training job: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getTrainingJob(jobId: string): Promise<TrainingJob> {
    try {
      const response = await apiClient.get(`${this.TRAINING_PATH}/jobs/${jobId}`);
      return response.data as TrainingJob;
    } catch (error: any) {
      throw new Error(`Failed to fetch training job: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async cancelTrainingJob(jobId: string): Promise<void> {
    try {
      await apiClient.post(`${this.TRAINING_PATH}/jobs/${jobId}/cancel`);
    } catch (error: any) {
      throw new Error(`Failed to cancel training job: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async pauseTrainingJob(jobId: string): Promise<void> {
    try {
      await apiClient.post(`${this.TRAINING_PATH}/jobs/${jobId}/pause`);
    } catch (error: any) {
      throw new Error(`Failed to pause training job: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async resumeTrainingJob(jobId: string): Promise<void> {
    try {
      await apiClient.post(`${this.TRAINING_PATH}/jobs/${jobId}/resume`);
    } catch (error: any) {
      throw new Error(`Failed to resume training job: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Training Monitoring
  static async getTrainingLogs(jobId: string, limit?: number): Promise<{ logs: string[]; has_more: boolean }> {
    try {
      const params = limit ? { limit } : {};
      const response = await apiClient.get(`${this.TRAINING_PATH}/jobs/${jobId}/logs`, { params } as any);
      return response.data as { logs: string[]; has_more: boolean };
    } catch (error: any) {
      throw new Error(`Failed to fetch training logs: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getTrainingMetrics(jobId: string): Promise<{
    training_loss: number[];
    validation_loss: number[];
    learning_rate: number[];
    epochs: number[];
    timestamps: string[];
    custom_metrics: Record<string, number[]>;
  }> {
    try {
      const response = await apiClient.get(`${this.TRAINING_PATH}/jobs/${jobId}/metrics`);
      return response.data as {
        training_loss: number[];
        validation_loss: number[];
        learning_rate: number[];
        epochs: number[];
        timestamps: string[];
        custom_metrics: Record<string, number[]>;
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch training metrics: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Model Evaluation
  static async evaluateModel(
    modelId: string,
    benchmarkDataset: string,
    evaluationType: string
  ): Promise<ModelEvaluation> {
    try {
      const response = await apiClient.post(`${this.TRAINING_PATH}/models/${modelId}/evaluate`, {
        benchmark_dataset: benchmarkDataset,
        evaluation_type: evaluationType
      });
      return response.data as ModelEvaluation;
    } catch (error: any) {
      throw new Error(`Model evaluation failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getModelEvaluations(modelId: string): Promise<ModelEvaluation[]> {
    try {
      const response = await apiClient.get(`${this.TRAINING_PATH}/models/${modelId}/evaluations`);
      return response.data as ModelEvaluation[];
    } catch (error: any) {
      throw new Error(`Failed to fetch model evaluations: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Human Feedback Management
  static async getHumanFeedback(datasetId?: string): Promise<HumanFeedback[]> {
    try {
      const params = datasetId ? { dataset_id: datasetId } : {};
      const response = await apiClient.get(`${this.BASE_PATH}/feedback`, { params } as any);
      return response.data as HumanFeedback[];
    } catch (error: any) {
      throw new Error(`Failed to fetch human feedback: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createHumanFeedback(request: HumanFeedbackCreateRequest): Promise<HumanFeedback> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/feedback`, request);
      return response.data as HumanFeedback;
    } catch (error: any) {
      throw new Error(`Failed to create human feedback: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateHumanFeedback(feedbackId: string, updates: Partial<HumanFeedbackCreateRequest>): Promise<HumanFeedback> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/feedback/${feedbackId}`, updates);
      return response.data as HumanFeedback;
    } catch (error: any) {
      throw new Error(`Failed to update human feedback: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteHumanFeedback(feedbackId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/feedback/${feedbackId}`);
    } catch (error: any) {
      throw new Error(`Failed to delete human feedback: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Reward Model Training
  static async trainRewardModel(
    datasetId: string,
    baseModel: string,
    hyperparameters?: Record<string, any>
  ): Promise<TrainingJob> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/reward-model/train`, {
        dataset_id: datasetId,
        base_model: baseModel,
        hyperparameters
      });
      return response.data as TrainingJob;
    } catch (error: any) {
      throw new Error(`Reward model training failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // RLHF Training Pipeline
  static async startRLHFPipeline(
    modelName: string,
    baseModel: string,
    supervisedDatasetId: string,
    preferenceDatasetId: string,
    config?: {
      sft_epochs?: number;
      reward_model_epochs?: number;
      ppo_epochs?: number;
      hyperparameters?: Record<string, any>;
    }
  ): Promise<{ pipeline_id: string; jobs: TrainingJob[] }> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/pipeline/start`, {
        model_name: modelName,
        base_model: baseModel,
        supervised_dataset_id: supervisedDatasetId,
        preference_dataset_id: preferenceDatasetId,
        config
      });
      return response.data as { pipeline_id: string; jobs: TrainingJob[] };
    } catch (error: any) {
      throw new Error(`RLHF pipeline start failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getRLHFPipelineStatus(pipelineId: string): Promise<{
    pipeline_id: string;
    status: string;
    current_stage: string;
    jobs: TrainingJob[];
    overall_progress: number;
  }> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/pipeline/${pipelineId}`);
      return response.data as {
        pipeline_id: string;
        status: string;
        current_stage: string;
        jobs: TrainingJob[];
        overall_progress: number;
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch RLHF pipeline status: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Model Deployment
  static async deployModel(
    modelId: string,
    deployment_config?: {
      instance_type?: string;
      min_instances?: number;
      max_instances?: number;
      auto_scaling?: boolean;
    }
  ): Promise<{ deployment_id: string; endpoint_url: string; status: string }> {
    try {
      const response = await apiClient.post(`${this.TRAINING_PATH}/models/${modelId}/deploy`, deployment_config || {});
      return response.data as { deployment_id: string; endpoint_url: string; status: string };
    } catch (error: any) {
      throw new Error(`Model deployment failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getDeployedModels(): Promise<Array<{
    deployment_id: string;
    model_id: string;
    model_name: string;
    endpoint_url: string;
    status: string;
    instance_count: number;
    deployed_at: string;
  }>> {
    try {
      const response = await apiClient.get(`${this.TRAINING_PATH}/deployments`);
      return response.data as Array<{
        deployment_id: string;
        model_id: string;
        model_name: string;
        endpoint_url: string;
        status: string;
        instance_count: number;
        deployed_at: string;
      }>;
    } catch (error: any) {
      throw new Error(`Failed to fetch deployed models: ${error.response?.data?.detail || error.message}`);
    }
  }
}