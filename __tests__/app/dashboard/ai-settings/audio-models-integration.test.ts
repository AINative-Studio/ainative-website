/**
 * Integration test for Audio Models in AI Settings
 * Verifies that audio models are correctly returned from aggregateAllModels
 * and can be filtered by the Audio category
 * @jest-environment node
 */

import { modelAggregatorService, UnifiedAIModel, ModelCategory } from '@/lib/model-aggregator-service';
import apiClient from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Category mapping from AISettingsClient
const CATEGORY_MAP: Record<string, string[]> = {
  Image: ['image-generation', 'vision'],
  Video: ['video-generation', 'text-to-video', 'image-to-video'],
  Audio: ['audio', 'speech', 'transcription', 'translation', 'audio-generation', 'text-to-speech'],
  Coding: ['code', 'text-generation'],
  Embedding: ['embedding', 'semantic-search'],
};

// Matching logic from AISettingsClient
function matchesCategory(model: UnifiedAIModel, category: ModelCategory): boolean {
  if (category === 'All') return true;
  const targetCaps = CATEGORY_MAP[category] || [];
  return model.capabilities.some(cap =>
    targetCaps.some(target => cap.toLowerCase().includes(target.toLowerCase()))
  );
}

describe('Audio Models Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API responses to return empty arrays (we're testing hardcoded audio models)
    mockedApiClient.get.mockImplementation((url: string) => {
      if (url === '/v1/models') {
        return Promise.resolve({
          data: {
            object: 'list',
            data: [],
          },
        } as any);
      }
      if (url === '/v1/public/embeddings/models') {
        return Promise.resolve({
          data: [],
        } as any);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  describe('aggregateAllModels returns audio models', () => {
    it('should return exactly 3 audio models', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const audioModels = allModels.filter(m => m.source_type === 'audio');

      expect(audioModels).toHaveLength(3);
    });

    it('should include Whisper Transcription model', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const whisperTranscription = allModels.find(m => m.id === 'audio-whisper-transcription');

      expect(whisperTranscription).toBeDefined();
      expect(whisperTranscription?.name).toBe('Whisper');
      expect(whisperTranscription?.capabilities).toContain('audio');
      expect(whisperTranscription?.capabilities).toContain('transcription');
      expect(whisperTranscription?.capabilities).toContain('speech-to-text');
      expect(whisperTranscription?.category).toBe('Audio');
      expect(whisperTranscription?.provider).toBe('OpenAI');
    });

    it('should include Whisper Translation model', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const whisperTranslation = allModels.find(m => m.id === 'audio-whisper-translation');

      expect(whisperTranslation).toBeDefined();
      expect(whisperTranslation?.name).toBe('Whisper Translation');
      expect(whisperTranslation?.capabilities).toContain('audio');
      expect(whisperTranslation?.capabilities).toContain('translation');
      expect(whisperTranslation?.category).toBe('Audio');
      expect(whisperTranslation?.provider).toBe('OpenAI');
    });

    it('should include TTS Model', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const ttsModel = allModels.find(m => m.id === 'audio-tts');

      expect(ttsModel).toBeDefined();
      expect(ttsModel?.name).toBe('TTS Model');
      expect(ttsModel?.capabilities).toContain('audio-generation');
      expect(ttsModel?.capabilities).toContain('text-to-speech');
      expect(ttsModel?.capabilities).toContain('speech');
      expect(ttsModel?.category).toBe('Audio');
      expect(ttsModel?.provider).toBe('OpenAI');
    });
  });

  describe('Audio category filter matches audio models', () => {
    it('should filter exactly 3 audio models when Audio category is selected', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const audioFiltered = allModels.filter(m => matchesCategory(m, 'Audio'));

      // Get the audio models for debugging
      const audioModelNames = audioFiltered
        .filter(m => m.source_type === 'audio')
        .map(m => m.name);

      expect(audioFiltered.filter(m => m.source_type === 'audio')).toHaveLength(3);
      expect(audioModelNames).toContain('Whisper');
      expect(audioModelNames).toContain('Whisper Translation');
      expect(audioModelNames).toContain('TTS Model');
    });

    it('should match Whisper Transcription with Audio filter', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const whisperTranscription = allModels.find(m => m.id === 'audio-whisper-transcription');

      expect(whisperTranscription).toBeDefined();
      const matches = matchesCategory(whisperTranscription!, 'Audio');
      expect(matches).toBe(true);
    });

    it('should match Whisper Translation with Audio filter', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const whisperTranslation = allModels.find(m => m.id === 'audio-whisper-translation');

      expect(whisperTranslation).toBeDefined();
      const matches = matchesCategory(whisperTranslation!, 'Audio');
      expect(matches).toBe(true);
    });

    it('should match TTS Model with Audio filter', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const ttsModel = allModels.find(m => m.id === 'audio-tts');

      expect(ttsModel).toBeDefined();
      const matches = matchesCategory(ttsModel!, 'Audio');
      expect(matches).toBe(true);
    });

    it('should not match video models with Audio filter', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const videoModels = allModels.filter(m => m.source_type === 'video');

      videoModels.forEach(model => {
        const matches = matchesCategory(model, 'Audio');
        expect(matches).toBe(false);
      });
    });

    it('should not match image models with Audio filter', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const imageModels = allModels.filter(m => m.source_type === 'image');

      imageModels.forEach(model => {
        const matches = matchesCategory(model, 'Audio');
        expect(matches).toBe(false);
      });
    });
  });

  describe('Audio models have correct structure', () => {
    it('should have all required fields for Whisper Transcription', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.id === 'audio-whisper-transcription');

      expect(model).toMatchObject({
        id: expect.any(String),
        slug: expect.any(String),
        name: expect.any(String),
        provider: expect.any(String),
        category: 'Audio',
        capabilities: expect.arrayContaining(['audio', 'transcription']),
        description: expect.any(String),
        endpoint: expect.any(String),
        method: 'POST',
        source_type: 'audio',
      });
    });

    it('should have all required fields for Whisper Translation', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.id === 'audio-whisper-translation');

      expect(model).toMatchObject({
        id: expect.any(String),
        slug: expect.any(String),
        name: expect.any(String),
        provider: expect.any(String),
        category: 'Audio',
        capabilities: expect.arrayContaining(['audio', 'translation']),
        description: expect.any(String),
        endpoint: expect.any(String),
        method: 'POST',
        source_type: 'audio',
      });
    });

    it('should have all required fields for TTS Model', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.id === 'audio-tts');

      expect(model).toMatchObject({
        id: expect.any(String),
        slug: expect.any(String),
        name: expect.any(String),
        provider: expect.any(String),
        category: 'Audio',
        capabilities: expect.arrayContaining(['audio-generation', 'text-to-speech']),
        description: expect.any(String),
        endpoint: expect.any(String),
        method: 'POST',
        source_type: 'audio',
      });
    });
  });

  describe('Debug - Print all models and their capabilities', () => {
    it('should log all models with their capabilities for debugging', async () => {
      const allModels = await modelAggregatorService.aggregateAllModels();

      console.log('\n========== ALL MODELS DEBUG ==========');
      console.log(`Total models: ${allModels.length}\n`);

      const audioModels = allModels.filter(m => m.source_type === 'audio');
      console.log(`Audio models (${audioModels.length}):`);
      audioModels.forEach(m => {
        console.log(`  - ${m.name} (${m.id})`);
        console.log(`    Capabilities: ${m.capabilities.join(', ')}`);
        console.log(`    Matches Audio filter: ${matchesCategory(m, 'Audio')}`);
      });

      console.log('\nCategory mapping for Audio:');
      console.log(`  ${CATEGORY_MAP.Audio.join(', ')}`);
      console.log('======================================\n');

      // This test always passes, it's just for debugging
      expect(audioModels.length).toBeGreaterThan(0);
    });
  });
});
