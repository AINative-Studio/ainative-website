// ZeroDB Services - Comprehensive API Integration Layer
export { DatabaseService } from './database-service';
export { VectorService } from './vector-service';
export { StreamingService } from './streaming-service';
export { StorageService } from './storage-service';
export { AgentService } from './agent-service';
export { AnalyticsService } from './analytics-service';
export { SecurityService } from './security-service';
export { RLHFService } from './rlhf-service';

// Type exports for easy importing
export type {
  // Database types
  PostgresProvisionRequest,
  PostgresProvisionResponse,
  Collection,
  CollectionCreateRequest,
  Table,
  TableCreateRequest,
  DatabaseStats,
} from './database-service';

export type {
  // Vector types
  VectorCollection,
  VectorCollectionCreateRequest,
  VectorSearchRequest,
  VectorSearchResponse,
  VectorUpsertRequest,
  VectorUpsertResponse,
  MLModel,
  MLModelCreateRequest,
  TrainingJob,
  TrainingJobCreateRequest,
} from './vector-service';

export type {
  // Streaming types
  StreamingTopic,
  TopicCreateRequest,
  PublishMessageRequest,
  PublishMessageResponse,
  ConsumeMessageRequest,
  StreamingMessage,
  ConsumeMessageResponse,
  EventLog,
  EventCreateRequest,
  ConsumerGroup,
  TopicMetrics,
} from './streaming-service';

export type {
  // Storage types
  StorageBucket,
  BucketCreateRequest,
  StorageFile,
  FileUploadRequest,
  FileUploadResponse,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from './storage-service';

export type {
  // Agent types
  Agent,
  AgentCreateRequest,
  MemoryRecord,
  MemoryCreateRequest,
  AgentExecution,
  AgentExecutionRequest,
} from './agent-service';

export type {
  // Analytics types
  UsageMetrics,
  ServiceHealth,
  BillingUsage,
  SystemMetrics,
} from './analytics-service';

export type {
  // Security types
  APIKey,
  APIKeyCreateRequest,
  APIKeyCreateResponse,
  RateLimit,
  RateLimitCreateRequest,
  AuditLog,
  SecurityEvent,
  AccessPolicy,
  AccessPolicyCreateRequest,
} from './security-service';

export type {
  // RLHF types
  RLHFDataset,
  RLHFDatasetCreateRequest,
  TrainingJob as RLHFTrainingJob,
  TrainingJobCreateRequest as RLHFTrainingJobCreateRequest,
  ModelEvaluation,
  HumanFeedback,
  HumanFeedbackCreateRequest,
} from './rlhf-service';