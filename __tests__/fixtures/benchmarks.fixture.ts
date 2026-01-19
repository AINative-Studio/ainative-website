/**
 * Test fixtures for benchmark data
 * Used for testing benchmark-related components and services
 */

export interface BenchmarkMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface BenchmarkResult {
  id: string;
  modelId: string;
  modelName: string;
  taskType: string;
  score: number;
  accuracy?: number;
  latency?: number;
  throughput?: number;
  timestamp: Date;
  metrics: BenchmarkMetric[];
}

export interface BenchmarkComparison {
  id: string;
  name: string;
  models: string[];
  results: BenchmarkResult[];
  createdAt: Date;
}

export const createBenchmarkMetric = (
  overrides?: Partial<BenchmarkMetric>
): BenchmarkMetric => ({
  id: 'metric-1',
  name: 'Inference Time',
  value: 150.5,
  unit: 'ms',
  timestamp: new Date('2025-01-01T12:00:00Z'),
  metadata: {
    environment: 'production',
    hardware: 'GPU',
  },
  ...overrides,
});

export const createBenchmarkResult = (
  overrides?: Partial<BenchmarkResult>
): BenchmarkResult => ({
  id: 'benchmark-1',
  modelId: 'model-gpt4',
  modelName: 'GPT-4',
  taskType: 'text-generation',
  score: 95.5,
  accuracy: 0.955,
  latency: 150.5,
  throughput: 1000,
  timestamp: new Date('2025-01-01T12:00:00Z'),
  metrics: [
    createBenchmarkMetric({ id: 'metric-1', name: 'Inference Time' }),
    createBenchmarkMetric({ id: 'metric-2', name: 'Memory Usage', value: 2048, unit: 'MB' }),
  ],
  ...overrides,
});

export const benchmarkResults: BenchmarkResult[] = [
  createBenchmarkResult({
    id: 'benchmark-1',
    modelId: 'model-gpt4',
    modelName: 'GPT-4',
    score: 95.5,
    accuracy: 0.955,
  }),
  createBenchmarkResult({
    id: 'benchmark-2',
    modelId: 'model-claude',
    modelName: 'Claude 3 Opus',
    score: 94.2,
    accuracy: 0.942,
  }),
  createBenchmarkResult({
    id: 'benchmark-3',
    modelId: 'model-gemini',
    modelName: 'Gemini Pro',
    score: 92.8,
    accuracy: 0.928,
  }),
];

export const createBenchmarkComparison = (
  overrides?: Partial<BenchmarkComparison>
): BenchmarkComparison => ({
  id: 'comparison-1',
  name: 'LLM Performance Comparison',
  models: ['GPT-4', 'Claude 3 Opus', 'Gemini Pro'],
  results: benchmarkResults,
  createdAt: new Date('2025-01-01T12:00:00Z'),
  ...overrides,
});

export const benchmarkMetricsByTask = {
  'text-generation': [
    createBenchmarkMetric({ name: 'Tokens per Second', value: 50, unit: 'tokens/s' }),
    createBenchmarkMetric({ name: 'First Token Latency', value: 100, unit: 'ms' }),
    createBenchmarkMetric({ name: 'Total Latency', value: 2000, unit: 'ms' }),
  ],
  'image-generation': [
    createBenchmarkMetric({ name: 'Generation Time', value: 5000, unit: 'ms' }),
    createBenchmarkMetric({ name: 'Image Quality Score', value: 0.92, unit: 'score' }),
    createBenchmarkMetric({ name: 'Resolution', value: 1024, unit: 'px' }),
  ],
  'code-generation': [
    createBenchmarkMetric({ name: 'Code Quality', value: 0.88, unit: 'score' }),
    createBenchmarkMetric({ name: 'Compilation Success', value: 0.95, unit: 'ratio' }),
    createBenchmarkMetric({ name: 'Test Pass Rate', value: 0.92, unit: 'ratio' }),
  ],
};

export const emptyBenchmarkResult = createBenchmarkResult({
  metrics: [],
  accuracy: undefined,
  latency: undefined,
  throughput: undefined,
});

export const errorBenchmarkResult = createBenchmarkResult({
  id: 'benchmark-error',
  score: 0,
  accuracy: 0,
  metrics: [],
});

export const largeBenchmarkDataset = Array.from({ length: 100 }, (_, i) =>
  createBenchmarkResult({
    id: `benchmark-${i}`,
    modelId: `model-${i % 10}`,
    modelName: `Model ${i % 10}`,
    score: 80 + Math.random() * 20,
    accuracy: 0.8 + Math.random() * 0.2,
  })
);
