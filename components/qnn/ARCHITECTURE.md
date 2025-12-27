# Quantum Signatures Architecture

Visual architecture and data flow documentation for the Quantum Signature Management component.

## Component Hierarchy

```
QuantumSignatures
│
├── Card (Container)
│   ├── CardHeader
│   │   ├── Shield Icon
│   │   └── Title + Description
│   │
│   └── CardContent
│       └── Tabs
│           ├── TabsList
│           │   ├── "Sign Model" Tab
│           │   ├── "Verify Signature" Tab
│           │   └── "Apply Signature" Tab
│           │
│           ├── TabsContent: Sign Model
│           │   ├── Select (Model Dropdown)
│           │   ├── Alert (Info about signatures)
│           │   ├── Button (Generate Signature)
│           │   └── Card (Result Display)
│           │       ├── Signature Hash (with Copy button)
│           │       ├── Timestamps
│           │       ├── Signature ID
│           │       └── Export Button
│           │
│           ├── TabsContent: Verify Signature
│           │   ├── Select (Model Dropdown)
│           │   ├── Code Block (Current Signature)
│           │   ├── Alert (Info about verification)
│           │   ├── Button (Verify Signature)
│           │   └── Card (Verification Results)
│           │       ├── Status Badges (Valid/Invalid, Expired/Active)
│           │       ├── Verification Timestamp
│           │       ├── Signed/Expires Timestamps
│           │       └── Warning Alerts (if issues)
│           │
│           └── TabsContent: Apply Signature
│               ├── Select (Model Dropdown)
│               ├── Textarea (Signature Input)
│               ├── Alert (Info about applying)
│               ├── Button (Apply Signature)
│               └── Card (Apply Results)
│                   ├── Model/Signature IDs
│                   ├── Applied Timestamp
│                   └── Status Badge
```

## Data Flow

### 1. Sign Model Flow

```
User Action: Select Model + Click "Generate Signature"
    ↓
Component State: setSigning(true)
    ↓
API Call: POST /v1/signing/sign { model_id }
    ↓
Backend: Generate quantum signature
    ↓
Response: SignatureResponse {
    model_id,
    signature,
    signature_id,
    signed_at,
    expires_at
}
    ↓
Component State: setSignatureResult(response)
    ↓
UI Update: Display signature result card
    ↓
Toast: "Model Signed Successfully"
    ↓
Refresh: loadModels() to update list
```

### 2. Verify Signature Flow

```
User Action: Select Model + Click "Verify Signature"
    ↓
Component State: setVerifying(true)
    ↓
API Call: POST /v1/signing/verify {
    model_id,
    signature
}
    ↓
Backend: Verify signature validity, expiration
    ↓
Response: VerificationResponse {
    model_id,
    is_valid,
    is_expired,
    signature_id,
    signed_at,
    expires_at,
    verification_time
}
    ↓
Component State: setVerificationResult(response)
    ↓
UI Update: Display verification results
    ↓
Toast: Success/Error based on result
```

### 3. Apply Signature Flow

```
User Action: Select Model + Paste Signature + Click "Apply"
    ↓
Component State: setApplying(true)
    ↓
Parse Input: JSON or raw hash
    ↓
API Call: POST /v1/signing/apply {
    model_id,
    signature_id
}
    ↓
Backend: Validate and apply signature
    ↓
Response: ApplySignatureResponse {
    model_id,
    signature_id,
    applied_at,
    status,
    is_verified
}
    ↓
Component State: setApplyResult(response)
    ↓
UI Update: Display apply results
    ↓
Toast: "Signature Applied"
    ↓
Refresh: loadModels() to update list
```

## State Management

### Component State Variables

```typescript
// Models state
models: Model[]              // All models from API
loadingModels: boolean       // Loading indicator

// Sign tab state
selectedSignModel: string    // Selected model ID
signing: boolean             // Operation in progress
signatureResult: SignatureResponse | null

// Verify tab state
selectedVerifyModel: string  // Selected model ID
verifying: boolean           // Operation in progress
verificationResult: VerificationResponse | null

// Apply tab state
selectedApplyModel: string   // Selected model ID
signatureToApply: string     // Signature input
applying: boolean            // Operation in progress
applyResult: ApplySignatureResponse | null

// Tab navigation
activeTab: 'sign' | 'verify' | 'apply'
```

### State Transitions

```
Initial State
    ↓
Load Models: loadingModels = true
    ↓
Models Loaded: models = [...], loadingModels = false
    ↓
User Interaction
    ↓
[Sign] → signing = true → API call → signing = false + result
[Verify] → verifying = true → API call → verifying = false + result
[Apply] → applying = true → API call → applying = false + result
```

## API Integration Layer

```
Component
    ↓
QNNApiClient (Singleton)
    ↓
Axios Instance (with interceptors)
    ↓
Request Interceptor:
    - Add JWT token
    - Log request (dev mode)
    ↓
HTTP Request
    ↓
Response Interceptor:
    - Handle retries
    - Log response (dev mode)
    - Transform errors
    ↓
Backend API (/v1/signing/*)
    ↓
Response
    ↓
Error Handling:
    - Network errors → QNNNetworkError
    - 401 → QNNAuthenticationError
    - 403 → QNNAuthorizationError
    - 404 → QNNNotFoundError
    - 400 → QNNValidationError
    - 5xx → QNNServerError
    ↓
Component receives:
    - Success: Typed response data
    - Error: Typed error object
```

## Security Architecture

```
Frontend (React Component)
    ↓
Validation Layer:
    - Model ID required
    - Signature format check
    - User authentication check
    ↓
Transport Layer (HTTPS):
    - TLS 1.2+
    - JWT in Authorization header
    - CORS headers
    ↓
Backend API Gateway
    ↓
Authentication Middleware:
    - Verify JWT
    - Check token expiration
    - Extract user identity
    ↓
Authorization Middleware:
    - Check user permissions
    - Verify model ownership
    - Validate operation allowed
    ↓
Signing Service:
    - Generate quantum signature
    - Verify signature validity
    - Apply signature with validation
    ↓
Signature Validation:
    - Hash verification
    - Expiration check
    - Tampering detection
    ↓
Database:
    - Store signature
    - Update model status
    - Log operation
```

## Error Handling Flow

```
API Call
    ↓
Try-Catch Block
    ↓
Error Occurred?
    │
    ├─ Yes → handleError()
    │           ↓
    │       Transform to QNNError
    │           ↓
    │       Extract message + details
    │           ↓
    │       Toast notification (destructive)
    │           ↓
    │       Component state: error displayed
    │           ↓
    │       Loading state: false
    │
    └─ No → Success
                ↓
            Update component state
                ↓
            Toast notification (success)
                ↓
            Refresh models list
```

## User Interaction Flow

```
User opens Quantum Signatures
    ↓
Component mounts → useEffect() → loadModels()
    ↓
Models displayed in dropdowns
    ↓
User selects tab
    ↓
┌─────────────────┬─────────────────┬──────────────────┐
│   Sign Model    │  Verify Sig     │   Apply Sig      │
├─────────────────┼─────────────────┼──────────────────┤
│ Select model    │ Select model    │ Select model     │
│ Click button    │ Click button    │ Paste signature  │
│ Loading...      │ Loading...      │ Click button     │
│ Result shown    │ Result shown    │ Loading...       │
│ Copy/Export     │ Check status    │ Result shown     │
└─────────────────┴─────────────────┴──────────────────┘
    ↓
User can:
    - Switch to another tab
    - Perform another operation
    - Export signatures
    - Copy signatures
```

## Performance Optimization

```
Component Mounting:
    - Single models fetch on mount
    - Models cached in state
    - No refetch on tab switch

API Calls:
    - Debounced operations (button disabled during)
    - Retry logic with exponential backoff
    - Timeout handling (30s default)
    - Request cancellation on unmount

Rendering:
    - Conditional rendering (only active tab)
    - Lazy loading of result cards
    - Memoized callbacks (could add)
    - No unnecessary re-renders

Data Management:
    - Models filtered client-side
    - Signature results cached until new operation
    - Toast notifications auto-dismiss
```

## Accessibility Flow

```
Keyboard Navigation:
Tab → Focus next element
Shift+Tab → Focus previous element
Enter → Activate button/select
Space → Toggle checkbox/radio
Escape → Close modal/dropdown
Arrow keys → Navigate select options

Screen Reader Announcements:
"Sign Model, tab, 1 of 3"
"Select Model to Sign, combobox, collapsed"
"Generate Quantum Signature, button"
"Model signed successfully, notification"
"Signature hash, code block"
"Copy to clipboard, button"

Focus Management:
Component mounts → No auto-focus
User interaction → Focus follows action
Modal opens → Focus trapped in modal
Modal closes → Focus returns to trigger
Error occurs → Error announced
Success → Success announced
```

## Testing Architecture

```
Unit Tests:
    - Component rendering
    - State management
    - Event handlers
    - Utility functions

Integration Tests:
    - API client integration
    - Toast system integration
    - Model list updates
    - Tab navigation

E2E Tests:
    - Sign model flow
    - Verify signature flow
    - Apply signature flow
    - Error scenarios
    - Happy paths

Visual Tests:
    - Component snapshot
    - Dark mode rendering
    - Responsive layouts
    - Loading states
```

## Deployment Architecture

```
Development:
localhost:5173 (Vite dev server)
    ↓
Backend: localhost:8000/v1/signing/*
    ↓
Dev database

Staging:
staging.ainative.studio
    ↓
Backend: staging-api.ainative.studio/v1/signing/*
    ↓
Staging database

Production:
ainative.studio
    ↓
Backend: qnn-api.ainative.studio/v1/signing/*
    ↓
Production database (with backups)
```

## Monitoring & Observability

```
Frontend Monitoring:
    - Error tracking (Sentry)
    - Performance monitoring
    - User analytics
    - Console logs (dev only)

API Monitoring:
    - Request/response logging
    - Error rate tracking
    - Latency monitoring
    - Success rate metrics

Security Monitoring:
    - Failed auth attempts
    - Invalid signature attempts
    - Permission violations
    - Unusual patterns
```

## Future Enhancements Architecture

```
Phase 1 (Current):
    ✅ Basic sign/verify/apply
    ✅ Single model operations
    ✅ Manual signature management

Phase 2 (Next):
    - Bulk operations
    - Signature history
    - Advanced options
    - Auto-refresh

Phase 3 (Future):
    - Signature revocation
    - Multi-signature support
    - Signature chains
    - Automated signing workflows
    - Integration with CI/CD
```

---

This architecture is designed for:
- **Scalability**: Can handle many models and operations
- **Security**: Multiple layers of validation and authentication
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Easy to add new features
- **Performance**: Optimized for speed and efficiency
- **Reliability**: Comprehensive error handling
