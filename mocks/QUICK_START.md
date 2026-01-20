# MSW Quick Start Guide

## Immediate Usage

### 1. In Jest Tests
MSW is already set up! Just write your tests:

```typescript
import { render, screen } from '@testing-library/react';

test('fetches and displays user', async () => {
  render(<UserProfile />);
  // MSW auto-intercepts API calls
  expect(await screen.findByText('test@example.com')).toBeInTheDocument();
});
```

### 2. Override Responses
```typescript
import { server, http, HttpResponse } from '@/mocks/server';

test('handles 404 error', async () => {
  server.use(
    http.get('*/v1/auth/me', () => HttpResponse.json({}, { status: 404 }))
  );
  // Test error handling
});
```

### 3. Use Mock Factories
```typescript
import { UserFactory, SubscriptionFactory } from '@/mocks';

const user = UserFactory.createUserProfile({
  email: 'custom@example.com'
});

const subscription = SubscriptionFactory.createTrialSubscription();
```

### 4. Playwright Tests
```typescript
import { initializeMSW } from './setup/msw.setup';

test.beforeEach(async ({ page }) => {
  await initializeMSW(page);
});
```

### 5. Dev Mode (Optional)
```bash
NEXT_PUBLIC_ENABLE_MSW=true npm run dev
```

## Available Factories
- `AuthFactory` - Login responses, user profiles
- `UserFactory` - User data, preferences
- `SubscriptionFactory` - Plans, subscriptions, invoices
- `CreditFactory` - Credits and transactions
- `RLHFFactory` - Feedback data
- `APIKeyFactory` - API keys

## Available Handlers
All handlers in `/mocks/handlers/`:
- `authHandlers` - Authentication
- `userHandlers` - User management
- `subscriptionHandlers` - Subscriptions
- `creditHandlers` - Credits
- `usageHandlers` - Usage stats
- `rlhfHandlers` - RLHF
- `apiKeyHandlers` - API keys

## Common Patterns

### Test authenticated user
```typescript
import { setAuthState } from '@/mocks/handlers/auth.handlers';

beforeEach(() => {
  setAuthState('token123', UserFactory.createUserProfile());
});
```

### Test loading state
```typescript
import { delay } from 'msw';

server.use(
  http.get('*/api/data', async () => {
    await delay(1000);
    return HttpResponse.json({});
  })
);
```

### Test multiple scenarios
```typescript
describe('User API', () => {
  test('success case', async () => {
    // Uses default MSW handlers
  });

  test('error case', async () => {
    server.use(http.get('*/api/*', () => HttpResponse.error()));
  });
});
```

## Full Documentation
See `/mocks/README.md` for complete documentation.
