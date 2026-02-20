/**
 * Tests for Model Aggregator Service
 * @jest-environment node
 */

import { modelAggregatorService, UnifiedAIModel } from '@/lib/model-aggregator-service';
import apiClient from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ModelAggregatorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('aggregateAllModels', () => {
    it('should aggregate models from all sources', async () => {
      // Mock chat models response
      mockedApiClient.get.mockImplementation((url: string) => {
        if (url === '/v1/models') {
          return Promise.resolve({
            data: {
              object: 'list',
              data: [
                {
                  id: 'gpt-4',
                  object: 'model',
                  created: 1687882411,
                  owned_by: 'openai',
                  available: true,
                },
                {
                  id: 'claude-3-5-sonnet-20241022',
                  object: 'model',
                  created: 1729641600,
                  owned_by: 'anthropic',
                  available: true,
                },
              ],
            },
          } as any);
        }
        if (url === '/v1/public/embeddings/models') {
          return Promise.resolve({
            data: [
              {
                id: 'BAAI/bge-small-en-v1.5',
                dimensions: 384,
                description: 'Fast and lightweight embedding model',
                speed: 'Fast',
                loaded: true,
              },
              {
                id: 'BAAI/bge-base-en-v1.5',
                dimensions: 768,
                description: 'Balanced performance embedding model',
                speed: 'Medium',
                loaded: true,
              },
            ],
          } as any);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const models = await modelAggregatorService.aggregateAllModels();

      // Should include chat models from API (2) + hardcoded coding models (1) = 3 total with source_type 'chat'
      const chatModels = models.filter(m => m.source_type === 'chat');
      expect(chatModels).toHaveLength(3);
      expect(chatModels.some(m => m.name.includes('Gpt'))).toBe(true);
      expect(chatModels.some(m => m.name === 'NousCoder')).toBe(true);
      expect(chatModels[0].category).toBe('Coding');

      // Should include embedding models (2)
      const embeddingModels = models.filter(m => m.source_type === 'embedding');
      expect(embeddingModels).toHaveLength(2);
      expect(embeddingModels[0].category).toBe('Embedding');
      expect(embeddingModels[0].capabilities).toContain('embedding');

      // Should include image models (1)
      const imageModels = models.filter(m => m.source_type === 'image');
      expect(imageModels).toHaveLength(1);
      expect(imageModels[0].name).toBe('Qwen Image Edit');
      expect(imageModels[0].category).toBe('Image');

      // Should include video models (5)
      const videoModels = models.filter(m => m.source_type === 'video');
      expect(videoModels).toHaveLength(5);
      expect(videoModels.some(m => m.name.includes('Wan 2.2'))).toBe(true);

      // Should include audio models (3)
      const audioModels = models.filter(m => m.source_type === 'audio');
      expect(audioModels).toHaveLength(3);
      expect(audioModels.some(m => m.name === 'Whisper')).toBe(true);

      // Total should be 3 + 2 + 1 + 5 + 3 = 14
      expect(models.length).toBe(14);
    });

    it('should handle API failures gracefully', async () => {
      // Mock both endpoints to fail
      mockedApiClient.get.mockRejectedValue(new Error('API Error'));

      const models = await modelAggregatorService.aggregateAllModels();

      // Should still return hardcoded models even if API calls fail
      // Coding: 1, Image: 1, Video: 5, Audio: 3 = 10 total
      expect(models.length).toBe(10);
      expect(models.some(m => m.source_type === 'chat')).toBe(true);
      expect(models.some(m => m.source_type === 'image')).toBe(true);
      expect(models.some(m => m.source_type === 'video')).toBe(true);
      expect(models.some(m => m.source_type === 'audio')).toBe(true);
    });

    it('should handle partial API failures', async () => {
      // Chat models succeed, embeddings fail
      mockedApiClient.get.mockImplementation((url: string) => {
        if (url === '/v1/models') {
          return Promise.resolve({
            data: {
              object: 'list',
              data: [
                {
                  id: 'gpt-4',
                  object: 'model',
                  created: 1687882411,
                  owned_by: 'openai',
                  available: true,
                },
              ],
            },
          } as any);
        }
        return Promise.reject(new Error('Embedding API Error'));
      });

      const models = await modelAggregatorService.aggregateAllModels();

      // Should have 1 chat from API + 1 coding hardcoded + 1 image + 5 video + 3 audio = 11 models
      expect(models.length).toBe(11);
      expect(models.filter(m => m.source_type === 'chat')).toHaveLength(2);
      expect(models.filter(m => m.source_type === 'embedding')).toHaveLength(0);
    });
  });

  describe('Model transformations', () => {
    it('should correctly transform chat models', async () => {
      mockedApiClient.get.mockImplementation((url: string) => {
        if (url === '/v1/models') {
          return Promise.resolve({
            data: {
              object: 'list',
              data: [
                {
                  id: 'gpt-4',
                  object: 'model',
                  created: 1687882411,
                  owned_by: 'openai',
                  available: true,
                },
              ],
            },
          } as any);
        }
        return Promise.resolve({ data: [] } as any);
      });

      const models = await modelAggregatorService.aggregateAllModels();
      const gpt4 = models.find(m => m.id === 'chat-gpt-4');

      expect(gpt4).toBeDefined();
      expect(gpt4?.slug).toBe('gpt-4');
      expect(gpt4?.category).toBe('Coding');
      expect(gpt4?.capabilities).toContain('text-generation');
      expect(gpt4?.capabilities).toContain('code');
      expect(gpt4?.capabilities).toContain('reasoning');
      expect(gpt4?.endpoint).toBe('/v1/chat/completions');
      expect(gpt4?.method).toBe('POST');
    });

    it('should correctly transform embedding models', async () => {
      mockedApiClient.get.mockImplementation((url: string) => {
        if (url === '/v1/public/embeddings/models') {
          return Promise.resolve({
            data: [
              {
                id: 'BAAI/bge-small-en-v1.5',
                dimensions: 384,
                description: 'Fast and lightweight',
                speed: 'Fast',
                loaded: true,
              },
            ],
          } as any);
        }
        return Promise.resolve({ data: { object: 'list', data: [] } } as any);
      });

      const models = await modelAggregatorService.aggregateAllModels();
      const embedding = models.find(m => m.id === 'embedding-BAAI/bge-small-en-v1.5');

      expect(embedding).toBeDefined();
      expect(embedding?.slug).toBe('baai-bge-small-en-v1-5');
      expect(embedding?.category).toBe('Embedding');
      expect(embedding?.capabilities).toContain('embedding');
      expect(embedding?.capabilities).toContain('semantic-search');
      expect(embedding?.is_default).toBe(true);
      expect(embedding?.speed).toBe('Fast');
    });

    it('should mark default models correctly', async () => {
      mockedApiClient.get.mockImplementation((url: string) => {
        if (url === '/v1/public/embeddings/models') {
          return Promise.resolve({
            data: [
              {
                id: 'BAAI/bge-small-en-v1.5',
                dimensions: 384,
                speed: 'Fast',
              },
              {
                id: 'BAAI/bge-base-en-v1.5',
                dimensions: 768,
                speed: 'Medium',
              },
            ],
          } as any);
        }
        return Promise.resolve({ data: { object: 'list', data: [] } } as any);
      });

      const models = await modelAggregatorService.aggregateAllModels();

      // Only bge-small should be default
      const defaultEmbeddings = models.filter(m => m.source_type === 'embedding' && m.is_default);
      expect(defaultEmbeddings).toHaveLength(1);
      expect(defaultEmbeddings[0].name).toBe('bge-small-en-v1.5');

      // Wan 2.2 should be default video model
      const defaultVideo = models.find(m => m.id === 'video-wan22-i2v');
      expect(defaultVideo?.is_default).toBe(true);

      // Qwen Image Edit should be default image model
      const defaultImage = models.find(m => m.id === 'image-qwen-edit');
      expect(defaultImage?.is_default).toBe(true);
    });

    it('should mark premium models correctly', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { object: 'list', data: [] } } as any);

      const models = await modelAggregatorService.aggregateAllModels();

      // Sora2 and T2V Generic should be premium
      const premiumModels = models.filter(m => m.is_premium);
      expect(premiumModels.length).toBeGreaterThanOrEqual(2);
      expect(premiumModels.some(m => m.name === 'Sora2')).toBe(true);
      expect(premiumModels.some(m => m.name === 'Text-to-Video Model')).toBe(true);
    });
  });

  describe('Model pricing', () => {
    it('should include pricing for video models', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { object: 'list', data: [] } } as any);

      const models = await modelAggregatorService.aggregateAllModels();
      const wan22 = models.find(m => m.id === 'video-wan22-i2v');

      expect(wan22?.pricing).toBeDefined();
      expect(wan22?.pricing?.credits).toBe(400);
      expect(wan22?.pricing?.usd).toBe(0.20);
      expect(wan22?.pricing?.unit).toBe('per 5s video');
    });

    it('should include pricing for image models', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { object: 'list', data: [] } } as any);

      const models = await modelAggregatorService.aggregateAllModels();
      const qwen = models.find(m => m.id === 'image-qwen-edit');

      expect(qwen?.pricing).toBeDefined();
      expect(qwen?.pricing?.credits).toBe(50);
      expect(qwen?.pricing?.usd).toBe(0.025);
      expect(qwen?.pricing?.unit).toBe('per image');
    });
  });

  describe('Model capabilities', () => {
    it('should include NousCoder with correct coding capabilities', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { object: 'list', data: [] } } as any);

      const models = await modelAggregatorService.aggregateAllModels();
      const nousCoder = models.find(m => m.id === 'coding-nous-coder');

      expect(nousCoder).toBeDefined();
      expect(nousCoder?.name).toBe('NousCoder');
      expect(nousCoder?.provider).toBe('Nous Research');
      expect(nousCoder?.category).toBe('Coding');
      expect(nousCoder?.capabilities).toContain('code');
      expect(nousCoder?.capabilities).toContain('code-generation');
      expect(nousCoder?.capabilities).toContain('text-generation');
      expect(nousCoder?.endpoint).toBe('/v1/chat/completions');
      expect(nousCoder?.method).toBe('POST');
    });

    it('should correctly assign video capabilities', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { object: 'list', data: [] } } as any);

      const models = await modelAggregatorService.aggregateAllModels();
      const videoModels = models.filter(m => m.category === 'Video');

      // All video models should have video-generation capability
      videoModels.forEach(model => {
        expect(model.capabilities).toContain('video-generation');
      });

      // Check specific capabilities
      const i2vModel = models.find(m => m.id === 'video-wan22-i2v');
      expect(i2vModel?.capabilities).toContain('image-to-video');

      const t2vModel = models.find(m => m.id === 'video-t2v-generic');
      expect(t2vModel?.capabilities).toContain('text-to-video');
    });

    it('should correctly assign audio capabilities', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { object: 'list', data: [] } } as any);

      const models = await modelAggregatorService.aggregateAllModels();

      const transcription = models.find(m => m.id === 'audio-whisper-transcription');
      expect(transcription?.capabilities).toContain('transcription');
      expect(transcription?.capabilities).toContain('speech-to-text');

      const translation = models.find(m => m.id === 'audio-whisper-translation');
      expect(translation?.capabilities).toContain('translation');

      const tts = models.find(m => m.id === 'audio-tts');
      expect(tts?.capabilities).toContain('text-to-speech');
      expect(tts?.capabilities).toContain('audio-generation');
    });
  });

  describe('Model metadata', () => {
    it('should include thumbnail URLs where available', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { object: 'list', data: [] } } as any);

      const models = await modelAggregatorService.aggregateAllModels();

      const qwen = models.find(m => m.id === 'image-qwen-edit');
      expect(qwen?.thumbnail_url).toBeDefined();
      // Qwen uses generated SVG thumbnail
      expect(qwen?.thumbnail_url).toBeTruthy();

      const wan22 = models.find(m => m.id === 'video-wan22-i2v');
      expect(wan22?.thumbnail_url).toBeDefined();
      // Wan22 has a specific hosted thumbnail
      expect(wan22?.thumbnail_url).toContain('image.ainative.studio');
    });

    it('should include speed and quality metadata', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { object: 'list', data: [] } } as any);

      const models = await modelAggregatorService.aggregateAllModels();

      const wan22 = models.find(m => m.id === 'video-wan22-i2v');
      expect(wan22?.speed).toBe('Fast');
      expect(wan22?.quality).toBe('High');

      const sora = models.find(m => m.id === 'video-sora2-i2v');
      expect(sora?.speed).toBe('Slow');
      expect(sora?.quality).toBe('Cinematic');
    });
  });
});
