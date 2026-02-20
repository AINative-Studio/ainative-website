/**
 * Tests for Model Aggregator Service
 * Refs #ISSUE_NUMBER (will be added after issue creation)
 */

import { modelAggregatorService } from '../model-aggregator-service';

// Mock the API client
jest.mock('../api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe('ModelAggregatorService', () => {
  describe('aggregateAllModels', () => {
    it('should return at least 10 hardcoded models even when API calls fail', async () => {
      // Arrange: Mock API failures
      const apiClient = require('../api-client').default;
      apiClient.get.mockRejectedValue(new Error('API call failed'));

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThanOrEqual(10);

      // Verify structure
      expect(models[0]).toHaveProperty('id');
      expect(models[0]).toHaveProperty('slug');
      expect(models[0]).toHaveProperty('name');
      expect(models[0]).toHaveProperty('provider');
      expect(models[0]).toHaveProperty('category');
      expect(models[0]).toHaveProperty('capabilities');
      expect(models[0]).toHaveProperty('description');
      expect(models[0]).toHaveProperty('endpoint');
      expect(models[0]).toHaveProperty('method');
      expect(models[0]).toHaveProperty('source_type');
    });

    it('should include models from all categories', async () => {
      // Arrange: Mock API failures
      const apiClient = require('../api-client').default;
      apiClient.get.mockRejectedValue(new Error('API call failed'));

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert: Check we have models from different categories
      const categories = [...new Set(models.map(m => m.category))];
      expect(categories).toContain('Coding');
      expect(categories).toContain('Image');
      expect(categories).toContain('Video');
      expect(categories).toContain('Audio');
    });

    it('should include coding models', async () => {
      // Arrange: Mock API failures
      const apiClient = require('../api-client').default;
      apiClient.get.mockRejectedValue(new Error('API call failed'));

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert
      const codingModels = models.filter(m => m.category === 'Coding');
      expect(codingModels.length).toBeGreaterThanOrEqual(1);

      const nousCoder = codingModels.find(m => m.id === 'coding-nous-coder');
      expect(nousCoder).toBeDefined();
      expect(nousCoder?.name).toBe('NousCoder');
      expect(nousCoder?.provider).toBe('Nous Research');
      expect(nousCoder?.capabilities).toContain('code');
    });

    it('should include image generation models', async () => {
      // Arrange: Mock API failures
      const apiClient = require('../api-client').default;
      apiClient.get.mockRejectedValue(new Error('API call failed'));

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert
      const imageModels = models.filter(m => m.category === 'Image');
      expect(imageModels.length).toBeGreaterThanOrEqual(1);

      const qwenEdit = imageModels.find(m => m.id === 'image-qwen-edit');
      expect(qwenEdit).toBeDefined();
      expect(qwenEdit?.name).toBe('Qwen Image Edit');
      expect(qwenEdit?.slug).toBe('qwen-image-edit');
      expect(qwenEdit?.capabilities).toContain('image-generation');
    });

    it('should include video generation models', async () => {
      // Arrange: Mock API failures
      const apiClient = require('../api-client').default;
      apiClient.get.mockRejectedValue(new Error('API call failed'));

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert
      const videoModels = models.filter(m => m.category === 'Video');
      expect(videoModels.length).toBeGreaterThanOrEqual(5);

      // Verify specific video models exist
      const wan22 = videoModels.find(m => m.id === 'video-wan22-i2v');
      expect(wan22).toBeDefined();
      expect(wan22?.capabilities).toContain('video-generation');
    });

    it('should include audio models', async () => {
      // Arrange: Mock API failures
      const apiClient = require('../api-client').default;
      apiClient.get.mockRejectedValue(new Error('API call failed'));

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert
      const audioModels = models.filter(m => m.category === 'Audio');
      expect(audioModels.length).toBeGreaterThanOrEqual(3);

      // Verify specific audio models exist
      const whisper = audioModels.find(m => m.id === 'audio-whisper-transcription');
      expect(whisper).toBeDefined();
      expect(whisper?.capabilities).toContain('transcription');
    });

    it('should have all required fields for each model', async () => {
      // Arrange: Mock API failures
      const apiClient = require('../api-client').default;
      apiClient.get.mockRejectedValue(new Error('API call failed'));

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert: Verify each model has required fields
      models.forEach(model => {
        expect(model.id).toBeTruthy();
        expect(model.slug).toBeTruthy();
        expect(model.name).toBeTruthy();
        expect(model.provider).toBeTruthy();
        expect(model.category).toBeTruthy();
        expect(Array.isArray(model.capabilities)).toBe(true);
        expect(model.capabilities.length).toBeGreaterThan(0);
        expect(model.description).toBeTruthy();
        expect(model.endpoint).toBeTruthy();
        expect(model.method).toMatch(/^(GET|POST|PUT|PATCH|DELETE)$/);
        expect(model.source_type).toBeTruthy();
      });
    });

    it('should include example prompts for all hardcoded models', async () => {
      // Arrange: Mock API failures
      const apiClient = require('../api-client').default;
      apiClient.get.mockRejectedValue(new Error('API call failed'));

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert: Verify specific models have example prompts
      const ttsModel = models.find(m => m.id === 'audio-tts');
      expect(ttsModel).toBeDefined();
      expect(ttsModel?.examplePrompts).toBeDefined();
      expect(Array.isArray(ttsModel?.examplePrompts)).toBe(true);
      expect(ttsModel?.examplePrompts?.length).toBeGreaterThan(0);
      expect(ttsModel?.examplePrompts?.[0]).toContain('narrator');

      const whisperModel = models.find(m => m.id === 'audio-whisper-transcription');
      expect(whisperModel).toBeDefined();
      expect(whisperModel?.examplePrompts).toBeDefined();
      expect(whisperModel?.examplePrompts?.[0]).toContain('Transcribe');

      const nousCoder = models.find(m => m.id === 'coding-nous-coder');
      expect(nousCoder).toBeDefined();
      expect(nousCoder?.examplePrompts).toBeDefined();
      expect(nousCoder?.examplePrompts?.[0]).toContain('production-ready');

      const qwenImage = models.find(m => m.id === 'image-qwen-edit');
      expect(qwenImage).toBeDefined();
      expect(qwenImage?.examplePrompts).toBeDefined();
      expect(qwenImage?.examplePrompts?.[0]).toContain('photorealistic');

      const wan22Video = models.find(m => m.id === 'video-wan22-i2v');
      expect(wan22Video).toBeDefined();
      expect(wan22Video?.examplePrompts).toBeDefined();
      expect(wan22Video?.examplePrompts?.[0]).toContain('realistic');

      const embeddings = models.filter(m => m.category === 'Embedding');
      embeddings.forEach(embedding => {
        expect(embedding.examplePrompts).toBeDefined();
        expect(embedding.examplePrompts?.length).toBeGreaterThan(0);
        expect(embedding.examplePrompts?.[0]).toContain('semantic');
      });
    });
  });
});
