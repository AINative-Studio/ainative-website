/**
 * Admin API Service Types
 * TypeScript type definitions for all admin dashboard entities
 */

/**
 * Standard API response wrapper used across all endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Standard operation result for mutations
 */
export interface OperationResult {
  success: boolean;
  message: string;
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Date range filter
 */
export interface DateRange {
  start_date?: string;
  end_date?: string;
}

/**
 * Sort parameters
 */
export interface SortParams {
  sort_by?: string;
  order?: 'asc' | 'desc';
}

// ==================== User Management Types ====================

/**
 * Admin user entity with full permissions and metadata
 */
export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  is_active: boolean;
  is_superuser: boolean;
  role: 'USER' | 'ADMIN' | 'SUPERUSER';
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  avatar?: string;
  phone?: string;
  company?: string;
  location?: string;
}

/**
 * User list filters
 */
export interface UserListFilters extends PaginationParams, SortParams {
  search?: string;
  role?: string;
  is_active?: boolean;
  email_verified?: boolean;
}

/**
 * User creation request
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  full_name?: string;
  username?: string;
  role?: 'USER' | 'ADMIN' | 'SUPERUSER';
}

/**
 * User update request
 */
export interface UpdateUserRequest {
  full_name?: string;
  username?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  role?: 'USER' | 'ADMIN' | 'SUPERUSER';
  email_verified?: boolean;
}

// ==================== API Key Management Types ====================

/**
 * Admin API key entity with extended metadata
 */
export interface AdminApiKey {
  id: string;
  user_id: string;
  name: string;
  key_preview: string;
  created_at: string;
  last_used?: string;
  status: 'active' | 'inactive' | 'revoked';
  scopes?: string[];
  rate_limit?: number;
  usage_count?: number;
}

/**
 * API key list filters
 */
export interface ApiKeyListFilters extends PaginationParams, SortParams {
  user_id?: string;
  status?: string;
  search?: string;
}

/**
 * API key creation request
 */
export interface CreateApiKeyRequest {
  name: string;
  scopes?: string[];
  rate_limit?: number;
}

/**
 * API key creation response (includes full key, shown only once)
 */
export interface CreateApiKeyResponse {
  id: string;
  key: string;
  name: string;
}

/**
 * API key usage statistics
 */
export interface ApiKeyUsageStats {
  total_requests: number;
  requests_today: number;
  requests_this_week: number;
  requests_this_month: number;
  last_used?: string;
  daily_usage: Array<{ date: string; requests: number }>;
  endpoint_breakdown?: Record<string, number>;
}

// ==================== RLHF Dashboard Types ====================

/**
 * RLHF dashboard overview metrics
 */
export interface RLHFOverview {
  total_feedback: number;
  active_models: number;
  avg_quality_score: number;
  improvement_rate: number;
  pending_reviews: number;
  recent_deployments: number;
}

/**
 * RLHF deployment entity
 */
export interface RLHFDeployment {
  id: string;
  model_name: string;
  version: string;
  deployed_at: string;
  status: 'active' | 'staging' | 'deprecated';
  performance_metrics: {
    accuracy: number;
    latency_ms: number;
    throughput: number;
  };
}

/**
 * RLHF quality insights
 */
export interface RLHFQualityInsights {
  overall_quality_score: number;
  trend: 'improving' | 'stable' | 'declining';
  top_issues: Array<{
    category: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
}

/**
 * RLHF realtime status
 */
export interface RLHFRealtimeStatus {
  active_sessions: number;
  feedback_rate: number;
  processing_queue: number;
  system_health: 'healthy' | 'degraded' | 'critical';
}

/**
 * RLHF experiment creation request
 */
export interface CreateRLHFExperimentRequest {
  name: string;
  description?: string;
  model_id: string;
  test_prompts: string[];
  comparison_model_id?: string;
}

// ==================== Monitoring Types ====================

/**
 * System monitoring dashboard metrics
 */
export interface MonitoringDashboard {
  uptime_percentage: number;
  total_requests: number;
  avg_response_time_ms: number;
  error_rate: number;
  active_users: number;
  system_health: 'healthy' | 'degraded' | 'critical';
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: { status: string; latency_ms?: number };
    cache: { status: string; latency_ms?: number };
    queue: { status: string; latency_ms?: number };
    storage: { status: string; latency_ms?: number };
  };
  version: string;
}

/**
 * System metrics
 */
export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_in_mbps: number;
  network_out_mbps: number;
  active_connections: number;
  queue_depth: number;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
}

/**
 * Audit log filters
 */
export interface AuditLogFilters extends PaginationParams, SortParams, DateRange {
  user_id?: string;
  action?: string;
  resource_type?: string;
}

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'critical';
  message: string;
  stack_trace?: string;
  user_id?: string;
  request_id?: string;
  endpoint?: string;
}

// ==================== Evaluation Types ====================

/**
 * Evaluation analytics
 */
export interface EvaluationAnalytics {
  total_evaluations: number;
  avg_score: number;
  pass_rate: number;
  recent_trend: 'improving' | 'stable' | 'declining';
  category_breakdown: Record<string, number>;
}

/**
 * Run evaluation request
 */
export interface RunEvaluationRequest {
  model_id: string;
  test_suite_id?: string;
  prompts?: string[];
  evaluation_criteria: string[];
}

/**
 * Recent evaluation result
 */
export interface RecentEvaluation {
  id: string;
  model_name: string;
  timestamp: string;
  overall_score: number;
  status: 'passed' | 'failed' | 'pending';
  duration_seconds: number;
}

/**
 * Performance analysis
 */
export interface PerformanceAnalysis {
  avg_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  throughput_rps: number;
  error_rate: number;
  bottlenecks: Array<{
    component: string;
    impact: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

/**
 * Quality trends
 */
export interface QualityTrends {
  time_series: Array<{
    date: string;
    quality_score: number;
    test_count: number;
  }>;
  improvement_areas: string[];
  regression_areas: string[];
}

/**
 * Security assessment
 */
export interface SecurityAssessment {
  overall_score: number;
  vulnerabilities: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    count: number;
  }>;
  compliance_status: Record<string, boolean>;
  recommendations: string[];
}

/**
 * Test coverage
 */
export interface TestCoverage {
  overall_percentage: number;
  unit_test_coverage: number;
  integration_test_coverage: number;
  e2e_test_coverage: number;
  uncovered_components: string[];
}

// ==================== Enterprise Types ====================

/**
 * Team activity metrics
 */
export interface TeamActivity {
  total_members: number;
  active_members_today: number;
  total_actions: number;
  collaboration_score: number;
  recent_activities: Array<{
    user_id: string;
    user_name: string;
    action: string;
    timestamp: string;
  }>;
}

/**
 * Project analytics
 */
export interface ProjectAnalytics {
  total_projects: number;
  active_projects: number;
  total_api_calls: number;
  total_tokens_used: number;
  cost_analysis: {
    total_cost: number;
    cost_by_project: Record<string, number>;
  };
}

/**
 * Security metrics
 */
export interface SecurityMetrics {
  failed_login_attempts: number;
  active_sessions: number;
  suspicious_activities: number;
  mfa_enabled_users: number;
  mfa_disabled_users: number;
  password_strength_score: number;
}

/**
 * Collaboration data
 */
export interface CollaborationData {
  shared_resources: number;
  team_messages: number;
  code_reviews: number;
  pair_programming_sessions: number;
  knowledge_base_articles: number;
}

// ==================== Billing & Credits Types ====================

/**
 * Billing information
 */
export interface BillingInfo {
  customer_id: string;
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  current_plan: string;
  billing_cycle: 'monthly' | 'annual';
  next_billing_date?: string;
  payment_method?: {
    type: string;
    last4: string;
    expires: string;
  };
}

/**
 * Invoice entity
 */
export interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'void' | 'draft';
  issued_date: string;
  due_date: string;
  paid_date?: string;
  pdf_url?: string;
}

/**
 * Credit balance
 */
export interface CreditBalance {
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
  expires_at?: string;
}

/**
 * Credit transaction
 */
export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  amount: number;
  description: string;
  timestamp: string;
  balance_after: number;
}

/**
 * Credit package
 */
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  bonus_credits?: number;
  popular?: boolean;
}

/**
 * Auto-refill settings
 */
export interface AutoRefillSettings {
  enabled: boolean;
  threshold_credits: number;
  refill_amount: number;
  payment_method_id?: string;
}

// ==================== ZeroDB Types ====================

/**
 * ZeroDB statistics
 */
export interface ZeroDBStats {
  total_projects: number;
  total_vectors: number;
  total_storage_mb: number;
  total_queries_today: number;
  avg_query_latency_ms: number;
}

/**
 * ZeroDB project
 */
export interface ZeroDBProject {
  id: string;
  name: string;
  created_at: string;
  vector_count: number;
  storage_mb: number;
  last_accessed?: string;
}

/**
 * ZeroDB usage analytics
 */
export interface ZeroDBUsageAnalytics {
  time_series: Array<{
    date: string;
    queries: number;
    storage_mb: number;
  }>;
  top_projects: Array<{
    project_id: string;
    project_name: string;
    query_count: number;
  }>;
}

// ==================== Agent Swarm Types ====================

/**
 * Agent swarm project
 */
export interface AgentSwarmProject {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  status: 'active' | 'paused' | 'completed';
  agent_count: number;
}

/**
 * Orchestrate request
 */
export interface OrchestrateRequest {
  project_id: string;
  task_description: string;
  agent_types?: string[];
  max_agents?: number;
}

/**
 * Agent type definition
 */
export interface AgentType {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  cost_per_execution: number;
}

/**
 * Agent swarm metrics
 */
export interface AgentSwarmMetrics {
  total_executions: number;
  successful_executions: number;
  avg_execution_time_seconds: number;
  cost_today: number;
  active_agents: number;
}
