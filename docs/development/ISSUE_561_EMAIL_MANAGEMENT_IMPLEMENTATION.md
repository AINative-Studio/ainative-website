# Issue #561: Email Management Router Frontend Integration

## Status: FRONTEND COMPLETE - AWAITING BACKEND IMPLEMENTATION

## Overview

This issue tracks the integration between the frontend email management service and the backend email API. The frontend portion is now complete and ready for backend API endpoints to be implemented.

## What Was Implemented (Frontend)

### 1. Updated Email Service Endpoints

**File**: `/lib/email-service.ts`

All email service methods have been updated to use the new `/v1/public/emails/` endpoint prefix:

| Method | Old Endpoint | New Endpoint |
|--------|--------------|--------------|
| `getTemplates()` | `/v1/email/templates` | `/v1/public/emails/templates` |
| `getTemplate(id)` | N/A (newly added) | `/v1/public/emails/templates/{id}` |
| `createTemplate(data)` | `/v1/email/templates` | `/v1/public/emails/templates` |
| `updateTemplate(id, data)` | `/v1/email/templates/{id}` | `/v1/public/emails/templates/{id}` |
| `deleteTemplate(id)` | `/v1/email/templates/{id}` | `/v1/public/emails/templates/{id}` |
| `getSettings()` | `/v1/email/settings` | `/v1/public/emails/settings` |
| `updateSettings(data)` | `/v1/email/settings` | `/v1/public/emails/settings` |
| `sendEmail(data)` | `/v1/email/send` | `/v1/public/emails/send` |
| `getHistory(params)` | `/v1/email/history` | `/v1/public/emails/history` |
| `getAnalytics(params)` | `/v1/email/analytics` | `/v1/public/emails/analytics` |

### 2. New Method Added

A new `getTemplate(id: number)` method was added to support fetching individual email templates by ID:

```typescript
async getTemplate(id: number): Promise<EmailTemplate> {
  const response = await apiClient.get<EmailTemplate>(`/v1/public/emails/templates/${id}`);
  return response.data;
}
```

### 3. TypeScript Type Definitions

All TypeScript interfaces are already defined in `/lib/email-service.ts`:

- `EmailTemplate` - Template structure
- `TemplatesResponse` - List of templates with total count
- `CreateTemplateData` - Template creation payload
- `UpdateTemplateData` - Template update payload
- `EmailSettings` - SMTP and sender configuration
- `UpdateSettingsData` - Settings update payload
- `SendEmailData` - Email sending payload
- `SendEmailResponse` - Send confirmation response
- `EmailHistoryItem` - Individual email record
- `EmailHistoryResponse` - Paginated history list
- `HistoryParams` - History query parameters
- `EmailAnalytics` - Analytics dashboard data
- `AnalyticsParams` - Analytics query parameters
- `DeleteResponse` - Delete confirmation

### 4. Client Component

**File**: `/app/dashboard/email/EmailManagementClient.tsx`

The email management UI is fully implemented with:
- Template CRUD operations with visual cards
- Email settings configuration (SMTP, sender info)
- Send test email functionality
- Email history with status indicators
- Analytics dashboard with charts and metrics
- React Query integration for data fetching and caching
- Framer Motion animations
- shadcn/ui components for consistent UI

## Backend Requirements (TO BE IMPLEMENTED)

The backend team needs to implement the following 10 endpoints under `/v1/public/emails/`:

### Template Management

```
GET    /v1/public/emails/templates        - List all templates
POST   /v1/public/emails/templates        - Create new template
GET    /v1/public/emails/templates/{id}   - Get template by ID
PUT    /v1/public/emails/templates/{id}   - Update template
DELETE /v1/public/emails/templates/{id}   - Delete template
```

### Settings Management

```
GET    /v1/public/emails/settings         - Get SMTP settings
PUT    /v1/public/emails/settings         - Update SMTP settings
```

### Email Operations

```
POST   /v1/public/emails/send             - Send email
GET    /v1/public/emails/history          - Get email history (paginated)
GET    /v1/public/emails/analytics        - Get analytics data
```

### Authentication Requirements

All endpoints must support:
- Bearer token authentication via `Authorization: Bearer {token}` header
- Proper 401 responses for unauthenticated requests
- The frontend API client automatically handles token refresh on 401 errors

### Expected Response Formats

All responses should match the TypeScript interfaces defined in `/lib/email-service.ts`. See the type definitions section above for complete schemas.

### Query Parameters

**History Endpoint** (`/v1/public/emails/history`):
```
page: number       - Page number (1-indexed)
pageSize: number   - Items per page
status?: string    - Optional filter by status (sent|delivered|opened|clicked|failed|bounced)
```

**Analytics Endpoint** (`/v1/public/emails/analytics`):
```
startDate?: string - Optional start date (ISO 8601)
endDate?: string   - Optional end date (ISO 8601)
```

## Validation Status

- **TypeScript Type Check**: ✅ Passes (no type-check script available, but build validates types)
- **ESLint**: ✅ No errors introduced by email-service.ts changes
- **Production Build**: ✅ Succeeds (`npm run build` completed successfully)

## API Configuration

The frontend is configured to call the backend API at:

```typescript
// lib/config/app.ts
api: {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000')
}
```

All API calls go through the centralized `api-client.ts` which handles:
- Automatic Bearer token injection
- 401 error handling with token refresh
- Request timeout management
- Error message extraction
- JSON serialization

## Testing Plan

Once backend endpoints are implemented, the following tests should pass:

### Manual Testing
1. Navigate to `/dashboard/email`
2. Test template creation, editing, and deletion
3. Test email settings retrieval (read-only in UI)
4. Send test email and verify in history
5. View analytics dashboard with charts

### Integration Testing
- Verify all 10 API endpoints return correct responses
- Test pagination in history endpoint
- Test filtering by status in history
- Test date range filtering in analytics
- Verify authentication token handling

### Error Handling
- Test 401 response triggers token refresh
- Test 404 for non-existent template IDs
- Test 422 validation errors for invalid payloads

## Files Modified

- `/lib/email-service.ts` - Updated all endpoint URLs and added `getTemplate(id)` method

## Files Referenced (No Changes)

- `/app/dashboard/email/EmailManagementClient.tsx` - Uses the updated service
- `/lib/api-client.ts` - HTTP client with auth handling
- `/lib/config/app.ts` - API configuration

## Next Steps

1. **Backend Team**: Implement the 10 required endpoints in the core backend repository
2. **Backend Team**: Add proper authentication middleware
3. **Backend Team**: Implement email template CRUD operations in database
4. **Backend Team**: Integrate with SMTP service (Resend, SendGrid, or similar)
5. **Backend Team**: Implement email tracking for history and analytics
6. **QA**: Test frontend integration once backend is deployed
7. **Close Issue**: Mark as complete when all endpoints are working in production

## References

- **Issue**: #561
- **Backend Repo**: AINative-Studio/core
- **Frontend Repo**: AINative-Studio/ainative-website-nextjs
- **API Base URL**: https://api.ainative.studio
- **Backend Service**: https://ainative-browser-builder.up.railway.app

## Notes

- The frontend implementation follows all existing patterns for API integration
- Error handling is robust with automatic token refresh on 401 errors
- The UI is fully responsive with loading states and error messages
- All TypeScript types are properly defined for type safety
- The implementation is ready for backend endpoints to go live
