# Agent Swarm Wizard - Complete API Specification

**Version:** 1.0
**Last Updated:** 2026-01-22
**Status:** Approved by Backend Team

---

## Overview

This document contains the complete API specification for building the Agent Swarm Setup Wizard UI. The wizard guides non-technical users through a step-by-step process to create AI-powered applications.

### Wizard Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 0a: Connect GitHub (PAT validation)                           │
│     ↓                                                               │
│  Step 0b: Setup ZeroDB (API key + project)                          │
│     ↓                                                               │
│  Step 1: Upload PRD (file or paste)                                 │
│     ↓                                                               │
│  Step 2: Review Data Model (AI-generated)                           │
│     ↓                                                               │
│  Step 3: Review Backlog (AI-generated)                              │
│     ↓                                                               │
│  Step 4: Review Sprint Plan (AI-generated)                          │
│     ↓                                                               │
│  Step 5: Launch & Monitor Agents (WebSocket real-time)              │
│     ↓                                                               │
│  Step 6: View Results (GitHub repo + deployment)                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Base Configuration

```typescript
const API_BASE_URL = 'https://api.ainative.studio';
const WS_BASE_URL = 'wss://api.ainative.studio';
```

---

## Step 0a: GitHub Connection

### Check Connection Status

```http
GET /api/v1/github-onboarding/connection-status
Authorization: Bearer <jwt>
```

**Response (200):**
```json
{
  "connected": true,
  "github_username": "octocat",
  "github_user_id": 583231,
  "avatar_url": "https://avatars.githubusercontent.com/u/583231",
  "scopes": ["repo", "workflow"],
  "has_required_scopes": true,
  "missing_scopes": [],
  "last_validated": "2026-01-22T10:30:00Z",
  "organizations": [
    {"login": "github", "id": 9919, "avatar_url": "https://..."}
  ]
}
```

### Validate GitHub PAT

```http
POST /api/v1/github-onboarding/pat/validate
Content-Type: application/json
```

**Request:**
```json
{
  "github_token": "ghp_xxxxxxxxxxxx",
  "required_scopes": ["repo", "workflow"]
}
```

**Note:** Token must start with: `ghp_`, `gho_`, `ghu_`, `ghs_`, or `ghr_`

**Response (200):**
```json
{
  "is_valid": true,
  "github_username": "octocat",
  "github_user_id": 583231,
  "github_email": "octocat@github.com",
  "avatar_url": "https://avatars.githubusercontent.com/u/583231",
  "scopes": ["repo", "workflow", "read:org"],
  "missing_scopes": [],
  "rate_limit_remaining": 4999,
  "organizations": [
    {"login": "github", "id": 9919, "avatar_url": "https://..."}
  ],
  "error_message": null
}
```

**Response (400 - Invalid Token):**
```json
{
  "is_valid": false,
  "error_message": "Invalid token format or expired token"
}
```

### Store GitHub PAT

```http
POST /api/v1/github-onboarding/pat/store
Authorization: Bearer <jwt>
Content-Type: application/json
```

**Request:**
```json
{
  "github_token": "ghp_xxxxxxxxxxxx",
  "enable_repo_access": true,
  "auto_sync_repos": false,
  "sync_private_repos": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "GitHub PAT stored successfully for octocat",
  "github_username": "octocat",
  "token_scopes": ["repo", "workflow"],
  "stored_at": "2026-01-22T10:30:00Z"
}
```

---

## Step 0b: ZeroDB Setup

### List Existing API Keys

```http
GET /v1/public/settings/api-keys
Authorization: Bearer <jwt>
```

**Response (200):**
```json
{
  "api_keys": [
    {
      "id": "uuid",
      "name": "my-key",
      "prefix": "QBbZ8XND",
      "created_at": "2026-01-22T10:30:00Z",
      "last_used_at": "2026-01-22T10:30:00Z",
      "usage_count": 150
    }
  ]
}
```

### Create API Key

```http
POST /v1/public/settings/api-keys
Authorization: Bearer <jwt>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "agent-swarm-key",
  "description": "API key for Agent Swarm project"
}
```

**Response (201):**
```json
{
  "success": true,
  "api_key": "QBbZ8XNDNRyNh4vWdk22OgdZgw0BldH2BAshml01eKI",
  "id": "a6d55e59-3a3a-4023-bc32-ac3a75d15e29",
  "name": "agent-swarm-key",
  "prefix": "QBbZ8XND",
  "message": "API key created successfully. Save this key - it won't be shown again."
}
```

### List ZeroDB Projects

```http
GET /zerodb/v1/projects
Authorization: Bearer <jwt>
```

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "my-project",
    "description": "Project description",
    "tier": "free",
    "status": "ACTIVE",
    "created_at": "2026-01-22T10:30:00Z"
  }
]
```

### Check Project Limits

```http
GET /zerodb/v1/projects/stats/summary
Authorization: Bearer <jwt>
```

**Response (200):**
```json
{
  "total_projects": 1,
  "projects_by_tier": {"free": 1},
  "total_usage": {
    "vectors_count": 5000,
    "tables_count": 2,
    "events_count": 1000
  },
  "active_projects": 1
}
```

### Create ZeroDB Project

```http
POST /zerodb/v1/projects
Authorization: Bearer <jwt>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "my-agent-swarm-project",
  "description": "ZeroDB project for Agent Swarm",
  "tier": "free",
  "database_enabled": true,
  "organization_id": null
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "my-agent-swarm-project",
  "description": "ZeroDB project for Agent Swarm",
  "tier": "free",
  "status": "ACTIVE",
  "user_id": "user-uuid",
  "organization_id": null,
  "database_enabled": true,
  "vector_dimensions": 1536,
  "quantum_enabled": false,
  "mcp_enabled": false,
  "database_config": {
    "vector_dimensions": 1536,
    "quantum_enabled": false,
    "mcp_enabled": false,
    "tier": "free"
  },
  "railway_project_id": null,
  "usage": {
    "vectors_count": 0,
    "tables_count": 0,
    "events_count": 0,
    "memory_usage_mb": 0,
    "storage_usage_mb": 0,
    "tier_limits": {
      "max_projects": 1,
      "max_vectors": 500000,
      "max_tables": 5,
      "max_events_per_month": 50000,
      "max_storage_gb": 1
    }
  },
  "created_at": "2026-01-22T10:30:00Z",
  "updated_at": "2026-01-22T10:30:00Z"
}
```

**Response (403 - Limit Exceeded):**
```json
{
  "detail": "Project limit reached for free tier (1 max)"
}
```

**Tier Limits:**
| Tier | Max Projects |
|------|--------------|
| Free | 1 |
| Pro | 5 |
| Scale | 15 |
| Enterprise | Unlimited |

---

## Step 1: Create Agent Swarm Project

```http
POST /v1/public/agent-swarms/orchestrate
Authorization: Bearer <jwt>
Content-Type: application/json
```

**Request:**
```json
{
  "project_type": "web_app",
  "description": "Full PRD content goes here...",
  "features": ["user_authentication", "crud_operations", "payments"],
  "technologies": ["React", "FastAPI", "ZeroDB"]
}
```

**Response (201):**
```json
{
  "project_id": "baabdea3-8e1d-42ac-b7c0-25130a673963",
  "project_type": "web_app",
  "description": "Full PRD content...",
  "status": "initializing",
  "agents_config": {
    "architect": {"enabled": true, "status": "pending"},
    "frontend_developer": {"enabled": true, "status": "pending"},
    "backend_developer": {"enabled": true, "status": "pending"},
    "qa_engineer": {"enabled": true, "status": "pending"},
    "devops_engineer": {"enabled": true, "status": "pending"}
  },
  "created_at": "2026-01-22T17:03:36.731253",
  "updated_at": "2026-01-22T17:03:36.731269",
  "estimated_completion": "10-15 minutes",
  "message": "Real agent swarm workflow initiated successfully"
}
```

---

## Step 2: Generate Data Model

```http
POST /admin/projects/{project_id}/ai/generate-data-model
Authorization: Bearer <jwt>
Content-Type: application/json
```

**Request:**
```json
{
  "prd_content": "Full PRD text...",
  "project_name": "My App",
  "features": ["user auth", "payments"],
  "technology_preferences": {"database": "zerodb"}
}
```

**Response (200):**
```json
{
  "project_id": "uuid-here",
  "data_model": {
    "database_type": "zerodb",
    "app_template": "ecommerce",
    "schema": {},
    "tables": {
      "users": {
        "columns": [
          {"name": "id", "type": "UUID", "primary": true},
          {"name": "email", "type": "VARCHAR(255)", "unique": true},
          {"name": "created_at", "type": "TIMESTAMP"}
        ]
      },
      "products": {
        "columns": []
      }
    },
    "collections": {
      "user_sessions": {
        "type": "key_value",
        "ttl": 86400
      }
    },
    "vector_collections": {
      "product_embeddings": {
        "type": "vector",
        "dimensions": 1536,
        "metric": "cosine"
      }
    },
    "relationships": {
      "users_orders": {
        "from": "users.id",
        "to": "orders.user_id",
        "type": "one_to_many"
      }
    },
    "indexes": {
      "users_email_idx": {"table": "users", "columns": ["email"]}
    },
    "security_rules": {},
    "api_mappings": {}
  },
  "generated_at": "2026-01-22T10:30:00Z",
  "generator": "ZeroDB Template Engine (Architect Agent)",
  "status": "success"
}
```

**App Template Values:**
- `ecommerce`
- `social_network`
- `task_management`
- `content_management`
- `custom`

---

## Step 3: Generate Backlog

```http
POST /admin/projects/{project_id}/ai/generate-backlog
Authorization: Bearer <jwt>
Content-Type: application/json
```

**Request:**
```json
{
  "prd_content": "Full PRD text...",
  "data_model": { /* from Step 2 */ }
}
```

**Response (200):**
```json
{
  "project_id": "uuid-here",
  "backlog": {
    "epics": [
      {
        "id": 1,
        "title": "User Authentication",
        "description": "Complete user auth system",
        "priority": "must-have",
        "stories": [
          {
            "id": 1,
            "title": "User Registration",
            "description": "As a new user, I want to register...",
            "acceptance_criteria": [
              "User can register with email/password",
              "Email validation is performed"
            ],
            "story_points": 5,
            "tasks": [
              "Create registration API endpoint",
              "Implement email validation"
            ],
            "dependencies": []
          }
        ],
        "total_points": 30
      }
    ],
    "total_story_points": 120,
    "estimated_sprints": 6
  },
  "generated_at": "2026-01-22T10:30:00Z",
  "model_used": "claude-3-5-sonnet-20241022",
  "status": "success"
}
```

---

## Step 4: Generate Sprint Plan

```http
POST /admin/projects/{project_id}/ai/generate-sprint-plan
Authorization: Bearer <jwt>
Content-Type: application/json
```

**Request:**
```json
{
  "backlog": { /* from Step 3 */ },
  "sprint_length_weeks": 2,
  "team_velocity": 20
}
```

**Response (200):**
```json
{
  "project_id": "uuid-here",
  "sprint_plan": {
    "sprints": [
      {
        "number": 1,
        "title": "Sprint 1: Foundation & Core Auth",
        "duration_weeks": 2,
        "goals": [
          "Set up development environment",
          "Implement user authentication",
          "Create database schema"
        ],
        "stories": [
          {
            "epic": "User Authentication",
            "story_id": 1,
            "title": "User Registration",
            "points": 5,
            "priority": "must-have"
          }
        ],
        "total_points": 18,
        "start_date": "2026-01-27",
        "end_date": "2026-02-07",
        "risks": ["Team learning curve with new tech stack"],
        "deliverables": ["Working user registration", "Database migrations"]
      }
    ],
    "total_duration_weeks": 12,
    "total_sprints": 6,
    "velocity_utilization": "85%",
    "deployment_strategy": "Continuous deployment after Sprint 2"
  },
  "generated_at": "2026-01-22T10:30:00Z",
  "model_used": "claude-3-5-sonnet-20241022",
  "status": "success"
}
```

---

## Step 5: Monitor Progress

### Get Project Status

```http
GET /admin/projects/{project_id}/status
Authorization: Bearer <jwt>
```

**Response (200):**
```json
{
  "project_id": "uuid-here",
  "status": "in_progress",
  "current_stage": "frontend_development",
  "progress": 45,
  "message": "Building frontend components...",
  "parallel_execution": true,
  "active_agents": [
    {"stage": "frontend_development", "agent": "Frontend Developer", "status": "working"},
    {"stage": "backend_development", "agent": "Backend Developer", "status": "working"}
  ],
  "stages_completed": [
    "initialization",
    "requirements_analysis",
    "architecture_design"
  ],
  "errors": [],
  "warnings": [],
  "metadata": {
    "data_model": "# Data Model\n...",
    "backlog": "# Backlog\n...",
    "sprint_plan": "# Sprint Plan\n..."
  },
  "completion_url": null,
  "deployment_url": null,
  "updated_at": "2026-01-22T10:35:00Z"
}
```

**Status Values:**
- `initializing`
- `in_progress`
- `completed`
- `failed`
- `paused`

**Stage Values:**
1. `initialization`
2. `requirements_analysis`
3. `architecture_design`
4. `frontend_development`
5. `backend_development`
6. `integration`
7. `security_scanning`
8. `testing`
9. `deployment_setup`
10. `validation`
11. `completion`

### WebSocket Real-time Updates

```
wss://api.ainative.studio/ws/admin/agent-swarm/{project_id}?token={jwt}
```

**Note:** Token parameter is optional (auth skipped for development).

#### Message Types

**connection_established:**
```json
{
  "type": "connection_established",
  "project_id": "uuid-here",
  "message": "Real-time updates active"
}
```

**agent_status_update:**
```json
{
  "type": "agent_status_update",
  "project_id": "uuid-here",
  "agent": "architect",
  "status": "working",
  "progress": 45,
  "task": "Analyzing PRD...",
  "timestamp": 1737544200.123
}
```

**workflow_stage_update:**
```json
{
  "type": "workflow_stage_update",
  "project_id": "uuid-here",
  "stage": "data_model_generation",
  "message": "Generating data model from PRD...",
  "timestamp": 1737544200.123
}
```

**project_progress:**
```json
{
  "type": "project_progress",
  "project_id": "uuid-here",
  "progress": 65,
  "message": "Building components...",
  "timestamp": 1737544200.123
}
```

**workflow_log:**
```json
{
  "type": "workflow_log",
  "project_id": "uuid-here",
  "message": "Created user authentication endpoints",
  "level": "info",
  "emoji": "✅",
  "timestamp": 1737544200.123
}
```

**project_completed:**
```json
{
  "type": "project_completed",
  "project_id": "uuid-here",
  "url": "https://github.com/user/repo",
  "completion_url": "https://github.com/user/repo",
  "deployment_url": "https://app.example.com",
  "timestamp": 1737544200.123
}
```

**project_error:**
```json
{
  "type": "project_error",
  "project_id": "uuid-here",
  "error": "Failed to generate data model: API rate limit exceeded",
  "timestamp": 1737544200.123
}
```

---

## Rate Limits

### Global API Rate Limits

| Tier | Requests/Hour |
|------|---------------|
| Anonymous | 50 |
| Free | 100 |
| Pro | 1,000 |
| Enterprise | 10,000 |

### Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1737547200
```

### Rate Limit Error (429)

```json
{
  "detail": "Rate limit exceeded. Try again in 3600 seconds.",
  "retry_after": 3600
}
```

### Recommended Retry Logic

```typescript
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**
```json
{
  "detail": "Project limit reached for free tier (1 max)"
}
```

**404 Not Found:**
```json
{
  "detail": "Project not found"
}
```

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "prd_content"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**500 Server Error:**
```json
{
  "error": "Service Temporarily Unavailable",
  "detail": "Database connection failed. Please try again later."
}
```

---

## Quick Reference Table

| Step | Action | Endpoint | Method |
|------|--------|----------|--------|
| 0a | Validate GitHub PAT | `/api/v1/github-onboarding/pat/validate` | POST |
| 0a | Store GitHub PAT | `/api/v1/github-onboarding/pat/store` | POST |
| 0a | Check GitHub status | `/api/v1/github-onboarding/connection-status` | GET |
| 0b | List API keys | `/v1/public/settings/api-keys` | GET |
| 0b | Create API key | `/v1/public/settings/api-keys` | POST |
| 0b | List ZeroDB projects | `/zerodb/v1/projects` | GET |
| 0b | Check project limits | `/zerodb/v1/projects/stats/summary` | GET |
| 0b | Create ZeroDB project | `/zerodb/v1/projects` | POST |
| 1 | Create Agent Swarm | `/v1/public/agent-swarms/orchestrate` | POST |
| 2 | Generate data model | `/admin/projects/{id}/ai/generate-data-model` | POST |
| 3 | Generate backlog | `/admin/projects/{id}/ai/generate-backlog` | POST |
| 4 | Generate sprint plan | `/admin/projects/{id}/ai/generate-sprint-plan` | POST |
| 5 | Get project status | `/admin/projects/{id}/status` | GET |
| 5 | Real-time updates | `wss://.../ws/admin/agent-swarm/{id}` | WS |

---

## TypeScript Interfaces

```typescript
// GitHub Types
interface GitHubConnectionStatus {
  connected: boolean;
  github_username: string;
  github_user_id: number;
  avatar_url: string;
  scopes: string[];
  has_required_scopes: boolean;
  missing_scopes: string[];
  last_validated: string;
  organizations: Array<{
    login: string;
    id: number;
    avatar_url: string;
  }>;
}

interface GitHubPATValidation {
  is_valid: boolean;
  github_username?: string;
  github_user_id?: number;
  github_email?: string;
  avatar_url?: string;
  scopes?: string[];
  missing_scopes?: string[];
  rate_limit_remaining?: number;
  organizations?: Array<{login: string; id: number; avatar_url: string}>;
  error_message?: string;
}

// ZeroDB Types
interface ZeroDBProject {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'pro' | 'scale' | 'enterprise';
  status: 'ACTIVE' | 'INACTIVE';
  user_id: string;
  organization_id: string | null;
  database_enabled: boolean;
  vector_dimensions: number;
  quantum_enabled: boolean;
  mcp_enabled: boolean;
  usage: {
    vectors_count: number;
    tables_count: number;
    events_count: number;
    memory_usage_mb: number;
    storage_usage_mb: number;
    tier_limits: {
      max_projects: number;
      max_vectors: number;
      max_tables: number;
      max_events_per_month: number;
      max_storage_gb: number;
    };
  };
  created_at: string;
  updated_at: string;
}

// Agent Swarm Types
interface AgentSwarmProject {
  project_id: string;
  project_type: string;
  description: string;
  status: 'initializing' | 'in_progress' | 'completed' | 'failed' | 'paused';
  agents_config: Record<string, {enabled: boolean; status: string}>;
  created_at: string;
  updated_at: string;
  estimated_completion: string;
  message: string;
}

interface DataModel {
  database_type: string;
  app_template: string;
  schema: object;
  tables: Record<string, {columns: Array<{name: string; type: string; primary?: boolean; unique?: boolean}>}>;
  collections: Record<string, {type: string; ttl?: number}>;
  vector_collections: Record<string, {type: string; dimensions: number; metric: string}>;
  relationships: Record<string, {from: string; to: string; type: string}>;
  indexes: Record<string, {table: string; columns: string[]}>;
  security_rules: object;
  api_mappings: object;
}

interface Backlog {
  epics: Array<{
    id: number;
    title: string;
    description: string;
    priority: string;
    stories: Array<{
      id: number;
      title: string;
      description: string;
      acceptance_criteria: string[];
      story_points: number;
      tasks: string[];
      dependencies: number[];
    }>;
    total_points: number;
  }>;
  total_story_points: number;
  estimated_sprints: number;
}

interface SprintPlan {
  sprints: Array<{
    number: number;
    title: string;
    duration_weeks: number;
    goals: string[];
    stories: Array<{
      epic: string;
      story_id: number;
      title: string;
      points: number;
      priority: string;
    }>;
    total_points: number;
    start_date: string;
    end_date: string;
    risks: string[];
    deliverables: string[];
  }>;
  total_duration_weeks: number;
  total_sprints: number;
  velocity_utilization: string;
  deployment_strategy: string;
}

interface ProjectStatus {
  project_id: string;
  status: 'initializing' | 'in_progress' | 'completed' | 'failed' | 'paused';
  current_stage: string;
  progress: number;
  message: string;
  parallel_execution: boolean;
  active_agents: Array<{stage: string; agent: string; status: string}>;
  stages_completed: string[];
  errors: string[];
  warnings: string[];
  metadata: {
    data_model?: string;
    backlog?: string;
    sprint_plan?: string;
  };
  completion_url?: string;
  deployment_url?: string;
  updated_at: string;
}

// WebSocket Message Types
type WebSocketMessage =
  | {type: 'connection_established'; project_id: string; message: string}
  | {type: 'agent_status_update'; project_id: string; agent: string; status: string; progress: number; task: string; timestamp: number}
  | {type: 'workflow_stage_update'; project_id: string; stage: string; message: string; timestamp: number}
  | {type: 'project_progress'; project_id: string; progress: number; message: string; timestamp: number}
  | {type: 'workflow_log'; project_id: string; message: string; level: string; emoji: string; timestamp: number}
  | {type: 'project_completed'; project_id: string; url: string; completion_url: string; deployment_url: string; timestamp: number}
  | {type: 'project_error'; project_id: string; error: string; timestamp: number};
```

---

## Implementation Notes

1. **GitHub PAT Flow:** Uses Personal Access Token (PAT) validation, NOT OAuth2 flow
2. **Required GitHub Scopes:** `repo`, `workflow` (optional: `admin:org`, `read:org`)
3. **Free Tier Limit:** 1 ZeroDB project - check first, offer reuse or upgrade
4. **AI Calls:** Take 5-30 seconds each - show loading states
5. **Sequential AI Requests:** Don't fire all AI endpoints at once - run sequentially
6. **WebSocket Auth:** Token parameter is optional (auth skipped for development)
7. **Admin Endpoints:** Regular JWT auth works (not admin-only despite `/admin/` path)

---

*Document approved by Backend Team - 2026-01-22*
