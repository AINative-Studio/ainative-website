/**
 * Comprehensive Examples for useBenchmarks Hook
 *
 * This file contains real-world examples of using the benchmark hooks
 * in various scenarios.
 */

import { useState } from 'react';
import {
  useBenchmarks,
  useBenchmarksByModel,
  useBenchmark,
  useRunBenchmark,
  useBenchmarkStatus,
  useCompareBenchmarks,
  usePrefetchBenchmark,
} from '@/hooks/useBenchmarks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, RefreshCw, TrendingUp } from 'lucide-react';

// ============================================================================
// Example 1: Simple Benchmark List
// ============================================================================

export function SimpleBenchmarkList() {
  const { data: benchmarks, isLoading, isError, error } = useBenchmarks();

  if (isLoading) {
    return <div>Loading benchmarks...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">All Benchmarks</h2>
      {benchmarks?.map((benchmark) => (
        <Card key={benchmark.benchmarkId}>
          <CardHeader>
            <CardTitle>{benchmark.dataset}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold">
                  {(benchmark.metrics.accuracy * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inference Time</p>
                <p className="text-2xl font-bold">
                  {benchmark.metrics.inferenceTime}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Example 2: Model-Specific Benchmarks with Filters
// ============================================================================

export function ModelBenchmarks({ modelId }: { modelId: string }) {
  const [dataset, setDataset] = useState<string | null>(null);
  const { data: benchmarks, isLoading } = useBenchmarksByModel(modelId);

  const filteredBenchmarks = dataset
    ? benchmarks?.filter((b) => b.dataset === dataset)
    : benchmarks;

  const datasets = [...new Set(benchmarks?.map((b) => b.dataset) || [])];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Model Benchmarks</h2>
        <div className="flex gap-2">
          <Button
            variant={dataset === null ? 'default' : 'outline'}
            onClick={() => setDataset(null)}
          >
            All
          </Button>
          {datasets.map((ds) => (
            <Button
              key={ds}
              variant={dataset === ds ? 'default' : 'outline'}
              onClick={() => setDataset(ds)}
            >
              {ds}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBenchmarks?.map((benchmark) => (
            <Card key={benchmark.benchmarkId}>
              <CardHeader>
                <CardTitle className="text-lg">{benchmark.dataset}</CardTitle>
                <Badge>{new Date(benchmark.timestamp).toLocaleDateString()}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Accuracy</span>
                      <span className="font-semibold">
                        {(benchmark.metrics.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={benchmark.metrics.accuracy * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Precision</span>
                      <span className="font-semibold">
                        {(benchmark.metrics.precision * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={benchmark.metrics.precision * 100} />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">Quantum Advantage</p>
                    <p className="text-lg font-bold text-primary">
                      {benchmark.quantumMetrics.quantumAdvantage.toFixed(2)}x
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 3: Interactive Benchmark Runner with Status Polling
// ============================================================================

export function BenchmarkRunner({ modelId }: { modelId: string }) {
  const [benchmarkId, setBenchmarkId] = useState<string | null>(null);
  const [dataset, setDataset] = useState('mnist');

  const { mutate: runBenchmark, isPending, isSuccess } = useRunBenchmark();
  const { data: benchmark } = useBenchmarkStatus(benchmarkId || '', !!benchmarkId);

  const handleRun = () => {
    runBenchmark(
      {
        modelId,
        dataset,
        batchSize: 64,
        iterations: 100,
      },
      {
        onSuccess: (result) => {
          setBenchmarkId(result.id);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run Benchmark</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Dataset</label>
          <select
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="mnist">MNIST</option>
            <option value="cifar10">CIFAR-10</option>
            <option value="imagenet">ImageNet</option>
          </select>
        </div>

        <Button onClick={handleRun} disabled={isPending || benchmark?.status === 'running'}>
          {isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Benchmark
            </>
          )}
        </Button>

        {benchmark && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <Badge
                variant={
                  benchmark.status === 'completed'
                    ? 'default'
                    : benchmark.status === 'failed'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {benchmark.status}
              </Badge>
            </div>

            {benchmark.status === 'running' && (
              <div>
                <Progress value={50} className="animate-pulse" />
                <p className="text-xs text-gray-600 mt-2">
                  Polling every 3 seconds...
                </p>
              </div>
            )}

            {benchmark.status === 'completed' && benchmark.metrics && (
              <div className="space-y-2">
                <h4 className="font-semibold">Results:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Accuracy</p>
                    <p className="font-bold">
                      {(benchmark.metrics.metrics.accuracy * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Inference Time</p>
                    <p className="font-bold">
                      {benchmark.metrics.metrics.inferenceTime}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">F1 Score</p>
                    <p className="font-bold">
                      {benchmark.metrics.metrics.f1Score.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Throughput</p>
                    <p className="font-bold">
                      {benchmark.metrics.metrics.throughput}/s
                    </p>
                  </div>
                </div>
              </div>
            )}

            {benchmark.status === 'failed' && (
              <div className="p-3 bg-red-50 text-red-800 rounded">
                <p className="text-sm">{benchmark.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 4: Multi-Model Comparison Dashboard
// ============================================================================

export function BenchmarkComparison({ modelIds }: { modelIds: string[] }) {
  const { data: comparison, isLoading } = useCompareBenchmarks(modelIds);

  if (isLoading) {
    return <div>Loading comparison...</div>;
  }

  const calculateAverage = (benchmarks: any[], metric: string) => {
    if (!benchmarks || benchmarks.length === 0) return 0;
    const sum = benchmarks.reduce((acc, b) => acc + b.metrics[metric], 0);
    return sum / benchmarks.length;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Model Comparison</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(comparison || {}).map(([modelId, benchmarks]) => {
          const avgAccuracy = calculateAverage(benchmarks, 'accuracy');
          const avgInferenceTime = calculateAverage(benchmarks, 'inferenceTime');
          const avgThroughput = calculateAverage(benchmarks, 'throughput');

          return (
            <Card key={modelId}>
              <CardHeader>
                <CardTitle className="text-lg">{modelId}</CardTitle>
                <Badge>{benchmarks.length} benchmarks</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avg Accuracy</span>
                    <span className="font-semibold">
                      {(avgAccuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={avgAccuracy * 100} />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
                  <div>
                    <p className="text-gray-600">Inference</p>
                    <p className="font-bold">{avgInferenceTime.toFixed(1)}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Throughput</p>
                    <p className="font-bold">{avgThroughput.toFixed(0)}/s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison Table</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Model</th>
                <th className="text-right p-2">Accuracy</th>
                <th className="text-right p-2">Precision</th>
                <th className="text-right p-2">Recall</th>
                <th className="text-right p-2">F1 Score</th>
                <th className="text-right p-2">Inference Time</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(comparison || {}).map(([modelId, benchmarks]) => (
                <tr key={modelId} className="border-b">
                  <td className="p-2 font-medium">{modelId}</td>
                  <td className="text-right p-2">
                    {(calculateAverage(benchmarks, 'accuracy') * 100).toFixed(1)}%
                  </td>
                  <td className="text-right p-2">
                    {(calculateAverage(benchmarks, 'precision') * 100).toFixed(1)}%
                  </td>
                  <td className="text-right p-2">
                    {(calculateAverage(benchmarks, 'recall') * 100).toFixed(1)}%
                  </td>
                  <td className="text-right p-2">
                    {calculateAverage(benchmarks, 'f1Score').toFixed(3)}
                  </td>
                  <td className="text-right p-2">
                    {calculateAverage(benchmarks, 'inferenceTime').toFixed(1)}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Example 5: Benchmark Card with Prefetching
// ============================================================================

export function BenchmarkCardWithPrefetch({
  benchmarkId,
  onSelect,
}: {
  benchmarkId: string;
  onSelect: (id: string) => void;
}) {
  const prefetchBenchmark = usePrefetchBenchmark();

  return (
    <Card
      onMouseEnter={() => prefetchBenchmark(benchmarkId)}
      onClick={() => onSelect(benchmarkId)}
      className="cursor-pointer hover:shadow-lg transition-shadow"
    >
      <CardContent className="p-4">
        <p className="text-sm text-gray-600">Benchmark ID</p>
        <p className="font-mono text-sm">{benchmarkId}</p>
        <p className="text-xs text-gray-500 mt-2">Hover to prefetch details</p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 6: Benchmark Detail View
// ============================================================================

export function BenchmarkDetailView({ benchmarkId }: { benchmarkId: string }) {
  const { data: benchmark, isLoading, isError } = useBenchmark(benchmarkId);

  if (isLoading) return <div>Loading benchmark details...</div>;
  if (isError) return <div>Error loading benchmark</div>;
  if (!benchmark) return <div>Benchmark not found</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Benchmark Details</CardTitle>
            <Badge>{benchmark.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-600">Benchmark ID</dt>
              <dd className="font-mono">{benchmark.id}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Model ID</dt>
              <dd className="font-mono">{benchmark.modelId}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Created At</dt>
              <dd>{new Date(benchmark.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Completed At</dt>
              <dd>
                {benchmark.completedAt
                  ? new Date(benchmark.completedAt).toLocaleString()
                  : 'N/A'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {benchmark.metrics && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(benchmark.metrics.metrics.accuracy * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <p className="text-sm text-gray-600">Precision</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(benchmark.metrics.metrics.precision * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <p className="text-sm text-gray-600">Recall</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(benchmark.metrics.metrics.recall * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded">
                  <p className="text-sm text-gray-600">F1 Score</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {benchmark.metrics.metrics.f1Score.toFixed(3)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quantum Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Circuit Depth</p>
                  <p className="text-xl font-bold">
                    {benchmark.metrics.quantumMetrics.circuitDepth}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gate Count</p>
                  <p className="text-xl font-bold">
                    {benchmark.metrics.quantumMetrics.gateCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fidelity</p>
                  <p className="text-xl font-bold">
                    {(benchmark.metrics.quantumMetrics.fidelity * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coherence Time</p>
                  <p className="text-xl font-bold">
                    {benchmark.metrics.quantumMetrics.coherenceTime}μs
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Quantum Advantage</p>
                      <p className="text-2xl font-bold text-primary">
                        {benchmark.metrics.quantumMetrics.quantumAdvantage.toFixed(2)}x
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
