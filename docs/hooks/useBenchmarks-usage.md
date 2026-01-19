# useBenchmarks Hook Documentation

Comprehensive guide for using the benchmark hooks in the AINative Studio QNN platform.

## Table of Contents

- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Hook Reference](#hook-reference)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)

## Overview

The `useBenchmarks` module provides a suite of React Query hooks for managing QNN model benchmarking operations. These hooks connect to the backend API through the QNNApiClient and provide features like:

- Automatic caching with React Query
- Optimistic updates
- Automatic polling for running benchmarks
- Prefetching capabilities
- Type-safe API integration

## API Endpoints

The hooks interact with the following backend endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/benchmarking/metrics` | GET | Fetch benchmark metrics (optional modelId query param) |
| `/v1/benchmarking/run` | POST | Run a new benchmark |
| `/v1/benchmarking/results/:id` | GET | Get specific benchmark result |

### Query Parameters

- `modelId` (string, optional): Filter benchmarks by model ID

## Hook Reference

### `useBenchmarks(modelId?: string)`

Fetch all benchmark metrics, optionally filtered by model ID.

**Parameters:**
- `modelId` (optional): Filter benchmarks by this model ID

**Returns:**
- `data`: Array of BenchmarkMetrics
- `isLoading`: Loading state
- `isError`: Error state
- `error`: Error object if request failed

**Cache Time:**
- Stale time: 5 minutes
- Garbage collection: 15 minutes

---

### `useBenchmarksByModel(modelId: string, enabled?: boolean)`

Fetch benchmarks for a specific model.

**Parameters:**
- `modelId`: Model ID (required)
- `enabled`: Whether to fetch automatically (default: true)

**Returns:**
- Same as `useBenchmarks`

---

### `useBenchmark(id: string, enabled?: boolean)`

Fetch a specific benchmark result by ID.

**Parameters:**
- `id`: Benchmark ID (required)
- `enabled`: Whether to fetch automatically (default: true)

**Returns:**
- `data`: BenchmarkResult object
- Standard React Query states

**Cache Time:**
- Stale time: 10 minutes

---

### `useBenchmarkMetrics(modelId: string, enabled?: boolean)`

Fetch benchmark metrics for a specific model.

**Parameters:**
- `modelId`: Model ID (required)
- `enabled`: Whether to fetch automatically (default: true)

**Returns:**
- `data`: Array of BenchmarkMetrics

---

### `useRunBenchmark()`

Mutation hook to run a new benchmark.

**Returns:**
- `mutate`: Function to trigger benchmark
- `isPending`: Loading state
- `isSuccess`: Success state
- `data`: BenchmarkResult on success

**Features:**
- Optimistic updates
- Automatic cache invalidation
- Rollback on error

---

### `useBenchmarkStatus(id: string, enabled?: boolean)`

Poll benchmark status until completion.

**Parameters:**
- `id`: Benchmark ID (required)
- `enabled`: Whether to poll automatically (default: true)

**Returns:**
- `data`: Current BenchmarkResult
- Polls every 3 seconds while status is 'running'

---

### `useCompareBenchmarks(modelIds: string[])`

Compare benchmarks across multiple models.

**Parameters:**
- `modelIds`: Array of model IDs to compare

**Returns:**
- `data`: Record<string, BenchmarkMetrics[]>
- Keys are model IDs, values are their benchmark metrics

---

### `usePrefetchBenchmark()`

Utility hook to prefetch benchmark data.

**Returns:**
- Function that accepts benchmark ID and prefetches its data

## Usage Examples

### Basic Benchmark Fetching

```tsx
import { useBenchmarks } from '@/hooks/useBenchmarks';

function BenchmarkList() {
  const { data: benchmarks, isLoading, isError } = useBenchmarks();

  if (isLoading) return <div>Loading benchmarks...</div>;
  if (isError) return <div>Error loading benchmarks</div>;

  return (
    <div>
      {benchmarks?.map((benchmark) => (
        <div key={benchmark.benchmarkId}>
          <h3>{benchmark.dataset}</h3>
          <p>Accuracy: {benchmark.metrics.accuracy}</p>
          <p>Inference Time: {benchmark.metrics.inferenceTime}ms</p>
        </div>
      ))}
    </div>
  );
}
```

### Filtering by Model

```tsx
import { useBenchmarksByModel } from '@/hooks/useBenchmarks';

function ModelBenchmarks({ modelId }: { modelId: string }) {
  const { data: benchmarks, isLoading } = useBenchmarksByModel(modelId);

  return (
    <div>
      <h2>Benchmarks for Model: {modelId}</h2>
      {benchmarks?.map((benchmark) => (
        <BenchmarkCard key={benchmark.benchmarkId} data={benchmark} />
      ))}
    </div>
  );
}
```

### Running a Benchmark

```tsx
import { useRunBenchmark } from '@/hooks/useBenchmarks';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

function BenchmarkRunner({ modelId }: { modelId: string }) {
  const { mutate: runBenchmark, isPending, isSuccess } = useRunBenchmark();
  const [benchmarkId, setBenchmarkId] = useState<string | null>(null);

  const handleRun = () => {
    runBenchmark(
      {
        modelId,
        dataset: 'mnist',
        batchSize: 64,
        iterations: 100,
      },
      {
        onSuccess: (result) => {
          console.log('Benchmark started:', result.id);
          setBenchmarkId(result.id);
        },
        onError: (error) => {
          console.error('Benchmark failed:', error);
        },
      }
    );
  };

  return (
    <div>
      <Button onClick={handleRun} disabled={isPending}>
        {isPending ? 'Starting...' : 'Run Benchmark'}
      </Button>
      {isSuccess && benchmarkId && (
        <BenchmarkStatus benchmarkId={benchmarkId} />
      )}
    </div>
  );
}
```

### Polling Benchmark Status

```tsx
import { useBenchmarkStatus } from '@/hooks/useBenchmarks';

function BenchmarkStatus({ benchmarkId }: { benchmarkId: string }) {
  const { data: benchmark, isLoading } = useBenchmarkStatus(benchmarkId);

  if (isLoading) return <div>Loading status...</div>;

  return (
    <div>
      <h3>Benchmark Status: {benchmark?.status}</h3>
      {benchmark?.status === 'running' && (
        <div>
          <Spinner />
          <p>Polling every 3 seconds...</p>
        </div>
      )}
      {benchmark?.status === 'completed' && benchmark.metrics && (
        <div>
          <h4>Results:</h4>
          <pre>{JSON.stringify(benchmark.metrics, null, 2)}</pre>
        </div>
      )}
      {benchmark?.status === 'failed' && (
        <div className="error">Error: {benchmark.error}</div>
      )}
    </div>
  );
}
```

### Comparing Multiple Models

```tsx
import { useCompareBenchmarks } from '@/hooks/useBenchmarks';

function BenchmarkComparison({ modelIds }: { modelIds: string[] }) {
  const { data: comparison, isLoading } = useCompareBenchmarks(modelIds);

  if (isLoading) return <div>Loading comparison...</div>;

  return (
    <div>
      <h2>Model Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Avg Accuracy</th>
            <th>Avg Inference Time</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(comparison || {}).map(([modelId, benchmarks]) => {
            const avgAccuracy =
              benchmarks.reduce((sum, b) => sum + b.metrics.accuracy, 0) /
              benchmarks.length;
            const avgInferenceTime =
              benchmarks.reduce((sum, b) => sum + b.metrics.inferenceTime, 0) /
              benchmarks.length;

            return (
              <tr key={modelId}>
                <td>{modelId}</td>
                <td>{avgAccuracy.toFixed(2)}</td>
                <td>{avgInferenceTime.toFixed(2)}ms</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

### Prefetching on Hover

```tsx
import { usePrefetchBenchmark } from '@/hooks/useBenchmarks';

function BenchmarkCard({ benchmarkId }: { benchmarkId: string }) {
  const prefetchBenchmark = usePrefetchBenchmark();

  return (
    <div
      onMouseEnter={() => prefetchBenchmark(benchmarkId)}
      onClick={() => navigateToBenchmark(benchmarkId)}
    >
      <p>Benchmark: {benchmarkId}</p>
      <p>Hover to prefetch details</p>
    </div>
  );
}
```

### Conditional Fetching

```tsx
import { useBenchmarksByModel } from '@/hooks/useBenchmarks';

function ConditionalBenchmarks({ modelId, shouldFetch }: {
  modelId: string;
  shouldFetch: boolean;
}) {
  const { data: benchmarks } = useBenchmarksByModel(modelId, shouldFetch);

  // Only fetches when shouldFetch is true
  return <div>{benchmarks?.length || 0} benchmarks loaded</div>;
}
```

## Best Practices

### 1. Use Appropriate Cache Times

```tsx
// For frequently changing data
useBenchmarkStatus(id); // staleTime: 0, refetches automatically

// For stable data
useBenchmark(id); // staleTime: 10 minutes
```

### 2. Handle Loading and Error States

```tsx
const { data, isLoading, isError, error } = useBenchmarks();

if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <BenchmarkList data={data} />;
```

### 3. Optimize with Enabled Flag

```tsx
// Don't fetch until user interaction
const [userReady, setUserReady] = useState(false);
const { data } = useBenchmarks(undefined, userReady);
```

### 4. Use Query Keys for Cache Management

```tsx
import { benchmarkKeys } from '@/hooks/useBenchmarks';
import { useQueryClient } from '@tanstack/react-query';

function RefreshButton({ modelId }: { modelId: string }) {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: benchmarkKeys.byModel(modelId)
    });
  };

  return <Button onClick={handleRefresh}>Refresh</Button>;
}
```

### 5. Combine with Other Hooks

```tsx
import { useBenchmarksByModel } from '@/hooks/useBenchmarks';
import { useModels } from '@/hooks/useModels';

function ModelWithBenchmarks() {
  const { data: models } = useModels();
  const selectedModel = models?.[0];

  const { data: benchmarks } = useBenchmarksByModel(
    selectedModel?.id || '',
    !!selectedModel
  );

  return <div>...</div>;
}
```

## Error Handling

### Error Types

The hooks use QNNApiClient which throws typed errors:

- `QNNAuthenticationError`: 401 authentication issues
- `QNNAuthorizationError`: 403 authorization issues
- `QNNNotFoundError`: 404 resource not found
- `QNNValidationError`: 400 validation errors
- `QNNNetworkError`: Network/connection issues
- `QNNTimeoutError`: Request timeout
- `QNNRateLimitError`: 429 rate limit exceeded
- `QNNServerError`: 5xx server errors

### Error Handling Example

```tsx
import { QNNAuthenticationError } from '@/services/QNNApiClient';

function BenchmarkWithErrorHandling() {
  const { data, error, isError } = useBenchmarks();

  if (isError) {
    if (error instanceof QNNAuthenticationError) {
      return <div>Please log in to view benchmarks</div>;
    }
    if (error instanceof QNNNotFoundError) {
      return <div>Benchmarks not found</div>;
    }
    return <div>Error: {error.message}</div>;
  }

  return <BenchmarkList data={data} />;
}
```

## TypeScript Types

### Key Type Definitions

```typescript
interface BenchmarkMetrics {
  modelId: string;
  benchmarkId: string;
  dataset: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    inferenceTime: number;
    throughput: number;
    memoryUsage: number;
  };
  quantumMetrics: {
    circuitDepth: number;
    gateCount: number;
    fidelity: number;
    coherenceTime: number;
    quantumAdvantage: number;
  };
  comparisonWithClassical?: {
    accuracyDiff: number;
    speedupFactor: number;
    memoryReduction: number;
  };
  timestamp: string;
}

interface BenchmarkResult {
  id: string;
  modelId: string;
  status: 'running' | 'completed' | 'failed';
  metrics?: BenchmarkMetrics;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface BenchmarkRequest {
  modelId: string;
  dataset: string;
  batchSize?: number;
  iterations?: number;
  hardwareBackend?: string;
}
```

### Query Key Structure

```typescript
export const benchmarkKeys = {
  all: ['benchmarks'] as const,
  lists: () => [...benchmarkKeys.all, 'list'] as const,
  list: () => [...benchmarkKeys.lists()] as const,
  details: () => [...benchmarkKeys.all, 'detail'] as const,
  detail: (id: string) => [...benchmarkKeys.details(), id] as const,
  byModel: (modelId: string) => [...benchmarkKeys.all, 'model', modelId] as const,
  results: (modelId: string) => [...benchmarkKeys.byModel(modelId), 'results'] as const,
};
```

## Advanced Patterns

### Custom Hook Composition

```tsx
import { useBenchmarksByModel } from '@/hooks/useBenchmarks';
import { useMemo } from 'react';

function useLatestBenchmark(modelId: string) {
  const { data: benchmarks, ...rest } = useBenchmarksByModel(modelId);

  const latestBenchmark = useMemo(() => {
    if (!benchmarks || benchmarks.length === 0) return null;
    return benchmarks.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  }, [benchmarks]);

  return { data: latestBenchmark, ...rest };
}
```

### Parallel Queries

```tsx
import { useQueries } from '@tanstack/react-query';
import { benchmarkKeys } from '@/hooks/useBenchmarks';
import QNNApiClient from '@/services/QNNApiClient';

function useMultipleBenchmarks(benchmarkIds: string[]) {
  return useQueries({
    queries: benchmarkIds.map((id) => ({
      queryKey: benchmarkKeys.detail(id),
      queryFn: async () => {
        const client = new QNNApiClient();
        return client.getBenchmarkResult(id);
      },
    })),
  });
}
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/AINative-Studio/ainative-website-nextjs-staging/issues
- Documentation: https://ainative.studio/docs
- Email: hello@ainative.studio
