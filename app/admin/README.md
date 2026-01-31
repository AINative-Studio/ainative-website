# Admin Dashboard - Next.js Implementation

**Issue**: #479
**Branch**: `feature/479-admin-migration-planning`
**Status**: Phase 1 - Planning Complete

---

## Overview

This directory contains the AINative Studio Admin Dashboard implementation using Next.js 16 App Router.

---

## Current Structure

```
app/admin/
├── README.md                          # This file
├── layout.tsx                         # Admin layout (future)
├── page.tsx                           # ✅ Dashboard Home (COMPLETE)
├── AdminDashboardClient.tsx           # ✅ Dashboard Client (COMPLETE)
│
├── login/                             # ⏳ TO IMPLEMENT
│   └── page.tsx                       # Skeleton
│
├── users/                             # ✅ COMPLETE
│   ├── page.tsx
│   └── UsersClient.tsx
│
├── api-keys/                          # ⏳ TO IMPLEMENT
│   └── page.tsx                       # Skeleton
│
├── monitoring/                        # ✅ COMPLETE (bonus)
│   ├── page.tsx
│   └── MonitoringClient.tsx
│
├── audit/                             # ✅ COMPLETE (bonus)
│   ├── page.tsx
│   └── AuditClient.tsx
│
└── analytics-verify/                  # ✅ COMPLETE (bonus)
    ├── page.tsx
    └── AnalyticsVerifyClient.tsx
```

---

## Phase 1 - Priority Pages

### ✅ COMPLETE

1. **Dashboard Home** (`/admin`)
   - System health overview
   - Metrics (CPU, Memory, Disk)
   - Recent alerts
   - Quick actions

2. **Users Management** (`/admin/users`)
   - User listing with pagination
   - Search/filter by role
   - Role management
   - User status tracking

### ⏳ TO IMPLEMENT

3. **Admin Login** (`/admin/login`)
   - Dedicated admin authentication
   - Role verification
   - See: `docs/admin/component-specs-priority1.md`

4. **API Keys Management** (`/admin/api-keys`)
   - List all user API keys
   - Search/filter by user
   - Revoke keys
   - Usage statistics
   - **Requires backend API endpoints**

---

## Authentication & Authorization

### Route Protection

All admin pages (except `/admin/login`) are protected by `AdminRouteGuard`:

```tsx
import { AdminRouteGuard } from '@/components/guards/AdminRouteGuard';

export default function AdminPage() {
  return (
    <AdminRouteGuard>
      <YourComponent />
    </AdminRouteGuard>
  );
}
```

### Role Requirements

- Required roles: `ADMIN` or `SUPERUSER`
- User role stored in `localStorage.user.role`
- Unauthorized users redirected to `/dashboard`

---

## Services

### Admin Service (`lib/admin-service.ts`)

All admin API calls use the `adminService`:

```typescript
import { adminService } from '@/lib/admin-service';

// Dashboard
await adminService.getDashboardSummary();

// Users
await adminService.getUsers({ page: 1, pageSize: 50 });
await adminService.updateUserRole(userId, 'ADMIN');

// Monitoring
await adminService.getSystemHealth();
await adminService.getSystemMetrics();
await adminService.getSystemLogs({ page: 1, pageSize: 50 });

// TODO: API Keys (to be implemented)
await adminService.getAllApiKeys({ page: 1, pageSize: 50 });
await adminService.revokeApiKey(keyId);
```

---

## Development

### Running Admin Pages

```bash
npm run dev
# Visit http://localhost:3000/admin
```

### Testing

```bash
# Run all admin tests
npm test -- app/admin

# Run specific page tests
npm test -- app/admin/users
```

### Adding a New Admin Page

1. Create directory: `app/admin/[page-name]/`
2. Create `page.tsx` (Server Component with metadata)
3. Create `[PageName]Client.tsx` (Client Component)
4. Wrap with `AdminRouteGuard`
5. Add service methods to `lib/admin-service.ts`
6. Write tests with 85%+ coverage
7. Update this README

---

## API Endpoints

All admin endpoints are prefixed with `/database/admin/`:

### Dashboard
- `GET /database/admin/dashboard/summary`

### Monitoring
- `GET /database/admin/monitoring/health`
- `GET /database/admin/monitoring/metrics`
- `GET /database/admin/monitoring/logs?page=1&pageSize=50`
- `GET /database/admin/monitoring/alerts`

### Users
- `GET /database/admin/users?page=1&pageSize=50&role=`
- `POST /database/admin/users/{id}/role`

### Security
- `POST /database/admin/security/audit-log`

### Stats
- `GET /database/admin/stats/system`

### TODO: API Keys (backend required)
- `GET /database/admin/api-keys?page=1&pageSize=50&userEmail=`
- `POST /database/admin/api-keys/{id}/revoke`
- `GET /database/admin/api-keys/{id}/stats`

---

## Design System

### Theme

All admin pages use a consistent dark theme:

- Background: `bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`
- Cards: `bg-gray-800/50 border-gray-700`
- Text: `text-white`, `text-gray-400`, `text-gray-300`
- Primary: `bg-blue-600 hover:bg-blue-700`

### Components

- **UI**: `components/ui/*` (shadcn/ui)
- **Icons**: `lucide-react`
- **Animations**: `framer-motion`
- **State**: `@tanstack/react-query`

---

## Documentation

- **Migration Plan**: `docs/admin/migration-plan-phase1.md`
- **Component Specs**: `docs/admin/component-specs-priority1.md`
- **Admin Service**: `lib/admin-service.ts`
- **Route Guard**: `components/guards/AdminRouteGuard.tsx`

---

## Next Steps (Phase 2)

1. Implement Admin Login page
2. Implement API Keys page (after backend ready)
3. Add shared `AdminLayout` component
4. Add admin sidebar navigation
5. Implement additional admin pages:
   - Organizations
   - Billing
   - Settings
   - Logs viewer
   - Analytics

---

## Testing Requirements

All admin pages must have:

- ✅ 85%+ code coverage
- ✅ Unit tests for all components
- ✅ API integration tests (mocked)
- ✅ Error state tests
- ✅ Loading state tests
- ✅ Accessibility tests (WCAG AA)
- ✅ E2E tests (Playwright)

---

## Support

For questions or issues:
- See: `docs/admin/migration-plan-phase1.md`
- Issue: #479
- Branch: `feature/479-admin-migration-planning`
