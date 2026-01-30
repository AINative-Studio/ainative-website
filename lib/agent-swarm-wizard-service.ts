/**
 * Agent Swarm Setup Wizard Service Layer
 *
 * Provides service classes for:
 * - GitHub PAT onboarding and connection management
 * - ZeroDB project and API key setup
 * - Agent Swarm AI-powered project generation
 *
 * All services include retry logic with exponential backoff for 429/5xx errors.
 */

import apiClient from './api-client';

// ============================================================================
// Type Definitions
// ============================================================================

// GitHub Types
export interface GitHubOrganization {
    login: string;
    id: number;
    avatar_url: string;
}

export interface GitHubConnectionStatus {
    connected: boolean;
    github_username: string;
    github_user_id: number;
    avatar_url: string;
    scopes: string[];
    has_required_scopes: boolean;
    missing_scopes: string[];
    last_validated: string;
    organizations: GitHubOrganization[];
}

export interface GitHubPATValidation {
    is_valid: boolean;
    github_username?: string;
    github_user_id?: number;
    github_email?: string;
    avatar_url?: string;
    scopes?: string[];
    missing_scopes?: string[];
    rate_limit_remaining?: number;
    organizations?: GitHubOrganization[];
    error_message?: string;
}

export interface GitHubPATValidateRequest {
    github_token: string;
    required_scopes?: string[];
}

export interface GitHubPATStoreRequest {
    github_token: string;
    enable_repo_access?: boolean;
    auto_sync_repos?: boolean;
    sync_private_repos?: boolean;
}

export interface GitHubPATStoreResponse {
    success: boolean;
    message: string;
    github_username: string;
    token_scopes: string[];
    stored_at: string;
}

// ZeroDB Types
export type ZeroDBTier = 'free' | 'pro' | 'scale' | 'enterprise';
export type ZeroDBProjectStatus = 'ACTIVE' | 'INACTIVE';

export interface ZeroDBTierLimits {
    max_projects: number;
    max_vectors: number;
    max_tables: number;
    max_events_per_month: number;
    max_storage_gb: number;
}

export interface ZeroDBUsage {
    vectors_count: number;
    tables_count: number;
    events_count: number;
    memory_usage_mb: number;
    storage_usage_mb: number;
    tier_limits: ZeroDBTierLimits;
}

export interface ZeroDBDatabaseConfig {
    vector_dimensions: number;
    quantum_enabled: boolean;
    mcp_enabled: boolean;
    tier: ZeroDBTier;
}

export interface ZeroDBProject {
    id: string;
    name: string;
    description: string;
    tier: ZeroDBTier;
    status: ZeroDBProjectStatus;
    user_id?: string;
    organization_id: string | null;
    database_enabled?: boolean;
    vector_dimensions?: number;
    quantum_enabled?: boolean;
    mcp_enabled?: boolean;
    database_config?: ZeroDBDatabaseConfig;
    railway_project_id?: string | null;
    usage?: ZeroDBUsage;
    created_at: string;
    updated_at?: string;
}

export interface ZeroDBProjectListItem {
    id: string;
    name: string;
    description: string;
    tier: ZeroDBTier;
    status: ZeroDBProjectStatus;
    created_at: string;
}

export interface ZeroDBProjectStats {
    total_projects: number;
    projects_by_tier: Record<string, number>;
    total_usage: {
        vectors_count: number;
        tables_count: number;
        events_count: number;
    };
    active_projects: number;
}

export interface ZeroDBCreateProjectRequest {
    name: string;
    description?: string;
    tier?: ZeroDBTier;
    database_enabled?: boolean;
    organization_id?: string | null;
}

export interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    created_at: string;
    last_used_at: string | null;
    usage_count: number;
}

export interface ApiKeyListResponse {
    api_keys: ApiKey[];
}

export interface CreateApiKeyRequest {
    name: string;
    description?: string;
}

export interface CreateApiKeyResponse {
    success: boolean;
    api_key: string;
    id: string;
    name: string;
    prefix: string;
    message: string;
}

// Agent Swarm Types
export type AgentSwarmStatus = 'initializing' | 'in_progress' | 'completed' | 'failed' | 'paused';

export type AppTemplate = 'ecommerce' | 'social_network' | 'task_management' | 'content_management' | 'custom';

export type ProjectStage =
    | 'initialization'
    | 'requirements_analysis'
    | 'architecture_design'
    | 'frontend_development'
    | 'backend_development'
    | 'integration'
    | 'security_scanning'
    | 'testing'
    | 'deployment_setup'
    | 'validation'
    | 'completion';

export interface AgentConfig {
    enabled: boolean;
    status: string;
}

export interface AgentSwarmProject {
    project_id: string;
    project_type: string;
    description: string;
    status: AgentSwarmStatus;
    agents_config: Record<string, AgentConfig>;
    created_at: string;
    updated_at: string;
    estimated_completion: string;
    message: string;
}

export interface CreateAgentSwarmRequest {
    project_type: string;
    description: string;
    features?: string[];
    technologies?: string[];
}

export interface TableColumn {
    name: string;
    type: string;
    primary?: boolean;
    unique?: boolean;
    nullable?: boolean;
    default?: string;
}

export interface TableDefinition {
    columns: TableColumn[];
}

export interface CollectionDefinition {
    type: string;
    ttl?: number;
}

export interface VectorCollectionDefinition {
    type: string;
    dimensions: number;
    metric: string;
}

export interface RelationshipDefinition {
    from: string;
    to: string;
    type: 'one_to_one' | 'one_to_many' | 'many_to_many';
}

export interface IndexDefinition {
    table: string;
    columns: string[];
}

export interface DataModel {
    database_type: string;
    app_template: AppTemplate;
    schema: Record<string, unknown>;
    tables: Record<string, TableDefinition>;
    collections: Record<string, CollectionDefinition>;
    vector_collections: Record<string, VectorCollectionDefinition>;
    relationships: Record<string, RelationshipDefinition>;
    indexes: Record<string, IndexDefinition>;
    security_rules: Record<string, unknown>;
    api_mappings: Record<string, unknown>;
}

export interface GenerateDataModelRequest {
    prd_content: string;
    project_name?: string;
    features?: string[];
    technology_preferences?: Record<string, string>;
}

export interface GenerateDataModelResponse {
    project_id: string;
    data_model: DataModel;
    generated_at: string;
    generator: string;
    status: string;
}

export interface Story {
    id: number;
    title: string;
    description: string;
    acceptance_criteria: string[];
    story_points: number;
    tasks: string[];
    dependencies: number[];
}

export interface Epic {
    id: number;
    title: string;
    description: string;
    priority: 'must-have' | 'should-have' | 'could-have' | 'wont-have';
    stories: Story[];
    total_points: number;
}

export interface Backlog {
    epics: Epic[];
    total_story_points: number;
    estimated_sprints: number;
}

export interface GenerateBacklogRequest {
    prd_content: string;
    data_model?: DataModel;
}

export interface GenerateBacklogResponse {
    project_id: string;
    backlog: Backlog;
    generated_at: string;
    model_used: string;
    status: string;
}

export interface SprintStory {
    epic: string;
    story_id: number;
    title: string;
    points: number;
    priority: string;
}

export interface Sprint {
    number: number;
    title: string;
    duration_weeks: number;
    goals: string[];
    stories: SprintStory[];
    total_points: number;
    start_date: string;
    end_date: string;
    risks: string[];
    deliverables: string[];
}

export interface SprintPlan {
    sprints: Sprint[];
    total_duration_weeks: number;
    total_sprints: number;
    velocity_utilization: string;
    deployment_strategy: string;
}

export interface GenerateSprintPlanRequest {
    backlog: Backlog;
    sprint_length_weeks?: number;
    team_velocity?: number;
}

export interface GenerateSprintPlanResponse {
    project_id: string;
    sprint_plan: SprintPlan;
    generated_at: string;
    model_used: string;
    status: string;
}

export interface ActiveAgent {
    stage: string;
    agent: string;
    status: string;
}

export interface ProjectStatusMetadata {
    data_model?: string;
    backlog?: string;
    sprint_plan?: string;
}

export interface ProjectStatus {
    project_id: string;
    status: AgentSwarmStatus;
    current_stage: ProjectStage;
    progress: number;
    message: string;
    parallel_execution: boolean;
    active_agents: ActiveAgent[];
    stages_completed: ProjectStage[];
    errors: string[];
    warnings: string[];
    metadata: ProjectStatusMetadata;
    completion_url?: string;
    deployment_url?: string;
    updated_at: string;
}

// WebSocket Message Types
export interface WSConnectionEstablished {
    type: 'connection_established';
    project_id: string;
    message: string;
}

export interface WSAgentStatusUpdate {
    type: 'agent_status_update';
    project_id: string;
    agent: string;
    status: string;
    progress: number;
    task: string;
    timestamp: number;
}

export interface WSWorkflowStageUpdate {
    type: 'workflow_stage_update';
    project_id: string;
    stage: string;
    message: string;
    timestamp: number;
}

export interface WSProjectProgress {
    type: 'project_progress';
    project_id: string;
    progress: number;
    message: string;
    timestamp: number;
}

export interface WSWorkflowLog {
    type: 'workflow_log';
    project_id: string;
    message: string;
    level: 'info' | 'warning' | 'error' | 'debug';
    emoji: string;
    timestamp: number;
}

export interface WSProjectCompleted {
    type: 'project_completed';
    project_id: string;
    url: string;
    completion_url: string;
    deployment_url: string;
    timestamp: number;
}

export interface WSProjectError {
    type: 'project_error';
    project_id: string;
    error: string;
    timestamp: number;
}

export type WebSocketMessage =
    | WSConnectionEstablished
    | WSAgentStatusUpdate
    | WSWorkflowStageUpdate
    | WSProjectProgress
    | WSWorkflowLog
    | WSProjectCompleted
    | WSProjectError;

// Error Types
export interface ApiError {
    detail: string | Array<{ loc: string[]; msg: string; type: string }>;
    retry_after?: number;
}

export class AgentSwarmApiError extends Error {
    public readonly status: number;
    public readonly detail: string | Array<{ loc: string[]; msg: string; type: string }>;
    public readonly retryAfter?: number;

    constructor(
        message: string,
        status: number,
        detail: string | Array<{ loc: string[]; msg: string; type: string }>,
        retryAfter?: number
    ) {
        super(message);
        this.name = 'AgentSwarmApiError';
        this.status = status;
        this.detail = detail;
        this.retryAfter = retryAfter;
    }
}

// ============================================================================
// Retry Logic with Exponential Backoff
// ============================================================================

interface RetryOptions {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    retryStatusCodes?: number[];
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    retryStatusCodes: [429, 500, 502, 503, 504],
};

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(
    fn: () => Promise<{ data: T; status: number; statusText: string }>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            const response = await fn();

            // Check for error status codes
            if (response.status >= 400) {
                const errorData = response.data as unknown as ApiError;
                const errorMessage = typeof errorData?.detail === 'string'
                    ? errorData.detail
                    : `Request failed with status ${response.status}`;

                // Check if we should retry
                if (opts.retryStatusCodes.includes(response.status) && attempt < opts.maxRetries) {
                    const delay = Math.min(
                        opts.initialDelayMs * Math.pow(2, attempt),
                        opts.maxDelayMs
                    );

                    // Use retry_after header value if available for 429
                    const retryAfter = response.status === 429 && errorData?.retry_after
                        ? errorData.retry_after * 1000
                        : delay;

                    await sleep(retryAfter);
                    continue;
                }

                throw new AgentSwarmApiError(
                    errorMessage,
                    response.status,
                    errorData?.detail || errorMessage,
                    errorData?.retry_after
                );
            }

            return response.data;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // If it's an AgentSwarmApiError that shouldn't be retried, throw immediately
            if (error instanceof AgentSwarmApiError &&
                !opts.retryStatusCodes.includes(error.status)) {
                throw error;
            }

            // If we've exhausted retries, throw
            if (attempt >= opts.maxRetries) {
                throw lastError;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(
                opts.initialDelayMs * Math.pow(2, attempt),
                opts.maxDelayMs
            );
            await sleep(delay);
        }
    }

    throw lastError || new Error('Max retries exceeded');
}

// ============================================================================
// Service Classes
// ============================================================================

/**
 * GitHub Onboarding Service
 *
 * Handles GitHub PAT validation, storage, and connection status checking.
 */
export class GitHubOnboardingService {
    private static instance: GitHubOnboardingService;

    private constructor() {}

    public static getInstance(): GitHubOnboardingService {
        if (!GitHubOnboardingService.instance) {
            GitHubOnboardingService.instance = new GitHubOnboardingService();
        }
        return GitHubOnboardingService.instance;
    }

    /**
     * Check the current GitHub connection status for the authenticated user.
     *
     * @returns GitHubConnectionStatus with connection details and scope information
     * @throws AgentSwarmApiError if the request fails
     */
    async checkConnectionStatus(): Promise<GitHubConnectionStatus> {
        return withRetry(() =>
            apiClient.get<GitHubConnectionStatus>('/v1/public/github/connection-status')
        );
    }

    /**
     * Validate a GitHub Personal Access Token (PAT) without storing it.
     * Validates directly against GitHub's API.
     *
     * @param token - The GitHub PAT to validate (must start with ghp_, gho_, ghu_, ghs_, or ghr_)
     * @param requiredScopes - Optional array of required scopes to check (default: ['repo', 'workflow'])
     * @returns GitHubPATValidation with validation results and user info
     * @throws AgentSwarmApiError if the request fails or token is invalid
     */
    async validatePAT(
        token: string,
        requiredScopes: string[] = ['repo', 'workflow']
    ): Promise<GitHubPATValidation> {
        try {
            // Validate directly against GitHub's API
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            if (!response.ok) {
                return {
                    is_valid: false,
                    error_message: response.status === 401
                        ? 'Invalid token. Please check your Personal Access Token.'
                        : `GitHub API error: ${response.status}`,
                };
            }

            const userData = await response.json();

            // Get token scopes from response headers
            const scopesHeader = response.headers.get('X-OAuth-Scopes') || '';
            const scopes = scopesHeader.split(',').map(s => s.trim()).filter(Boolean);

            // Check for missing required scopes
            const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope));

            // Fetch user's organizations
            const orgsResponse = await fetch('https://api.github.com/user/orgs', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });
            const organizations = orgsResponse.ok ? await orgsResponse.json() : [];

            return {
                is_valid: missingScopes.length === 0,
                github_username: userData.login,
                github_user_id: userData.id,
                github_email: userData.email,
                avatar_url: userData.avatar_url,
                scopes,
                missing_scopes: missingScopes,
                organizations: organizations.map((org: { login: string; id: number; avatar_url: string }) => ({
                    login: org.login,
                    id: org.id,
                    avatar_url: org.avatar_url,
                })),
                error_message: missingScopes.length > 0
                    ? `Missing required scopes: ${missingScopes.join(', ')}`
                    : undefined,
            };
        } catch (error) {
            return {
                is_valid: false,
                error_message: error instanceof Error ? error.message : 'Failed to validate token',
            };
        }
    }

    /**
     * Store a validated GitHub PAT for the authenticated user.
     *
     * @param token - The GitHub PAT to store
     * @param options - Optional configuration for repository access
     * @returns GitHubPATStoreResponse with storage confirmation
     * @throws AgentSwarmApiError if the request fails
     */
    async storePAT(
        token: string,
        options: {
            enableRepoAccess?: boolean;
            autoSyncRepos?: boolean;
            syncPrivateRepos?: boolean;
        } = {}
    ): Promise<GitHubPATStoreResponse> {
        // Use correct field names per OpenAPI spec
        const request = {
            token: token,
            enable_repo_access: options.enableRepoAccess ?? true,
            auto_sync_repos: options.autoSyncRepos ?? false,
            sync_private_repos: options.syncPrivateRepos ?? false,
        };

        return withRetry(() =>
            apiClient.post<GitHubPATStoreResponse>('/v1/public/github/token', request)
        );
    }
}

/**
 * ZeroDB Setup Service
 *
 * Handles ZeroDB project management and API key operations.
 */
export class ZeroDBSetupService {
    private static instance: ZeroDBSetupService;

    private constructor() {}

    public static getInstance(): ZeroDBSetupService {
        if (!ZeroDBSetupService.instance) {
            ZeroDBSetupService.instance = new ZeroDBSetupService();
        }
        return ZeroDBSetupService.instance;
    }

    /**
     * List all ZeroDB projects for the authenticated user.
     *
     * @returns Array of ZeroDB projects
     * @throws AgentSwarmApiError if the request fails
     */
    async listProjects(): Promise<ZeroDBProjectListItem[]> {
        return withRetry(() =>
            apiClient.get<ZeroDBProjectListItem[]>('/v1/public/projects')
        );
    }

    /**
     * Get project statistics summary including usage and tier information.
     *
     * @returns ZeroDBProjectStats with aggregate statistics
     * @throws AgentSwarmApiError if the request fails
     */
    async getProjectStats(): Promise<ZeroDBProjectStats> {
        return withRetry(() =>
            apiClient.get<ZeroDBProjectStats>('/v1/public/projects/stats/summary')
        );
    }

    /**
     * Create a new ZeroDB project.
     *
     * @param name - Project name
     * @param description - Optional project description
     * @param options - Optional project configuration
     * @returns The created ZeroDB project
     * @throws AgentSwarmApiError if the request fails (403 if project limit reached)
     */
    async createProject(
        name: string,
        description?: string,
        options: {
            tier?: ZeroDBTier;
            databaseEnabled?: boolean;
            organizationId?: string | null;
        } = {}
    ): Promise<ZeroDBProject> {
        const request: ZeroDBCreateProjectRequest = {
            name,
            description,
            tier: options.tier ?? 'free',
            database_enabled: options.databaseEnabled ?? true,
            organization_id: options.organizationId ?? null,
        };

        return withRetry(() =>
            apiClient.post<ZeroDBProject>('/v1/public/projects', request)
        );
    }

    /**
     * List all API keys for the authenticated user.
     *
     * @returns ApiKeyListResponse with array of API keys
     * @throws AgentSwarmApiError if the request fails
     */
    async listApiKeys(): Promise<ApiKeyListResponse> {
        // API returns array directly, wrap it in expected response format
        const keys = await withRetry(() =>
            apiClient.get<ApiKey[]>('/v1/public/api-keys/')
        );
        return { api_keys: keys };
    }

    /**
     * Create a new API key.
     *
     * Note: The full API key is only returned once. Save it securely.
     *
     * @param name - Name for the API key
     * @param description - Optional description
     * @returns CreateApiKeyResponse with the full API key (only shown once)
     * @throws AgentSwarmApiError if the request fails
     */
    async createApiKey(
        name: string,
        description?: string
    ): Promise<CreateApiKeyResponse> {
        const request: CreateApiKeyRequest = {
            name,
            description,
        };

        return withRetry(() =>
            apiClient.post<CreateApiKeyResponse>('/v1/public/api-keys/', request)
        );
    }

    /**
     * Check if user can create a new project based on tier limits.
     *
     * @returns Object with canCreate boolean and current/max project counts
     */
    async canCreateProject(): Promise<{
        canCreate: boolean;
        currentProjects: number;
        maxProjects: number;
        tier: string;
    }> {
        const stats = await this.getProjectStats();

        // Determine tier from projects_by_tier
        const tiers = Object.keys(stats.projects_by_tier);
        const primaryTier = tiers.length > 0 ? tiers[0] : 'free';

        // Tier limits
        const tierLimits: Record<string, number> = {
            free: 1,
            pro: 5,
            scale: 15,
            enterprise: Infinity,
        };

        const maxProjects = tierLimits[primaryTier] ?? 1;

        return {
            canCreate: stats.total_projects < maxProjects,
            currentProjects: stats.total_projects,
            maxProjects,
            tier: primaryTier,
        };
    }
}

/**
 * Agent Swarm AI Service
 *
 * Handles AI-powered project generation including data model, backlog, and sprint planning.
 */
export class AgentSwarmAIService {
    private static instance: AgentSwarmAIService;

    private constructor() {}

    public static getInstance(): AgentSwarmAIService {
        if (!AgentSwarmAIService.instance) {
            AgentSwarmAIService.instance = new AgentSwarmAIService();
        }
        return AgentSwarmAIService.instance;
    }

    /**
     * Create a new Agent Swarm project.
     *
     * This initiates the real agent swarm workflow for building the application.
     *
     * @param config - Project configuration including type, description, features, and technologies
     * @returns AgentSwarmProject with project ID and initial status
     * @throws AgentSwarmApiError if the request fails
     */
    async createProject(config: CreateAgentSwarmRequest): Promise<AgentSwarmProject> {
        return withRetry(() =>
            apiClient.post<AgentSwarmProject>('/v1/public/agent-swarms/orchestrate', config)
        );
    }

    /**
     * Generate a data model from PRD content using AI.
     *
     * This step analyzes the PRD and creates a comprehensive database schema
     * including tables, collections, vector stores, relationships, and indexes.
     *
     * @param projectId - The project ID
     * @param prdContent - The full PRD text content
     * @param options - Optional configuration for generation
     * @returns GenerateDataModelResponse with the generated data model
     * @throws AgentSwarmApiError if the request fails
     */
    async generateDataModel(
        projectId: string,
        prdContent: string,
        options: {
            projectName?: string;
            features?: string[];
            technologyPreferences?: Record<string, string>;
        } = {}
    ): Promise<GenerateDataModelResponse> {
        const request: GenerateDataModelRequest = {
            prd_content: prdContent,
            project_name: options.projectName,
            features: options.features,
            technology_preferences: options.technologyPreferences,
        };

        // AI calls can take longer, use extended timeout
        // Use public endpoint for better availability
        return withRetry(
            () => apiClient.post<GenerateDataModelResponse>(
                `/v1/public/agent-swarms/projects/${projectId}/ai/generate-data-model`,
                request,
                { timeout: 60000 } // 60 second timeout for AI operations
            ),
            { maxRetries: 2 } // Fewer retries for long operations
        );
    }

    /**
     * Generate a product backlog from PRD content and data model using AI.
     *
     * Creates epics, user stories with acceptance criteria, story points, and tasks.
     *
     * @param projectId - The project ID
     * @param prdContent - The full PRD text content
     * @param dataModel - The data model from generateDataModel
     * @returns GenerateBacklogResponse with the generated backlog
     * @throws AgentSwarmApiError if the request fails
     */
    async generateBacklog(
        projectId: string,
        prdContent: string,
        dataModel?: DataModel
    ): Promise<GenerateBacklogResponse> {
        const request: GenerateBacklogRequest = {
            prd_content: prdContent,
            data_model: dataModel,
        };

        // Use public endpoint for better availability
        return withRetry(
            () => apiClient.post<GenerateBacklogResponse>(
                `/v1/public/agent-swarms/projects/${projectId}/ai/generate-backlog`,
                request,
                { timeout: 60000 }
            ),
            { maxRetries: 2 }
        );
    }

    /**
     * Generate a sprint plan from the backlog using AI.
     *
     * Creates a sprint-by-sprint execution plan with goals, risks, and deliverables.
     *
     * @param projectId - The project ID
     * @param backlog - The backlog from generateBacklog
     * @param options - Optional sprint configuration
     * @returns GenerateSprintPlanResponse with the generated sprint plan
     * @throws AgentSwarmApiError if the request fails
     */
    async generateSprintPlan(
        projectId: string,
        backlog: Backlog,
        options: {
            sprintLengthWeeks?: number;
            teamVelocity?: number;
        } = {}
    ): Promise<GenerateSprintPlanResponse> {
        const request: GenerateSprintPlanRequest = {
            backlog,
            sprint_length_weeks: options.sprintLengthWeeks ?? 2,
            team_velocity: options.teamVelocity ?? 20,
        };

        return withRetry(
            () => apiClient.post<GenerateSprintPlanResponse>(
                `/v1/public/agent-swarms/projects/${projectId}/ai/generate-sprint-plan`,
                request,
                { timeout: 60000 }
            ),
            { maxRetries: 2 }
        );
    }

    /**
     * Get the current status of an Agent Swarm project.
     *
     * Returns detailed progress information including active agents, completed stages,
     * and any errors or warnings.
     *
     * @param projectId - The project ID
     * @returns ProjectStatus with detailed progress information
     * @throws AgentSwarmApiError if the request fails
     */
    async getProjectStatus(projectId: string): Promise<ProjectStatus> {
        return withRetry(() =>
            apiClient.get<ProjectStatus>(`/v1/public/agent-swarms/projects/${projectId}/status`)
        );
    }

    /**
     * Poll for project status updates at regular intervals.
     *
     * @param projectId - The project ID
     * @param onUpdate - Callback for status updates
     * @param options - Polling configuration
     * @returns Cleanup function to stop polling
     */
    pollProjectStatus(
        projectId: string,
        onUpdate: (status: ProjectStatus) => void,
        options: {
            intervalMs?: number;
            onError?: (error: Error) => void;
            stopOnCompletion?: boolean;
        } = {}
    ): () => void {
        const {
            intervalMs = 5000,
            onError,
            stopOnCompletion = true,
        } = options;

        let isActive = true;

        const poll = async () => {
            while (isActive) {
                try {
                    const status = await this.getProjectStatus(projectId);
                    onUpdate(status);

                    // Stop polling if project is complete or failed
                    if (stopOnCompletion &&
                        (status.status === 'completed' || status.status === 'failed')) {
                        break;
                    }
                } catch (error) {
                    if (onError && error instanceof Error) {
                        onError(error);
                    }
                }

                if (isActive) {
                    await sleep(intervalMs);
                }
            }
        };

        poll();

        return () => {
            isActive = false;
        };
    }
}

// ============================================================================
// Singleton Exports
// ============================================================================

export const gitHubOnboardingService = GitHubOnboardingService.getInstance();
export const zeroDBSetupService = ZeroDBSetupService.getInstance();
export const agentSwarmAIService = AgentSwarmAIService.getInstance();

// Default export with all services
export default {
    gitHub: gitHubOnboardingService,
    zeroDB: zeroDBSetupService,
    agentSwarm: agentSwarmAIService,
};
