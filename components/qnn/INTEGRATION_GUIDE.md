# Quantum Signatures Integration Guide

This guide shows how to integrate the `QuantumSignatures` component into the existing `ModelManager` component.

## Option 1: Add as a New Tab in ModelManager (Recommended)

Update `/Users/aideveloper/core/AINative-website/src/components/qnn/ModelManager.tsx`:

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, List, Info, Shield } from 'lucide-react';
import QuantumSignatures from '@/components/qnn/QuantumSignatures';

export default function ModelManager() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Model Management</CardTitle>
              <CardDescription>
                Create, manage, and monitor your quantum neural network models
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Model List
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Model Details
              </TabsTrigger>
              <TabsTrigger value="signatures" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Quantum Signatures
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-6">
              {/* Your existing model list UI */}
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              {/* Your existing model details UI */}
            </TabsContent>

            <TabsContent value="signatures" className="mt-6">
              <QuantumSignatures />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Option 2: Add as a Separate Route

Add a new route in your router configuration:

```tsx
// In your router file (e.g., App.tsx or routes.tsx)
import QNNSignaturesPage from '@/pages/QNNSignaturesPage';

const routes = [
  // ... other routes
  {
    path: '/qnn/signatures',
    element: <QNNSignaturesPage />,
  },
];
```

Then link to it from ModelManager:

```tsx
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

function ModelManager() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ... other UI ... */}
      <Button onClick={() => navigate('/qnn/signatures')}>
        <Shield className="mr-2 h-4 w-4" />
        Manage Signatures
      </Button>
    </div>
  );
}
```

## Option 3: Add "Sign Model" Button to Model Cards

Add a quick-action button to each model card:

```tsx
import { Shield } from 'lucide-react';

function ModelCard({ model }) {
  const [showSignatures, setShowSignatures] = useState(false);

  return (
    <Card>
      <CardContent>
        {/* ... model info ... */}

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1">
            View Details
          </Button>
          {model.status === 'trained' && !model.is_signed && (
            <Button
              variant="outline"
              onClick={() => setShowSignatures(true)}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Sign
            </Button>
          )}
        </div>
      </CardContent>

      {/* Dialog with QuantumSignatures component */}
      <Dialog open={showSignatures} onOpenChange={setShowSignatures}>
        <DialogContent className="max-w-4xl">
          <QuantumSignatures defaultModelId={model.id} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
```

## Option 4: Add to Model Details View

If you have a detailed model view, add a signatures section:

```tsx
import QuantumSignatures from '@/components/qnn/QuantumSignatures';

function ModelDetailsPage({ modelId }) {
  return (
    <div className="space-y-6">
      {/* Model information */}
      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ... model details ... */}
        </CardContent>
      </Card>

      {/* Training history */}
      <Card>
        <CardHeader>
          <CardTitle>Training History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ... training info ... */}
        </CardContent>
      </Card>

      {/* Quantum Signatures */}
      <QuantumSignatures defaultModelId={modelId} />
    </div>
  );
}
```

## Adding a "Sign" Badge to Signed Models

Update your model card to show signature status:

```tsx
import { Shield, ShieldCheck } from 'lucide-react';

function ModelCard({ model }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{model.name}</CardTitle>
          {model.is_signed && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <ShieldCheck className="mr-1 h-3 w-3" />
              Signed
            </Badge>
          )}
        </div>
      </CardHeader>
      {/* ... rest of card ... */}
    </Card>
  );
}
```

## Navigation Flow Example

Here's a complete user flow for signing models:

```
1. User views model list in ModelManager
   ↓
2. User selects "Quantum Signatures" tab
   ↓
3. User selects a trained model from dropdown
   ↓
4. User clicks "Generate Quantum Signature"
   ↓
5. Signature is generated and displayed
   ↓
6. User can:
   - Copy signature hash
   - Export as JSON
   - Verify signature later
   - Apply to other models
```

## Props Enhancement (Optional)

You can enhance the `QuantumSignatures` component to accept props:

```tsx
interface QuantumSignaturesProps {
  defaultModelId?: string;  // Pre-select a model
  defaultTab?: 'sign' | 'verify' | 'apply';  // Start on specific tab
  onSignSuccess?: (signature: SignatureResponse) => void;
  onVerifySuccess?: (result: VerificationResponse) => void;
}

export default function QuantumSignatures(props: QuantumSignaturesProps) {
  // Implementation...
}
```

Then use it like:

```tsx
// Pre-select a model and tab
<QuantumSignatures
  defaultModelId="model-123"
  defaultTab="sign"
  onSignSuccess={(sig) => {
    console.log('Model signed:', sig);
    refreshModelList();
  }}
/>
```

## Adding to Dashboard

You can also add a signatures summary to your main dashboard:

```tsx
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

function DashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    signed: 0,
    unsigned: 0,
    expired: 0,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Models</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Signed Models</CardTitle>
          <ShieldCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.signed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unsigned Models</CardTitle>
          <Shield className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{stats.unsigned}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expired Signatures</CardTitle>
          <ShieldAlert className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Testing Integration

After integration, test these scenarios:

1. **Sign a trained model**
   - Navigate to Quantum Signatures
   - Select a trained, unsigned model
   - Generate signature
   - Verify signature appears

2. **Verify a signed model**
   - Switch to Verify tab
   - Select a signed model
   - Verify signature shows valid

3. **Export and apply**
   - Sign a model
   - Export signature as JSON
   - Apply to another model
   - Verify it works

4. **Error handling**
   - Try signing with no model selected
   - Try verifying an unsigned model
   - Verify error messages appear

## Security Checklist

Before deploying to production:

- [ ] All API calls use HTTPS
- [ ] JWT tokens are properly managed
- [ ] Signatures are validated server-side
- [ ] Expiration timestamps are enforced
- [ ] User permissions are checked
- [ ] Audit logging is enabled
- [ ] Error messages don't expose sensitive data

## Recommended Integration

For the best user experience, we recommend **Option 1** (tabs in ModelManager) with these additions:

1. Add signature status badges to model cards
2. Add a "Sign" quick action button on unsigned, trained models
3. Add signature stats to the dashboard
4. Link directly to the signatures tab from model cards

This provides a seamless, integrated experience while keeping the powerful signature management features easily accessible.
