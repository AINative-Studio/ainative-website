# Issue #448: Conversion Tracking Service Wrong API Endpoints

## Problem
The Conversion Tracking Service was using incorrect API endpoints that didn't match the backend implementation.

### Wrong Endpoints
- `/v1/events/track` - used for tracking conversion events
- `/v1/events/funnel` - used for updating funnel stages

### Correct Endpoints
- `/v1/events/conversions` - for tracking conversion events
- `/v1/events/reconcile` - for funnel stage reconciliation

## Solution
Updated `services/ConversionTrackingService.ts` to use the correct API endpoints that match the backend.

## Changes Made

### File: `services/ConversionTrackingService.ts`

#### Line 201 (trackEvent method)
**Before:**
```typescript
await apiClient.post('/v1/events/track', payload);
```

**After:**
```typescript
await apiClient.post('/v1/events/conversions', payload);
```

#### Line 229 (updateFunnel method)
**Before:**
```typescript
await apiClient.post('/v1/events/funnel', payload);
```

**After:**
```typescript
await apiClient.post('/v1/events/reconcile', payload);
```

## Impact
All conversion tracking features now use the correct API endpoints:
- `trackEvent()` - tracks conversion events
- `updateFunnel()` - reconciles funnel stages
- `trackSignup()` - calls both methods
- `trackCheckoutStart()` - calls both methods
- `trackPurchase()` - calls both methods
- `trackPageView()` - tracks page views
- `trackFormSubmit()` - tracks form submissions

## Verification
The fix can be verified by checking the API calls in the browser network tab or by searching the codebase:

```bash
grep -n "apiClient.post.*events" services/ConversionTrackingService.ts
```

Expected output:
```
201:      await apiClient.post('/v1/events/conversions', payload);
229:      await apiClient.post('/v1/events/reconcile', payload);
```

## Deployment
- Committed in: `a97018a`
- Branch: `bug/448-conversion-tracking-endpoints`
- Merged to: `main`
- Status: Deployed

## Related Files
- `/Users/aideveloper/ainative-website-nextjs-staging/services/ConversionTrackingService.ts`
- `/Users/aideveloper/ainative-website-nextjs-staging/hooks/useConversionTracking.ts`
