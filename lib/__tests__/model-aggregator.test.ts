/**
 * @jest-environment node
 */

import apiClient from '../api-client';
import { ModelAggregatorService } from '../model-aggregator';

// Mock the apiClient
jest.mock('../api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('ModelAggregatorService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
  let service: ModelAggregatorService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ModelAggregatorService();
  });

  describe('fetchChatModels', () => {
    it('fetches chat models from /v1/models endpoint', async () => {
      const mockChatModelsResponse = {
        models: [
          {
            id: 'gpt-4',
            object: 'model',
            created: 1687882411,
            owned_by: 'openai',
            available: true,
          },
          {
            id: 'gpt-3.5-turbo',
            object: 'model',
            created: 1677649963,
            owned_by: 'openai',
            available: true,
          },
          {
            id: 'claude-3-5-sonnet-20241022',
            object: 'model',
            created: 1729555200,
            owned_by: 'anthropic',
            available: true,
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockChatModelsResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await service.fetchChatModels();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/models');
      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: expect.any(String),
        slug: expect.any(String),
        name: expect.any(String),
        provider: 'OpenAI',
        category: 'Coding',
        capabilities: expect.arrayContaining(['text-generation', 'code']),
        endpoint: '/v1/chat/completions',
        method: 'POST',
      });
    });

    it('transforms GPT-4 model correctly', async () => {
      const mockResponse = {
        models: [
          {
            id: 'gpt-4',
            object: 'model',
            created: 1687882411,
            owned_by: 'openai',
            available: true,
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await service.fetchChatModels();

      expect(result[0]).toMatchObject({
        id: 'gpt-4',
        slug: 'gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        category: 'Coding',
        capabilities: ['text-generation', 'reasoning', 'code', 'vision'],
        description: "OpenAI's most capable model for complex reasoning and coding tasks",
        endpoint: '/v1/chat/completions',
        method: 'POST',
      });
    });

    it('transforms Claude model correctly', async () => {
      const mockResponse = {
        models: [
          {
            id: 'claude-3-5-sonnet-20241022',
            object: 'model',
            created: 1729555200,
            owned_by: 'anthropic',
            available: true,
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await service.fetchChatModels();

      expect(result[0]).toMatchObject({
        id: 'claude-3-5-sonnet-20241022',
        slug: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        category: 'Coding',
        capabilities: ['text-generation', 'reasoning', 'code', 'vision'],
        description: 'Long context window, detailed analysis, and advanced reasoning capabilities',
        endpoint: '/v1/chat/completions',
        method: 'POST',
      });
    });

    it('handles errors when fetching chat models', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('API unavailable'));

      await expect(service.fetchChatModels()).rejects.toThrow('API unavailable');
    });

    it('returns empty array if models array is missing', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await service.fetchChatModels();

      expect(result).toEqual([]);
    });
  });

  describe('fetchEmbeddingModels', () => {
    it('fetches embedding models from /v1/public/embeddings/models endpoint', async () => {
      const mockEmbeddingResponse = [
        {
          id: 'BAAI/bge-small-en-v1.5',
          dimensions: 384,
          description: 'Lightweight semantic search model',
          speed: 'fast',
          loaded: true,
        },
        {
          id: 'BAAI/bge-base-en-v1.5',
          dimensions: 768,
          description: 'Balanced performance model',
          speed: 'medium',
          loaded: true,
        },
        {
          id: 'BAAI/bge-large-en-v1.5',
          dimensions: 1024,
          description: 'Highest quality embeddings',
          speed: 'slow',
          loaded: false,
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({
        data: mockEmbeddingResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await service.fetchEmbeddingModels();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/embeddings/models');
      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: 'BAAI/bge-small-en-v1.5',
        slug: 'bge-small-en-v1-5',
        name: 'bge-small-en-v1.5',
        provider: 'BAAI',
        category: 'Embedding',
        capabilities: ['embedding', 'semantic-search'],
        description: 'Lightweight semantic search model',
        speed: 'fast',
        endpoint: '/v1/embeddings',
        method: 'POST',
        is_default: true,
      });
    });

    it('marks first model as default', async () => {
      const mockResponse = [
        { id: 'BAAI/bge-small-en-v1.5', dimensions: 384, speed: 'fast', loaded: true },
        { id: 'BAAI/bge-base-en-v1.5', dimensions: 768, speed: 'medium', loaded: true },
      ];

      mockApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await service.fetchEmbeddingModels();

      expect(result[0].is_default).toBe(true);
      expect(result[1].is_default).toBe(false);
    });

    it('handles errors when fetching embedding models', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Service unavailable'));

      await expect(service.fetchEmbeddingModels()).rejects.toThrow('Service unavailable');
    });

    it('returns empty array if response is not an array', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: null,
        status: 200,
        statusText: 'OK',
      });

      const result = await service.fetchEmbeddingModels();

      expect(result).toEqual([]);
    });
  });

  describe('fetchImageModels', () => {
    it('returns hardcoded Qwen Image Edit model', async () => {
      const result = await service.fetchImageModels();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'qwen-image-edit',
        slug: 'qwen-image-edit',
        name: 'Qwen Image Edit',
        provider: 'Qwen',
        category: 'Image',
        capabilities: ['image-generation', 'text-to-image'],
        description: 'High-quality image generation with LoRA style transfer support',
        endpoint: '/v1/multimodal/image',
        method: 'POST',
        pricing: {
          credits: 50,
          usd: 0.025,
          unit: 'per image',
        },
      });
    });

    it('includes parameters for image generation', async () => {
      const result = await service.fetchImageModels();

      expect(result[0].parameters).toBeDefined();
      expect(result[0].parameters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'prompt',
            type: 'string',
            required: true,
          }),
          expect.objectContaining({
            name: 'width',
            type: 'integer',
            required: false,
            default: 1024,
            min: 512,
            max: 2048,
          }),
          expect.objectContaining({
            name: 'height',
            type: 'integer',
            required: false,
            default: 1024,
            min: 512,
            max: 2048,
          }),
        ])
      );
    });
  });

  describe('fetchVideoModels', () => {
    it('returns all hardcoded video models', async () => {
      const result = await service.fetchVideoModels();

      expect(result).toHaveLength(5);

      const modelNames = result.map(m => m.id);
      expect(modelNames).toEqual(
        expect.arrayContaining(['wan22-i2v', 'seedance-i2v', 'sora2-i2v', 't2v', 'cogvideox'])
      );
    });

    it('includes Alibaba Wan 2.2 as default i2v model', async () => {
      const result = await service.fetchVideoModels();

      const wan22 = result.find(m => m.id === 'wan22-i2v');
      expect(wan22).toMatchObject({
        id: 'wan22-i2v',
        slug: 'alibaba-wan-22-i2v-720p',
        name: 'Alibaba Wan 2.2 I2V 720p',
        provider: 'Alibaba',
        category: 'Video',
        capabilities: ['image-to-video', 'video-generation'],
        description: 'Wan 2.2 is an open-source AI video generation model that utilizes a diffusion transformer architecture and a novel 3D spatio-temporal VAE for image-to-video generation',
        endpoint: '/v1/multimodal/video/i2v',
        method: 'POST',
        is_default: true,
        speed: 'Fast',
        quality: 'High',
        pricing: {
          credits: 400,
          usd: 0.20,
          unit: 'per 5s video',
        },
      });
    });

    it('includes Seedance i2v model', async () => {
      const result = await service.fetchVideoModels();

      const seedance = result.find(m => m.id === 'seedance-i2v');
      expect(seedance).toMatchObject({
        id: 'seedance-i2v',
        provider: 'Seedance',
        category: 'Video',
        capabilities: ['image-to-video', 'video-generation'],
        pricing: {
          credits: 520,
          usd: 0.26,
          unit: 'per 5s video',
        },
      });
    });

    it('includes Sora2 premium i2v model', async () => {
      const result = await service.fetchVideoModels();

      const sora2 = result.find(m => m.id === 'sora2-i2v');
      expect(sora2).toMatchObject({
        id: 'sora2-i2v',
        provider: 'Sora',
        category: 'Video',
        capabilities: ['image-to-video', 'video-generation'],
        is_premium: true,
        quality: 'Cinematic',
        pricing: {
          credits: 800,
          usd: 0.40,
          unit: 'per 4s video',
        },
      });
    });

    it('includes text-to-video model', async () => {
      const result = await service.fetchVideoModels();

      const t2v = result.find(m => m.id === 't2v');
      expect(t2v).toMatchObject({
        id: 't2v',
        slug: 'text-to-video',
        name: 'Text-to-Video',
        provider: 'Generic T2V',
        category: 'Video',
        capabilities: ['text-to-video', 'video-generation'],
        endpoint: '/v1/multimodal/video/t2v',
        method: 'POST',
        is_premium: true,
        pricing: {
          credits: 1000,
          usd: 0.50,
          unit: 'per video',
        },
      });
    });

    it('includes CogVideoX model', async () => {
      const result = await service.fetchVideoModels();

      const cogvideox = result.find(m => m.id === 'cogvideox');
      expect(cogvideox).toMatchObject({
        id: 'cogvideox',
        slug: 'cogvideox-2b',
        name: 'CogVideoX-2B',
        provider: 'CogVideo',
        category: 'Video',
        capabilities: ['text-to-video', 'video-generation'],
        endpoint: '/v1/multimodal/video/cogvideox',
        method: 'POST',
        pricing: {
          credits: 800,
          usd: 0.40,
          unit: 'per video',
        },
      });
    });

    it('includes parameters for video models', async () => {
      const result = await service.fetchVideoModels();

      const wan22 = result.find(m => m.id === 'wan22-i2v');
      expect(wan22?.parameters).toBeDefined();
      expect(wan22?.parameters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'image',
            type: 'string',
            required: true,
            description: 'Source image URL',
          }),
          expect.objectContaining({
            name: 'prompt',
            type: 'string',
            required: true,
            description: 'Motion description',
          }),
        ])
      );
    });
  });

  describe('fetchAudioModels', () => {
    it('returns all hardcoded audio models', async () => {
      const result = await service.fetchAudioModels();

      expect(result).toHaveLength(3);

      const modelNames = result.map(m => m.id);
      expect(modelNames).toEqual(
        expect.arrayContaining(['whisper-transcription', 'whisper-translation', 'tts'])
      );
    });

    it('includes Whisper transcription model', async () => {
      const result = await service.fetchAudioModels();

      const transcription = result.find(m => m.id === 'whisper-transcription');
      expect(transcription).toMatchObject({
        id: 'whisper-transcription',
        slug: 'whisper-transcription',
        name: 'Whisper Transcription',
        provider: 'OpenAI',
        category: 'Audio',
        capabilities: ['audio', 'transcription', 'speech-to-text'],
        description: 'Convert audio/video to text in 99+ languages',
        endpoint: '/v1/audio/transcriptions',
        method: 'POST',
      });
    });

    it('includes Whisper translation model', async () => {
      const result = await service.fetchAudioModels();

      const translation = result.find(m => m.id === 'whisper-translation');
      expect(translation).toMatchObject({
        id: 'whisper-translation',
        slug: 'whisper-translation',
        name: 'Whisper Translation',
        provider: 'OpenAI',
        category: 'Audio',
        capabilities: ['audio', 'translation'],
        description: 'Translate any language audio to English text',
        endpoint: '/v1/audio/translations',
        method: 'POST',
      });
    });

    it('includes TTS model', async () => {
      const result = await service.fetchAudioModels();

      const tts = result.find(m => m.id === 'tts');
      expect(tts).toMatchObject({
        id: 'tts',
        slug: 'text-to-speech',
        name: 'Text-to-Speech',
        provider: 'OpenAI',
        category: 'Audio',
        capabilities: ['audio-generation', 'text-to-speech'],
        description: 'Generate natural-sounding speech from text',
        endpoint: '/v1/audio/speech',
        method: 'POST',
      });
    });

    it('includes parameters for audio models', async () => {
      const result = await service.fetchAudioModels();

      const transcription = result.find(m => m.id === 'whisper-transcription');
      expect(transcription?.parameters).toBeDefined();
      expect(transcription?.parameters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'file',
            type: 'file',
            required: true,
            description: 'Audio file to transcribe',
          }),
        ])
      );
    });
  });

  describe('aggregateAllModels', () => {
    beforeEach(() => {
      // Mock chat models response
      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint === '/v1/models') {
          return Promise.resolve({
            data: {
              models: [
                {
                  id: 'gpt-4',
                  object: 'model',
                  created: 1687882411,
                  owned_by: 'openai',
                  available: true,
                },
              ],
            },
            status: 200,
            statusText: 'OK',
          });
        }
        if (endpoint === '/v1/public/embeddings/models') {
          return Promise.resolve({
            data: [
              {
                id: 'BAAI/bge-small-en-v1.5',
                dimensions: 384,
                speed: 'fast',
                loaded: true,
              },
            ],
            status: 200,
            statusText: 'OK',
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('aggregates models from all sources', async () => {
      const result = await service.aggregateAllModels();

      // Should include: 1 chat + 1 embedding + 1 image + 5 video + 3 audio = 11 models
      expect(result).toHaveLength(11);
    });

    it('includes models from all categories', async () => {
      const result = await service.aggregateAllModels();

      const categories = [...new Set(result.map(m => m.category))];
      expect(categories).toEqual(
        expect.arrayContaining(['Coding', 'Embedding', 'Image', 'Video', 'Audio'])
      );
    });

    it('maintains correct model structure for all models', async () => {
      const result = await service.aggregateAllModels();

      result.forEach(model => {
        expect(model).toMatchObject({
          id: expect.any(String),
          slug: expect.any(String),
          name: expect.any(String),
          provider: expect.any(String),
          category: expect.any(String),
          capabilities: expect.any(Array),
          endpoint: expect.any(String),
          method: expect.stringMatching(/GET|POST/),
        });
      });
    });

    it('handles partial failures gracefully', async () => {
      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint === '/v1/models') {
          return Promise.reject(new Error('Chat models unavailable'));
        }
        if (endpoint === '/v1/public/embeddings/models') {
          return Promise.resolve({
            data: [
              {
                id: 'BAAI/bge-small-en-v1.5',
                dimensions: 384,
                speed: 'fast',
                loaded: true,
              },
            ],
            status: 200,
            statusText: 'OK',
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const result = await service.aggregateAllModels();

      // Should still include: 1 embedding + 1 image + 5 video + 3 audio = 10 models
      // (chat models failed)
      expect(result).toHaveLength(10);

      const hasEmbedding = result.some(m => m.category === 'Embedding');
      expect(hasEmbedding).toBe(true);
    });

    it('returns hardcoded models even if all API calls fail', async () => {
      mockApiClient.get.mockRejectedValue(new Error('All APIs down'));

      const result = await service.aggregateAllModels();

      // Should include: 1 image + 5 video + 3 audio = 9 models
      expect(result).toHaveLength(9);
    });
  });

  describe('Model transformations', () => {
    it('generates valid slugs from model IDs', async () => {
      const result = await service.fetchImageModels();

      expect(result[0].slug).toMatch(/^[a-z0-9-]+$/);
      expect(result[0].slug).not.toContain('_');
      expect(result[0].slug).not.toContain(' ');
    });

    it('includes all required UnifiedAIModel fields', async () => {
      const result = await service.fetchImageModels();

      const requiredFields = ['id', 'slug', 'name', 'provider', 'category', 'capabilities', 'endpoint', 'method'];
      requiredFields.forEach(field => {
        expect(result[0]).toHaveProperty(field);
      });
    });

    it('formats pricing consistently', async () => {
      const videoModels = await service.fetchVideoModels();

      videoModels.forEach(model => {
        if (model.pricing) {
          expect(model.pricing).toHaveProperty('credits');
          expect(model.pricing).toHaveProperty('usd');
          expect(model.pricing).toHaveProperty('unit');
          expect(typeof model.pricing.credits).toBe('number');
          expect(typeof model.pricing.usd).toBe('number');
          expect(typeof model.pricing.unit).toBe('string');
        }
      });
    });
  });
});
