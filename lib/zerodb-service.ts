/**
 * ZeroDB Service
 * Handles all ZeroDB vector database API calls
 */

import apiClient from './api-client';

// ===== Namespace Types =====
export interface Namespace {
  name: string;
  vector_count: number;
  dimensions: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface NamespacesListResponse {
  namespaces: Namespace[];
  total: number;
}

export interface CreateNamespaceData {
  name: string;
  dimensions: number;
  description?: string;
}

export interface DeleteNamespaceResponse {
  message: string;
  namespace: string;
  vectors_deleted: number;
}

// ===== Stats Types =====
export interface NamespaceStats {
  name: string;
  vector_count: number;
  storage_mb: number;
}

export interface DatabaseStats {
  total_vectors: number;
  total_namespaces: number;
  total_storage_mb: number;
  avg_query_latency_ms: number;
  queries_last_24h: number;
  writes_last_24h: number;
  by_namespace: NamespaceStats[];
  index_health: 'optimal' | 'degraded' | 'rebuilding';
}

export interface NamespaceDetailStats {
  namespace: string;
  vector_count: number;
  storage_mb: number;
  dimensions: number;
  index_type: string;
  avg_query_latency_ms: number;
}

// ===== Query Types =====
export interface VectorQuery {
  namespace: string;
  vector: number[];
  top_k: number;
  include_metadata?: boolean;
  filter?: Record<string, unknown>;
}

export interface QueryResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
  vector?: number[];
}

export interface QueryResponse {
  results: QueryResult[];
  query_time_ms: number;
  total_scanned: number;
}

// ===== Vector Types =====
export interface VectorEntry {
  id: string;
  namespace: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface VectorDetail extends VectorEntry {
  vector: number[];
  updated_at: string;
}

export interface VectorsListResponse {
  vectors: VectorEntry[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface ListVectorsParams {
  namespace: string;
  page?: number;
  page_size?: number;
  filter?: Record<string, unknown>;
}

export interface DeleteVectorResponse {
  message: string;
  vector_id: string;
}

// ===== Import/Export Types =====
export type DataFormat = 'json' | 'parquet' | 'csv';

export interface ImportRequest {
  namespace: string;
  format: DataFormat;
  data?: string;
  source_url?: string;
}

export interface ImportResponse {
  import_id: string;
  status: 'completed' | 'processing' | 'failed';
  vectors_imported: number;
  errors: number;
  duration_ms?: number;
}

export interface ExportRequest {
  namespace: string;
  format: DataFormat;
  include_vectors?: boolean;
  filter?: Record<string, unknown>;
}

export interface ExportResponse {
  export_id: string;
  download_url: string;
  format: string;
  vectors_exported: number;
  size_mb: number;
  expires_at: string;
}

// ===== Index Types =====
export type IndexType = 'hnsw' | 'ivf' | 'flat';
export type MetricType = 'cosine' | 'euclidean' | 'dot';

export interface CreateIndexRequest {
  namespace: string;
  index_type: IndexType;
  metric: MetricType;
  params?: Record<string, unknown>;
}

export interface IndexResponse {
  index_id: string;
  namespace: string;
  index_type: string;
  metric: string;
  status: 'building' | 'ready' | 'error';
  progress: number;
  created_at: string;
}

export interface IndexStatus {
  index_id: string;
  namespace: string;
  status: 'building' | 'ready' | 'error';
  progress: number;
  vectors_indexed: number;
  build_time_ms?: number;
}

/**
 * ZeroDB Service class
 */
class ZeroDBService {
  // ===== Namespace Endpoints =====

  /**
   * List all namespaces
   * Returns empty list if the endpoint is unavailable (404/deprecated)
   */
  async listNamespaces(): Promise<NamespacesListResponse> {
    try {
      const response = await apiClient.get<NamespacesListResponse>('/v1/public/zerodb/namespaces');
      return response.data;
    } catch (error) {
      console.warn('ZeroDB namespaces endpoint unavailable:', error instanceof Error ? error.message : error);
      return { namespaces: [], total: 0 };
    }
  }

  /**
   * Create a new namespace
   */
  async createNamespace(data: CreateNamespaceData): Promise<Namespace> {
    const response = await apiClient.post<Namespace>('/v1/public/zerodb/namespaces', data);
    return response.data;
  }

  /**
   * Delete a namespace
   */
  async deleteNamespace(name: string): Promise<DeleteNamespaceResponse> {
    const response = await apiClient.delete<DeleteNamespaceResponse>(
      `/v1/public/zerodb/namespaces/${name}`
    );
    return response.data;
  }

  // ===== Stats Endpoints =====

  private static readonly defaultStats: DatabaseStats = {
    total_vectors: 0,
    total_namespaces: 0,
    total_storage_mb: 0,
    avg_query_latency_ms: 0,
    queries_last_24h: 0,
    writes_last_24h: 0,
    by_namespace: [],
    index_health: 'optimal',
  };

  /**
   * Get database statistics
   * Returns empty stats if the endpoint is unavailable (404/deprecated)
   */
  async getStats(namespace?: string): Promise<DatabaseStats | NamespaceDetailStats> {
    try {
      const endpoint = namespace
        ? `/v1/public/zerodb/stats?namespace=${namespace}`
        : '/v1/public/zerodb/stats';
      const response = await apiClient.get<DatabaseStats | NamespaceDetailStats>(endpoint);
      return response.data;
    } catch (error) {
      console.warn('ZeroDB stats endpoint unavailable:', error instanceof Error ? error.message : error);
      return ZeroDBService.defaultStats;
    }
  }

  // ===== Query Endpoints =====

  /**
   * Execute a vector similarity query
   */
  async executeQuery(query: VectorQuery): Promise<QueryResponse> {
    const response = await apiClient.post<QueryResponse>('/v1/public/zerodb/query', query);
    return response.data;
  }

  // ===== Vector Endpoints =====

  /**
   * List vectors in a namespace
   */
  async listVectors(params: ListVectorsParams): Promise<VectorsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('namespace', params.namespace);
      if (params.page !== undefined) {
        queryParams.set('page', String(params.page));
      }
      if (params.page_size !== undefined) {
        queryParams.set('page_size', String(params.page_size));
      }

      const endpoint = `/v1/public/zerodb/vectors?${queryParams.toString()}`;
      const response = await apiClient.get<VectorsListResponse>(endpoint);
      return response.data;
    } catch (error) {
      console.warn('ZeroDB vectors endpoint unavailable:', error instanceof Error ? error.message : error);
      return { vectors: [], total: 0, page: 1, page_size: 50, has_more: false };
    }
  }

  /**
   * Get a specific vector by ID
   */
  async getVector(vectorId: string, namespace: string): Promise<VectorDetail> {
    const response = await apiClient.get<VectorDetail>(
      `/v1/public/zerodb/vectors/${vectorId}?namespace=${namespace}`
    );
    return response.data;
  }

  /**
   * Delete a vector by ID
   */
  async deleteVector(vectorId: string, namespace: string): Promise<DeleteVectorResponse> {
    const response = await apiClient.delete<DeleteVectorResponse>(
      `/v1/public/zerodb/vectors/${vectorId}?namespace=${namespace}`
    );
    return response.data;
  }

  // ===== Import/Export Endpoints =====

  /**
   * Import data into a namespace
   */
  async importData(request: ImportRequest): Promise<ImportResponse> {
    const response = await apiClient.post<ImportResponse>('/v1/public/zerodb/import', request);
    return response.data;
  }

  /**
   * Export data from a namespace
   */
  async exportData(request: ExportRequest): Promise<ExportResponse> {
    const response = await apiClient.post<ExportResponse>('/v1/public/zerodb/export', request);
    return response.data;
  }

  // ===== Index Management =====

  /**
   * Create an index for a namespace
   */
  async createIndex(request: CreateIndexRequest): Promise<IndexResponse> {
    const response = await apiClient.post<IndexResponse>('/v1/public/zerodb/index', request);
    return response.data;
  }

  /**
   * Get index status for a namespace
   */
  async getIndexStatus(namespace: string): Promise<IndexStatus> {
    const response = await apiClient.get<IndexStatus>(
      `/v1/public/zerodb/index/status?namespace=${namespace}`
    );
    return response.data;
  }
}

// Export singleton instance
export const zerodbService = new ZeroDBService();
