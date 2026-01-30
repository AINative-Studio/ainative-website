/**
 * ZeroDB Service
 * Handles all ZeroDB vector database API calls
 *
 * API Base Path: /v1/public/zerodb
 * Reference: services/zerodb/ implementations
 */

import apiClient from './api-client';

// Base path for ZeroDB API endpoints
const ZERODB_BASE_PATH = '/v1/public/zerodb';

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
  metadata?: Record<string, any>;
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
  filter?: Record<string, any>;
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
  filter?: Record<string, any>;
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
  params?: Record<string, any>;
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
   * TODO: Verify endpoint exists in backend - may need to use /collections instead
   */
  async listNamespaces(): Promise<NamespacesListResponse> {
    const response = await apiClient.get<NamespacesListResponse>(
      `${ZERODB_BASE_PATH}/namespaces`
    );
    return response.data;
  }

  /**
   * Create a new namespace
   * TODO: Verify endpoint exists in backend - may need to use /collections instead
   */
  async createNamespace(data: CreateNamespaceData): Promise<Namespace> {
    const response = await apiClient.post<Namespace>(
      `${ZERODB_BASE_PATH}/namespaces`,
      data
    );
    return response.data;
  }

  /**
   * Delete a namespace
   * TODO: Verify endpoint exists in backend - may need to use /collections instead
   */
  async deleteNamespace(name: string): Promise<DeleteNamespaceResponse> {
    const response = await apiClient.delete<DeleteNamespaceResponse>(
      `${ZERODB_BASE_PATH}/namespaces/${name}`
    );
    return response.data;
  }

  // ===== Stats Endpoints =====

  /**
   * Get database statistics
   * Verified: /v1/public/zerodb/stats endpoint exists (see DatabaseService)
   */
  async getStats(namespace?: string): Promise<DatabaseStats | NamespaceDetailStats> {
    const endpoint = namespace
      ? `${ZERODB_BASE_PATH}/stats?namespace=${namespace}`
      : `${ZERODB_BASE_PATH}/stats`;
    const response = await apiClient.get<DatabaseStats | NamespaceDetailStats>(endpoint);
    return response.data;
  }

  // ===== Query Endpoints =====

  /**
   * Execute a vector similarity query
   * Reference: VectorService uses /v1/public/zerodb/vectors/search for similar functionality
   * TODO: Verify if /query endpoint exists or should use /vectors/search instead
   */
  async executeQuery(query: VectorQuery): Promise<QueryResponse> {
    const response = await apiClient.post<QueryResponse>(
      `${ZERODB_BASE_PATH}/query`,
      query
    );
    return response.data;
  }

  // ===== Vector Endpoints =====

  /**
   * List vectors in a namespace
   * Reference: VectorService uses /v1/public/zerodb/vectors base path
   */
  async listVectors(params: ListVectorsParams): Promise<VectorsListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.set('namespace', params.namespace);
    if (params.page !== undefined) {
      queryParams.set('page', String(params.page));
    }
    if (params.page_size !== undefined) {
      queryParams.set('page_size', String(params.page_size));
    }

    const endpoint = `${ZERODB_BASE_PATH}/vectors?${queryParams.toString()}`;
    const response = await apiClient.get<VectorsListResponse>(endpoint);
    return response.data;
  }

  /**
   * Get a specific vector by ID
   * Reference: VectorService uses /v1/public/zerodb/vectors base path
   */
  async getVector(vectorId: string, namespace: string): Promise<VectorDetail> {
    const response = await apiClient.get<VectorDetail>(
      `${ZERODB_BASE_PATH}/vectors/${vectorId}?namespace=${namespace}`
    );
    return response.data;
  }

  /**
   * Delete a vector by ID
   * Reference: VectorService uses /v1/public/zerodb/vectors/vectors with DELETE
   */
  async deleteVector(vectorId: string, namespace: string): Promise<DeleteVectorResponse> {
    const response = await apiClient.delete<DeleteVectorResponse>(
      `${ZERODB_BASE_PATH}/vectors/${vectorId}?namespace=${namespace}`
    );
    return response.data;
  }

  // ===== Import/Export Endpoints =====

  /**
   * Import data into a namespace
   * TODO: Verify endpoint exists in backend - not found in services/zerodb/ implementations
   */
  async importData(request: ImportRequest): Promise<ImportResponse> {
    const response = await apiClient.post<ImportResponse>(
      `${ZERODB_BASE_PATH}/import`,
      request
    );
    return response.data;
  }

  /**
   * Export data from a namespace
   * TODO: Verify endpoint exists in backend - not found in services/zerodb/ implementations
   */
  async exportData(request: ExportRequest): Promise<ExportResponse> {
    const response = await apiClient.post<ExportResponse>(
      `${ZERODB_BASE_PATH}/export`,
      request
    );
    return response.data;
  }

  // ===== Index Management =====

  /**
   * Create an index for a namespace
   * TODO: Verify endpoint exists in backend - not found in services/zerodb/ implementations
   */
  async createIndex(request: CreateIndexRequest): Promise<IndexResponse> {
    const response = await apiClient.post<IndexResponse>(
      `${ZERODB_BASE_PATH}/index`,
      request
    );
    return response.data;
  }

  /**
   * Get index status for a namespace
   * TODO: Verify endpoint exists in backend - not found in services/zerodb/ implementations
   */
  async getIndexStatus(namespace: string): Promise<IndexStatus> {
    const response = await apiClient.get<IndexStatus>(
      `${ZERODB_BASE_PATH}/index/status?namespace=${namespace}`
    );
    return response.data;
  }
}

// Export singleton instance
export const zerodbService = new ZeroDBService();
