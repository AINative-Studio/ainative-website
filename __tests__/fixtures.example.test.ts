/**
 * Example test file demonstrating fixture usage
 * This file shows best practices for using centralized test fixtures
 */

import {
  // Model fixtures
  createModel,
  models,
  activeModels,
  multimodalModels,
  modelsByProvider,

  // Benchmark fixtures
  createBenchmarkResult,
  benchmarkResults,

  // Monitoring fixtures
  createAlert,
  activeAlerts,

  // Repository fixtures
  createGitRepository,
  pullRequestsByState,

  // Training fixtures
  createTrainingJob,
  trainingJobsByStatus,
} from '@/__tests__/fixtures';

describe('Fixture Examples', () => {
  describe('Model Fixtures', () => {
    it('should use default model', () => {
      const model = createModel();
      expect(model.id).toBe('model-gpt4');
      expect(model.name).toBe('GPT-4');
      expect(model.provider).toBe('OpenAI');
    });

    it('should create custom model', () => {
      const customModel = createModel({
        id: 'custom-model',
        name: 'Custom LLM',
        contextWindow: 256000,
      });
      expect(customModel.id).toBe('custom-model');
      expect(customModel.name).toBe('Custom LLM');
    });

    it('should filter active models', () => {
      expect(activeModels.length).toBeGreaterThan(0);
      activeModels.forEach((model) => {
        expect(model.status).toBe('active');
      });
    });

    it('should filter multimodal models', () => {
      expect(multimodalModels.length).toBeGreaterThan(0);
      multimodalModels.forEach((model) => {
        expect(model.multimodal).toBe(true);
      });
    });

    it('should group models by provider', () => {
      expect(modelsByProvider.OpenAI).toBeDefined();
      expect(modelsByProvider.Anthropic).toBeDefined();
    });
  });

  describe('Benchmark Fixtures', () => {
    it('should use default benchmark result', () => {
      const result = createBenchmarkResult();
      expect(result.modelId).toBe('model-gpt4');
      expect(result.score).toBe(95.5);
    });

    it('should create custom benchmark result', () => {
      const customResult = createBenchmarkResult({
        modelName: 'My Model',
        score: 99.5,
      });
      expect(customResult.modelName).toBe('My Model');
      expect(customResult.score).toBe(99.5);
    });

    it('should have benchmark results collection', () => {
      expect(benchmarkResults).toHaveLength(3);
      expect(benchmarkResults[0].modelName).toBe('GPT-4');
    });
  });

  describe('Monitoring Fixtures', () => {
    it('should create default alert', () => {
      const alert = createAlert();
      expect(alert.severity).toBe('high');
      expect(alert.status).toBe('active');
    });

    it('should filter active alerts', () => {
      expect(activeAlerts.length).toBeGreaterThan(0);
      activeAlerts.forEach((alert) => {
        expect(alert.status).toBe('active');
      });
    });
  });

  describe('Repository Fixtures', () => {
    it('should create default repository', () => {
      const repo = createGitRepository();
      expect(repo.name).toBe('ainative-platform');
    });

    it('should create custom repository', () => {
      const customRepo = createGitRepository({
        name: 'my-repo',
        stars: 5000,
      });
      expect(customRepo.name).toBe('my-repo');
      expect(customRepo.stars).toBe(5000);
    });

    it('should filter pull requests by state', () => {
      expect(pullRequestsByState.open).toBeDefined();
      expect(pullRequestsByState.merged).toBeDefined();
    });
  });

  describe('Training Fixtures', () => {
    it('should create default training job', () => {
      const job = createTrainingJob();
      expect(job.status).toBe('running');
      expect(job.progress).toBe(50);
    });

    it('should create custom training job', () => {
      const customJob = createTrainingJob({
        name: 'My Training Job',
        status: 'completed',
        progress: 100,
      });
      expect(customJob.name).toBe('My Training Job');
      expect(customJob.status).toBe('completed');
    });

    it('should filter jobs by status', () => {
      expect(trainingJobsByStatus.running).toBeDefined();
      expect(trainingJobsByStatus.completed).toBeDefined();
    });
  });
});
