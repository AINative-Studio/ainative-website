import apiClient from '../../utils/apiClient';

export interface VectorCollection {
  id: string;
  name: string;
  dimension: number;
  distance_metric: 'cosine' | 'euclidean' | 'dot_product';
  vector_count: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  status: string;
}

export interface VectorCollectionCreateRequest {
  name: string;
  dimension: number;
  distance_metric?: 'cosine' | 'euclidean' | 'dot_product';
  metadata?: Record<string, any>;
}

export interface VectorSearchRequest {
  collection_name: string;
  query_vector: number[];
  top_k?: number;
  filter?: Record<string, any>;
  include_metadata?: boolean;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  vector?: number[];
  metadata?: Record<string, any>;
  payload?: Record<string, any>;
}

export interface VectorSearchResponse {
  results: VectorSearchResult[];
  query_time_ms: number;
  total_results: number;
}

export interface VectorUpsertRequest {
  collection_name: string;
  vectors: Array<{
    id: string;
    vector: number[];
    metadata?: Record<string, any>;
    payload?: Record<string, any>;
  }>;
}

export interface VectorUpsertResponse {
  inserted_count: number;
  updated_count: number;
  operation_time_ms: number;
}

export interface MLModel {
  id: string;
  name: string;
  model_type: 'embedding' | 'classification' | 'regression' | 'clustering';
  framework: 'huggingface' | 'openai' | 'custom';
  model_path: string;
  input_dimension?: number;
  output_dimension?: number;
  status: string;
  accuracy?: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface MLModelCreateRequest {
  name: string;
  model_type: 'embedding' | 'classification' | 'regression' | 'clustering';
  framework: 'huggingface' | 'openai' | 'custom';
  model_path: string;
  input_dimension?: number;
  output_dimension?: number;
  metadata?: Record<string, any>;
}

export interface TrainingJob {
  id: string;
  model_id: string;
  dataset_id?: string;
  training_config: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  accuracy?: number;
  loss?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface TrainingJobCreateRequest {
  model_id: string;
  dataset_id?: string;
  training_config: Record<string, any>;
}

export class VectorService {
  private static readonly BASE_PATH = '/v1/public/zerodb/vectors';
  private static readonly ZEROML_PATH = '/v1/public/zerodb/zeroml';

  // Vector Collections Management
  static async getCollections(): Promise<VectorCollection[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/collections`);
      return response.data as VectorCollection[];
    } catch (error: any) {
      throw new Error(`Failed to fetch vector collections: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createCollection(request: VectorCollectionCreateRequest): Promise<VectorCollection> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/collections`, request);
      return response.data as VectorCollection;
    } catch (error: any) {
      throw new Error(`Failed to create vector collection: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getCollection(collectionId: string): Promise<VectorCollection> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/collections/${collectionId}`);
      return response.data as VectorCollection;
    } catch (error: any) {
      throw new Error(`Failed to fetch vector collection: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateCollection(collectionId: string, updates: Partial<VectorCollectionCreateRequest>): Promise<VectorCollection> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/collections/${collectionId}`, updates);
      return response.data as VectorCollection;
    } catch (error: any) {
      throw new Error(`Failed to update vector collection: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteCollection(collectionId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/collections/${collectionId}`);
    } catch (error: any) {
      throw new Error(`Failed to delete vector collection: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Vector Search
  static async searchVectors(request: VectorSearchRequest): Promise<VectorSearchResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/search`, request);
      return response.data as VectorSearchResponse;
    } catch (error: any) {
      throw new Error(`Vector search failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Vector Upsert
  static async upsertVectors(request: VectorUpsertRequest): Promise<VectorUpsertResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/upsert`, request);
      return response.data as VectorUpsertResponse;
    } catch (error: any) {
      throw new Error(`Vector upsert failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Vector Deletion
  static async deleteVectors(collectionName: string, vectorIds: string[]): Promise<{ deleted_count: number }> {
    try {
      const response = await apiClient.delete(`${this.BASE_PATH}/vectors`, {
        data: { collection_name: collectionName, vector_ids: vectorIds }
      } as any);
      return response.data as { deleted_count: number };
    } catch (error: any) {
      throw new Error(`Vector deletion failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Similarity Search with Text
  static async searchSimilarText(
    collectionName: string,
    queryText: string,
    topK: number = 10,
    filter?: Record<string, any>
  ): Promise<VectorSearchResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/search/text`, {
        collection_name: collectionName,
        query_text: queryText,
        top_k: topK,
        filter
      });
      return response.data as VectorSearchResponse;
    } catch (error: any) {
      throw new Error(`Text similarity search failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // ZeroML Models Management
  static async getModels(): Promise<MLModel[]> {
    try {
      const response = await apiClient.get(`${this.ZEROML_PATH}/models`);
      return response.data as MLModel[];
    } catch (error: any) {
      throw new Error(`Failed to fetch ML models: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createModel(request: MLModelCreateRequest): Promise<MLModel> {
    try {
      const response = await apiClient.post(`${this.ZEROML_PATH}/models`, request);
      return response.data as MLModel;
    } catch (error: any) {
      throw new Error(`Failed to create ML model: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getModel(modelId: string): Promise<MLModel> {
    try {
      const response = await apiClient.get(`${this.ZEROML_PATH}/models/${modelId}`);
      return response.data as MLModel;
    } catch (error: any) {
      throw new Error(`Failed to fetch ML model: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateModel(modelId: string, updates: Partial<MLModelCreateRequest>): Promise<MLModel> {
    try {
      const response = await apiClient.put(`${this.ZEROML_PATH}/models/${modelId}`, updates);
      return response.data as MLModel;
    } catch (error: any) {
      throw new Error(`Failed to update ML model: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteModel(modelId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.ZEROML_PATH}/models/${modelId}`);
    } catch (error: any) {
      throw new Error(`Failed to delete ML model: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Training Jobs
  static async getTrainingJobs(modelId?: string): Promise<TrainingJob[]> {
    try {
      const params = modelId ? { model_id: modelId } : {};
      const response = await apiClient.get(`${this.ZEROML_PATH}/train`, { params } as any);
      return response.data as TrainingJob[];
    } catch (error: any) {
      throw new Error(`Failed to fetch training jobs: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createTrainingJob(request: TrainingJobCreateRequest): Promise<TrainingJob> {
    try {
      const response = await apiClient.post(`${this.ZEROML_PATH}/train`, request);
      return response.data as TrainingJob;
    } catch (error: any) {
      throw new Error(`Failed to create training job: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getTrainingJob(jobId: string): Promise<TrainingJob> {
    try {
      const response = await apiClient.get(`${this.ZEROML_PATH}/train/${jobId}`);
      return response.data as TrainingJob;
    } catch (error: any) {
      throw new Error(`Failed to fetch training job: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async cancelTrainingJob(jobId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.ZEROML_PATH}/train/${jobId}`);
    } catch (error: any) {
      throw new Error(`Failed to cancel training job: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Model Inference
  static async runInference(
    modelId: string,
    input: Record<string, any>
  ): Promise<{ prediction: any; confidence?: number; processing_time_ms: number }> {
    try {
      const response = await apiClient.post(`${this.ZEROML_PATH}/models/${modelId}/infer`, input);
      return response.data as { prediction: any; confidence?: number; processing_time_ms: number };
    } catch (error: any) {
      throw new Error(`Model inference failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Generate Embeddings
  static async generateEmbeddings(
    modelId: string,
    texts: string[]
  ): Promise<{ embeddings: number[][]; processing_time_ms: number }> {
    try {
      const response = await apiClient.post(`${this.ZEROML_PATH}/models/${modelId}/embed`, { texts });
      return response.data as { embeddings: number[][]; processing_time_ms: number };
    } catch (error: any) {
      throw new Error(`Embedding generation failed: ${error.response?.data?.detail || error.message}`);
    }
  }
}