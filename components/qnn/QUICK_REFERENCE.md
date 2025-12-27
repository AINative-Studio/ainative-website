# Quantum Signatures - Quick Reference

One-page reference guide for developers working with the Quantum Signature Management component.

## Import

```tsx
import QuantumSignatures from '@/components/qnn/QuantumSignatures';
```

## Basic Usage

```tsx
function MyPage() {
  return <QuantumSignatures />;
}
```

## File Locations

| File | Path |
|------|------|
| Component | `/src/components/qnn/QuantumSignatures.tsx` |
| Demo Page | `/src/pages/QNNSignaturesPage.tsx` |
| Types | `/src/types/qnn.types.ts` |
| API Client | `/src/services/QNNApiClient.ts` |

## API Endpoints

```typescript
// Sign a model
POST /v1/signing/sign
Body: { model_id: string, key?: string }

// Verify a signature
POST /v1/signing/verify
Body: { model_id: string, signature?: string }

// Apply a signature
POST /v1/signing/apply
Body: { model_id: string, signature_id: string }
```

## QNNApiClient Methods

```typescript
// Sign model
await qnnApiClient.signModel(modelId, key?);

// Verify signature
await qnnApiClient.verifySignature(modelId, signature?);

// Apply signature
await qnnApiClient.applySignature(modelId, signatureId);
```

## Type Definitions

```typescript
interface SignatureResponse {
  model_id: string;
  signature: string;
  signature_id: string;
  signed_at: string;
  expires_at: string;
}

interface VerificationResponse {
  model_id: string;
  is_valid: boolean;
  is_expired: boolean;
  signature_id: string;
  signed_at: string;
  expires_at: string;
  verification_time?: string;
}

interface ApplySignatureResponse {
  model_id: string;
  signature_id: string;
  applied_at: string;
  status: string;
  is_verified: boolean;
}
```

## Component State

```typescript
// Models
models: Model[]
loadingModels: boolean

// Sign tab
selectedSignModel: string
signing: boolean
signatureResult: SignatureResponse | null

// Verify tab
selectedVerifyModel: string
verifying: boolean
verificationResult: VerificationResponse | null

// Apply tab
selectedApplyModel: string
signatureToApply: string
applying: boolean
applyResult: ApplySignatureResponse | null
```

## Key Features

### Tab 1: Sign Model
- ✅ Select trained, unsigned models
- ✅ Generate quantum signature
- ✅ Copy signature hash
- ✅ Export as JSON

### Tab 2: Verify Signature
- ✅ Select signed models
- ✅ Display current signature
- ✅ Verify validity & expiration
- ✅ Tampering detection

### Tab 3: Apply Signature
- ✅ Select target model
- ✅ Paste signature (JSON or hash)
- ✅ Validation before applying
- ✅ Success confirmation

## Common Operations

### Sign a Model
```typescript
const handleSign = async (modelId: string) => {
  try {
    const result = await qnnApiClient.signModel(modelId);
    toast({ title: 'Signed successfully' });
  } catch (error) {
    toast({ title: 'Error', variant: 'destructive' });
  }
};
```

### Verify a Signature
```typescript
const handleVerify = async (modelId: string, signature: string) => {
  try {
    const result = await qnnApiClient.verifySignature(modelId, signature);
    if (result.is_valid) {
      toast({ title: 'Valid signature' });
    }
  } catch (error) {
    toast({ title: 'Error', variant: 'destructive' });
  }
};
```

### Export Signature
```typescript
const exportSignature = (signature: SignatureResponse) => {
  const json = JSON.stringify(signature, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `signature-${signature.model_id}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
```

## Integration Options

### Option 1: As Tab in ModelManager
```tsx
<Tabs>
  <TabsTrigger value="signatures">Signatures</TabsTrigger>
  <TabsContent value="signatures">
    <QuantumSignatures />
  </TabsContent>
</Tabs>
```

### Option 2: As Separate Page
```tsx
// routes.tsx
{
  path: '/qnn/signatures',
  element: <QNNSignaturesPage />
}

// Navigation
<Button onClick={() => navigate('/qnn/signatures')}>
  Manage Signatures
</Button>
```

### Option 3: In Model Card
```tsx
<Button onClick={() => setShowSignDialog(true)}>
  <Shield className="mr-2 h-4 w-4" />
  Sign Model
</Button>

<Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
  <DialogContent className="max-w-4xl">
    <QuantumSignatures defaultModelId={model.id} />
  </DialogContent>
</Dialog>
```

## Error Handling

```typescript
try {
  const result = await qnnApiClient.signModel(modelId);
} catch (error) {
  if (error instanceof QNNAuthenticationError) {
    // Handle 401 - redirect to login
  } else if (error instanceof QNNAuthorizationError) {
    // Handle 403 - show permission error
  } else if (error instanceof QNNNotFoundError) {
    // Handle 404 - model not found
  } else if (error instanceof QNNValidationError) {
    // Handle 400 - invalid input
  } else if (error instanceof QNNNetworkError) {
    // Handle network issues
  } else {
    // Handle unknown errors
  }
}
```

## Styling Classes

```css
/* Main container */
.border-primary/20

/* Success states */
.border-green-500/50 .bg-green-500/5

/* Error states */
.border-red-500/50 .bg-red-500/5

/* Loading states */
.animate-spin

/* Code blocks */
.bg-gray-900 .text-green-400 .font-mono

/* Badges */
.bg-green-500/10 .text-green-600 .border-green-500/20
```

## Icons Used

```tsx
import {
  Shield,           // Main icon
  CheckCircle2,     // Success
  XCircle,          // Error
  Copy,             // Copy button
  Download,         // Export button
  Upload,           // Apply tab
  Clock,            // Timestamps
  AlertTriangle,    // Warnings
  Loader2,          // Loading
  FileSignature,    // Sign tab
  ShieldCheck,      // Verify tab
  ShieldAlert,      // Tampering warning
} from 'lucide-react';
```

## Toast Notifications

```typescript
// Success
toast({
  title: 'Model Signed Successfully',
  description: 'Signature generated'
});

// Error
toast({
  title: 'Signing Failed',
  description: error.message,
  variant: 'destructive'
});

// Info
toast({
  title: 'Copied to Clipboard',
  description: 'Signature hash copied'
});
```

## Testing Scenarios

```bash
# Sign model
1. Select trained model
2. Click "Generate Signature"
3. Verify result appears
4. Test copy button
5. Test export button

# Verify signature
1. Select signed model
2. Click "Verify Signature"
3. Check result color (green/red)
4. Verify all details shown

# Apply signature
1. Export a signature
2. Select target model
3. Paste signature
4. Click "Apply Signature"
5. Verify success
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Models not loading | Check API connection, auth token |
| 401 error | Token expired, redirect to login |
| No signable models | All models are signed or not trained |
| Copy not working | Check browser clipboard permissions |
| Export not working | Check browser download permissions |
| Signature invalid | Model may be tampered with |

## Performance Tips

```typescript
// ✅ Good - Load models once
useEffect(() => {
  loadModels();
}, []);

// ❌ Bad - Load on every render
loadModels();

// ✅ Good - Debounce operations
const handleSign = debounce(signModel, 300);

// ✅ Good - Cache results
const [cachedModels, setCachedModels] = useState([]);
```

## Accessibility Checklist

- ✅ All buttons keyboard accessible
- ✅ Tab order is logical
- ✅ Focus states visible
- ✅ ARIA labels present
- ✅ Error messages announced
- ✅ Color not sole indicator
- ✅ Text contrast meets WCAG 2.1 AA

## Security Checklist

- ✅ JWT auth required
- ✅ HTTPS enforced
- ✅ Server-side validation
- ✅ XSS prevention
- ✅ Input sanitization
- ✅ No sensitive data in logs
- ✅ Expiration timestamps enforced

## Dependencies

```json
{
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "@radix-ui/*": "latest",
  "lucide-react": "latest",
  "date-fns": "latest",
  "framer-motion": "latest",
  "axios": "latest"
}
```

## Environment Variables

```env
VITE_QNN_API_URL=https://qnn-api.ainative.studio
```

## Useful Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## Links & Resources

- [GitHub Issue #129](https://github.com/AINative-Studio/core/issues/129)
- [Full Documentation](./QUANTUM_SIGNATURES_README.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [Testing Checklist](./TESTING_CHECKLIST.md)
- [Architecture](./ARCHITECTURE.md)
- Backend Reference: `/qnn-app/ui/components/model_manager.py` (Lines 901-1077)

## Support

For issues or questions:
1. Check [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Consult [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
4. Open GitHub issue

---

**Quick Start**: Import component → Add to your page → Connect to API → Test all three tabs
