# Integration Tests - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies (if needed)
```bash
npm install
```

### 2. Run Integration Tests
```bash
# Run all integration tests
npm run test:integration

# Watch mode for development
npm run test:integration:watch

# Generate coverage report
npm run test:integration:coverage
```

### 3. View Results
```bash
# Open coverage report in browser
open coverage/integration/lcov-report/index.html
```

## What's Included

### 6 Test Suites (99+ Scenarios)

1. **Authentication** - Login, signup, OAuth, token management
2. **Payment & Subscriptions** - Stripe, plans, invoices
3. **Credit System** - Balance, purchases, auto-refill
4. **Video Processing** - Upload, processing, playback
5. **RLHF Feedback** - AI improvement, statistics
6. **Community** - Search, videos, interactions

## Common Commands

```bash
# Run specific test file
npm run test:integration -- auth-flow.integration.test.ts

# Run tests matching pattern
npm run test:integration -- --testNamePattern="login"

# Debug mode
DEBUG_TESTS=true npm run test:integration

# All tests (unit + integration + e2e)
npm run test:all
```

## Writing Your First Test

```typescript
import { setupIntegrationTest, testUtils } from './setup'
import { myService } from '@/services/myService'

describe('My Feature Integration Tests', () => {
  setupIntegrationTest()

  beforeEach(() => {
    testUtils.setupAuthenticatedState()
  })

  it('should complete user workflow', async () => {
    // Given: Setup
    const input = { /* test data */ }

    // When: Execute
    const result = await myService.doSomething(input)

    // Then: Verify
    expect(result.success).toBe(true)
  })
})
```

## Test Structure

```
__tests__/integration/
├── setup.ts                    # Mock server & test infrastructure
├── helpers/test-helpers.ts     # Utilities
├── auth-flow.integration.test.ts
├── payment-subscription-flow.integration.test.ts
├── credit-system-flow.integration.test.ts
├── video-processing-flow.integration.test.ts
├── rlhf-feedback-flow.integration.test.ts
└── community-features-flow.integration.test.ts
```

## Test Helpers Available

```typescript
// Data generators
testDataGenerators.generateUser()
testDataGenerators.generateRandomEmail()

// State management
testUtils.setupAuthenticatedState()
testUtils.clearAuthState()

// Assertions
assertionHelpers.assertApiResponse(response, ['id', 'email'])
assertionHelpers.assertUserStructure(user)

// Performance
performanceHelpers.measureTime(async () => await operation())
performanceHelpers.assertCompletesWithin(operation, 1000)

// Retry logic
retryHelpers.retryWithBackoff(operation, 3)
retryHelpers.pollUntil(operation, condition, 10, 100)
```

## Mock Data Available

```typescript
// From setup.ts
mockUser         // Test user profile
mockTokens       // Auth tokens
mockSubscription // Subscription data
mockCredits      // Credit balance
mockPaymentMethod // Payment info
mockVideo        // Video metadata
```

## CI/CD

Tests run automatically on:
- Push to main/develop
- All pull requests
- Daily at 2 AM UTC

View results in GitHub Actions.

## Troubleshooting

### Tests timing out?
```typescript
it('slow test', async () => {
  // test code
}, 60000) // 60 second timeout
```

### Mock not working?
Check that the URL in your test matches the mock in `setup.ts` exactly.

### Need to debug?
```bash
node --inspect-brk node_modules/.bin/jest --config jest.integration.config.js --runInBand
```

## Coverage Goals

- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

Current suite achieves 70%+ across all services.

## Next Steps

1. Run the tests: `npm run test:integration`
2. Review coverage: `open coverage/integration/lcov-report/index.html`
3. Read full docs: `__tests__/integration/README.md`
4. Add your own tests using the templates provided

## Need Help?

- Check `__tests__/integration/README.md` for detailed docs
- Look at existing tests for examples
- Review `helpers/test-helpers.ts` for available utilities
- Check GitHub Actions logs for CI issues

## Example Test Execution

```bash
$ npm run test:integration

PASS  __tests__/integration/auth-flow.integration.test.ts
  Authentication Flow Integration Tests
    ✓ should complete full registration and login flow (45ms)
    ✓ should handle login with email and password (23ms)
    ✓ should maintain authentication state across requests (67ms)
    ...

PASS  __tests__/integration/payment-subscription-flow.integration.test.ts
  Payment and Subscription Workflow Integration Tests
    ✓ should complete full subscription purchase workflow (89ms)
    ✓ should handle subscription upgrade flow (34ms)
    ...

Test Suites: 6 passed, 6 total
Tests:       99 passed, 99 total
Time:        8.234s
```

## Resources

- [Full Documentation](./README.md)
- [Test Helpers](./helpers/test-helpers.ts)
- [Implementation Summary](../../INTEGRATION_TESTS_SUMMARY.md)
- [Jest Docs](https://jestjs.io/)
- [MSW Docs](https://mswjs.io/)
