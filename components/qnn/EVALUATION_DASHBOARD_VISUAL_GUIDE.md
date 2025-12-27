# Evaluation Dashboard - Visual Guide

## Component Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                     EVALUATION DASHBOARD                         │
│  🎯 Evaluate trained models and view comprehensive metrics      │
│                                                                  │
│  [Select a model to evaluate ▼]  [JSON ▼] [Export Report 📥]  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│   ACCURACY   │  F1 SCORE   │  PRECISION   │   RECALL     │
│              │              │              │              │
│   🎯 92.45%  │  ⚡ 91.23%  │  ✓ 93.67%   │  📊 91.12%  │
│              │              │              │              │
│ +2.5% ↑     │   Harmonic   │   Positive   │  True pos.  │
│              │     mean     │   predict.   │     rate    │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌────────────────────────────┬────────────────────────────┐
│   CONFUSION MATRIX         │      ROC CURVE             │
│                            │                            │
│  ┌────┬────┐              │   1.0 ┤      ╱─────       │
│  │ 85 │ 5  │ Predicted    │       │     ╱              │
│  │(94%)│(6%)│ Positive     │   0.8 ┤    ╱               │
│  ├────┼────┤              │       │   ╱                │
│  │ 5  │ 90 │ Predicted    │   0.6 ┤  ╱                 │
│  │(5%)│(95%)│ Negative     │       │ ╱                  │
│  └────┴────┘              │   0.4 ┤╱                   │
│    Actual  Actual         │       │                    │
│   Positive Negative       │   0.2 ┤                    │
│                            │       │  Random Classifier │
│  🟢 Correct predictions   │   0.0 └────────────────    │
│  🔴 Incorrect predictions │       0.0  0.5  1.0        │
│                            │                            │
│                            │   AUC: 0.9524              │
│                            │   Excellent discrimination │
└────────────────────────────┴────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ADDITIONAL METRICS                             │
│                                                             │
│  Specificity    NPV        Matthews CC    Sample Size      │
│    88.52%     90.34%        0.8235         185 samples     │
│                                                             │
│  📄 Last evaluated 2024-10-29                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Color Palette

### Performance Metrics Cards
```css
Accuracy:   Linear gradient purple-500/10 → primary/10 → blue-600/10
F1 Score:   Linear gradient blue-500/5 → blue-600/10
Precision:  Linear gradient emerald-500/5 → emerald-600/10
Recall:     Linear gradient amber-500/5 → amber-600/10
```

### Confusion Matrix
```
Correct Predictions (Diagonal):
  - Background: rgba(34, 197, 94, opacity 0.1-0.7) [Green]
  - Darker = more samples

Incorrect Predictions (Off-diagonal):
  - Background: rgba(239, 68, 68, opacity 0.1-0.6) [Red]
  - Darker = more errors
```

### ROC Curve
```
Model ROC Line:     hsl(var(--primary)) [Purple/Blue]
Random Classifier:  #9ca3af [Gray, dashed]
Grid:               Opacity 0.3 [Light gray]
```

---

## Component States

### 1. Empty State
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              🎯                                 │
│                                                 │
│         No Model Selected                       │
│                                                 │
│   Select a trained model from the dropdown     │
│   above to view its evaluation metrics and     │
│   performance analysis                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. Loading State
```
┌─────────────────────────────────────────────────┐
│  [████████████████████████     ] Loading...     │
└─────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ ▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓ │
└──────────┴──────────┴──────────┴──────────┘

┌────────────────────┬────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└────────────────────┴────────────────────┘
```

### 3. Loaded State (Main View)
Full dashboard with all metrics and visualizations

---

## Interaction Patterns

### 1. Model Selection
```
[Select a model to evaluate        ▼]
  │
  ├─ Click: Opens dropdown
  │
  └─ Hover: Shows full model name
```

### 2. Confusion Matrix Hover
```
┌────┐
│ 85 │ ← Hover
└────┘
    ↓
┌─────────────────────────────┐
│ Predicted: Positive         │
│ Actual: Positive            │
│ Count: 85                   │
│ Percentage: 94.4%           │
└─────────────────────────────┘
```

### 3. ROC Curve Hover
```
   ●  ← Hover on curve
   │
   └─ FPR: 0.245
      TPR: 0.892
```

### 4. Export Button
```
[JSON ▼]  [Export Report 📥] ← Click
                                 │
                                 ├─ JSON: Downloads immediately
                                 └─ PDF: Coming soon alert
```

---

## Animation Sequence (Framer Motion)

```
1. Header Card
   └─ Fade in from top (0ms delay)

2. Metrics Cards (staggered)
   ├─ Accuracy    (80ms delay)
   ├─ F1 Score    (160ms delay)
   ├─ Precision   (240ms delay)
   └─ Recall      (320ms delay)

3. Confusion Matrix
   └─ Fade in + slide up (400ms delay)

4. ROC Curve
   ├─ Container fade in (480ms delay)
   └─ Line draws left to right (1500ms animation)

5. Additional Metrics
   └─ Fade in + slide up (560ms delay)
```

---

## Responsive Breakpoints

### Mobile (< 768px)
```
┌─────────────────────┐
│     ACCURACY        │
│      92.45%         │
└─────────────────────┘
┌─────────────────────┐
│     F1 SCORE        │
│      91.23%         │
└─────────────────────┘
┌─────────────────────┐
│    PRECISION        │
│      93.67%         │
└─────────────────────┘
┌─────────────────────┐
│      RECALL         │
│      91.12%         │
└─────────────────────┘

┌─────────────────────┐
│  CONFUSION MATRIX   │
│                     │
└─────────────────────┘

┌─────────────────────┐
│     ROC CURVE       │
│                     │
└─────────────────────┘
```

### Tablet (768px - 1024px)
```
┌──────────┬──────────┐
│ ACCURACY │ F1 SCORE │
└──────────┴──────────┘
┌──────────┬──────────┐
│PRECISION │  RECALL  │
└──────────┴──────────┘

┌──────────┬──────────┐
│ CONFUSION│    ROC   │
│  MATRIX  │   CURVE  │
└──────────┴──────────┘
```

### Desktop (> 1024px)
```
┌────┬────┬────┬────┐
│ACCR│ F1 │PREC│RECL│
└────┴────┴────┴────┘

┌─────────┬─────────┐
│CONFUSION│   ROC   │
│ MATRIX  │  CURVE  │
└─────────┴─────────┘
```

---

## Typography Scale

```css
Page Title:         text-4xl font-bold (36px)
Card Title:         text-lg font-semibold (18px)
Metric Value:       text-4xl font-bold (36px)
Metric Label:       text-xs font-medium (12px)
Description:        text-sm (14px)
Tooltip:            text-xs (12px)
```

---

## Spacing System

```css
Card Padding:       p-6 (24px)
Grid Gap:           gap-4 (16px)
Section Gap:        gap-6 (24px)
Metric Card Gap:    gap-3 (12px)
Icon Size:          h-6 w-6 (24px) or h-4 w-4 (16px)
```

---

## Icon Usage

```
🎯 Target         - Accuracy
⚡ Zap            - F1 Score
✓ CheckCircle2   - Precision
📊 Activity       - Recall
📥 Download       - Export
📄 FileText       - Last evaluated
📈 TrendingUp     - Positive change
⚠️ AlertCircle    - Negative change
```

---

## Accessibility Features

### Keyboard Navigation
```
Tab Order:
1. Model dropdown
2. Export format selector
3. Export button
4. [Future: Confusion matrix cells]
5. [Future: ROC curve points]
```

### ARIA Labels
```html
<select aria-label="Select model for evaluation">
<button aria-label="Export evaluation report">
<div role="img" aria-label="Confusion matrix visualization">
<div role="img" aria-label="ROC curve showing AUC of 0.95">
```

### Screen Reader Text
```
"Model evaluation dashboard"
"Accuracy: 92.45 percent, increased by 2.5 percent"
"Confusion matrix showing 85 true positives, 5 false negatives..."
"ROC curve with area under curve of 0.9524, excellent discrimination"
```

---

## Dark Mode Variations

### Light Mode
```
Background:     white/gray-50
Text:           gray-900
Border:         primary/20
Card:           white/80 with backdrop-blur
```

### Dark Mode
```
Background:     gray-900/gray-800
Text:           white/gray-100
Border:         primary/20
Card:           gray-800/80 with backdrop-blur
```

---

## Performance Metrics

### Initial Load
```
Time to Interactive:    < 1.5s
First Contentful Paint: < 0.8s
Largest Contentful Paint: < 2.0s
```

### Animation Performance
```
Frame Rate:     60fps
GPU Accelerated: Yes (transform, opacity)
Layout Shifts:  Minimal (skeleton screens)
```

### Data Fetching
```
Initial Fetch:  800ms (mock)
Cached Fetch:   < 50ms
Stale Time:     5 minutes
```

---

## Component Tree

```
EvaluationDashboard/
├── Header Card
│   ├── Title & Description
│   └── Controls Row
│       ├── Model Select
│       ├── Export Format Select
│       └── Export Button
│
├── Empty State (conditional)
│   ├── Icon
│   ├── Heading
│   └── Description
│
├── Loading State (conditional)
│   ├── Skeleton Cards
│   └── Skeleton Charts
│
└── Loaded State (conditional)
    ├── Performance Metrics Grid (motion.div)
    │   ├── Accuracy Card
    │   ├── F1 Score Card
    │   ├── Precision Card
    │   └── Recall Card
    │
    ├── Charts Grid (2 columns)
    │   ├── Confusion Matrix Card
    │   │   ├── Header
    │   │   ├── Heatmap Grid
    │   │   └── Legend
    │   │
    │   └── ROC Curve Card
    │       ├── Header
    │       ├── LineChart (Recharts)
    │       └── AUC Info Badge
    │
    └── Additional Metrics Card
        ├── Header with Timestamp Badge
        └── Metrics Grid (4 columns)
            ├── Specificity
            ├── NPV
            ├── MCC
            └── Sample Size
```

---

## CSS Classes Reference

### Card Styles
```css
.card-gradient-purple
  bg-gradient-to-br from-purple-500/10 via-primary/10 to-blue-600/10

.card-gradient-blue
  bg-gradient-to-br from-blue-500/5 to-blue-600/10

.card-gradient-emerald
  bg-gradient-to-br from-emerald-500/5 to-emerald-600/10

.card-gradient-amber
  bg-gradient-to-br from-amber-500/5 to-amber-600/10
```

### Border Styles
```css
.card-border
  border border-primary/20

.card-backdrop
  bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
```

---

## Component Props (Future Enhancement)

```typescript
interface EvaluationDashboardProps {
  // Pre-select a model
  defaultModelId?: string;

  // Customize which metrics to show
  visibleMetrics?: ('accuracy' | 'f1' | 'precision' | 'recall')[];

  // Customize export formats
  exportFormats?: ('json' | 'pdf' | 'csv')[];

  // Callback when model changes
  onModelChange?: (modelId: string) => void;

  // Callback when export completes
  onExport?: (format: string, data: ModelEvaluation) => void;

  // Custom styling
  className?: string;

  // Disable certain features
  disableExport?: boolean;
}
```

---

This visual guide provides a comprehensive overview of the Evaluation Dashboard's layout, interactions, and styling. Use it as a reference for understanding how the component should look and behave across different states and screen sizes.
