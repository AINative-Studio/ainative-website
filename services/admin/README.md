# Admin API Service Layer

Comprehensive TypeScript service layer for the AINative Studio admin dashboard. Provides fully typed, tested, and documented API clients for all admin operations.

## Features

- Full TypeScript support with comprehensive type definitions
- Automatic `/admin` path prefixing
- Error handling with meaningful messages
- Request/response transformation
- Query string building utilities
- 69% test coverage with 117 passing tests
- 100% function coverage

## Installation

The admin services are already part of the project. Import from `@/services/admin`:

```typescript
import { adminUserService, adminApiKeyService } from '@/services/admin';
```

## Available Services

### 1. User Management (`adminUserService`)

Manage users, roles, and permissions.

```typescript
import { adminUserService } from '@/services/admin';

// List users with pagination and filters
const users = await adminUserService.listUsers({
  page: 1,
  limit: 20,
  search: 'john@example.com',
  role: 'ADMIN',
  is_active: true,
});

// Get single user
const user = await adminUserService.getUser('user123');

// Create user
const newUser = await adminUserService.createUser({
  email: 'newadmin@example.com',
  password: 'SecurePass123!',
  full_name: 'New Admin',
  role: 'ADMIN',
});

// Update user
const updated = await adminUserService.updateUser('user123', {
  full_name: 'Updated Name',
  is_active: false,
});

// Delete user
await adminUserService.deleteUser('user123');

// Activate/Deactivate
await adminUserService.activateUser('user123');
await adminUserService.deactivateUser('user123');

// Reset password
const { temporary_password } = await adminUserService.resetPassword('user123');

// Send verification email
await adminUserService.sendVerificationEmail('user123');
```

### 2. API Key Management (`adminApiKeyService`)

Manage API keys across all users.

```typescript
import { adminApiKeyService } from '@/services/admin';

// List all API keys
const keys = await adminApiKeyService.listApiKeys({
  user_id: 'user123',
  status: 'active',
  page: 1,
  limit: 20,
});

// Get single API key
const key = await adminApiKeyService.getApiKey('key123');

// Create API key for a user
const newKey = await adminApiKeyService.createApiKey('user123', {
  name: 'Production API Key',
  scopes: ['read', 'write'],
  rate_limit: 1000,
});
console.log('Full key (shown only once):', newKey.key);

// Get usage statistics
const usage = await adminApiKeyService.getApiKeyUsage('key123');

// Get aggregated stats
const stats = await adminApiKeyService.getUsageStats({
  user_id: 'user123',
  days: 30,
});

// Revoke API key
await adminApiKeyService.revokeApiKey('key123');

// Update rate limit
await adminApiKeyService.updateRateLimit('key123', 5000);

// Activate/Deactivate
await adminApiKeyService.activateApiKey('key123');
await adminApiKeyService.deactivateApiKey('key123');
```

### 3. RLHF Dashboard (`adminRLHFService`)

Monitor and manage RLHF models and experiments.

```typescript
import { adminRLHFService } from '@/services/admin';

// Get overview metrics
const overview = await adminRLHFService.getOverview();

// Get model deployments
const deployments = await adminRLHFService.getDeployments();

// Get quality insights
const insights = await adminRLHFService.getQualityInsights();

// Get realtime status
const status = await adminRLHFService.getRealtimeStatus();

// Create experiment
const experiment = await adminRLHFService.createExperiment({
  name: 'Test Experiment',
  description: 'Testing model improvements',
  model_id: 'model123',
  test_prompts: ['Prompt 1', 'Prompt 2'],
  comparison_model_id: 'baseline',
});

// Deploy model
await adminRLHFService.deployModel('model123', '2.0.0');

// Get feedback history
const feedback = await adminRLHFService.getFeedbackHistory('model123', {
  limit: 50,
  offset: 0,
});
```

### 4. Monitoring & Health (`adminMonitoringService`)

System monitoring, health checks, and logs.

```typescript
import { adminMonitoringService } from '@/services/admin';

// Get monitoring dashboard
const dashboard = await adminMonitoringService.getDashboard();

// Health check
const health = await adminMonitoringService.getHealth();

// Current metrics
const metrics = await adminMonitoringService.getMetrics();

// Historical metrics
const historical = await adminMonitoringService.getHistoricalMetrics({
  start_date: '2024-01-01',
  end_date: '2024-01-15',
  interval: 'day',
});

// Audit logs
const auditLogs = await adminMonitoringService.getAuditLogs({
  user_id: 'user123',
  action: 'USER_CREATED',
  start_date: '2024-01-01',
  limit: 50,
});

// Error logs
const errorLogs = await adminMonitoringService.getErrorLogs({
  level: 'error',
  limit: 100,
});

// Get alerts
const alerts = await adminMonitoringService.getAlerts({
  status: 'active',
  severity: 'high',
});

// Acknowledge alert
await adminMonitoringService.acknowledgeAlert('alert123');

// Resolve alert
await adminMonitoringService.resolveAlert('alert123', 'Scaled up servers');
```

### 5. Evaluation & Testing (`adminEvaluationService`)

Model evaluation and quality assurance.

```typescript
import { adminEvaluationService } from '@/services/admin';

// Get analytics
const analytics = await adminEvaluationService.getAnalytics();

// Run evaluation
const evaluation = await adminEvaluationService.runEvaluation({
  model_id: 'model123',
  evaluation_criteria: ['accuracy', 'latency', 'safety'],
});

// Recent evaluations
const recent = await adminEvaluationService.getRecentEvaluations(10);

// Performance analysis
const performance = await adminEvaluationService.getPerformanceAnalysis({
  model_id: 'model123',
  days: 30,
});

// Quality trends
const trends = await adminEvaluationService.getQualityTrends();

// Security assessment
const security = await adminEvaluationService.getSecurityAssessment();

// Test coverage
const coverage = await adminEvaluationService.getTestCoverage();

// Get evaluation details
const details = await adminEvaluationService.getEvaluationDetails('eval123');

// Cancel evaluation
await adminEvaluationService.cancelEvaluation('eval123');
```

### 6. Enterprise Management (`adminEnterpriseService`)

Team and project analytics.

```typescript
import { adminEnterpriseService } from '@/services/admin';

// Team activity
const teamActivity = await adminEnterpriseService.getTeamActivity({
  days: 7,
  team_id: 'team123',
});

// Project analytics
const projectAnalytics = await adminEnterpriseService.getProjectAnalytics({
  days: 30,
});

// Security metrics
const securityMetrics = await adminEnterpriseService.getSecurityMetrics();

// Collaboration data
const collaboration = await adminEnterpriseService.getCollaborationData({
  team_id: 'team123',
});
```

### 7. Agent Swarm (`adminAgentService`)

Manage AI agent orchestration.

```typescript
import { adminAgentService } from '@/services/admin';

// List projects
const projects = await adminAgentService.listProjects({
  status: 'active',
  limit: 20,
});

// Orchestrate task
const task = await adminAgentService.orchestrate({
  project_id: 'proj123',
  task_description: 'Build authentication feature',
  agent_types: ['frontend', 'backend', 'testing'],
  max_agents: 5,
});

// Get agent types
const agentTypes = await adminAgentService.getAgentTypes();

// Get metrics
const metrics = await adminAgentService.getMetrics({
  days: 7,
});

// Get task status
const status = await adminAgentService.getTaskStatus('task123');

// Cancel task
await adminAgentService.cancelTask('task123');
```

### 8. ZeroDB Management (`adminZeroDBService`)

Manage ZeroDB projects and usage.

```typescript
import { adminZeroDBService } from '@/services/admin';

// Get statistics
const stats = await adminZeroDBService.getStats();

// List projects
const projects = await adminZeroDBService.listProjects({
  limit: 20,
  sort_by: 'created_at',
});

// Usage analytics
const analytics = await adminZeroDBService.getUsageAnalytics({
  days: 30,
  project_id: 'proj123',
});

// Get project
const project = await adminZeroDBService.getProject('proj123');

// Get collections
const collections = await adminZeroDBService.getCollections('proj123');

// User usage
const userUsage = await adminZeroDBService.getUserUsage('user123');
```

### 9. Billing & Credits (`adminBillingService`)

Manage billing and credit operations.

```typescript
import { adminBillingService } from '@/services/admin';

// Get billing info
const billing = await adminBillingService.getBillingInfo('user123');

// List invoices
const invoices = await adminBillingService.listInvoices({
  user_id: 'user123',
  status: 'paid',
});

// Get invoice
const invoice = await adminBillingService.getInvoice('inv123');

// Payment methods
const methods = await adminBillingService.getPaymentMethods('user123');

// Credit balance
const balance = await adminBillingService.getCreditBalance('user123');

// Credit transactions
const transactions = await adminBillingService.listCreditTransactions({
  user_id: 'user123',
  type: 'purchase',
});

// Current usage
const usage = await adminBillingService.getCurrentUsage('user123');

// Credit packages
const packages = await adminBillingService.getCreditPackages();

// Purchase credits
const purchase = await adminBillingService.purchaseCredits('user123', 'pkg1');

// Add bonus credits
await adminBillingService.addBonusCredits('user123', 1000, 'Promotion');

// Auto-refill settings
const settings = await adminBillingService.getAutoRefillSettings('user123');

// Update auto-refill
await adminBillingService.updateAutoRefillSettings('user123', {
  enabled: true,
  threshold_credits: 100,
  refill_amount: 1000,
});
```

## Error Handling

All services throw errors on failure. Always wrap calls in try-catch:

```typescript
try {
  const users = await adminUserService.listUsers();
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to fetch users:', error.message);
  }
}
```

Common error scenarios:
- **401 Unauthorized**: Invalid or expired auth token
- **403 Forbidden**: Insufficient permissions (non-admin)
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Backend error

## Type Safety

All services are fully typed. Import types as needed:

```typescript
import type {
  AdminUser,
  UserListFilters,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
} from '@/services/admin/types';

const filters: UserListFilters = {
  page: 1,
  limit: 20,
  search: 'test',
  role: 'ADMIN',
};

const users: PaginatedResponse<AdminUser> = await adminUserService.listUsers(filters);
```

## Testing

All services have comprehensive test coverage:

```bash
# Run admin service tests
npm test -- services/admin/__tests__

# Run with coverage
npm test -- services/admin/__tests__ --coverage
```

Test coverage:
- Statements: 69%
- Branches: 41.53%
- Functions: 100%
- Lines: 68.48%

## Architecture

### Client Layer

`adminApi` - Base HTTP client with automatic `/admin` prefix:

```typescript
import { adminApi } from '@/services/admin/client';

// All paths automatically prefixed with /admin
const response = await adminApi.get('users'); // → GET /admin/users
const created = await adminApi.post('keys', data); // → POST /admin/keys
```

### Service Layer

Each service wraps the client with domain-specific methods:

```typescript
export class AdminUserService {
  private readonly basePath = 'users';

  async listUsers(filters?: UserListFilters): Promise<PaginatedResponse<AdminUser>> {
    const queryString = filters ? adminApi.buildQueryString(filters) : '';
    const response = await adminApi.get<PaginatedResponse<AdminUser>>(
      `${this.basePath}${queryString}`
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch users');
    }

    return response.data;
  }
}
```

### Type Definitions

All types in `types.ts`:
- Request/Response types
- Entity models
- Pagination/Filtering types
- Operation results

## Best Practices

1. **Always handle errors**:
   ```typescript
   try {
     const result = await adminUserService.createUser(userData);
   } catch (error) {
     // Handle error
   }
   ```

2. **Use TypeScript types**:
   ```typescript
   import type { CreateUserRequest } from '@/services/admin/types';
   const userData: CreateUserRequest = { ... };
   ```

3. **Validate data before API calls**:
   ```typescript
   if (!email || !password) {
     throw new Error('Email and password required');
   }
   await adminUserService.createUser({ email, password });
   ```

4. **Use pagination for large datasets**:
   ```typescript
   const users = await adminUserService.listUsers({
     page: 1,
     limit: 20,
   });
   ```

5. **Filter and search efficiently**:
   ```typescript
   const activeAdmins = await adminUserService.listUsers({
     role: 'ADMIN',
     is_active: true,
     search: 'john',
   });
   ```

## Contributing

When adding new endpoints:

1. Add types to `types.ts`
2. Create service class in separate file
3. Export from `index.ts`
4. Write comprehensive tests
5. Update this README

## License

Part of AINative Studio - Internal use only
