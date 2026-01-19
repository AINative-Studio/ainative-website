#!/bin/bash

# Create all MSW handler and setup files

# Create auth factory (already exists but ensure it's complete)
cat > mocks/factories/auth.factory.ts << 'EOF'
import type { LoginResponse, UserProfile } from '@/services/AuthService';

export class AuthFactory {
  static createUserProfile(overrides?: Partial<UserProfile>): UserProfile {
    return {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      preferred_name: 'Tester',
      full_name: 'Test User',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
      github_username: 'testuser',
      roles: ['user'],
      ...overrides,
    };
  }

  static createLoginResponse(overrides?: Partial<LoginResponse>): LoginResponse {
    return {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      user_id: 'user-123',
      email: 'test@example.com',
      user: AuthFactory.createUserProfile(),
      ...overrides,
    };
  }

  static createAuthenticatedUser(email: string = 'test@example.com', name: string = 'Test User'): UserProfile {
    return AuthFactory.createUserProfile({
      email,
      name,
      preferred_name: name.split(' ')[0],
      full_name: name,
    });
  }

  static createAdminUser(): UserProfile {
    return AuthFactory.createUserProfile({
      id: 'admin-123',
      email: 'admin@ainative.studio',
      name: 'Admin User',
      roles: ['admin', 'user'],
    });
  }

  static createOAuthResponse(provider: 'github' = 'github'): LoginResponse {
    return {
      ...AuthFactory.createLoginResponse(),
      user: AuthFactory.createUserProfile({ github_username: 'oauth_user' }),
    };
  }
}
EOF

# Create browser.ts
cat > mocks/browser.ts << 'EOF'
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export const startMockServiceWorker = async () => {
  if (typeof window === 'undefined') {
    console.warn('MSW browser worker can only be started in a browser environment');
    return;
  }

  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
    console.log('[MSW] Mock Service Worker started successfully');
  } catch (error) {
    console.error('[MSW] Failed to start Mock Service Worker:', error);
  }
};
EOF

# Create server.ts
cat > mocks/server.ts << 'EOF'
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

export const setupMockServer = () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
    console.log('[MSW] Mock server started for testing');
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    console.log('[MSW] Mock server stopped');
  });
};

export const resetMockHandlers = () => {
  server.resetHandlers();
};

export const addMockHandlers = (...additionalHandlers: Parameters<typeof server.use>) => {
  server.use(...additionalHandlers);
};
EOF

# Create index.ts
cat > mocks/index.ts << 'EOF'
export { worker, startMockServiceWorker } from './browser';
export { server, setupMockServer, resetMockHandlers, addMockHandlers } from './server';
export { handlers, authHandlers, userHandlers, creditHandlers } from './handlers';
export { AuthFactory, UserFactory, CreditFactory } from './factories';
EOF

# Create handlers index
cat > mocks/handlers/index.ts << 'EOF'
import { authHandlers } from './auth.handlers';
import { userHandlers } from './user.handlers';
import { creditHandlers } from './credit.handlers';

export const handlers = [...authHandlers, ...userHandlers, ...creditHandlers];
export { authHandlers, userHandlers, creditHandlers };
EOF

echo "MSW files created successfully"
