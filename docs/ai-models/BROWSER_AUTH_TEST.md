# Browser-Based Authentication Testing

This guide provides manual browser-based tests to verify API authentication for the AI Model Registry.

## Prerequisites

1. Open browser (Chrome/Firefox/Safari recommended)
2. Navigate to `https://ainative.studio` or `http://localhost:3000`
3. Ensure you are logged in
4. Open Developer Tools (F12 or Cmd+Option+I)

---

## Test 1: Verify Token Storage

### Step 1: Check Token Exists

Paste this in the browser console:

```javascript
// Check if token exists in cookies
const cookies = document.cookie.split(';').map(c => c.trim());
const tokenCookie = cookies.find(c => c.startsWith('ainative_access_token='));
console.log('Cookie Token Found:', !!tokenCookie);
if (tokenCookie) {
  console.log('Cookie Token (first 20 chars):', tokenCookie.substring(0, 50) + '...');
}

// Check if token exists in localStorage
const localToken = localStorage.getItem('access_token');
console.log('LocalStorage Token Found:', !!localToken);
if (localToken) {
  console.log('LocalStorage Token (first 20 chars):', localToken.substring(0, 20) + '...');
}

// Verify token format (should be JWT)
const token = tokenCookie?.split('=')[1] || localToken;
if (token) {
  const parts = token.split('.');
  console.log('Is valid JWT format:', parts.length === 3);

  try {
    const payload = JSON.parse(atob(parts[1]));
    console.log('Token expires:', new Date(payload.exp * 1000).toLocaleString());
    console.log('Token is expired:', payload.exp * 1000 < Date.now());
  } catch (e) {
    console.warn('Could not decode token payload:', e.message);
  }
}
```

**Expected Result**:
- Cookie Token Found: `true` OR LocalStorage Token Found: `true`
- Is valid JWT format: `true`
- Token is expired: `false`

---

## Test 2: Monitor API Requests

### Step 1: Open Network Tab

1. Click on "Network" tab in Developer Tools
2. Filter by "Fetch/XHR"
3. Clear existing requests (trash icon)

### Step 2: Navigate to AI Settings

Navigate to: `https://ainative.studio/dashboard/ai-settings`

### Step 3: Check Network Requests

Look for these requests in the Network tab:

1. **GET** `https://api.ainative.studio/v1/models`
2. **GET** `https://api.ainative.studio/v1/public/embeddings/models`

For each request:
1. Click on the request
2. Go to "Headers" tab
3. Scroll to "Request Headers" section
4. Find the `Authorization` header

**Expected Result**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The value should start with `Bearer` followed by a long JWT token.

### Step 4: Check Response

1. Click on the same request
2. Go to "Response" or "Preview" tab
3. Verify you see model data (not an error)

**Expected Result for `/v1/models`**:
```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "created": 1234567890,
      "owned_by": "openai",
      "available": true
    },
    ...
  ]
}
```

**Expected Result for `/v1/public/embeddings/models`**:
```json
[
  {
    "id": "BAAI/bge-small-en-v1.5",
    "dimensions": 384,
    "description": "Small embedding model",
    "speed": "Fast",
    "loaded": true
  },
  ...
]
```

---

## Test 3: Test Authenticated POST Request

### Step 1: Test Image Generation

1. Navigate to a model with playground: `/dashboard/ai-settings/model/qwen-image-edit`
2. Or use browser console to make direct API call:

```javascript
// Import the API client (if in Next.js app)
// This assumes you're on the ainative.studio domain

fetch('https://api.ainative.studio/v1/multimodal/image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token') || 'YOUR_TOKEN_HERE'}`
  },
  body: JSON.stringify({
    prompt: 'A beautiful sunset over the ocean',
    width: 512,
    height: 512
  })
})
.then(res => {
  console.log('Status:', res.status);
  return res.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### Step 2: Check Network Request

1. Open Network tab
2. Find the POST request to `/v1/multimodal/image`
3. Click on it and verify:
   - Request Headers include `Authorization: Bearer ...`
   - Request Payload includes your prompt
   - Response Status is `200 OK` (or `202 Accepted` for async)

**Expected Result**:
```json
{
  "image_url": "https://image.ainative.studio/generated/abc123.png",
  "success": true
}
```

---

## Test 4: Test Unauthenticated Scenario

### Step 1: Clear Authentication

**WARNING**: This will log you out!

```javascript
// Backup current auth state
const backupToken = localStorage.getItem('access_token');
console.log('Backup token saved');

// Clear all auth data
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('user');
localStorage.removeItem('authenticated');

// Clear cookies
document.cookie = 'ainative_access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.ainative.studio';
document.cookie = 'ainative_user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.ainative.studio';

console.log('Auth data cleared');
```

### Step 2: Try API Call Without Auth

```javascript
fetch('https://api.ainative.studio/v1/models', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
    // No Authorization header
  }
})
.then(res => {
  console.log('Status:', res.status);
  console.log('Expected 401 Unauthorized');
  return res.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

**Expected Result**:
- Status: `401`
- Response: `{ "detail": "Not authenticated" }` or similar error message

### Step 3: Restore Authentication

```javascript
// Restore from backup (if you saved it)
if (backupToken) {
  localStorage.setItem('access_token', backupToken);
  console.log('Auth restored - please refresh the page');

  // Or just refresh to trigger login
  // location.reload();
}
```

**Note**: If you didn't backup the token, you'll need to log in again through the UI.

---

## Test 5: Verify Error Handling

### Step 1: Test with Invalid Token

```javascript
// Try API call with invalid token
fetch('https://api.ainative.studio/v1/models', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer invalid_token_12345'
  }
})
.then(res => {
  console.log('Status:', res.status);
  console.log('Expected 401 Unauthorized');
  return res.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

**Expected Result**:
- Status: `401`
- Response: `{ "detail": "Invalid token" }` or similar error

### Step 2: Verify Auto Token Cleanup

After a 401 response, the API client should automatically clean up the invalid token:

```javascript
// Check if localStorage was cleaned
setTimeout(() => {
  const token = localStorage.getItem('accessToken');
  console.log('Token should be cleared:', token === null);
}, 1000);
```

**Note**: The API client clears `localStorage.accessToken` (not `access_token`) on 401.

---

## Test 6: Test All Model Registry Endpoints

### Comprehensive API Test Script

```javascript
// Comprehensive authentication test for all model registry endpoints
const API_BASE = 'https://api.ainative.studio';
const token = localStorage.getItem('access_token');

if (!token) {
  console.error('No auth token found! Please log in first.');
} else {
  console.log('Starting comprehensive API authentication tests...\n');

  const endpoints = [
    { method: 'GET', path: '/v1/models', description: 'Chat/Text Models' },
    { method: 'GET', path: '/v1/public/embeddings/models', description: 'Embedding Models' },
  ];

  endpoints.forEach(async (endpoint, index) => {
    setTimeout(async () => {
      console.log(`\nTest ${index + 1}: ${endpoint.description}`);
      console.log(`${endpoint.method} ${endpoint.path}`);

      try {
        const res = await fetch(`${API_BASE}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(`Status: ${res.status} ${res.statusText}`);

        if (res.ok) {
          const data = await res.json();
          console.log(`Data type: ${Array.isArray(data) ? 'Array' : typeof data}`);
          console.log(`Items count: ${Array.isArray(data) ? data.length : (data.data?.length || 'N/A')}`);
          console.log('✅ PASSED');
        } else {
          const error = await res.json();
          console.log(`Error: ${JSON.stringify(error)}`);
          console.log('❌ FAILED');
        }
      } catch (err) {
        console.error(`Exception: ${err.message}`);
        console.log('❌ FAILED');
      }
    }, index * 1000); // Delay each request by 1 second
  });

  console.log('\nTests will run sequentially with 1s delay between each...');
}
```

**Expected Result**:
- All tests should show `✅ PASSED`
- Status: `200 OK` for all endpoints
- Data returned for each endpoint

---

## Troubleshooting

### Issue: "No auth token found"

**Solution**:
1. Log in to the application
2. After login, check localStorage: `localStorage.getItem('access_token')`
3. If still null, check cookies: `document.cookie`

### Issue: "401 Unauthorized" even with token

**Diagnosis**:
1. Check token expiration:
```javascript
const token = localStorage.getItem('access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expired:', payload.exp * 1000 < Date.now());
```

**Solution**:
- Token expired: Log out and log in again
- Token invalid: Clear storage and re-login

### Issue: "CORS policy" error

**Diagnosis**:
```javascript
console.log('Current origin:', window.location.origin);
console.log('API base URL:', 'https://api.ainative.studio');
```

**Solution**:
- Ensure you're on `ainative.studio` or `localhost:3000`
- CORS errors mean API server doesn't allow your origin
- Contact backend team to whitelist your origin

### Issue: Network tab doesn't show Authorization header

**Diagnosis**:
1. Check if using the correct API client
2. Verify token exists before request
3. Check browser extensions (some ad blockers remove headers)

**Solution**:
- Disable browser extensions temporarily
- Use incognito mode to test
- Verify token in console before making request

---

## Success Criteria

All tests should show:
1. Token exists (cookie or localStorage)
2. Token is valid JWT format
3. Token is not expired
4. All API requests include `Authorization: Bearer <token>` header
5. All endpoints return `200 OK` status
6. Model data is successfully retrieved
7. 401 errors properly handled when token is invalid

---

## Next Steps

After verifying authentication works:

1. **Test on production**: `https://ainative.studio`
2. **Test on localhost**: `http://localhost:3000` (update API base URL)
3. **Test with different users**: Log in with different accounts
4. **Test token expiration**: Wait for token to expire (7 days) or manually expire
5. **Test cross-subdomain**: Test on `zerodb.ainative.studio` to verify SSO

---

**Last updated**: 2026-02-06
**Author**: AI QA Engineer
**Related**: API_AUTHENTICATION_VERIFICATION.md
