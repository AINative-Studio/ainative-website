# Streaming Progress Indicators

A comprehensive system for providing real-time feedback during long-running operations, preventing the "silent hanging" user experience identified in Gemini CLI issues #16985 and #16982.

## Overview

This system addresses the critical UX problem where users don't know if:
- The system is still working
- The operation has failed
- How long it will take
- What they can do about errors

## Components

### StreamingProgress

Real-time progress display with logs, estimates, and step tracking.

**Features:**
- Live progress bar (0-100%)
- Step tracking (e.g., "Step 3 of 5")
- Time elapsed display
- Estimated time remaining
- Expandable log viewer
- Auto-warnings at 10s and 60s
- Cancel operation support
- Compact variant for inline display

**Usage:**
```tsx
import { StreamingProgress } from '@/components/ui/progress';

<StreamingProgress
  operationId="unique-op-id"
  showLogs={true}
  showEstimate={true}
  onCancel={() => handleCancel()}
  onComplete={(result) => handleComplete(result)}
/>
```

**Props:**
- `operationId` (required): Unique identifier for the operation
- `showLogs` (optional): Show expandable log viewer (default: true)
- `showEstimate` (optional): Show estimated time remaining (default: true)
- `compact` (optional): Use minimal inline variant (default: false)
- `onComplete` (optional): Callback when operation completes
- `onError` (optional): Callback when operation fails
- `onCancel` (optional): Callback for cancel button (enables cancel button)

---

### ToolExecutionStatus

Visual status indicator for tool/command execution with auto-hide on success.

**Features:**
- Animated status icons
- Progress bar for running operations
- Auto-hide after success (configurable)
- Expandable details section
- Error state with recovery info
- Operation metadata display

**Usage:**
```tsx
import { ToolExecutionStatus } from '@/components/ui/progress';

<ToolExecutionStatus
  operationId="tool-exec-1"
  toolName="Data Processing Tool"
  showDetails={true}
  autoHideOnSuccess={true}
  autoHideDuration={3000}
/>
```

**Props:**
- `operationId` (required): Unique identifier for the operation
- `toolName` (required): Display name of the tool/command
- `showDetails` (optional): Show expandable details (default: true)
- `autoHideOnSuccess` (optional): Auto-hide on success (default: true)
- `autoHideDuration` (optional): Hide delay in ms (default: 3000)

---

### LongOperationIndicator

Fixed-position indicator for operations exceeding 5 seconds, with warnings at 60 seconds.

**Features:**
- Appears only after threshold (default: 5s)
- Fixed bottom-right position
- Warning state after 60s
- Elapsed time display
- Progress visualization
- Step indicators
- Cancel operation button
- Suggested troubleshooting actions
- Auto-timeout callback

**Usage:**
```tsx
import { LongOperationIndicator } from '@/components/ui/progress';

<LongOperationIndicator
  operationId="long-op-1"
  threshold={5000}
  warningThreshold={60000}
  showTimeElapsed={true}
  showCancel={true}
  onTimeout={() => handleTimeout()}
/>
```

**Props:**
- `operationId` (required): Unique identifier for the operation
- `threshold` (optional): Show after N ms (default: 5000)
- `warningThreshold` (optional): Warning after N ms (default: 60000)
- `showTimeElapsed` (optional): Show elapsed time (default: true)
- `showCancel` (optional): Show cancel button (default: true)
- `onTimeout` (optional): Callback when timeout occurs

---

### ErrorDisplay

User-friendly error display with actionable feedback and recovery suggestions.

**Features:**
- Severity-based styling (critical/warning/recoverable)
- Auto-generated suggested actions based on error code
- Copy error details to clipboard
- Expandable technical stack trace
- Retry button for recoverable errors
- Help documentation link
- Operation context display

**Usage:**
```tsx
import { ErrorDisplay } from '@/components/ui/progress';

<ErrorDisplay
  error={{
    code: 'NETWORK_ERROR',
    message: 'Unable to connect to server',
    details: 'Connection timeout after 30s',
    recoverable: true
  }}
  operation={{
    operationId: 'op-123',
    type: 'api_call',
    message: 'Fetching user data'
  }}
  showStack={true}
  showRetry={true}
  onRetry={() => retryOperation()}
  onDismiss={() => closeError()}
/>
```

**Props:**
- `error` (required): Error object with code, message, details
- `operation` (required): Operation context (id, type, message)
- `showStack` (optional): Show technical stack trace (default: false)
- `showRetry` (optional): Show retry button (default: true)
- `onRetry` (optional): Callback for retry button
- `onDismiss` (optional): Callback for dismiss button

---

## Hooks

### useOperationProgress

Subscribe to real-time operation progress via SSE or WebSocket.

**Features:**
- SSE (Server-Sent Events) support
- WebSocket support
- Auto-reconnection with exponential backoff
- Max retry attempts (5)
- Connection state tracking
- Error handling
- Custom event callbacks

**Usage:**
```tsx
import { useOperationProgress } from '@/hooks/useOperationProgress';

const {
  progress,
  isConnected,
  error,
  connect,
  disconnect,
  retry
} = useOperationProgress({
  operationId: 'op-123',
  endpoint: '/api/operations/progress',
  protocol: 'sse', // or 'websocket'
  autoConnect: true,
  onUpdate: (progress) => console.log(progress),
  onComplete: (result) => console.log('Done!', result),
  onError: (error) => console.error(error),
  context: {
    userId: 'user-123',
    sessionId: 'session-456'
  }
});
```

### useMockOperationProgress

Development helper for simulating progress (remove in production).

**Usage:**
```tsx
import { useMockOperationProgress } from '@/hooks/useOperationProgress';

const progress = useMockOperationProgress(
  'demo-op',
  'tool_execution',
  5,    // total steps
  10000 // duration in ms
);
```

---

### useProgressToast

Enhanced toast notifications for progress events.

**Features:**
- Success/error/warning/info variants
- Progress toast with percentage bar
- Custom action buttons
- Auto-dismiss durations
- Consistent styling

**Usage:**
```tsx
import { useProgressToast } from '@/hooks/useProgressToast';

const {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showProgressUpdateToast,
  dismissProgressToast
} = useProgressToast();

// Success notification
showSuccessToast('op-123', 'Upload complete', undefined, 3200);

// Error with retry
showErrorToast(
  'op-456',
  'Upload failed',
  'Network connection lost',
  () => retryUpload()
);

// Progress update
showProgressUpdateToast('op-789', 'Uploading files', 45, '3 of 10 files');

// Warning
showWarningToast('op-999', 'Taking longer than usual', 'Still processing...');
```

---

## TypeScript Types

All types are exported from `@/types/progress`:

```typescript
import type {
  OperationProgress,
  OperationStatus,
  OperationType,
  LogLevel,
  OperationLog,
  StreamingProgressProps,
  ToolExecutionStatusProps,
  LongOperationIndicatorProps,
  ErrorDisplayProps,
  ProgressToastOptions,
  OperationContext,
  ProgressMessage
} from '@/types/progress';
```

### OperationProgress Interface

```typescript
interface OperationProgress {
  operationId: string;
  type: OperationType;
  status: OperationStatus;
  progress: number; // 0-100
  message: string;
  startTime: number;
  endTime?: number;
  estimatedTimeRemaining?: number;
  totalSteps?: number;
  currentStep?: number;
  logs: OperationLog[];
  error?: {
    code: string;
    message: string;
    details?: string;
    stack?: string;
    recoverable: boolean;
  };
  metadata?: {
    fileName?: string;
    fileCount?: number;
    bytesProcessed?: number;
    totalBytes?: number;
    modelName?: string;
    endpoint?: string;
  };
}
```

---

## Backend Integration

### SSE Endpoint Example

```typescript
// app/api/operations/progress/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const operationId = request.nextUrl.searchParams.get('operationId');

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start background operation
  performOperation(operationId, async (progress) => {
    const data = JSON.stringify({
      type: 'progress_update',
      data: progress
    });
    await writer.write(encoder.encode(`data: ${data}\n\n`));
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### WebSocket Example

```typescript
// Server-side WebSocket handler
ws.on('message', (message) => {
  const { type, operationId } = JSON.parse(message);

  if (type === 'subscribe') {
    subscribeToOperation(operationId, (progress) => {
      ws.send(JSON.stringify({
        type: 'progress_update',
        data: progress
      }));
    });
  }
});
```

---

## Accessibility

All components follow WCAG 2.1 Level AA standards:

### ARIA Live Regions
- All progress components use `aria-live="polite"` for status updates
- Error states use `aria-live="assertive"` for immediate announcements
- Progress bars have `aria-label` with current percentage

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Cancel/retry buttons can be activated with Enter/Space
- Expandable sections use proper `aria-expanded` state

### Screen Reader Support
- Semantic HTML with proper roles (`role="status"`, `role="alert"`, `role="log"`)
- Descriptive `aria-label` attributes
- Status changes announced to screen readers

### Color Contrast
- All text meets WCAG AA contrast ratios (4.5:1 minimum)
- Status indicators use icons + color (not color alone)
- Color-blind friendly palette

---

## Demo Page

Visit `/demo/progress-indicators` to see all components in action with:
- Quick demo controls for different operation durations
- Live state inspection
- Error simulation
- Toast notification demos
- Accessibility feature documentation

---

## Production Checklist

Before deploying to production:

1. **Remove Mock Functions**
   - Remove `useMockOperationProgress` imports
   - Replace with real `useOperationProgress` calls

2. **Implement Backend Endpoints**
   - Create SSE or WebSocket endpoint at `/api/operations/progress`
   - Emit progress events from your backend operations
   - Follow the `ProgressMessage` type structure

3. **Configure Timeouts**
   - Adjust `threshold` and `warningThreshold` for your use case
   - Set appropriate `autoHideDuration` values

4. **Test Accessibility**
   - Run with screen reader (NVDA, JAWS, VoiceOver)
   - Test keyboard navigation
   - Verify color contrast in production theme

5. **Monitor Performance**
   - SSE/WebSocket connection pooling
   - Reconnection backoff limits
   - Memory cleanup on unmount

---

## Error Code Conventions

Use consistent error codes for auto-suggestions:

- `NETWORK_*` - Network/connectivity issues
- `AUTH_*` - Authentication/authorization issues
- `RATE_LIMIT_*` - Rate limiting issues
- `VALIDATION_*` - Input validation issues
- `TIMEOUT_*` - Operation timeout issues
- `SYSTEM_*` - System/critical errors

The `ErrorDisplay` component automatically generates helpful suggestions based on error code prefixes.

---

## License

Part of AINative Studio - see LICENSE file in project root.
