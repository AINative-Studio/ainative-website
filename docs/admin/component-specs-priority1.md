# Admin Dashboard - Component Specifications (Phase 1)

**Issue**: #479
**Phase**: 1 - Priority Pages
**Created**: 2026-01-30

---

## Overview

This document provides detailed specifications for all components required in Phase 1 of the Admin Dashboard migration. Each component includes:
- Purpose and context
- Props interface
- State management
- API integration
- Error handling
- Testing requirements

---

## Page Components

### 1. Admin Login Page

#### File Structure
```
app/admin/login/
├── page.tsx                 # Server component wrapper
└── AdminLoginClient.tsx     # Client component
```

#### Server Component (`page.tsx`)

```tsx
// app/admin/login/page.tsx
import AdminLoginClient from './AdminLoginClient';

export const metadata = {
  title: 'Admin Login',
  description: 'Administrator login portal',
  robots: 'noindex, nofollow', // Prevent search indexing
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}
```

**Specifications**:
- Server component (no 'use client')
- Metadata for SEO (noindex for security)
- No authentication guard (this IS the login page)

---

#### Client Component (`AdminLoginClient.tsx`)

```tsx
// app/admin/login/AdminLoginClient.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import { authService } from '@/services/AuthService';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginError {
  message: string;
  type: 'auth' | 'permission' | 'network';
}

export default function AdminLoginClient() {
  // State management
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);

  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Authenticate user
      const result = await authService.login(formData.email, formData.password);

      if (!result.access_token) {
        throw new Error('Invalid credentials');
      }

      // 2. Fetch user profile
      const user = await authService.getCurrentUser();

      if (!user) {
        throw new Error('Failed to fetch user profile');
      }

      // 3. Verify admin role
      const userRole = user.roles?.[0] || user.role;
      const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERUSER' || user.is_superuser;

      if (!isAdmin) {
        setError({
          message: 'Access denied. Admin privileges required.',
          type: 'permission',
        });
        await authService.logout();
        return;
      }

      // 4. Redirect to admin dashboard
      router.push(callbackUrl);
    } catch (err) {
      console.error('Admin login error:', err);
      setError({
        message: err instanceof Error ? err.message : 'Login failed',
        type: 'auth',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mb-4">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Sign in to access administrative features</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-red-800 bg-red-900/20">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <AlertDescription className="text-red-300 ml-2">
                  {error.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ainative.studio"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying credentials...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              This portal is restricted to authorized administrators only.
              All access attempts are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Specifications**:

| Aspect | Specification |
|--------|---------------|
| **Component Type** | Client Component |
| **State Management** | Local useState (form, loading, error) |
| **Authentication** | authService.login() → getCurrentUser() |
| **Role Verification** | Check user.role or user.roles[0] |
| **Error Handling** | Three types: auth, permission, network |
| **Loading State** | Disabled inputs + spinner |
| **Redirect** | On success → `/admin` or callbackUrl |
| **Security** | Logout on permission denial |

**Dependencies**:
- ✅ `services/AuthService.ts`
- ✅ `components/ui/button`
- ✅ `components/ui/input`
- ✅ `components/ui/label`
- ✅ `components/ui/alert`
- ✅ `lucide-react` icons

**Testing Requirements**:
```typescript
describe('AdminLoginClient', () => {
  it('renders login form');
  it('handles email and password input');
  it('shows loading state during submission');
  it('displays error for invalid credentials');
  it('displays error for non-admin users');
  it('redirects admin users to /admin on success');
  it('logs out user on permission denial');
  it('respects callbackUrl parameter');
});
```

---

### 2. API Keys Management Page

#### File Structure
```
app/admin/api-keys/
├── page.tsx                 # Server component wrapper
└── ApiKeysClient.tsx        # Client component
```

#### Server Component (`page.tsx`)

```tsx
// app/admin/api-keys/page.tsx
import { AdminRouteGuard } from '@/components/guards/AdminRouteGuard';
import ApiKeysClient from './ApiKeysClient';

export default function ApiKeysPage() {
  return (
    <AdminRouteGuard>
      <ApiKeysClient />
    </AdminRouteGuard>
  );
}
```

---

#### Client Component (`ApiKeysClient.tsx`)

```tsx
// app/admin/api-keys/ApiKeysClient.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Key,
  BarChart3,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminService } from '@/lib/admin-service';

// Type definitions
interface AdminApiKey {
  id: string;
  userId: string;
  userEmail: string;
  name: string;
  keyPreview: string;
  created: string;
  lastUsed: string | null;
  requestCount: number;
  status: 'active' | 'inactive';
}

interface ApiKeysResponse {
  keys: AdminApiKey[];
  total: number;
  page: number;
  pageSize: number;
}

export default function ApiKeysClient() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch API keys
  const { data: keysData, isLoading, error } = useQuery({
    queryKey: ['admin-api-keys', page, searchQuery],
    queryFn: () =>
      adminService.getAllApiKeys({
        page,
        pageSize: 50,
        userEmail: searchQuery || undefined,
      }),
  });

  // Revoke API key mutation
  const revokeMutation = useMutation({
    mutationFn: (keyId: string) => adminService.revokeApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-api-keys'] });
    },
  });

  const handleRevoke = async (keyId: string, keyName: string) => {
    if (confirm(`Are you sure you want to revoke the API key "${keyName}"?`)) {
      await revokeMutation.mutateAsync(keyId);
    }
  };

  // Mock data for development
  const mockData: ApiKeysResponse = {
    keys: [
      {
        id: '1',
        userId: 'user-123',
        userEmail: 'john.doe@example.com',
        name: 'Production API',
        keyPreview: 'ak_****7b2c',
        created: '2025-01-15T10:00:00Z',
        lastUsed: '2025-12-21T14:30:00Z',
        requestCount: 12547,
        status: 'active',
      },
      {
        id: '2',
        userId: 'user-456',
        userEmail: 'jane.smith@example.com',
        name: 'Development Key',
        keyPreview: 'ak_****9f3e',
        created: '2025-02-01T09:00:00Z',
        lastUsed: '2025-12-20T11:00:00Z',
        requestCount: 3421,
        status: 'active',
      },
    ],
    total: 2,
    page: 1,
    pageSize: 50,
  };

  const displayData = keysData || mockData;

  // Filter keys by search
  const filteredKeys = displayData.keys.filter((key) =>
    key.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-600' : 'bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">API Keys Management</h1>
              <p className="text-gray-400 mt-1">Monitor and manage all user API keys</p>
            </div>
          </div>
          <Badge variant="outline" className="border-blue-600 text-blue-400">
            {displayData.total} Total Keys
          </Badge>
        </div>

        {/* Search */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by user email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load API keys. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Keys Table */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys ({filteredKeys.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
              </div>
            ) : filteredKeys.length > 0 ? (
              <div className="space-y-3">
                {filteredKeys.map((key) => (
                  <motion.div
                    key={key.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Key className="h-4 w-4 text-blue-400" />
                          <p className="text-white font-medium">{key.name}</p>
                          <Badge className={getStatusColor(key.status)}>{key.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">User</p>
                            <p className="text-gray-300">{key.userEmail}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Key Preview</p>
                            <p className="text-gray-300 font-mono">{key.keyPreview}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Requests</p>
                            <p className="text-gray-300">{key.requestCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Last Used</p>
                            <p className="text-gray-300">
                              {key.lastUsed
                                ? new Date(key.lastUsed).toLocaleDateString()
                                : 'Never'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                          onClick={() => setSelectedKey(key.id)}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevoke(key.id, key.name)}
                          disabled={revokeMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No API keys found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {displayData.total > displayData.pageSize && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-gray-700 border-gray-600 hover:bg-gray-600"
            >
              Previous
            </Button>
            <div className="px-4 py-2 bg-gray-800 text-white rounded-lg">
              Page {page} of {Math.ceil(displayData.total / displayData.pageSize)}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(displayData.total / displayData.pageSize)}
              className="bg-gray-700 border-gray-600 hover:bg-gray-600"
            >
              Next
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
```

**Specifications**:

| Aspect | Specification |
|--------|---------------|
| **Component Type** | Client Component |
| **State Management** | React Query + local useState |
| **Data Fetching** | adminService.getAllApiKeys() |
| **Mutations** | Revoke key (with confirmation) |
| **Search** | Client-side filtering by email |
| **Pagination** | Server-side (50 per page) |
| **Error Handling** | Alert banner + mock fallback |
| **Loading State** | Spinner |

**New Admin Service Methods**:
```typescript
// lib/admin-service.ts
async getAllApiKeys(params: {
  page: number;
  pageSize: number;
  userEmail?: string;
}): Promise<ApiKeysResponse>;

async revokeApiKey(keyId: string): Promise<void>;

async getApiKeyStats(keyId: string): Promise<ApiKeyStats>;
```

**Testing Requirements**:
```typescript
describe('ApiKeysClient', () => {
  it('renders API keys list');
  it('handles search by user email');
  it('displays pagination controls');
  it('shows confirm dialog before revoking key');
  it('updates list after successful revoke');
  it('displays error state on API failure');
  it('shows empty state when no keys found');
  it('navigates back to admin dashboard');
});
```

---

## Shared Components (Future)

### AdminPageHeader

**Status**: Not required for Phase 1 (defer to Phase 2)

```tsx
// components/admin/AdminPageHeader.tsx
interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backLink?: string;
}

export function AdminPageHeader({
  title,
  description,
  actions,
  backLink = '/admin',
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {backLink && (
          <Link href={backLink}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {description && <p className="text-gray-400 mt-1">{description}</p>}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
```

---

## Service Layer Updates

### Admin Service Extensions

**File**: `lib/admin-service.ts`

```typescript
// Add to existing AdminService class

/**
 * Get all API keys across all users (admin only)
 */
async getAllApiKeys(params: {
  page: number;
  pageSize: number;
  userEmail?: string;
}): Promise<ApiKeysResponse> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    ...(params.userEmail && { userEmail: params.userEmail }),
  });

  const response = await apiClient.get<ApiKeysResponse>(
    `/database/admin/api-keys?${queryParams.toString()}`
  );
  return response.data;
}

/**
 * Revoke an API key (admin only)
 */
async revokeApiKey(keyId: string): Promise<void> {
  await apiClient.post(`/database/admin/api-keys/${keyId}/revoke`);
}

/**
 * Get API key usage statistics (admin only)
 */
async getApiKeyStats(keyId: string): Promise<ApiKeyStats> {
  const response = await apiClient.get<ApiKeyStats>(
    `/database/admin/api-keys/${keyId}/stats`
  );
  return response.data;
}
```

---

## Testing Strategy

### Test Coverage Requirements

Each component must achieve **85%+ coverage** across:
- ✅ Rendering tests
- ✅ User interaction tests
- ✅ API integration tests (mocked)
- ✅ Error state tests
- ✅ Loading state tests
- ✅ Accessibility tests

### Example Test Structure

```typescript
// app/admin/login/__tests__/AdminLoginClient.test.tsx
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { authService } from '@/services/AuthService';
import AdminLoginClient from '../AdminLoginClient';

jest.mock('@/services/AuthService');

describe('AdminLoginClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<AdminLoginClient />);
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
    expect(screen.getByLabelText('Admin Email')).toBeInTheDocument();
  });

  it('allows admin users to login', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ access_token: 'token123' });
    const mockGetUser = jest.fn().mockResolvedValue({ role: 'ADMIN' });
    (authService.login as jest.Mock) = mockLogin;
    (authService.getCurrentUser as jest.Mock) = mockGetUser;

    const user = userEvent.setup();
    render(<AdminLoginClient />);

    await user.type(screen.getByLabelText('Admin Email'), 'admin@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'password123');
    });
  });

  it('denies non-admin users', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ access_token: 'token123' });
    const mockGetUser = jest.fn().mockResolvedValue({ role: 'USER' });
    const mockLogout = jest.fn();
    (authService.login as jest.Mock) = mockLogin;
    (authService.getCurrentUser as jest.Mock) = mockGetUser;
    (authService.logout as jest.Mock) = mockLogout;

    const user = userEvent.setup();
    render(<AdminLoginClient />);

    await user.type(screen.getByLabelText('Admin Email'), 'user@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
```

---

## Accessibility Requirements

All components must meet **WCAG 2.1 Level AA** standards:

### Keyboard Navigation
- All interactive elements accessible via Tab
- Enter/Space activates buttons
- Escape closes modals/dialogs
- Focus indicators visible

### Screen Reader Support
- Proper ARIA labels
- Form labels associated with inputs
- Loading states announced
- Error messages announced

### Color Contrast
- Text contrast ratio ≥ 4.5:1
- Interactive elements contrast ≥ 3:1
- Error states distinguishable without color

### Focus Management
- Logical tab order
- Focus trapped in modals
- Focus restored after actions

---

## Performance Considerations

### Code Splitting
- Each admin page is a separate route
- Components lazy-loaded where appropriate
- Heavy dependencies (charts) loaded on-demand

### Bundle Size
- Framer Motion: 50KB (already used)
- React Query: 40KB (already used)
- Lucide Icons: Tree-shaken per icon

### Runtime Performance
- React Query caching reduces API calls
- Debounced search (300ms)
- Virtual scrolling for large lists (future)
- Optimistic UI updates for mutations

---

## Design System Compliance

All components use existing design tokens:

### Colors
- Background: `gray-900`, `gray-800`
- Card: `gray-800/50` with `gray-700` border
- Text: `white`, `gray-400`, `gray-300`
- Primary: `blue-600`, `blue-700`
- Success: `green-600`
- Danger: `red-600`, `red-800`

### Typography
- Headings: `text-3xl font-bold`
- Body: `text-base`
- Labels: `text-sm`
- Metadata: `text-xs`

### Spacing
- Page padding: `p-6`
- Card padding: `p-8`
- Section gaps: `space-y-6`
- Form gaps: `space-y-4`

---

## Summary

### Components to Implement

| Component | File | Lines (est.) | Complexity | Tests Required |
|-----------|------|--------------|------------|----------------|
| Admin Login Page | `app/admin/login/page.tsx` | 10 | Low | 1 |
| Admin Login Client | `app/admin/login/AdminLoginClient.tsx` | 200 | Medium | 8 |
| API Keys Page | `app/admin/api-keys/page.tsx` | 10 | Low | 1 |
| API Keys Client | `app/admin/api-keys/ApiKeysClient.tsx` | 300 | Medium | 10 |
| Admin Service (update) | `lib/admin-service.ts` | 50 | Low | 3 |

**Total**: ~570 lines of code + ~23 tests

---

## Next Steps

1. ✅ Review component specifications
2. Backend: Implement API endpoints
3. Frontend: Implement components per spec
4. Testing: Write unit tests (85%+ coverage)
5. E2E: Write Playwright tests
6. Review: Code review and QA
7. Deploy: Merge to staging

---

## References

- Existing pages: `app/admin/page.tsx`, `app/admin/users/page.tsx`
- Admin service: `lib/admin-service.ts`
- Auth service: `services/AuthService.ts`
- UI components: `components/ui/`
- Guards: `components/guards/AdminRouteGuard.tsx`
