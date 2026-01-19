# Mock Service Worker (MSW) Setup Guide

## Overview

Mock Service Worker (MSW) is configured for API mocking in development and testing environments. This setup allows you to:

- Test API integrations without hitting real endpoints
- Develop frontend features before backend APIs are ready
- Create predictable test scenarios with controlled responses
- Simulate error conditions and edge cases

## Directory Structure

```
mocks/
├── factories/           # Mock data generation
│   ├── auth.factory.ts
│   ├── user.factory.ts
│   ├── credit.factory.ts
│   └── index.ts
├── handlers/            # API request handlers
│   ├── auth.handlers.ts
│   ├── user.handlers.ts
│   ├── credit.handlers.ts
│   └── index.ts
├── browser.ts           # Browser worker setup
├── server.ts            # Node.js server setup
└── index.ts             # Main exports
```

## Installation

MSW is already installed as a dev dependency:

```bash
npm install msw@latest --save-dev
```

The service worker has been initialized in the `public/` directory:

```bash
npx msw init public/ --save
```

## Usage

### In Tests (Jest)

MSW is automatically configured in `jest.setup.js`:

```javascript
import { setupMockServer } from './mocks/server';
setupMockServer();
```

This ensures all tests use mocked API responses by default.

#### Using Factories in Tests

```typescript
import { AuthFactory, UserFactory, CreditFactory } from '@/mocks';

// Create mock data
const user = UserFactory.createUserProfile();
const loginResponse = AuthFactory.createLoginResponse();
const balance = CreditFactory.createCreditBalance();
```

#### Override Handlers in Specific Tests

```typescript
import { server, addMockHandlers } from '@/mocks';
import { http, HttpResponse } from 'msw';

it('should handle API error', async () => {
  // Override handler for this test only
  addMockHandlers(
    http.get('https://api.ainative.studio/v1/auth/me', () => {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    })
  );

  // Test code that expects 401 error
});
```

### In Development (Browser)

To enable MSW in development mode, set the environment variable:

```bash
# .env.local
NEXT_PUBLIC_ENABLE_MSW=true
```

Then add the MSWProvider to your root layout (optional, for browser testing):

```typescript
// app/layout.tsx
import { MSWProvider } from '@/components/MSWProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <MSWProvider>
          {children}
        </MSWProvider>
      </body>
    </html>
  );
}
```

## API Handlers

### Authentication Handlers

Located in `mocks/handlers/auth.handlers.ts`:

- `POST /v1/public/auth/login` - User login
- `POST /v1/public/auth/register` - User registration
- `GET /v1/auth/me` - Get current user
- `POST /v1/auth/logout` - Logout
- `POST /v1/public/auth/refresh` - Refresh access token
- `GET /v1/public/auth/verify-email` - Email verification
- `POST /v1/public/auth/github/callback` - GitHub OAuth

#### Special Test Cases

```typescript
// Trigger authentication failure
await authService.login('fail@example.com', 'wrongpassword');
// Returns: 401 with { detail: 'Invalid credentials' }

// Trigger network error
await authService.login('error@example.com', 'password123');
// Returns: Network error

// Trigger duplicate email on registration
await authService.register({ email: 'duplicate@example.com', password: '123' });
// Returns: 400 with { detail: 'Email already registered' }
```

### User Handlers

Located in `mocks/handlers/user.handlers.ts`:

- `GET /v1/public/auth/me` - Get user profile
- `PUT /v1/public/profile` - Update user profile
- `GET /v1/public/profile/preferences` - Get preferences
- `PUT /v1/public/profile/preferences` - Update preferences
- `GET /v1/public/profile/picture` - Get profile picture
- `POST /v1/public/profile/picture` - Upload profile picture
- `DELETE /v1/public/profile/delete` - Delete account

### Credit Handlers

Located in `mocks/handlers/credit.handlers.ts`:

- `GET /api/v1/credits/balance` - Get credit balance
- `GET /api/v1/credits/transactions` - Get transaction history
- `GET /api/v1/credits/packages` - Get available packages
- `POST /api/v1/credits/purchase` - Purchase credits
- `GET /api/v1/credits` - Get credits (dashboard format)
- `POST /api/v1/credits/auto-refill` - Setup auto-refill
- `GET /api/v1/credits/auto-refill` - Get auto-refill settings

#### Special Test Cases

```typescript
// Trigger invalid package error
await creditService.purchaseCredits('invalid_package');
// Returns: 400 with { success: false, message: 'Invalid package ID' }

// Trigger payment failure
await creditService.purchaseCredits('payment_failed');
// Returns: 402 with { success: false, message: 'Payment processing failed' }
```

## Mock Data Factories

### AuthFactory

```typescript
import { AuthFactory } from '@/mocks';

// Create user profile
const user = AuthFactory.createUserProfile({
  email: 'custom@example.com',
  name: 'Custom User',
});

// Create login response
const loginResponse = AuthFactory.createLoginResponse();

// Create admin user
const admin = AuthFactory.createAdminUser();

// Create OAuth response
const oauthResponse = AuthFactory.createOAuthResponse('github');
```

### UserFactory

```typescript
import { UserFactory } from '@/mocks';

// Create user profile
const user = UserFactory.createUserProfile();

// Create user preferences
const prefs = UserFactory.createUserPreferences({
  theme: 'dark',
  email_notifications: false,
});

// Create multiple users
const users = UserFactory.createUserList(10);

// Create special user types
const superuser = UserFactory.createSuperUser();
const unverified = UserFactory.createUnverifiedUser();
const inactive = UserFactory.createInactiveUser();
```

### CreditFactory

```typescript
import { CreditFactory } from '@/mocks';

// Create credit balance
const balance = CreditFactory.createCreditBalance({
  available: 500,
  used: 500,
  total: 1000,
});

// Create transaction
const transaction = CreditFactory.createCreditTransaction({
  type: 'purchase',
  amount: 1000,
});

// Create transaction history
const history = CreditFactory.createTransactionHistory(20);

// Create credit packages
const packages = CreditFactory.createCreditPackages();

// Create special scenarios
const lowBalance = CreditFactory.createLowBalance();
const depleted = CreditFactory.createDepletedBalance();
```

## Testing Best Practices

### 1. Use Factories for Consistent Data

```typescript
// Good
const user = UserFactory.createUserProfile();

// Avoid
const user = {
  id: '123',
  email: 'test@example.com',
  // ... manual construction
};
```

### 2. Reset Handlers Between Tests

MSW automatically resets handlers after each test via `jest.setup.js`. No manual reset needed.

### 3. Test Error Scenarios

```typescript
it('should handle authentication failure', async () => {
  await expect(
    authService.login('fail@example.com', 'wrongpassword')
  ).rejects.toThrow('Invalid credentials');
});
```

### 4. Test Loading States

```typescript
it('should show loading state while fetching data', async () => {
  // Add delay to handler
  addMockHandlers(
    http.get('https://api.ainative.studio/v1/auth/me', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return HttpResponse.json(UserFactory.createUserProfile());
    })
  );

  // Test loading UI
});
```

### 5. Test Pagination

```typescript
it('should handle paginated results', async () => {
  const result = await creditService.getTransactionHistory({
    page: 2,
    limit: 10,
  });

  expect(result?.transactions).toHaveLength(10);
});
```

## Debugging

### Enable MSW Logging

```typescript
// In browser.ts or server.ts
worker.start({
  onUnhandledRequest: 'warn', // Log unhandled requests
});
```

### Check Active Handlers

```typescript
import { server } from '@/mocks';

console.log('Active handlers:', server.listHandlers());
```

### Inspect Request/Response

Add logging to handlers:

```typescript
http.get('/api/endpoint', ({ request }) => {
  console.log('Request URL:', request.url);
  console.log('Request headers:', request.headers);

  const response = HttpResponse.json({ data: 'test' });
  console.log('Response:', response);

  return response;
});
```

## Common Issues

### Issue: Handlers not intercepting requests

**Solution:** Ensure MSW is started before making requests:
- In tests: `setupMockServer()` is called in `jest.setup.js`
- In browser: `startMockServiceWorker()` is called in `MSWProvider`

### Issue: Type errors with factories

**Solution:** Ensure service interfaces match factory types:

```typescript
// If you get type errors, check that your service types are up to date
import type { UserProfile } from '@/services/UserService';
```

### Issue: Service worker not found in browser

**Solution:** Re-run MSW initialization:

```bash
npx msw init public/ --save
```

## Environment Variables

```bash
# .env.local

# Enable MSW in development (optional, for browser mocking)
NEXT_PUBLIC_ENABLE_MSW=true

# API base URL (used by handlers)
NEXT_PUBLIC_API_BASE_URL=https://api.ainative.studio
```

## Coverage

Current MSW setup covers:

- Authentication (login, register, logout, OAuth, email verification)
- User management (profile, preferences, avatar)
- Credit system (balance, transactions, packages, auto-refill)

### Adding New Handlers

1. Create handler file in `mocks/handlers/`:

```typescript
// mocks/handlers/newfeature.handlers.ts
import { http, HttpResponse } from 'msw';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';

export const newFeatureHandlers = [
  http.get(`${API_BASE_URL}/api/v1/newfeature`, () => {
    return HttpResponse.json({ data: 'test' });
  }),
];
```

2. Add to `mocks/handlers/index.ts`:

```typescript
import { newFeatureHandlers } from './newfeature.handlers';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...creditHandlers,
  ...newFeatureHandlers, // Add here
];
```

3. Create corresponding factory if needed:

```typescript
// mocks/factories/newfeature.factory.ts
export class NewFeatureFactory {
  static createData(overrides?: Partial<Data>): Data {
    return {
      id: '1',
      name: 'Test',
      ...overrides,
    };
  }
}
```

4. Write tests using the new handlers and factories

## Resources

- [MSW Documentation](https://mswjs.io/docs/)
- [MSW with Next.js](https://mswjs.io/docs/integrations/node)
- [MSW with Jest](https://mswjs.io/docs/integrations/jest)
- [HTTP Response API](https://mswjs.io/docs/api/http-response)
