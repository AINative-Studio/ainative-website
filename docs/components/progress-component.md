# Progress Component

A simple, accessible progress indicator component built on Radix UI primitives.

## Overview

The Progress component provides a clean, WCAG 2.1 AA compliant way to display progress indicators in your application. It supports both determinate (with a specific value) and indeterminate (loading) states.

## Features

- **Accessible**: Built with proper ARIA attributes (`role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`)
- **Customizable**: Supports custom sizing, colors, and styling via className
- **Smooth Animations**: CSS transitions for smooth progress updates
- **Lightweight**: Minimal abstraction over Radix UI primitive
- **Type-safe**: Full TypeScript support with prop forwarding

## Installation

The Progress component is already included in the UI component library. No additional installation needed.

## Basic Usage

```tsx
import { Progress } from '@/components/ui/progress';

export default function Example() {
  return <Progress value={50} />;
}
```

## API Reference

### Props

The Progress component accepts all standard HTML `div` attributes plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| null \| undefined` | `undefined` | Progress value between 0-100. Omit for indeterminate state. |
| `className` | `string` | `undefined` | Additional CSS classes to apply |
| `ref` | `React.Ref<HTMLDivElement>` | `undefined` | Forwarded ref to the root element |
| `aria-label` | `string` | `undefined` | Accessible label for screen readers |
| `aria-labelledby` | `string` | `undefined` | ID of element that labels the progress |

### Default Styling

```typescript
{
  className: 'relative h-2 w-full overflow-hidden rounded-full bg-primary/20'
  indicator: 'h-full w-full flex-1 bg-primary transition-all'
}
```

## Examples

### Basic Progress Bar

```tsx
<Progress value={75} aria-label="Upload progress" />
```

### Indeterminate State

For loading states where progress is unknown:

```tsx
<Progress aria-label="Loading" />
```

### Custom Sizing

```tsx
// Small
<Progress value={50} className="h-1" />

// Medium (default)
<Progress value={50} />

// Large
<Progress value={50} className="h-4" />

// Extra Large
<Progress value={50} className="h-6" />
```

### Custom Colors

```tsx
// Success (green)
<Progress value={100} className="[&>div]:bg-green-500" />

// Warning (yellow)
<Progress value={60} className="[&>div]:bg-yellow-500" />

// Error (red)
<Progress value={30} className="[&>div]:bg-red-500" />

// Info (blue)
<Progress value={45} className="[&>div]:bg-blue-500" />
```

### With Label and Percentage

```tsx
export default function ProgressWithLabel({ value }: { value: number }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Upload Progress</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} aria-label="Upload progress" />
    </div>
  );
}
```

### Dynamic Progress

```tsx
'use client';

import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

export default function DynamicProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <Progress value={progress} aria-label="Loading progress" />;
}
```

### File Upload Progress

```tsx
'use client';

import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

export default function FileUploadProgress() {
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (file: File) => {
    // Simulated upload
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span>Uploading file...</span>
        <span>{uploadProgress}%</span>
      </div>
      <Progress value={uploadProgress} aria-label="File upload progress" />
      {uploadProgress === 100 && (
        <p className="text-sm text-green-600">Upload complete!</p>
      )}
    </div>
  );
}
```

### Multiple Steps

```tsx
export default function MultiStepProgress({ currentStep, totalSteps }: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress
        value={progress}
        aria-label={`Step ${currentStep} of ${totalSteps}`}
      />
    </div>
  );
}
```

## Accessibility

The Progress component is WCAG 2.1 AA compliant and includes:

- **`role="progressbar"`**: Identifies the element as a progress indicator
- **`aria-valuemin`**: Minimum value (automatically set by Radix UI)
- **`aria-valuemax`**: Maximum value (automatically set by Radix UI)
- **`aria-valuenow`**: Current value (managed by Radix UI when value is provided)
- **`aria-label` or `aria-labelledby`**: Required for screen reader accessibility

### Best Practices

1. **Always provide a label**: Use `aria-label` or `aria-labelledby`
2. **Update announcements**: For dynamic progress, consider using `aria-live` regions
3. **Keyboard support**: Progress bars are not interactive, so keyboard support is not required
4. **Color contrast**: Ensure the progress indicator has sufficient contrast (4.5:1 minimum)

## Styling Guidelines

### Size Variants

| Size | Height Class | Use Case |
|------|-------------|----------|
| Small | `h-1` | Compact UIs, subtle indicators |
| Medium | `h-2` (default) | Standard progress bars |
| Large | `h-4` | Prominent progress indicators |
| Extra Large | `h-6` | Hero sections, major operations |

### Color Variants

Use Tailwind's arbitrary values to customize the indicator color:

```tsx
// Syntax: [&>div]:bg-{color}-{shade}
<Progress value={50} className="[&>div]:bg-blue-500" />
```

Common color mappings:
- **Primary**: Default (uses theme primary color)
- **Success**: `[&>div]:bg-green-500`
- **Warning**: `[&>div]:bg-yellow-500`
- **Error**: `[&>div]:bg-red-500`
- **Info**: `[&>div]:bg-blue-500`

## Performance Considerations

The Progress component is highly optimized:

- **Lightweight**: Only ~29 lines of code
- **No unnecessary re-renders**: Uses React.forwardRef
- **CSS transitions**: Smooth animations handled by CSS, not JavaScript
- **Minimal dependencies**: Only Radix UI primitive as dependency

### Rendering Multiple Instances

The component is efficient enough to render multiple instances:

```tsx
{Array.from({ length: 50 }, (_, i) => (
  <Progress key={i} value={i * 2} />
))}
```

## Testing

The component includes comprehensive test coverage:

- **45 unit tests** covering all functionality
- **21 validation tests** for refactor compliance
- **Accessibility tests** using jest-axe
- **Edge case handling** (NaN, Infinity, negative values, etc.)

See `/components/ui/__tests__/Progress.test.tsx` for full test suite.

## Common Patterns

### Loading State with Text

```tsx
<div className="space-y-2">
  <Progress aria-label="Loading" />
  <p className="text-sm text-center text-muted-foreground">
    Loading your content...
  </p>
</div>
```

### Progress with Status

```tsx
export default function ProgressWithStatus({ value }: { value: number }) {
  const getStatus = () => {
    if (value < 30) return { text: 'Starting...', color: 'text-gray-500' };
    if (value < 70) return { text: 'In Progress', color: 'text-blue-500' };
    if (value < 100) return { text: 'Almost Done', color: 'text-yellow-500' };
    return { text: 'Complete!', color: 'text-green-500' };
  };

  const status = getStatus();

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className={`text-sm font-medium ${status.color}`}>
          {status.text}
        </span>
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
```

## Migration from Legacy Progress

If migrating from a custom progress implementation:

```tsx
// Before (custom implementation)
<div className="progress-bar">
  <div style={{ width: `${value}%` }} />
</div>

// After (Progress component)
<Progress value={value} aria-label="Progress" />
```

## Related Components

- **StreamingProgress**: For complex, long-running operations with logs
- **Skeleton**: For loading states without progress indication
- **Spinner**: For indeterminate loading without progress

## Troubleshooting

### Progress not showing

Ensure the component has a parent with defined width:

```tsx
<div className="w-full"> {/* or w-64, w-96, etc. */}
  <Progress value={50} />
</div>
```

### Custom colors not applying

Use the correct Tailwind arbitrary value syntax:

```tsx
// ✅ Correct
<Progress className="[&>div]:bg-blue-500" />

// ❌ Incorrect
<Progress className="bg-blue-500" />
```

### Accessibility warnings

Always provide an accessible label:

```tsx
// ✅ Correct
<Progress value={50} aria-label="Upload progress" />

// ❌ Missing label
<Progress value={50} />
```

## Technical Details

### Component Structure

```
Progress (Root) - Radix UI ProgressPrimitive.Root
└── Indicator - Radix UI ProgressPrimitive.Indicator
```

### Props Forwarding

The component forwards all props to the underlying Radix UI primitive:

```typescript
React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
```

### Display Name

```typescript
Progress.displayName = ProgressPrimitive.Root.displayName;
// "Progress"
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

## License

MIT License - Part of AINative Studio UI Component Library

## Changelog

### v2.0.0 (2025-01-31)
- Simplified component structure (Issue #500)
- Comprehensive test coverage (85%+)
- Enhanced accessibility documentation
- Performance improvements

### v1.0.0
- Initial implementation with Radix UI
- Basic progress functionality
- WCAG 2.1 AA compliance
