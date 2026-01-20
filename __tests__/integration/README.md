# Integration Tests Suite

Comprehensive integration tests for AINative Studio covering cross-service workflows and real-world user scenarios.

## Overview

This integration test suite validates complete user workflows that span multiple services and components. Unlike unit tests that test individual functions in isolation, integration tests verify that different parts of the application work correctly together.

## Test Coverage

### 1. Authentication Flow Tests (`auth-flow.integration.test.ts`)
Tests complete authentication workflows including:
- User registration and automatic login
- Email/password login with token management
- OAuth GitHub authentication flow
- Token refresh and session management
- Cross-subdomain SSO
- Logout and state cleanup
- Concurrent authentication scenarios

**Coverage**: 15+ test scenarios

### 2. Payment & Subscription Flow Tests (`payment-subscription-flow.integration.test.ts`)
Tests payment and subscription management:
- Complete subscription purchase workflow
- Stripe checkout session creation
- Payment method management (add, remove, set default)
- Subscription upgrades and downgrades
- Cancellation and reactivation
- Invoice history and management
- Usage tracking integration

**Coverage**: 20+ test scenarios

### 3. Credit System Flow Tests (`credit-system-flow.integration.test.ts`)
Tests credit management workflows:
- Credit balance checking and transaction history
- Credit package purchases
- Auto-refill configuration and management
- Credit usage tracking
- Integration with subscriptions
- Credit expiration handling
- Display formatting and UI helpers

**Coverage**: 18+ test scenarios

### 4. Video Processing Flow Tests (`video-processing-flow.integration.test.ts`)
Tests video upload and processing workflows:
- Video upload initiation with presigned URLs
- Processing status tracking and polling
- Video metadata retrieval
- Playback URL generation with expiration
- Storage and access control
- Multi-format support
- Concurrent uploads
- Error handling and recovery

**Coverage**: 15+ test scenarios

### 5. RLHF Feedback Flow Tests (`rlhf-feedback-flow.integration.test.ts`)
Tests feedback collection for AI improvement:
- Positive and negative feedback submission
- Workflow step feedback tracking
- Agent-specific feedback aggregation
- Feedback statistics and analytics
- Performance trend tracking
- Multi-user feedback scenarios
- Agent improvement tracking

**Coverage**: 16+ test scenarios

### 6. Community Features Flow Tests (`community-features-flow.integration.test.ts`)
Tests community interaction workflows:
- Content search with filters and pagination
- Video discovery and browsing
- Video interactions (like, share, comment)
- Authenticated vs unauthenticated access
- Community analytics
- Content moderation features

**Coverage**: 15+ test scenarios

## Test Structure

```
__tests__/integration/
├── setup.ts                          # Test infrastructure and mock server
├── helpers/
│   └── test-helpers.ts              # Reusable test utilities
├── auth-flow.integration.test.ts    # Authentication workflows
├── payment-subscription-flow.integration.test.ts
├── credit-system-flow.integration.test.ts
├── video-processing-flow.integration.test.ts
├── rlhf-feedback-flow.integration.test.ts
└── community-features-flow.integration.test.ts
```

## Running Tests

### Run All Integration Tests
```bash
npm run test:integration
```

### Run Integration Tests in Watch Mode
```bash
npm run test:integration:watch
```

### Run Integration Tests with Coverage
```bash
npm run test:integration:coverage
```

### Run Performance Tests Only
```bash
npm run test:integration:performance
```

### Run All Tests (Unit + Integration + E2E)
```bash
npm run test:all
```

### Run Specific Test File
```bash
npm run test:integration -- auth-flow.integration.test.ts
```

### Run Tests Matching Pattern
```bash
npm run test:integration -- --testNamePattern="authentication"
```

## Mock Server Setup

Integration tests use MSW (Mock Service Worker) to intercept and mock API calls. The mock server is configured in `setup.ts` and provides:

- Consistent test data across all tests
- Fast execution without real network calls
- Deterministic test results
- Easy debugging of test failures

### Mock Data Available

- `mockUser` - Test user profile
- `mockTokens` - Authentication tokens
- `mockSubscription` - Subscription data
- `mockCredits` - Credit balance data
- `mockPaymentMethod` - Payment method data
- `mockVideo` - Video metadata

### Test Utilities

The `testUtils` object provides helpers for:

```typescript
// Auth state management
testUtils.setAuthToken()
testUtils.clearAuthToken()
testUtils.setupAuthenticatedState()
testUtils.clearAuthState()

// Async helpers
await testUtils.waitFor(100) // Wait 100ms
```

## Test Helpers

The `helpers/test-helpers.ts` file provides comprehensive utilities:

### Data Generators
```typescript
testDataGenerators.generateUser({ email: 'custom@example.com' })
testDataGenerators.generateRandomEmail()
testDataGenerators.generateTimestamp(7) // 7 days in future
```

### Assertion Helpers
```typescript
assertionHelpers.assertApiResponse(response, ['id', 'email'])
assertionHelpers.assertUserStructure(user)
assertionHelpers.assertFutureDate(dateString)
```

### State Management
```typescript
stateHelpers.setupCompleteState()
stateHelpers.clearAllState()
stateHelpers.isAuthenticated()
```

### Performance Testing
```typescript
const { result, timeMs } = await performanceHelpers.measureTime(async () => {
  return await someOperation()
})

await performanceHelpers.assertCompletesWithin(operation, 1000)
```

### Retry Helpers
```typescript
const result = await retryHelpers.retryWithBackoff(operation, 3)
const result = await retryHelpers.pollUntil(
  operation,
  (result) => result.status === 'ready',
  10,
  100
)
```

## CI/CD Integration

Integration tests run automatically in CI/CD pipelines:

### GitHub Actions Workflow
- Runs on push to main/develop branches
- Runs on all pull requests
- Scheduled daily runs at 2 AM UTC
- Generates and uploads coverage reports
- Comments coverage on PRs

### Pipeline Jobs
1. **integration-tests** - Standard integration test suite
2. **integration-tests-e2e** - Combined integration and E2E tests
3. **integration-tests-performance** - Performance-focused tests

### Coverage Requirements
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## Writing New Integration Tests

### Best Practices

1. **Test Real User Workflows**
   ```typescript
   it('should complete new user signup to first API call', async () => {
     // Step 1: Register
     await authService.register(userData)

     // Step 2: Verify authenticated
     expect(authService.isAuthenticated()).toBe(true)

     // Step 3: Make API call
     const result = await apiService.someCall()
     expect(result).toBeDefined()
   })
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should deduct credits after successful API call', async () => {})

   // Bad
   it('test credits', async () => {})
   ```

3. **Setup and Teardown**
   ```typescript
   beforeEach(() => {
     testUtils.setupAuthenticatedState()
   })

   afterEach(() => {
     testUtils.clearAuthState()
   })
   ```

4. **Test Error Scenarios**
   ```typescript
   it('should handle network failures gracefully', async () => {
     // Test error handling
   })
   ```

5. **Test Edge Cases**
   ```typescript
   it('should handle concurrent operations', async () => {
     const results = await Promise.all([
       operation1(),
       operation2(),
       operation3(),
     ])
     // Verify all succeeded
   })
   ```

### Template for New Test

```typescript
/**
 * [Feature Name] Integration Tests
 * Tests [description of workflows]
 */

import { setupIntegrationTest, testUtils } from './setup'
import { someService } from '@/services/someService'

describe('[Feature Name] Integration Tests', () => {
  setupIntegrationTest()

  beforeEach(() => {
    testUtils.setupAuthenticatedState()
  })

  describe('[Workflow Name]', () => {
    it('should [expected behavior]', async () => {
      // Given: Setup
      const data = { /* test data */ }

      // When: Execute
      const result = await someService.someMethod(data)

      // Then: Verify
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })
  })
})
```

## Debugging Integration Tests

### Enable Debug Logging
```bash
DEBUG_TESTS=true npm run test:integration
```

### Run Single Test in Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --config jest.integration.config.js --runInBand auth-flow.integration.test.ts
```

### View Coverage Report
```bash
npm run test:integration:coverage
open coverage/integration/lcov-report/index.html
```

### Common Issues

1. **Test Timeout**
   - Increase timeout in test: `it('test', async () => {}, 60000)`
   - Or in config: `testTimeout: 30000`

2. **Mock Not Working**
   - Verify mock is registered in `setup.ts`
   - Check URL matches exactly
   - Ensure MSW server is started

3. **State Leakage Between Tests**
   - Use `beforeEach` to reset state
   - Always clear localStorage/sessionStorage
   - Reset mock handlers

## Test Metrics

### Current Coverage

- **Total Integration Test Scenarios**: 99+
- **Services Covered**: 10+
- **Critical User Flows**: 15+
- **Average Test Duration**: <100ms per test
- **Total Suite Duration**: ~5-10 seconds

### Test Distribution

- Authentication: 15 scenarios
- Payment/Subscription: 20 scenarios
- Credits: 18 scenarios
- Videos: 15 scenarios
- RLHF: 16 scenarios
- Community: 15 scenarios

## Contributing

When adding new integration tests:

1. Follow existing patterns in similar test files
2. Use provided test helpers and utilities
3. Add appropriate documentation
4. Ensure tests are deterministic and fast
5. Update this README if adding new test categories

## Resources

- [Jest Documentation](https://jestjs.io/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)

## Support

For questions or issues with integration tests:
1. Check existing test files for examples
2. Review test helper documentation
3. Check GitHub Actions workflow logs
4. Contact the QA team
