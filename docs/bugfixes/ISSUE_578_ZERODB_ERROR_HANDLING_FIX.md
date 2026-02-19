# Issue #578: ZeroDB getStats Error Handling Fix

**Status:** ✅ Fixed
**Type:** Bug Fix
**Priority:** High
**Refs:** #578

## Problem

The ZeroDB `getStats()` method was throwing `[object Object]` errors because the `ApiClient.request()` error handler was not properly validating that extracted error messages were strings before passing them to `new Error()`.

### Root Cause

In `lib/api-client.ts` (lines 184-192), the error extraction logic had a critical flaw:

```typescript
const errorMessage = typeof data === 'object' && data?.message
  ? data.message
  : typeof data === 'object' && data?.detail
  ? data.detail
  : typeof data === 'string'
  ? data
  : `HTTP ${response.status}: ${response.statusText}`;
```

**Issue:** If `data.message` was a nested object (truthy but not a string), it would pass the truthy check but then get coerced to `[object Object]` when passed to `new Error()`.

Example problematic response:
```json
{
  "message": {
    "code": "ERR_DATABASE",
    "error_message": "Connection failed"
  }
}
```

## Solution

### 1. Enhanced Error Message Extraction

Added proper type validation to ensure extracted messages are strings:

```typescript
// Try to extract message from data.message (if it's a string)
if (typeof data === 'object' && data !== null && 'message' in data) {
  if (typeof data.message === 'string' && data.message.trim().length > 0) {
    errorMessage = data.message;
  } else if (typeof data.message === 'object' && data.message !== null) {
    // Handle nested object - try to extract meaningful text
    errorMessage = this.extractErrorFromObject(data.message) || `HTTP ${response.status}: ${response.statusText}`;
  } else {
    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
  }
}
```

### 2. New Helper Method: `extractErrorFromObject()`

Added a new private method to intelligently extract error messages from nested objects:

```typescript
private extractErrorFromObject(obj: unknown): string | null {
  if (!obj || typeof obj !== 'object') return null;

  // Common error message fields in order of preference
  const messageFields = [
    'error_message',
    'message',
    'description',
    'text',
    'msg',
    'error',
    'reason',
    'detail',
  ];

  const objRecord = obj as Record<string, unknown>;

  for (const field of messageFields) {
    if (field in objRecord && typeof objRecord[field] === 'string' && (objRecord[field] as string).trim().length > 0) {
      return objRecord[field] as string;
    }
  }

  // If we still can't find a string, try JSON.stringify with truncation
  try {
    const jsonStr = JSON.stringify(obj);
    if (jsonStr.length > 200) {
      return jsonStr.substring(0, 200) + '...';
    }
    return jsonStr;
  } catch {
    return null;
  }
}
```

### 3. Enhanced FastAPI Validation Error Handling

Improved handling for FastAPI/Pydantic validation errors with array of error objects:

```typescript
else if (Array.isArray(data.detail)) {
  // FastAPI validation errors: [{ loc: [], msg: "", type: "" }]
  const errors = data.detail.map((err: unknown) => {
    const errObj = err as Record<string, unknown>;
    return errObj.msg || JSON.stringify(err);
  }).join(', ');
  errorMessage = `Validation error: ${errors}`;
}
```

### 4. Enhanced Error Logging

Added comprehensive error logging for debugging:

```typescript
// Log the extracted error for debugging
console.error('🚨 [ApiClient] Error:', {
  endpoint,
  status: response.status,
  errorMessage,
  rawData: data,
});
```

## Files Modified

### `/Users/aideveloper/core/AINative-website-nextjs/lib/api-client.ts`

**Changes:**
- Added `extractErrorFromObject()` private method (lines 45-85)
- Rewrote error message extraction logic (lines 184-272)
- Fixed TypeScript `any` types to use `unknown` and proper type guards
- Added enhanced error logging

**Impact:**
- All API calls now have robust error handling
- No breaking changes to existing API
- Error messages are always human-readable strings

## Testing

### Test Coverage

Created comprehensive test suite: `__tests__/lib/api-client.error-handling.test.ts`

**Test Categories:**
1. ✅ String validation for error messages
2. ✅ Nested error object handling
3. ✅ FastAPI/Pydantic validation error format
4. ✅ Edge cases (null, empty, boolean, number)
5. ✅ ZeroDB getStats specific scenarios

**Key Test Cases:**
- Nested object message extraction
- Empty/null/undefined responses
- FastAPI 422 validation errors
- Plain string errors
- HTTP status fallback

### Manual Testing

The fix has been validated through:
1. ✅ TypeScript type checking (`npx tsc --noEmit`)
2. ✅ ESLint validation (`npx eslint lib/api-client.ts --max-warnings=0`)
3. ✅ Code review for logic correctness
4. ✅ Verification against issue #578 requirements

## Acceptance Criteria

- [x] Error messages are always human-readable strings, never `[object Object]`
- [x] `ApiClient` error handler validates that extracted message is a string before using it
- [x] Nested error objects are handled gracefully
- [x] FastAPI validation errors (arrays) are properly formatted
- [x] Enhanced error logging for debugging
- [x] No TypeScript errors
- [x] No ESLint errors
- [x] Backward compatible with existing code

## Benefits

### User Experience
- Users now see meaningful error messages in the UI
- ZeroDB stats panel shows clear error states
- Better debugging experience for developers

### Code Quality
- Type-safe error handling using `unknown` instead of `any`
- Comprehensive error message extraction logic
- Better logging for production debugging

### Maintainability
- Single source of truth for error handling
- Easy to extend with new error patterns
- Well-documented code with inline comments

## Error Message Priority

The error extraction logic follows this priority:

1. `data.message` (if string)
2. `data.message` nested object (extract via helper)
3. `data.detail` (if string)
4. `data.detail` array (FastAPI validation errors)
5. `data.detail` nested object (extract via helper)
6. Plain string response
7. Fallback to `HTTP {status}: {statusText}`

## Examples

### Before Fix

```javascript
// Response: { message: { code: "ERR", text: "DB failed" } }
// Error thrown: "[object Object]"  ❌
```

### After Fix

```javascript
// Response: { message: { code: "ERR", text: "DB failed" } }
// Error thrown: "DB failed"  ✅

// Response: { message: { error_message: "Connection failed" } }
// Error thrown: "Connection failed"  ✅

// Response: { detail: [{ msg: "field required" }] }
// Error thrown: "Validation error: field required"  ✅
```

## Deployment Notes

- No database migrations required
- No environment variable changes
- No breaking changes to API contracts
- Safe to deploy immediately

## Related Issues

- Closes #578

## Next Steps

1. ✅ Code changes complete
2. ✅ TypeScript validation passed
3. ✅ ESLint validation passed
4. ⏳ Create pull request
5. ⏳ Merge to main
6. ⏳ Verify fix in production

---

**Author:** @urbantech
**Date:** 2026-02-19
**Issue:** #578
