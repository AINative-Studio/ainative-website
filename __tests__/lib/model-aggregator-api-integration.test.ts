/**
 * Tests for Model Aggregator Service - API Integration
 * Refs #566 - Test AI Registry API integration
 */

import { modelAggregatorService, UnifiedAIModel } from '@/lib/model-aggregator-service';
import apiClient from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ModelAggregatorService - AI Registry API Integration (Issue #566)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAIRegistryModels', () => {
    it('should fetch models from /v1/public/ai-registry/models endpoint', async () => {
      // Arrange: Mock AI Registry API response
      const mockRegistryResponse = {
        data: {
          models: [
            {
              id: 'test-image-model',
              name: 'Test Image Model',
              provider: 'TestProvider',
              category: 'image',
              capabilities: ['image-generation', 'text-to-image'],
              description: 'Test image generation model',
              endpoint: '/v1/multimodal/image',
              method: 'POST',
              pricing: {
                credits: 50,
                usd: 0.025,
                unit: 'per image',
              },
              is_default: false,
              is_premium: false,
              speed: 'Fast',
              quality: 'High',
              examplePrompts: ['Generate a test image'],
            },
            {
              id: 'test-video-model',
              name: 'Test Video Model',
              provider: 'TestProvider',
              category: 'video',
              capabilities: ['video-generation', 'image-to-video'],
              description: 'Test video generation model',
              endpoint: '/v1/multimodal/video/i2v',
              method: 'POST',
              pricing: {
                credits: 400,
                usd: 0.20,
                unit: 'per 5s video',
              },
            },
          ],
          total: 2,
        },
      };

      const mockHealthResponse = {
        data: {
          status: 'healthy',
          services: {
            image: { available: true },
            video: { available: true },
            audio: { available: true },
          },
        },
      };

      // Mock chat models (empty for this test)
      const mockChatResponse = { data: { object: 'list', data: [] } };

      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint === '/v1/public/ai-registry/models') {
          return Promise.resolve(mockRegistryResponse) as any;
        }
        if (endpoint === '/v1/multimodal/health') {
          return Promise.resolve(mockHealthResponse) as any;
        }
        if (endpoint === '/v1/models') {
          return Promise.resolve(mockChatResponse) as any;
        }
        if (endpoint === '/v1/public/embeddings/models') {
          return Promise.resolve({ data: [] }) as any;
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/ai-registry/models');
      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/multimodal/health');

      // Verify models were transformed correctly
      const imageModel = models.find((m) => m.id === 'test-image-model');
      expect(imageModel).toBeDefined();
      expect(imageModel?.category).toBe('Image');
      expect(imageModel?.source_type).toBe('image');
      expect(imageModel?.slug).toBe('test-image-model');

      const videoModel = models.find((m) => m.id === 'test-video-model');
      expect(videoModel).toBeDefined();
      expect(videoModel?.category).toBe('Video');
      expect(videoModel?.source_type).toBe('video');
    });

    it('should fallback to hardcoded models if AI Registry API fails', async () => {
      // Arrange: Mock API failure
      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint === '/v1/public/ai-registry/models') {
          return Promise.reject(new Error('API Error'));
        }
        if (endpoint === '/v1/multimodal/health') {
          return Promise.resolve({ data: { status: 'healthy', services: {} } }) as any;
        }
        if (endpoint === '/v1/models') {
          return Promise.resolve({ data: { object: 'list', data: [] } }) as any;
        }
        if (endpoint === '/v1/public/embeddings/models') {
          return Promise.resolve({ data: [] }) as any;
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert: Should have hardcoded fallback models
      expect(models.length).toBeGreaterThan(0);

      // Verify hardcoded models exist
      const imageModels = models.filter((m) => m.category === 'Image');
      const videoModels = models.filter((m) => m.category === 'Video');
      const audioModels = models.filter((m) => m.category === 'Audio');

      expect(imageModels.length).toBeGreaterThanOrEqual(1);
      expect(videoModels.length).toBeGreaterThanOrEqual(5);
      expect(audioModels.length).toBeGreaterThanOrEqual(3);
    });

    it('should apply health check availability status to models', async () => {
      // Arrange: Mock health check with unavailable services
      const mockRegistryResponse = {
        data: {
          models: [
            {
              id: 'test-image-model',
              name: 'Test Image Model',
              provider: 'TestProvider',
              category: 'image',
              capabilities: ['image-generation'],
              description: 'Test model',
              endpoint: '/v1/multimodal/image',
            },
          ],
        },
      };

      const mockHealthResponse = {
        data: {
          status: 'degraded',
          services: {
            image: { available: false },
            video: { available: true },
            audio: { available: true },
          },
        },
      };

      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint === '/v1/public/ai-registry/models') {
          return Promise.resolve(mockRegistryResponse) as any;
        }
        if (endpoint === '/v1/multimodal/health') {
          return Promise.resolve(mockHealthResponse) as any;
        }
        if (endpoint === '/v1/models') {
          return Promise.resolve({ data: { object: 'list', data: [] } }) as any;
        }
        if (endpoint === '/v1/public/embeddings/models') {
          return Promise.resolve({ data: [] }) as any;
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert
      const imageModel = models.find((m) => m.id === 'test-image-model');
      expect(imageModel).toBeDefined();
      expect(imageModel?.available).toBe(false);
    });

    it('should transform category names correctly', async () => {
      // Arrange
      const mockRegistryResponse = {
        data: {
          models: [
            {
              id: 'model-1',
              name: 'Model 1',
              provider: 'Provider',
              category: 'image',
              capabilities: ['image-generation'],
              description: 'Image model',
              endpoint: '/v1/test',
            },
            {
              id: 'model-2',
              name: 'Model 2',
              provider: 'Provider',
              category: 'video',
              capabilities: ['video-generation'],
              description: 'Video model',
              endpoint: '/v1/test',
            },
            {
              id: 'model-3',
              name: 'Model 3',
              provider: 'Provider',
              category: 'audio',
              capabilities: ['audio-generation'],
              description: 'Audio model',
              endpoint: '/v1/test',
            },
            {
              id: 'model-4',
              name: 'Model 4',
              provider: 'Provider',
              category: 'coding',
              capabilities: ['code-generation'],
              description: 'Coding model',
              endpoint: '/v1/test',
            },
            {
              id: 'model-5',
              name: 'Model 5',
              provider: 'Provider',
              category: 'embedding',
              capabilities: ['embedding'],
              description: 'Embedding model',
              endpoint: '/v1/test',
            },
          ],
        },
      };

      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint === '/v1/public/ai-registry/models') {
          return Promise.resolve(mockRegistryResponse) as any;
        }
        if (endpoint === '/v1/multimodal/health') {
          return Promise.resolve({ data: { status: 'healthy', services: {} } }) as any;
        }
        if (endpoint === '/v1/models') {
          return Promise.resolve({ data: { object: 'list', data: [] } }) as any;
        }
        if (endpoint === '/v1/public/embeddings/models') {
          return Promise.resolve({ data: [] }) as any;
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert category mapping
      expect(models.find((m) => m.id === 'model-1')?.category).toBe('Image');
      expect(models.find((m) => m.id === 'model-2')?.category).toBe('Video');
      expect(models.find((m) => m.id === 'model-3')?.category).toBe('Audio');
      expect(models.find((m) => m.id === 'model-4')?.category).toBe('Coding');
      expect(models.find((m) => m.id === 'model-5')?.category).toBe('Embedding');

      // Assert source_type mapping
      expect(models.find((m) => m.id === 'model-1')?.source_type).toBe('image');
      expect(models.find((m) => m.id === 'model-2')?.source_type).toBe('video');
      expect(models.find((m) => m.id === 'model-3')?.source_type).toBe('audio');
      expect(models.find((m) => m.id === 'model-4')?.source_type).toBe('chat');
      expect(models.find((m) => m.id === 'model-5')?.source_type).toBe('embedding');
    });

    it('should generate correct slugs from model names', async () => {
      // Arrange
      const mockRegistryResponse = {
        data: {
          models: [
            {
              id: 'test-1',
              name: 'Test Model With Spaces',
              provider: 'Provider',
              category: 'image',
              capabilities: ['image-generation'],
              description: 'Test',
              endpoint: '/v1/test',
            },
            {
              id: 'test-2',
              name: 'Model_With_Underscores',
              provider: 'Provider',
              category: 'video',
              capabilities: ['video-generation'],
              description: 'Test',
              endpoint: '/v1/test',
            },
            {
              id: 'test-3',
              name: 'Model!@#$%Special^&*()Chars',
              provider: 'Provider',
              category: 'audio',
              capabilities: ['audio-generation'],
              description: 'Test',
              endpoint: '/v1/test',
            },
          ],
        },
      };

      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint === '/v1/public/ai-registry/models') {
          return Promise.resolve(mockRegistryResponse) as any;
        }
        if (endpoint === '/v1/multimodal/health') {
          return Promise.resolve({ data: { status: 'healthy', services: {} } }) as any;
        }
        if (endpoint === '/v1/models') {
          return Promise.resolve({ data: { object: 'list', data: [] } }) as any;
        }
        if (endpoint === '/v1/public/embeddings/models') {
          return Promise.resolve({ data: [] }) as any;
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert slug generation
      expect(models.find((m) => m.id === 'test-1')?.slug).toBe('test-model-with-spaces');
      expect(models.find((m) => m.id === 'test-2')?.slug).toBe('model-with-underscores');
      expect(models.find((m) => m.id === 'test-3')?.slug).toBe('model-special-chars');
    });

    it('should cache health check results for 5 minutes', async () => {
      // Arrange
      const mockRegistryResponse = {
        data: {
          models: [
            {
              id: 'test-model',
              name: 'Test Model',
              provider: 'Provider',
              category: 'image',
              capabilities: ['image-generation'],
              description: 'Test',
              endpoint: '/v1/test',
            },
          ],
        },
      };

      const mockHealthResponse = {
        data: {
          status: 'healthy',
          services: {
            image: { available: true },
          },
        },
      };

      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint === '/v1/public/ai-registry/models') {
          return Promise.resolve(mockRegistryResponse) as any;
        }
        if (endpoint === '/v1/multimodal/health') {
          return Promise.resolve(mockHealthResponse) as any;
        }
        if (endpoint === '/v1/models') {
          return Promise.resolve({ data: { object: 'list', data: [] } }) as any;
        }
        if (endpoint === '/v1/public/embeddings/models') {
          return Promise.resolve({ data: [] }) as any;
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act: Call aggregateAllModels twice
      await modelAggregatorService.aggregateAllModels();
      await modelAggregatorService.aggregateAllModels();

      // Assert: Health check should only be called once (cached on second call)
      const healthCheckCalls = mockApiClient.get.mock.calls.filter(
        (call) => call[0] === '/v1/multimodal/health'
      );
      expect(healthCheckCalls.length).toBe(1);
    });
  });

  describe('Model transformation', () => {
    it('should include all required UnifiedAIModel fields', async () => {
      // Arrange
      const mockRegistryResponse = {
        data: {
          models: [
            {
              id: 'complete-model',
              name: 'Complete Model',
              provider: 'TestProvider',
              category: 'image',
              capabilities: ['image-generation', 'text-to-image'],
              description: 'A complete model with all fields',
              thumbnail_url: 'https://example.com/thumb.png',
              endpoint: '/v1/multimodal/image',
              method: 'POST',
              pricing: {
                credits: 50,
                usd: 0.025,
                unit: 'per image',
              },
              is_default: true,
              is_premium: false,
              speed: 'Fast',
              quality: 'High',
              examplePrompts: ['Generate an example image'],
            },
          ],
        },
      };

      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint === '/v1/public/ai-registry/models') {
          return Promise.resolve(mockRegistryResponse) as any;
        }
        if (endpoint === '/v1/multimodal/health') {
          return Promise.resolve({ data: { status: 'healthy', services: {} } }) as any;
        }
        if (endpoint === '/v1/models') {
          return Promise.resolve({ data: { object: 'list', data: [] } }) as any;
        }
        if (endpoint === '/v1/public/embeddings/models') {
          return Promise.resolve({ data: [] }) as any;
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      const models = await modelAggregatorService.aggregateAllModels();

      // Assert
      const model = models.find((m) => m.id === 'complete-model');
      expect(model).toBeDefined();
      expect(model).toMatchObject({
        id: 'complete-model',
        slug: 'complete-model',
        name: 'Complete Model',
        provider: 'TestProvider',
        category: 'Image',
        capabilities: ['image-generation', 'text-to-image'],
        description: 'A complete model with all fields',
        thumbnail_url: 'https://example.com/thumb.png',
        endpoint: '/v1/multimodal/image',
        method: 'POST',
        pricing: {
          credits: 50,
          usd: 0.025,
          unit: 'per image',
        },
        is_default: true,
        is_premium: false,
        speed: 'Fast',
        quality: 'High',
        examplePrompts: ['Generate an example image'],
        source_type: 'image',
      });
    });
  });
});
