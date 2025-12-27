# Evaluation Dashboard Component

## Overview

The Evaluation Dashboard is a comprehensive component for evaluating trained QNN models and viewing detailed performance metrics. It provides interactive visualizations for confusion matrices, ROC curves, and key performance indicators.

**File Location:** `/Users/aideveloper/core/AINative-website/src/components/qnn/EvaluationDashboard.tsx`

## Features

### 1. Model Selection
- Dropdown selector to choose from trained/deployed models
- Filters automatically to show only evaluable models
- Displays model architecture badges
- Empty state when no models available

### 2. Performance Metrics Cards
Four prominent metric cards with gradient backgrounds:
- **Accuracy** - Overall classification accuracy with trend indicator
- **F1 Score** - Harmonic mean of precision and recall
- **Precision** - Positive predictive value
- **Recall** - True positive rate

Each card features:
- Large, readable percentage display
- Icon indicators
- Contextual descriptions
- Animated transitions

### 3. Confusion Matrix Visualization
Interactive heatmap showing model predictions vs actual labels:
- Color-coded cells (green for correct, red for incorrect)
- Opacity based on cell values for visual hierarchy
- Hover tooltips with class names
- Percentage display in each cell
- Scales automatically for multi-class classification
- Smooth hover effects with scale transformation

### 4. ROC Curve
Professional ROC (Receiver Operating Characteristic) curve visualization:
- True Positive Rate vs False Positive Rate plot
- Displays AUC (Area Under Curve) score
- Diagonal reference line for random classifier baseline
- Interactive tooltips showing exact values
- Performance interpretation text based on AUC score
- Animated curve drawing on load
- Recharts library for smooth rendering

### 5. Export Functionality
Download evaluation reports in multiple formats:
- **JSON Format** - Complete evaluation data with all metrics
- **PDF Format** - Formatted report (coming soon)
- Format selector dropdown
- Automatic filename with timestamp
- One-click download

### 6. Additional Metrics Section
Extended performance indicators:
- Specificity (True Negative Rate)
- NPV (Negative Predictive Value)
- Matthews Correlation Coefficient (MCC)
- Sample size
- Evaluation timestamp with badge
- Grid layout for clean organization

## UI/UX Design

### Visual Design
- Gradient backgrounds for key metric cards
- Color-coded visualizations (green/red for accuracy)
- Backdrop blur effects on cards
- Consistent border styling with primary color accents
- Dark mode support throughout

### Animations
- Staggered fade-in for all elements using Framer Motion
- Smooth transitions when switching models
- ROC curve draws with 1.5s animation
- Hover effects on confusion matrix cells
- Loading skeleton screens

### States
- **Empty State** - No model selected message with icon
- **Loading State** - Skeleton cards and charts
- **Loaded State** - Full metrics and visualizations
- **Error State** - Handled by React Query

## Data Integration

### API Hooks
Uses custom React Query hooks from `useEvaluation.ts`:

```typescript
import { useModelEvaluation } from '@/hooks/useEvaluation';
import { useModels } from '@/hooks/useModels';

// Fetch models filtered by trained/deployed status
const { data: modelsResponse, isLoading: modelsLoading } = useModels({
  status: ['trained', 'deployed'],
});

// Fetch evaluation data for selected model
const { data: evaluation, isLoading: evaluationLoading } = useModelEvaluation(
  selectedModelId,
  !!selectedModelId
);
```

### Data Flow
1. Component loads and fetches available models
2. User selects a model from dropdown
3. Evaluation data fetches automatically
4. Charts and metrics render with animations
5. Export button enables when data available

### Caching
- React Query provides automatic caching
- 5-minute stale time for evaluation data
- 15-minute garbage collection time
- Prefetch on hover (utility available)

## Type Definitions

Located in `/Users/aideveloper/core/AINative-website/src/types/qnn.types.ts`:

```typescript
export interface ModelEvaluation {
  modelId: string;
  evaluatedAt: string;
  sampleSize: number;
  metrics: EvaluationMetrics;
  confusionMatrix: number[][];
  classNames?: string[];
  rocCurve?: ROCPoint[];
  precisionRecallCurve?: PrecisionRecallPoint[];
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc?: number;
  specificity?: number;
  npv?: number;
  mcc?: number;
  accuracyChange?: number;
}

export interface ROCPoint {
  threshold: number;
  truePositiveRate: number;
  falsePositiveRate: number;
}
```

## Usage Example

```tsx
import EvaluationDashboard from '@/components/qnn/EvaluationDashboard';

function QNNApp() {
  return (
    <div className="container mx-auto p-6">
      <EvaluationDashboard />
    </div>
  );
}
```

## Dependencies

### UI Components (shadcn/ui)
- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle`
- `Button`
- `Badge`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Skeleton`

### Visualization
- `recharts` - For ROC curve and charts
  - `ResponsiveContainer`
  - `LineChart`, `Line`
  - `XAxis`, `YAxis`
  - `CartesianGrid`
  - `Tooltip`, `Legend`

### Animation
- `framer-motion` - For smooth animations and transitions

### Icons
- `lucide-react` - Vector icons for UI elements

## Responsive Design

The dashboard is fully responsive across all screen sizes:

### Mobile (< 768px)
- Single column layout for metric cards
- Full-width charts
- Stacked confusion matrix and ROC curve
- Touch-friendly interactions

### Tablet (768px - 1024px)
- 2-column grid for metric cards
- Side-by-side charts
- Optimized spacing

### Desktop (> 1024px)
- 4-column grid for metric cards
- 2-column chart layout
- Maximum readability

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Focus indicators

## Performance Optimization

- Lazy loading of charts
- Memoized calculations for confusion matrix and ROC data
- React Query caching
- Efficient re-renders with useMemo
- Code splitting ready
- Skeleton screens for perceived performance

## Integration with QNN API

Currently using mock data for demonstration. To integrate with real API:

1. Update `useEvaluation.ts` hook queries
2. Replace mock data with actual API client calls
3. Handle real-time evaluation updates
4. Implement proper error handling
5. Add retry logic for failed requests

```typescript
// Example integration (in useEvaluation.ts)
export function useModelEvaluation(modelId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: evaluationKeys.detail(modelId),
    queryFn: async (): Promise<ModelEvaluation> => {
      const apiClient = new QNNApiClient();
      return apiClient.getModelEvaluation(modelId);
    },
    staleTime: 5 * 60 * 1000,
    enabled: enabled && !!modelId,
  });
}
```

## Future Enhancements

### Planned Features
1. **PDF Export** - Full report generation with jsPDF
2. **Precision-Recall Curve** - Additional visualization
3. **Multi-Model Comparison** - Side-by-side evaluation
4. **Real-time Updates** - WebSocket integration for live evaluation
5. **Custom Metrics** - User-defined evaluation metrics
6. **Historical Tracking** - Evaluation history over time
7. **Interactive Filtering** - Filter by class, threshold, etc.
8. **Advanced Statistics** - Confidence intervals, bootstrapping
9. **Export to CSV** - Raw data export
10. **Shareable Links** - Direct links to evaluation results

### Visualization Improvements
- 3D confusion matrix for multi-class
- Animated metric transitions
- Drill-down capabilities
- Threshold slider for ROC curve
- Cost-benefit analysis overlay

## Testing Considerations

### Unit Tests
- Component rendering with different states
- Model selection logic
- Export functionality
- Data transformations (confusion matrix, ROC curve)

### Integration Tests
- API integration with mock server
- Data fetching and caching
- Error handling scenarios

### E2E Tests
- Full workflow from model selection to export
- Responsive design verification
- Accessibility compliance

## Troubleshooting

### Common Issues

**Issue:** Models not appearing in dropdown
- **Solution:** Check model status filters, ensure models are trained/deployed

**Issue:** Confusion matrix not rendering
- **Solution:** Verify confusionMatrix array structure in evaluation data

**Issue:** ROC curve missing
- **Solution:** Check if AUC metric is available, fallback to synthetic curve

**Issue:** Export not working
- **Solution:** Check browser permissions for downloads

## Related Components

- `/Users/aideveloper/core/AINative-website/src/components/qnn/BenchmarkingDashboard.tsx`
- `/Users/aideveloper/core/AINative-website/src/components/qnn/TrainingHistory.tsx`
- `/Users/aideveloper/core/AINative-website/src/components/qnn/ModelManager.tsx`

## Related Hooks

- `/Users/aideveloper/core/AINative-website/src/hooks/useEvaluation.ts`
- `/Users/aideveloper/core/AINative-website/src/hooks/useModels.ts`
- `/Users/aideveloper/core/AINative-website/src/hooks/useQNN.ts`

## Contributing

When modifying this component:
1. Maintain consistent styling with other QNN components
2. Update type definitions if adding new metrics
3. Add JSDoc comments for new functions
4. Test responsive behavior
5. Verify accessibility
6. Update this README

## License

Part of the AINative Core project.
