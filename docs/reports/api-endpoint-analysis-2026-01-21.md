# API Endpoint Analysis Report

**Date**: 2026-01-21
**Purpose**: Compare frontend API endpoints against backend working endpoints
**Backend Reference**: `/Users/ranveerdeshmukh/AINative-core/core/docs/api/WORKING_ENDPOINTS_2026-01-14.json`

---

## Summary

| Category | Count |
|----------|-------|
| **CRITICAL: Will cause 404 errors** | 45+ endpoints |
| **FIXED in this session** | 2 endpoints |
| **Correct endpoints** | ~30 endpoints |
| **Test/Mock files (not production)** | ~50 references |

---

## CRITICAL ISSUES (Will Cause 404 Errors)

### 1. Invoice Service (`services/InvoiceService.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/me/invoices` | `/v1/public/billing/invoices` | **WRONG PATH** |
| `/v1/invoices` | `/v1/public/billing/invoices` | **WRONG PATH** |
| `/v1/me/invoices/{id}/pdf` | Not found | **MISSING** |
| `/v1/me/invoices/{id}/payment-intent` | Not found | **MISSING** |
| `/v1/invoices/{id}/finalize` | Not found | **MISSING** |
| `/v1/invoices/{id}/send-email` | Not found | **MISSING** |
| `/v1/invoices/{id}/void` | Not found | **MISSING** |
| `/v1/invoices/{id}/mark-paid` | Not found | **MISSING** |

**Recommended Fix**: Update to use `/v1/public/billing/invoices`

---

### 2. Organization Service (`lib/organization-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/organizations` | `/v1/public/organizations/` | **WRONG PATH** |
| `/v1/organizations/{id}` | Not found | **MISSING** |
| `/v1/organizations/{id}/members` | Not found | **MISSING** |

**Recommended Fix**: Update to use `/v1/public/organizations/`

---

### 3. Team Service (`lib/team-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/teams` | Not found | **MISSING** |
| `/v1/teams/{id}` | Not found | **MISSING** |
| `/v1/teams/{id}/members` | Not found | **MISSING** |

**Recommended Fix**: Teams API may not be implemented yet, or needs `/v1/public/` prefix

---

### 4. MCP Service (`lib/mcp-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/mcp/catalog` | `/v1/public/mcp/catalog` | **WRONG PATH** |
| `/v1/mcp/deploy` | Not found | **MISSING** |
| `/v1/mcp/{id}` | Not found | **MISSING** |
| `/v1/mcp/{id}/status` | Not found | **MISSING** |
| `/v1/mcp/{id}/logs` | Not found | **MISSING** |
| `/v1/mcp/{id}/restart` | Not found | **MISSING** |
| `/v1/mcp/instances` | `/v1/public/mcp/instances` | **WRONG PATH** |
| `/v1/mcp/{id}/usage` | Not found | **MISSING** |
| `/v1/mcp/{id}/billing` | `/v1/public/mcp/billing/summary` | **WRONG PATH** |
| `/v1/mcp/costs` | Not found | **MISSING** |
| `/v1/mcp/capacity` | Not found | **MISSING** |
| `/v1/mcp/{id}/performance` | Not found | **MISSING** |

**Recommended Fix**: Update to use `/v1/public/mcp/` prefix

---

### 5. Load Testing Service (`lib/load-testing-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/load-testing/scenarios` | `/v1/public/load-testing/scenarios` | **WRONG PATH** |
| `/v1/load-testing/create` | Not found | **MISSING** |
| `/v1/load-testing/{testId}` | Not found | **MISSING** |
| `/v1/load-testing/run` | Not found | **MISSING** |
| `/v1/load-testing/{testId}/metrics` | Not found | **MISSING** |
| `/v1/load-testing/{testId}/cancel` | Not found | **MISSING** |
| `/v1/load-testing/history` | Not found | **MISSING** |

**Backend available**: `/v1/public/load-testing/results`, `/v1/public/load-testing/scenarios`

---

### 6. Email Service (`lib/email-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/email/templates` | Not found | **MISSING** |
| `/v1/email/settings` | Not found | **MISSING** |
| `/v1/email/send` | Not found | **MISSING** |
| `/v1/email/history` | Not found | **MISSING** |
| `/v1/email/analytics` | Not found | **MISSING** |

**Backend available**: Only `/v1/public/emails/health` exists

---

### 7. Video Service (`lib/video-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/video/upload` | Not found | **MISSING** |
| `/v1/video/{videoId}` | Not found | **MISSING** |
| `/v1/video/{videoId}/process` | Not found | **MISSING** |
| `/v1/video/{videoId}/status` | Not found | **MISSING** |
| `/v1/video/library` | Not found | **MISSING** |
| `/v1/video/batch-process` | Not found | **MISSING** |
| `/v1/video/{videoId}/analytics` | Not found | **MISSING** |

**Recommended Fix**: Video API may not be implemented on backend

---

### 8. Agent Service (`lib/agent-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/agents` | `/v1/public/agent-orchestration/agents` | **WRONG PATH** |
| `/v1/agents/{agentId}` | Not found | **MISSING** |
| `/v1/agents/{agentId}/run` | Not found | **MISSING** |
| `/v1/agents/{agentId}/runs` | Not found | **MISSING** |
| `/v1/agents/{agentId}/logs` | Not found | **MISSING** |
| `/v1/agents/templates` | Not found | **MISSING** |

---

### 9. ZeroDB Service (`lib/zerodb-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/zerodb/namespaces` | Not found | **MISSING** |
| `/v1/zerodb/stats` | Not found | **MISSING** |
| `/v1/zerodb/query` | Not found | **MISSING** |
| `/v1/zerodb/vectors` | Not found | **MISSING** |
| `/v1/zerodb/import` | Not found | **MISSING** |
| `/v1/zerodb/export` | Not found | **MISSING** |
| `/v1/zerodb/index` | Not found | **MISSING** |

**Backend available**: `/v1/public/zerodb/search/suggestions/stats` (different structure)

---

### 10. Session Service (`lib/session-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/sessions` | `/v1/public/sessions/` | **WRONG PATH** |
| `/v1/sessions/{sessionId}` | Not found | **MISSING** |
| `/v1/memory/context` | Not found | **MISSING** |
| `/v1/memory/store` | Not found | **MISSING** |
| `/v1/memory/search` | Not found | **MISSING** |
| `/v1/memory/{memoryId}` | Not found | **MISSING** |
| `/v1/memory/stats` | Not found | **MISSING** |
| `/v1/sessions/{sessionId}/memory` | Not found | **MISSING** |

---

### 11. Notification Service (`lib/notification-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/notifications` | Not found | **MISSING** |
| `/v1/notifications/{id}` | Not found | **MISSING** |
| `/v1/notifications/{id}/read` | Not found | **MISSING** |
| `/v1/notifications/mark-all-read` | Not found | **MISSING** |
| `/v1/notifications/preferences` | Not found | **MISSING** |
| `/v1/notifications/subscribe` | Not found | **MISSING** |
| `/v1/notifications/stats` | Not found | **MISSING** |

---

### 12. Webhook Service (`lib/webhook-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/webhooks` | `/v1/public/webhooks/` | **WRONG PATH** |
| `/v1/webhooks/{id}` | Not found | **MISSING** |
| `/v1/webhooks/{id}/test` | Not found | **MISSING** |
| `/v1/webhooks/{id}/deliveries` | Not found | **MISSING** |
| `/v1/webhooks/{id}/toggle` | Not found | **MISSING** |

---

### 13. AI Registry Service (`lib/ai-registry-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/ai-registry/models` | Not found | **MISSING** |
| `/v1/ai-registry/models/{id}` | Not found | **MISSING** |
| `/v1/ai-registry/models/{id}/switch` | Not found | **MISSING** |
| `/v1/ai-usage/summary` | `/v1/public/ai-usage/aggregate` | **WRONG PATH** |
| `/v1/ai-usage/models` | Not found | **MISSING** |
| `/v1/ai-usage/daily` | Not found | **MISSING** |
| `/v1/ai-usage/export` | `/v1/public/ai-usage/export` | **WRONG PATH** |
| `/v1/ai-context/load` | `/v1/public/ai-context/contexts` | **WRONG PATH** |
| `/v1/ai-orchestration/multi-model` | `/v1/public/ai-orchestration/requests` | **WRONG PATH** |

---

### 14. Sandbox Service (`lib/sandbox-service.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/sandbox/environments` | `/v1/public/sandbox/environments` | **WRONG PATH** |
| `/v1/sandbox/create` | Not found | **MISSING** |
| `/v1/sandbox/{sandboxId}` | Not found | **MISSING** |
| `/v1/sandbox/{sandboxId}/execute` | Not found | **MISSING** |
| `/v1/sandbox/{sandboxId}/history` | Not found | **MISSING** |

---

### 15. Tutorial Progress Service (`services/tutorialProgressService.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/tutorials/progress/{id}` | Not found | **MISSING** |
| `/v1/tutorials/progress/{id}/chapter` | Not found | **MISSING** |
| `/v1/tutorials/progress/{id}/quiz` | Not found | **MISSING** |
| `/v1/tutorials/progress/{id}/complete` | Not found | **MISSING** |

---

### 16. QNN API Client (`services/QNNApiClient.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/repositories` | Not found | **MISSING** |
| `/v1/repositories/search` | Not found | **MISSING** |
| `/v1/repositories/{id}` | Not found | **MISSING** |
| `/v1/repositories/{id}/analysis` | Not found | **MISSING** |
| `/v1/repositories/{id}/analyze` | Not found | **MISSING** |
| `/v1/models` | Not found | **MISSING** |
| `/v1/models/{id}` | Not found | **MISSING** |
| `/v1/models/{id}/metadata` | Not found | **MISSING** |
| `/v1/training/start` | Not found | **MISSING** |
| `/v1/training/{id}/status` | Not found | **MISSING** |
| `/v1/training/{id}/logs` | Not found | **MISSING** |
| `/v1/training/{id}/stop` | Not found | **MISSING** |
| `/v1/training/history` | Not found | **MISSING** |
| `/v1/benchmarking/*` | Not found | **MISSING** |
| `/v1/evaluation/*` | Not found | **MISSING** |
| `/v1/monitoring/*` | Not found | **MISSING** |
| `/v1/signing/*` | Not found | **MISSING** |

---

### 17. Conversion Tracking Service (`services/ConversionTrackingService.ts`)

| Frontend Uses | Backend Has | Status |
|---------------|-------------|--------|
| `/v1/events/track` | `/v1/events/conversions` | **WRONG PATH** |
| `/v1/events/funnel` | `/v1/events/reconcile` | **WRONG PATH** |

---

## FIXED IN THIS SESSION

### Subscription Service (`services/subscriptionService.ts`)

| Old Path | New Path | Status |
|----------|----------|--------|
| `/v1/public/subscription/invoices` | `/v1/public/billing/invoices` | **FIXED** |
| `/v1/public/subscription/payment-methods` | `/v1/public/billing/payment-methods` | **FIXED** |

---

## CORRECT ENDPOINTS (Working)

### Auth Service (`services/AuthService.ts`)
- `/v1/public/auth/login` - Needs verification
- `/v1/auth/me` - **EXISTS**
- `/v1/public/auth/me` - **EXISTS**

### Subscription Service (`services/subscriptionService.ts`)
- `/v1/public/subscription` - **EXISTS**
- `/v1/public/subscription/plans` - **EXISTS**
- `/v1/public/subscription/usage` - **EXISTS**

### Billing Service (`services/billingService.ts`)
- `/v1/public/billing` - **EXISTS**
- `/v1/public/billing/info` - **EXISTS**
- `/v1/public/billing/invoices` - **EXISTS**
- `/v1/public/billing/payment-methods` - **EXISTS**

### Credits Service (`services/creditService.ts`)
- `/v1/public/credits/balance` - **EXISTS**
- `/v1/public/credits/transactions` - **EXISTS**
- `/v1/public/credits/packages` - **EXISTS**
- `/v1/public/credits/auto-refill-settings` - **EXISTS**
- `/v1/public/credits/usage/current` - **EXISTS**

### User Settings Service (`services/userSettingsService.ts`)
- `/v1/public/settings/notifications/preferences` - **EXISTS**
- `/v1/public/settings/communication` - **EXISTS**

### Profile Service
- `/v1/public/profile/` - **EXISTS**
- `/v1/public/profile/stats` - **EXISTS**

### API Keys Service (`services/apiKeyService.ts`)
- `/v1/public/api-keys/` - **EXISTS**

### GitHub Service (`services/GitHubService.ts`)
- `/v1/public/github/repositories` - **EXISTS**
- `/v1/public/github/connection-status` - **EXISTS**
- `/v1/public/github/settings` - **EXISTS**

### Agent Swarm Service
- `/v1/public/agent-swarms/` - **EXISTS**
- `/v1/public/agent-swarms/projects` - **EXISTS**
- `/v1/public/agent-swarms/executions` - **EXISTS**

### Pricing Service (`services/pricingService.ts`)
- `/v1/public/pricing/plans` - **EXISTS**
- `/v1/public/pricing/config` - **EXISTS**

### Usage Service (`services/usageService.ts`)
- `/v1/public/ai-usage/aggregate` - **EXISTS**

### Dashboard Service (`services/DashboardService.ts`)
- `/v1/public/dashboard/stats` - **EXISTS**

---

## RECOMMENDATIONS

### Priority 1: Fix Path Prefixes (Quick Wins)

Many services just need `/v1/public/` prefix added:

1. **Organization Service**: `/v1/organizations` -> `/v1/public/organizations/`
2. **MCP Service**: `/v1/mcp/*` -> `/v1/public/mcp/*`
3. **Session Service**: `/v1/sessions` -> `/v1/public/sessions/`
4. **Webhook Service**: `/v1/webhooks` -> `/v1/public/webhooks/`
5. **Sandbox Service**: `/v1/sandbox/*` -> `/v1/public/sandbox/*`

### Priority 2: Backend API Not Implemented

These frontend services reference APIs that don't exist in the backend:

1. **Video Service** - No video endpoints in backend
2. **Email Service** - Only health endpoint exists
3. **Notification Service** - No notification endpoints
4. **Tutorial Progress Service** - No tutorial endpoints
5. **QNN API Client** - Complex ML/AI endpoints not implemented

### Priority 3: Different API Structure

These need more significant refactoring:

1. **Invoice Service** - Uses `/v1/me/invoices` but backend uses `/v1/public/billing/invoices`
2. **Agent Service** - Uses `/v1/agents` but backend uses `/v1/public/agent-orchestration/agents`
3. **AI Registry Service** - Different endpoint structure than backend

---

## ACTION ITEMS

1. [ ] Fix Invoice Service to use `/v1/public/billing/invoices`
2. [ ] Add `/v1/public/` prefix to Organization, MCP, Session, Webhook, Sandbox services
3. [ ] Verify which APIs are actually implemented vs planned
4. [ ] Create stubs/mock endpoints for unimplemented features
5. [ ] Update test files to match corrected endpoints
