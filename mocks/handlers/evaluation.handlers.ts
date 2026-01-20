/**
 * QNN Evaluation MSW Handlers
 *
 * Mock handlers for model evaluation API endpoints.
 * These handlers support integration tests and development without backend.
 *
 * Refs #433
 */
import { http, HttpResponse, delay } from 'msw';

const QNN_BASE_URL = process.env.NEXT_PUBLIC_QNN_API_URL || 'https://qnn-api.ainative.studio';

// Mock evaluation data
const mockEvaluationMetrics = {
  accuracy: 0.92,
  precision: 0.91,
  recall: 0.93,
  f1Score: 0.92,
  auc: 0.95,
  specificity: 0.89,
  npv: 0.88,
  mcc: 0.84,
  accuracyChange: 0.02,
};

const mockModelEvaluation = {
  modelId: 'model-123',
  evaluatedAt: new Date().toISOString(),
  sampleSize: 10000,
  metrics: mockEvaluationMetrics,
  confusionMatrix: [
    [950, 50],
    [70, 930],
  ],
  classNames: ['Negative', 'Positive'],
  rocCurve: [
    { threshold: 0.1, truePositiveRate: 0.98, falsePositiveRate: 0.15 },
    { threshold: 0.3, truePositiveRate: 0.96, falsePositiveRate: 0.10 },
    { threshold: 0.5, truePositiveRate: 0.93, falsePositiveRate: 0.07 },
    { threshold: 0.7, truePositiveRate: 0.90, falsePositiveRate: 0.04 },
    { threshold: 0.9, truePositiveRate: 0.85, falsePositiveRate: 0.02 },
  ],
  precisionRecallCurve: [
    { threshold: 0.1, precision: 0.87, recall: 0.98 },
    { threshold: 0.3, precision: 0.90, recall: 0.96 },
    { threshold: 0.5, precision: 0.93, recall: 0.93 },
    { threshold: 0.7, precision: 0.96, recall: 0.90 },
    { threshold: 0.9, precision: 0.98, recall: 0.85 },
  ],
};

// Store evaluations by modelId for stateful mocking
const evaluationsStore: Map<string, typeof mockModelEvaluation> = new Map();

export const evaluationHandlers = [
  /**
   * GET /v1/models/:modelId/evaluation
   * Fetch full evaluation results for a model
   */
  http.get(`${QNN_BASE_URL}/v1/models/:modelId/evaluation`, async ({ params }) => {
    await delay(100); // Simulate network latency

    const modelId = params.modelId as string;

    // Check if model exists (simulate 404)
    if (modelId === 'nonexistent' || modelId === 'invalid') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'EVALUATION_NOT_FOUND',
            message: `Evaluation for model '${modelId}' not found`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Return stored or default evaluation
    const evaluation = evaluationsStore.get(modelId) || {
      ...mockModelEvaluation,
      modelId,
    };

    return HttpResponse.json({
      success: true,
      data: evaluation,
      timestamp: new Date().toISOString(),
    });
  }),

  /**
   * GET /v1/models/:modelId/evaluation/metrics
   * Fetch lightweight metrics only
   */
  http.get(`${QNN_BASE_URL}/v1/models/:modelId/evaluation/metrics`, async ({ params }) => {
    await delay(50); // Faster endpoint

    const modelId = params.modelId as string;

    if (modelId === 'nonexistent') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'METRICS_NOT_FOUND',
            message: `Metrics for model '${modelId}' not found`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: mockEvaluationMetrics,
      timestamp: new Date().toISOString(),
    });
  }),

  /**
   * POST /v1/evaluation/run
   * Run evaluation on a model
   */
  http.post(`${QNN_BASE_URL}/v1/evaluation/run`, async ({ request }) => {
    await delay(200); // Simulate evaluation time

    const body = await request.json() as {
      modelId?: string;
      datasetPath?: string;
      batchSize?: number;
      metrics?: string[];
    };

    // Validate request
    if (!body.modelId) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Model ID is required',
            details: { field: 'modelId' },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (!body.datasetPath) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dataset path is required',
            details: { field: 'datasetPath' },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Simulate model not found
    if (body.modelId === 'untrained') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'MODEL_NOT_TRAINED',
            message: 'Model must be trained before evaluation',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Generate new evaluation
    const newEvaluation = {
      ...mockModelEvaluation,
      modelId: body.modelId,
      evaluatedAt: new Date().toISOString(),
      sampleSize: Math.floor(Math.random() * 5000) + 5000,
    };

    // Store for subsequent fetches
    evaluationsStore.set(body.modelId, newEvaluation);

    return HttpResponse.json({
      success: true,
      data: newEvaluation,
      message: 'Evaluation completed successfully',
      timestamp: new Date().toISOString(),
    });
  }),

  /**
   * POST /v1/evaluation/compare
   * Compare evaluations across multiple models
   */
  http.post(`${QNN_BASE_URL}/v1/evaluation/compare`, async ({ request }) => {
    await delay(150);

    const body = await request.json() as { modelIds?: string[] };

    if (!body.modelIds || body.modelIds.length === 0) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one model ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Generate comparison data
    const comparisons = body.modelIds.map((modelId: string) => ({
      ...mockModelEvaluation,
      modelId,
      metrics: {
        ...mockEvaluationMetrics,
        accuracy: 0.85 + Math.random() * 0.10,
        f1Score: 0.84 + Math.random() * 0.11,
        auc: 0.88 + Math.random() * 0.08,
      },
    }));

    return HttpResponse.json({
      success: true,
      data: comparisons,
      timestamp: new Date().toISOString(),
    });
  }),

  /**
   * GET /v1/models/:modelId/evaluation/export
   * Export evaluation report in specified format
   */
  http.get(`${QNN_BASE_URL}/v1/models/:modelId/evaluation/export`, async ({ params, request }) => {
    await delay(100);

    const modelId = params.modelId as string;
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';

    if (modelId === 'nonexistent') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'EVALUATION_NOT_FOUND',
            message: `No evaluation found for model '${modelId}'`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const evaluation = evaluationsStore.get(modelId) || {
      ...mockModelEvaluation,
      modelId,
    };

    // Return appropriate format
    switch (format) {
      case 'json':
        return new HttpResponse(JSON.stringify(evaluation, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="evaluation-${modelId}.json"`,
          },
        });

      case 'csv':
        const csvContent = [
          'metric,value',
          `accuracy,${evaluation.metrics.accuracy}`,
          `precision,${evaluation.metrics.precision}`,
          `recall,${evaluation.metrics.recall}`,
          `f1Score,${evaluation.metrics.f1Score}`,
          `auc,${evaluation.metrics.auc}`,
        ].join('\n');
        return new HttpResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="evaluation-${modelId}.csv"`,
          },
        });

      case 'pdf':
        // Return a mock PDF blob
        const pdfContent = '%PDF-1.4 mock content';
        return new HttpResponse(pdfContent, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="evaluation-${modelId}.pdf"`,
          },
        });

      default:
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_FORMAT',
              message: `Unsupported export format: ${format}`,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
    }
  }),
];

// Export for use in tests
export { mockModelEvaluation, mockEvaluationMetrics };
