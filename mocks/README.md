# Mock Service Worker (MSW) Setup

This directory contains the complete MSW configuration for mocking API endpoints in tests and development.

## Overview

MSW (Mock Service Worker) intercepts network requests at the service worker level, allowing you to:
- Write tests without hitting real APIs
- Develop features before backend APIs are ready
- Simulate error conditions and edge cases
- Speed up test execution

## Directory Structure

```
mocks/
├── browser.ts              # MSW browser worker setup
├── server.ts               # MSW server setup for Node.js (Jest)
├── init-browser.ts         # Browser initialization script
├── index.ts                # Main exports
├── factories/              # Mock data generators
│   ├── auth.factory.ts
│   ├── user.factory.ts
│   ├── credit.factory.ts
│   ├── subscription.factory.ts
│   ├── rlhf.factory.ts
│   ├── api-key.factory.ts
│   └── index.ts
└── handlers/               # API endpoint handlers
    ├── auth.handlers.ts
    ├── user.handlers.ts
    ├── credit.handlers.ts
    ├── subscription.handlers.ts
    ├── usage.handlers.ts
    ├── rlhf.handlers.ts
    ├── api-key.handlers.ts
    ├── invoice.handlers.ts
    ├── billing.handlers.ts
    ├── community.handlers.ts
    ├── video.handlers.ts
    ├── webinar.handlers.ts
    └── index.ts
```

## Usage

### 1. Jest Tests (Automatic)

MSW is automatically enabled for all Jest tests via `jest.setup.js`.

```typescript
import { render, screen } from '@testing-library/react';
import { UserProfile } from '@/components/UserProfile';

describe('UserProfile', () => {
  it('displays user information', async () => {
    // MSW will intercept the /v1/auth/me API call automatically
    render(<UserProfile />);
    
    expect(await screen.findByText('test@example.com')).toBeInTheDocument();
  });
});
```

### 2. Custom Test Handlers

Override handlers for specific test scenarios:

```typescript
import { server, http, HttpResponse } from '@/mocks/server';
import { UserFactory } from '@/mocks';

describe('Error handling', () => {
  it('handles API errors gracefully', async () => {
    // Override the default handler for this test
    server.use(
      http.get('*/v1/auth/me', () => {
        return HttpResponse.json(
          { detail: 'Unauthorized' },
          { status: 401 }
        );
      })
    );

    render(<UserProfile />);
    
    expect(await screen.findByText('Please log in')).toBeInTheDocument();
  });
});
```

### 3. Playwright E2E Tests

Enable MSW in Playwright tests:

```typescript
import { test, expect } from '@playwright/test';
import { initializeMSW } from './setup/msw.setup';

test.describe('User flow', () => {
  test.beforeEach(async ({ page }) => {
    await initializeMSW(page);
  });

  test('user can log in', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
```

### 4. Development Mode

Enable MSW in the browser during development to work without a backend:

1. Set environment variable:
```bash
NEXT_PUBLIC_ENABLE_MSW=true npm run dev
```

2. Add to `app/layout.tsx`:
```typescript
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_MSW === 'true') {
      import('../mocks/init-browser').then(({ initMockServiceWorker }) => {
        initMockServiceWorker();
      });
    }
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

## Mock Data Factories

Factories provide consistent, realistic test data:

```typescript
import { AuthFactory, UserFactory, SubscriptionFactory } from '@/mocks';

// Create a mock user
const user = UserFactory.createUserProfile({
  email: 'custom@example.com',
  full_name: 'Custom User',
});

// Create a mock subscription
const subscription = SubscriptionFactory.createSubscription({
  status: 'active',
  plan: SubscriptionFactory.createSubscriptionPlan({ name: 'Pro' }),
});

// Create admin user
const admin = UserFactory.createSuperUser();

// Create trial subscription
const trial = SubscriptionFactory.createTrialSubscription();
```

## API Endpoints Mocked

### Authentication (`auth.handlers.ts`)
- `POST /v1/public/auth/login` - Login with email/password
- `POST /v1/public/auth/register` - Register new user
- `GET /v1/auth/me` - Get current user
- `POST /v1/auth/logout` - Logout user
- `POST /v1/public/auth/refresh` - Refresh access token
- `GET /v1/public/auth/verify-email` - Verify email
- `POST /v1/public/auth/github/callback` - GitHub OAuth

### User Management (`user.handlers.ts`)
- `GET /v1/public/auth/me` - Get user profile
- `PUT /v1/public/profile` - Update profile
- `GET /v1/public/profile/preferences` - Get preferences
- `PUT /v1/public/profile/preferences` - Update preferences
- `POST /v1/public/profile/picture` - Upload profile picture
- `DELETE /v1/public/profile/delete` - Delete account

### Subscriptions (`subscription.handlers.ts`)
- `GET /api/v1/subscription` - Get current subscription
- `GET /api/v1/subscription/plans` - List available plans
- `POST /api/v1/subscription/subscribe` - Subscribe to plan
- `POST /api/v1/subscription/cancel` - Cancel subscription
- `GET /api/v1/subscription/invoices` - List invoices
- `GET /api/v1/subscription/payment-methods` - List payment methods

### Credits (`credit.handlers.ts`)
- Credit balance and transaction endpoints

### Usage (`usage.handlers.ts`)
- Usage statistics and history endpoints

### RLHF (`rlhf.handlers.ts`)
- `POST /v1/public/:projectId/database/rlhf/interactions` - Submit feedback
- `GET /v1/public/:projectId/database/rlhf/stats` - Get feedback stats
- `GET /v1/public/:projectId/database/rlhf/workflow/:workflowId` - Get workflow feedback

### API Keys (`api-key.handlers.ts`)
- `GET /api/v1/api-keys` - List API keys
- `POST /api/v1/api-keys` - Create API key
- `DELETE /api/v1/api-keys/:keyId` - Delete API key

### Other Services
- Invoices, Billing, Community, Video, Webinar endpoints

## Testing Patterns

### Test authenticated endpoints
```typescript
import { setAuthState } from '@/mocks/handlers/auth.handlers';
import { UserFactory } from '@/mocks';

beforeEach(() => {
  const user = UserFactory.createUserProfile();
  setAuthState('mock_token_123', user);
});
```

### Test error scenarios
```typescript
import { server, http, HttpResponse } from '@/mocks/server';

it('handles 500 errors', async () => {
  server.use(
    http.get('*/v1/auth/me', () => {
      return HttpResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    })
  );
  
  // Test error handling
});
```

### Test loading states
```typescript
import { delay } from 'msw';

it('shows loading spinner', async () => {
  server.use(
    http.get('*/v1/auth/me', async () => {
      await delay(1000); // Simulate slow network
      return HttpResponse.json(UserFactory.createUserProfile());
    })
  );
  
  // Test loading state
});
```

## Troubleshooting

### MSW not intercepting requests
1. Check that `jest.setup.js` imports MSW server setup
2. Verify the base URL matches your API client configuration
3. Check browser console for MSW initialization messages

### TypeScript errors
1. Ensure all factories export proper types
2. Import types from service files: `import type { UserProfile } from '@/services/userService'`

### Handlers not matching
1. Check the URL pattern in handlers matches your API calls
2. Use wildcards: `${BASE_URL}/api/*` or `*/api/users`
3. Check HTTP method (GET, POST, etc.)

## Best Practices

1. **Use factories** - Always use factory functions for consistent test data
2. **Reset between tests** - MSW automatically resets handlers after each test
3. **Test happy and sad paths** - Mock both success and error responses
4. **Keep handlers simple** - Handlers should return data quickly, avoid complex logic
5. **Match real API** - Keep mock responses consistent with actual API responses
6. **Version handlers with API** - Update handlers when API changes

## Resources

- [MSW Documentation](https://mswjs.io/)
- [MSW with Next.js](https://mswjs.io/docs/integrations/node)
- [MSW with Playwright](https://mswjs.io/docs/integrations/browser)
