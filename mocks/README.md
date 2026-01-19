# MSW (Mock Service Worker) Setup

This directory contains Mock Service Worker configuration for API mocking in development and testing.

## Quick Start

### In Tests (Jest)

MSW is automatically configured. Just import and use:

```typescript
import { AuthFactory, UserFactory, CreditFactory } from '@/mocks';

const user = UserFactory.createUserProfile();
const balance = CreditFactory.createCreditBalance();
```

### In Development (Browser)

Set environment variable:

```bash
NEXT_PUBLIC_ENABLE_MSW=true
```

## Structure

- `factories/` - Mock data generation (AuthFactory, UserFactory, CreditFactory)
- `handlers/` - API request handlers (auth, user, credit endpoints)
- `browser.ts` - Browser worker setup
- `server.ts` - Node.js test server setup
- `index.ts` - Main exports

## Documentation

See `/Users/aideveloper/ainative-website-nextjs-staging/docs/msw-setup-guide.md` for complete usage guide and API reference.

## Covered APIs

- Authentication (login, register, OAuth, email verification)
- User management (profile, preferences, avatar)
- Credit system (balance, transactions, packages)

## Adding New Handlers

1. Create handler file in `handlers/`
2. Export from `handlers/index.ts`
3. Create corresponding factory in `factories/` (if needed)
4. Write tests

See documentation for detailed examples.
