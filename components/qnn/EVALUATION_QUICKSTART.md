# Evaluation Dashboard - Quick Start Guide

## 5-Minute Setup

### Step 1: Import the Component (30 seconds)

```tsx
import EvaluationDashboard from '@/components/qnn/EvaluationDashboard';
```

### Step 2: Add Required Providers (1 minute)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QNNProvider } from '@/contexts/QNNContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QNNProvider>
        <EvaluationDashboard />
      </QNNProvider>
    </QueryClientProvider>
  );
}
```

### Step 3: That's It! (0 seconds)

Your evaluation dashboard is now ready to use with mock data. The component will automatically:
- ✅ Fetch available models
- ✅ Display performance metrics
- ✅ Render confusion matrix
- ✅ Show ROC curve
- ✅ Enable JSON export

---

## What You Get Out of the Box

### 1. Model Selection
- Dropdown populated with trained/deployed models
- Architecture badges for each model
- Automatic filtering

### 2. Performance Metrics (4 Cards)
- **Accuracy** - Overall model accuracy with trend
- **F1 Score** - Harmonic mean of precision/recall
- **Precision** - Positive predictive value
- **Recall** - True positive rate

### 3. Visualizations
- **Confusion Matrix** - Interactive heatmap with hover tooltips
- **ROC Curve** - Professional line chart with AUC score

### 4. Additional Metrics
- Specificity, NPV, MCC, Sample Size
- Evaluation timestamp

### 5. Export Functionality
- JSON format (ready)
- PDF format (coming soon)

---

## Using the Dashboard

### 1. Select a Model
Click the dropdown at the top to choose a model for evaluation:
```
[Select a model to evaluate ▼]
```

### 2. View Metrics
All metrics and visualizations will load automatically:
- Large metric cards at the top
- Confusion matrix (left)
- ROC curve (right)
- Additional metrics at bottom

### 3. Explore Visualizations
- **Hover** over confusion matrix cells to see details
- **Hover** over ROC curve to see exact values
- **Read** the AUC interpretation below the ROC curve

### 4. Export Results
```tsx
[JSON ▼]  [Export Report 📥]  ← Click to download
```

---

## Integration with QNN API

Currently using mock data. To connect to real API:

### Option A: Use QNN Hook (Recommended)
```tsx
import { useQNN } from '@/hooks/useQNN';

function MyComponent() {
  const qnn = useQNN();

  // Get evaluation for a model
  const { data: evaluation } = qnn.evaluation.get('model-123');

  // Run new evaluation
  const { mutate: runEval } = qnn.evaluation.run();

  return <EvaluationDashboard />;
}
```

### Option B: Update Hook Directly
In `/Users/aideveloper/core/AINative-website/src/hooks/useEvaluation.ts`:

```typescript
export function useModelEvaluation(modelId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: evaluationKeys.detail(modelId),
    queryFn: async (): Promise<ModelEvaluation> => {
      // Replace this with your API client
      const apiClient = new QNNApiClient();
      return apiClient.getModelEvaluation(modelId);
    },
    staleTime: 5 * 60 * 1000,
    enabled: enabled && !!modelId,
  });
}
```

---

## Common Use Cases

### 1. Standalone Page
```tsx
export default function EvaluationPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Model Evaluation</h1>
      <EvaluationDashboard />
    </div>
  );
}
```

### 2. Tabbed Interface
```tsx
<Tabs defaultValue="evaluation">
  <TabsList>
    <TabsTrigger value="training">Training</TabsTrigger>
    <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
    <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
  </TabsList>

  <TabsContent value="evaluation">
    <EvaluationDashboard />
  </TabsContent>
</Tabs>
```

### 3. Modal/Dialog
```tsx
<Dialog>
  <DialogTrigger>View Evaluation</DialogTrigger>
  <DialogContent className="max-w-6xl">
    <EvaluationDashboard />
  </DialogContent>
</Dialog>
```

---

## Customization Examples

### Change Colors
Edit the gradient backgrounds in the component:
```tsx
// In EvaluationDashboard.tsx
<Card className="border border-primary/20 bg-gradient-to-br from-purple-500/10 to-blue-600/10">
  {/* Change to your colors */}
</Card>
```

### Add Custom Metrics
Extend the `EvaluationMetrics` interface in types:
```typescript
export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  // Add your custom metrics
  yourCustomMetric?: number;
}
```

### Modify Export
Add custom export logic:
```tsx
const handleExport = async () => {
  if (exportFormat === 'custom') {
    // Your custom export logic
    await myCustomExportFunction(evaluation);
  }
};
```

---

## Troubleshooting

### Models Not Showing
**Problem:** Dropdown is empty
**Solution:** Check that models have status `trained` or `deployed`:
```typescript
const { data: modelsResponse } = useModels({
  status: ['trained', 'deployed'],
});
```

### Evaluation Not Loading
**Problem:** Selected model but no data
**Solution:** Check browser console for errors. Ensure model ID is valid:
```typescript
const { data: evaluation, error } = useModelEvaluation(selectedModelId);
console.log('Evaluation:', evaluation, 'Error:', error);
```

### Charts Not Rendering
**Problem:** Blank space where charts should be
**Solution:** Ensure Recharts is installed:
```bash
npm install recharts
```

### Export Not Working
**Problem:** Export button doesn't download
**Solution:** Check browser console. Ensure popup blocker isn't blocking download.

---

## Performance Tips

### 1. Prefetch on Hover
```tsx
const prefetchEvaluation = usePrefetchEvaluation();

<div onMouseEnter={() => prefetchEvaluation('model-123')}>
  Hover to prefetch
</div>
```

### 2. Memoize Expensive Calculations
Already implemented in the component:
```tsx
const confusionMatrixData = useMemo(() => {
  // Expensive calculation
}, [evaluation]);
```

### 3. Lazy Load the Component
```tsx
const EvaluationDashboard = lazy(() =>
  import('@/components/qnn/EvaluationDashboard')
);

<Suspense fallback={<LoadingSkeleton />}>
  <EvaluationDashboard />
</Suspense>
```

---

## Next Steps

### For Development
1. ✅ Component is ready with mock data
2. ⏳ Connect to real QNN API
3. ⏳ Add PDF export functionality
4. ⏳ Implement precision-recall curve
5. ⏳ Add multi-model comparison

### For Production
1. ✅ Component is production-ready
2. ⏳ Replace mock data with API calls
3. ⏳ Add error boundaries
4. ⏳ Implement analytics tracking
5. ⏳ Add user preference storage

---

## Resources

- **Full Documentation:** `EvaluationDashboard.README.md`
- **Visual Guide:** `EVALUATION_DASHBOARD_VISUAL_GUIDE.md`
- **Usage Examples:** `EvaluationDashboard.example.tsx`
- **Implementation Summary:** `/EVALUATION_DASHBOARD_IMPLEMENTATION.md`

---

## Getting Help

### Common Questions
**Q: How do I change the stale time for data?**
A: Configure in QueryClient:
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10 * 60 * 1000 }, // 10 minutes
  },
});
```

**Q: How do I disable animations?**
A: Set `animate={false}` on motion components or disable in user preferences.

**Q: Can I use this without React Query?**
A: Not recommended. React Query handles caching, loading, and error states. You'd need to implement this manually.

**Q: How do I add more model filters?**
A: Modify the `useModels` call:
```tsx
const { data } = useModels({
  status: ['trained', 'deployed'],
  architecture: ['quantum-cnn'], // Add filters
});
```

---

## Quick Reference

### Component Path
```
/Users/aideveloper/core/AINative-website/src/components/qnn/EvaluationDashboard.tsx
```

### Hook Path
```
/Users/aideveloper/core/AINative-website/src/hooks/useEvaluation.ts
```

### Types Path
```
/Users/aideveloper/core/AINative-website/src/types/qnn.types.ts
```

### Import Statement
```tsx
import EvaluationDashboard from '@/components/qnn/EvaluationDashboard';
import { useModelEvaluation } from '@/hooks/useEvaluation';
import type { ModelEvaluation, EvaluationMetrics } from '@/types/qnn.types';
```

---

## That's It!

You're now ready to use the Evaluation Dashboard. For more detailed information, check the full documentation files listed above.

**Happy Evaluating!** 🎯📊
