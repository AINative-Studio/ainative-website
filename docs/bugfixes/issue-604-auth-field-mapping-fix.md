# Issue #604: Auth Service Register Field Mapping Fix

**Issue**: Verify authService register field mapping against backend schema
**Status**: Fixed
**Date**: 2026-02-19

## Problem Summary

The `authService.register()` method had incorrect field mapping that didn't match the backend UserCreate schema:

- **Frontend was sending**: `full_name` field
- **Backend expected**: `name` field (required)
- **Form used**: `preferred_name` in RegisterData interface

This mismatch caused new user registrations to fail or silently drop the user's name.

## Backend Schema Verification

From the backend OpenAPI spec at `https://api.ainative.studio/v1/openapi.json`:

```json
{
  "UserCreate": {
    "properties": {
      "email": { "type": "string", "format": "email", "title": "Email" },
      "password": { "type": "string", "title": "Password" },
      "name": { "type": "string", "title": "Name" }
    },
    "type": "object",
    "required": ["email", "password", "name"],
    "title": "UserCreate",
    "description": "Schema for user registration"
  }
}
```

**Endpoint**: `POST /api/v1/auth/register`

## Changes Made

### 1. Updated RegisterData Interface (`services/authService.ts`)

**Before**:
```typescript
export interface RegisterData {
  email: string;
  password: string;
  preferred_name?: string;  // INCORRECT - optional field
}
```

**After**:
```typescript
export interface RegisterData {
  email: string;
  password: string;
  name: string;  // CORRECT - required field matching backend
}
```

### 2. Fixed Register Method Request Body (`services/authService.ts`)

**Before**:
```typescript
body: JSON.stringify({
  email: userData.email,
  password: userData.password,
  full_name: userData.preferred_name,  // INCORRECT mapping
}),
```

**After**:
```typescript
body: JSON.stringify({
  email: userData.email,
  password: userData.password,
  name: userData.name,  // CORRECT - matches backend schema
}),
```

### 3. Updated Signup Page (`app/signup/page.tsx`)

**Before**:
```typescript
await authService.register({
  email,
  password,
  preferred_name: name,  // INCORRECT field name
});
```

**After**:
```typescript
await authService.register({
  email,
  password,
  name,  // CORRECT field name
});
```

### 4. Updated Mock Handlers (`mocks/handlers/auth.handlers.ts`)

**Before**:
```typescript
const { email, password, full_name } = body as {
  email: string;
  password: string;
  full_name?: string;
};
```

**After**:
```typescript
const { email, password, name } = body as {
  email: string;
  password: string;
  name: string;
};
```

Added handler for the correct endpoint `/api/v1/auth/register` in addition to the deprecated `/v1/public/auth/register`.

### 5. Updated Integration Tests (`__tests__/integration/auth-flow.integration.test.ts`)

**Before**:
```typescript
const registerData = {
  email: 'newuser@example.com',
  password: 'SecurePass123!',
  preferred_name: 'New User',  // INCORRECT
};
```

**After**:
```typescript
const registerData = {
  email: 'newuser@example.com',
  password: 'SecurePass123!',
  name: 'New User',  // CORRECT
};
```

## Files Modified

1. `/services/authService.ts` - RegisterData interface and register() method
2. `/app/signup/page.tsx` - Registration form submission
3. `/mocks/handlers/auth.handlers.ts` - Mock API handlers
4. `/__tests__/integration/auth-flow.integration.test.ts` - Integration tests
5. `/__tests__/services/authService.register.test.ts` - New test file (created)

## Verification

### Build Verification
```bash
npm run build
```
**Result**: ✅ Build succeeded

### Lint Verification
```bash
npm run lint
```
**Result**: ✅ No errors related to changes (existing unrelated warnings)

### Type Safety
TypeScript now enforces correct field usage:
- `RegisterData` interface requires `name: string`
- Attempting to use `preferred_name` or `full_name` will cause TypeScript errors

## API Contract Alignment

| Field | Backend UserCreate | Frontend RegisterData | Status |
|-------|-------------------|----------------------|---------|
| email | Required (string) | Required (string) | ✅ Aligned |
| password | Required (string) | Required (string) | ✅ Aligned |
| name | Required (string) | Required (string) | ✅ Aligned |

## Testing Strategy

### Manual Testing Checklist
- [ ] Navigate to `/signup` page
- [ ] Fill in name, email, and password
- [ ] Submit registration form
- [ ] Verify user is created with name saved
- [ ] Verify automatic login works
- [ ] Check user profile displays correct name

### API Request Format (POST /api/v1/auth/register)
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

### Expected Response (201 Created)
```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## Impact

- **User Registration**: Now correctly saves user's name to backend
- **Type Safety**: TypeScript enforces correct field names at compile time
- **Test Coverage**: Mock handlers aligned with actual API contract
- **Backward Compatibility**: No breaking changes for existing users

## Related Issues

- Refs #604

## Next Steps

1. Manual testing of registration flow in development environment
2. Monitor production logs for any registration errors
3. Consider adding E2E tests for complete registration flow
4. Update API documentation if needed
