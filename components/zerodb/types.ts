/**
 * ZeroDB Enhanced Types and Interfaces
 * Complete type definitions for all ZeroDB services and APIs
 */

import { LucideIcon } from 'lucide-react';

// Tab Configuration Types
export interface ZeroDBTab {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  category: 'overview' | 'storage' | 'ai-ml' | 'streaming' | 'agent' | 'monitoring';
  newFeature?: boolean;
  enhanced?: boolean;
  apiEndpoints: string[];
  subTabs?: ZeroDBSubTab[];
}

export interface ZeroDBSubTab {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  apiEndpoints: string[];
}

// Core ZeroDB Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'suspended';
  owner_id: string;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  auto_backup: boolean;
  encryption_enabled: boolean;
  rate_limits: RateLimits;
  retention_policy: RetentionPolicy;
}

export interface RateLimits {
  requests_per_minute: number;
  concurrent_connections: number;
  data_transfer_limit_gb: number;
}

export interface RetentionPolicy {
  logs_retention_days: number;
  backup_retention_days: number;
  analytics_retention_days: number;
}

// Database Management Types
export interface Collection {
  id: string;
  name: string;
  description?: string;
  schema: CollectionSchema;
  created_at: string;
  updated_at: string;
  document_count: number;
  storage_size_bytes: number;
  indexes: CollectionIndex[];
}

export interface CollectionSchema {
  type: 'object';
  properties: Record<string, SchemaProperty>;
  required: string[];
  additionalProperties?: boolean;
}

export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  format?: string;
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}

export interface CollectionIndex {
  name: string;
  fields: string[];
  unique: boolean;
  type: 'btree' | 'hash' | 'text';
}

export interface Document {
  id: string;
  collection_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  version: number;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  size_bytes: number;
  checksum: string;
  tags: string[];
  access_count: number;
  last_accessed: string;
}

// PostgreSQL Types
export interface PostgreSQLInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'maintenance' | 'error';
  version: string;
  host: string;
  port: number;
  database: string;
  connection_pool_size: number;
  cpu_usage: number;
  memory_usage_mb: number;
  storage_used_gb: number;
  storage_limit_gb: number;
  created_at: string;
  last_backup: string;
}

export interface TableInfo {
  name: string;
  schema: string;
  row_count: number;
  size_bytes: number;
  created_at: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default_value?: string;
  primary_key: boolean;
  foreign_key?: ForeignKeyInfo;
}

export interface ForeignKeyInfo {
  referenced_table: string;
  referenced_column: string;
}

export interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
  type: string;
}

// Vector & Search Types
export interface VectorCollection {
  id: string;
  name: string;
  dimension: number;
  distance_metric: 'cosine' | 'euclidean' | 'dot';
  vector_count: number;
  created_at: string;
  updated_at: string;
  config: VectorCollectionConfig;
}

export interface VectorCollectionConfig {
  hnsw_config?: HNSWConfig;
  quantization_config?: QuantizationConfig;
  optimizer_config?: OptimizerConfig;
}

export interface HNSWConfig {
  m: number;
  ef_construct: number;
  full_scan_threshold: number;
}

export interface QuantizationConfig {
  scalar?: ScalarQuantizationConfig;
  product?: ProductQuantizationConfig;
}

export interface ScalarQuantizationConfig {
  type: 'int8';
  quantile?: number;
  always_ram?: boolean;
}

export interface ProductQuantizationConfig {
  compression: 'x4' | 'x8' | 'x16' | 'x32' | 'x64';
  always_ram?: boolean;
}

export interface OptimizerConfig {
  deleted_threshold: number;
  vacuum_min_vector_number: number;
  default_segment_number: number;
}

export interface VectorPoint {
  id: string | number;
  vector: number[];
  payload?: Record<string, any>;
}

export interface SearchRequest {
  vector?: number[];
  filter?: SearchFilter;
  limit?: number;
  offset?: number;
  with_payload?: boolean;
  with_vector?: boolean;
  score_threshold?: number;
}

export interface SearchFilter {
  should?: SearchCondition[];
  must?: SearchCondition[];
  must_not?: SearchCondition[];
}

export interface SearchCondition {
  key: string;
  match?: SearchMatch;
  range?: SearchRange;
  geo_bounding_box?: GeoBoundingBox;
  geo_radius?: GeoRadius;
}

export interface SearchMatch {
  value?: any;
  text?: string;
  integer?: number;
  keyword?: string;
  bool?: boolean;
}

export interface SearchRange {
  gte?: number;
  gt?: number;
  lte?: number;
  lt?: number;
}

export interface GeoBoundingBox {
  top_left: GeoPoint;
  bottom_right: GeoPoint;
}

export interface GeoRadius {
  center: GeoPoint;
  radius: number;
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface SearchResult {
  id: string | number;
  score: number;
  payload?: Record<string, any>;
  vector?: number[];
}

// ML & AI Types
export interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'embedding' | 'custom';
  status: 'training' | 'trained' | 'deployed' | 'failed' | 'paused';
  framework: 'tensorflow' | 'pytorch' | 'sklearn' | 'custom';
  version: string;
  created_at: string;
  updated_at: string;
  metrics: MLModelMetrics;
  config: MLModelConfig;
}

export interface MLModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  loss?: number;
  training_time_minutes: number;
  model_size_mb: number;
}

export interface MLModelConfig {
  hyperparameters: Record<string, any>;
  training_config: TrainingConfig;
  deployment_config?: DeploymentConfig;
}

export interface TrainingConfig {
  epochs: number;
  batch_size: number;
  learning_rate: number;
  optimizer: string;
  early_stopping?: boolean;
  validation_split?: number;
}

export interface DeploymentConfig {
  instance_type: 'cpu' | 'gpu' | 'edge';
  auto_scaling: boolean;
  min_instances: number;
  max_instances: number;
  memory_limit_mb: number;
  timeout_seconds: number;
}

export interface TrainingJob {
  id: string;
  model_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  created_at: string;
  started_at?: string;
  completed_at?: string;
  logs: TrainingLog[];
  resource_usage: ResourceUsage;
}

export interface TrainingLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metrics?: Record<string, number>;
}

export interface ResourceUsage {
  cpu_usage: number;
  memory_usage_mb: number;
  gpu_usage?: number;
  gpu_memory_usage_mb?: number;
}

// Streaming & Events Types
export interface RedpandaTopic {
  id: string;
  name: string;
  partitions: number;
  replication_factor: number;
  retention_ms: number;
  max_message_bytes: number;
  created_at: string;
  message_count: number;
  total_size_bytes: number;
  config: TopicConfig;
}

export interface TopicConfig {
  cleanup_policy: 'delete' | 'compact' | 'compact,delete';
  compression_type: 'none' | 'gzip' | 'snappy' | 'lz4' | 'zstd';
  min_insync_replicas: number;
  segment_bytes: number;
  segment_ms: number;
}

export interface StreamMessage {
  id: string;
  topic: string;
  partition: number;
  offset: number;
  timestamp: string;
  key?: string;
  value: any;
  headers?: Record<string, string>;
}

export interface StreamProcessor {
  id: string;
  name: string;
  type: 'filter' | 'transform' | 'aggregate' | 'join' | 'custom';
  status: 'running' | 'stopped' | 'error' | 'paused';
  input_topics: string[];
  output_topics: string[];
  config: ProcessorConfig;
  metrics: ProcessorMetrics;
}

export interface ProcessorConfig {
  parallelism: number;
  checkpointing_interval_ms: number;
  state_backend: 'memory' | 'rocksdb' | 'redis';
  transformation_logic: string;
}

export interface ProcessorMetrics {
  messages_processed: number;
  messages_per_second: number;
  processing_latency_ms: number;
  error_rate: number;
  backlog_size: number;
  last_checkpoint: string;
}

// Object Storage Types (MinIO)
export interface StorageBucket {
  name: string;
  created_at: string;
  object_count: number;
  total_size_bytes: number;
  region?: string;
  versioning_enabled: boolean;
  encryption_enabled: boolean;
  lifecycle_rules: LifecycleRule[];
}

export interface StorageObject {
  key: string;
  bucket: string;
  size_bytes: number;
  last_modified: string;
  etag: string;
  content_type: string;
  metadata: Record<string, string>;
  storage_class: 'STANDARD' | 'REDUCED_REDUNDANCY' | 'ARCHIVE';
  version_id?: string;
}

export interface LifecycleRule {
  id: string;
  status: 'enabled' | 'disabled';
  filter?: LifecycleFilter;
  expiration?: LifecycleExpiration;
  transitions?: LifecycleTransition[];
}

export interface LifecycleFilter {
  prefix?: string;
  tags?: Record<string, string>;
}

export interface LifecycleExpiration {
  days: number;
  expired_object_delete_marker: boolean;
}

export interface LifecycleTransition {
  days: number;
  storage_class: string;
}

// Agent & MCP Types
export interface MCPConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  protocol_version: string;
  server_info: MCPServerInfo;
  capabilities: MCPCapabilities;
  connected_at: string;
  last_heartbeat: string;
  message_stats: MCPMessageStats;
}

export interface MCPServerInfo {
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
}

export interface MCPCapabilities {
  resources?: boolean;
  tools?: boolean;
  prompts?: boolean;
  roots?: boolean;
  sampling?: boolean;
}

export interface MCPMessageStats {
  messages_sent: number;
  messages_received: number;
  errors: number;
  average_response_time_ms: number;
}

export interface AgentMemory {
  id: string;
  agent_id: string;
  type: 'conversation' | 'knowledge' | 'skill' | 'preference' | 'context';
  content: any;
  importance_score: number; // 0-1
  created_at: string;
  accessed_at: string;
  access_count: number;
  tags: string[];
  relationships: MemoryRelationship[];
}

export interface MemoryRelationship {
  target_memory_id: string;
  relationship_type: 'related' | 'causal' | 'temporal' | 'semantic';
  strength: number; // 0-1
  created_at: string;
}

export interface RLHFDataset {
  id: string;
  name: string;
  description?: string;
  type: 'text' | 'conversation' | 'multimodal';
  size: number;
  created_at: string;
  updated_at: string;
  status: 'active' | 'processing' | 'completed' | 'error';
  feedback_stats: FeedbackStats;
}

export interface FeedbackStats {
  total_samples: number;
  positive_feedback: number;
  negative_feedback: number;
  neutral_feedback: number;
  average_quality_score: number;
  completion_rate: number;
}

export interface HumanFeedback {
  id: string;
  dataset_id: string;
  sample_id: string;
  feedback_type: 'rating' | 'ranking' | 'correction' | 'preference';
  rating?: number; // 1-5
  ranking?: number[];
  correction?: string;
  preference?: 'a' | 'b' | 'neither';
  comments?: string;
  reviewer_id: string;
  created_at: string;
}

// Analytics & Monitoring Types
export interface ServiceHealth {
  service_name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  uptime_percentage: number;
  response_time_ms: number;
  error_rate: number;
  last_check: string;
  health_checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration_ms: number;
  timestamp: string;
}

export interface UsageMetrics {
  period: 'hour' | 'day' | 'week' | 'month';
  timestamp: string;
  api_requests: number;
  data_processed_gb: number;
  compute_time_minutes: number;
  storage_used_gb: number;
  bandwidth_used_gb: number;
  active_users: number;
  error_count: number;
}

export interface BillingInfo {
  period_start: string;
  period_end: string;
  total_cost: number;
  currency: 'USD';
  breakdown: CostBreakdown[];
  usage_limits: UsageLimits;
  alerts: BillingAlert[];
}

export interface CostBreakdown {
  service: string;
  category: 'compute' | 'storage' | 'bandwidth' | 'requests';
  quantity: number;
  unit: string;
  rate: number;
  cost: number;
}

export interface UsageLimits {
  requests_per_month: number;
  storage_gb: number;
  bandwidth_gb: number;
  compute_hours: number;
}

export interface BillingAlert {
  id: string;
  type: 'threshold' | 'forecast' | 'anomaly';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  threshold?: number;
  current_value: number;
  created_at: string;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  message?: string;
  timestamp: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  trace_id?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
  total: number;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Chart and Visualization Types
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  series_name: string;
  data_points: ChartDataPoint[];
  color?: string;
  unit?: string;
}

export interface MetricCard {
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  change_type?: 'increase' | 'decrease';
  status?: 'good' | 'warning' | 'error';
  description?: string;
}