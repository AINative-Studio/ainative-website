/**
 * Frontend Simulation Test
 * Simulates exactly what happens in the AISettingsClient component
 * to identify why audio models don't show when Audio filter is clicked
 * @jest-environment node
 */

import { modelAggregatorService, UnifiedAIModel, ModelCategory } from '@/lib/model-aggregator-service';
import apiClient from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// EXACT copy from AISettingsClient.tsx (lines 20-26)
const CATEGORY_MAP: Record<string, string[]> = {
  Image: ['image-generation', 'vision'],
  Video: ['video-generation', 'text-to-video', 'image-to-video'],
  Audio: ['audio', 'speech', 'transcription', 'translation', 'audio-generation', 'text-to-speech'],
  Coding: ['code', 'text-generation', 'code-generation'],
  Embedding: ['embedding', 'semantic-search'],
};

// EXACT copy from AISettingsClient.tsx (lines 66-72)
function matchesCategory(model: UnifiedAIModel, category: ModelCategory): boolean {
  if (category === 'All') return true;
  const targetCaps = CATEGORY_MAP[category] || [];
  return model.capabilities.some(cap =>
    targetCaps.some(target => cap.toLowerCase().includes(target.toLowerCase()))
  );
}

describe('Frontend Simulation - Exact AISettingsClient Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API to return empty arrays
    mockedApiClient.get.mockImplementation((url: string) => {
      if (url === '/v1/models') {
        return Promise.resolve({
          data: { object: 'list', data: [] },
        } as any);
      }
      if (url === '/v1/public/embeddings/models') {
        return Promise.resolve({ data: [] } as any);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  it('should simulate user clicking "Audio" category filter', async () => {
    // Step 1: Component mounts, fetches all models
    const allModels = await modelAggregatorService.aggregateAllModels();
    console.log(`\n[STEP 1] Fetched ${allModels.length} total models`);

    // Step 2: User clicks "Audio" category button
    const activeCategory: ModelCategory = 'Audio';
    console.log(`[STEP 2] User clicks "${activeCategory}" filter`);

    // Step 3: Filter models (lines 179 in AISettingsClient.tsx)
    const filteredModels = allModels.filter(m => matchesCategory(m, activeCategory));
    console.log(`[STEP 3] Filtered to ${filteredModels.length} models`);

    // Step 4: Check if audio models are in filtered results
    const audioModels = filteredModels.filter(m => m.source_type === 'audio');
    console.log(`[STEP 4] Found ${audioModels.length} audio models in filtered results:`);

    audioModels.forEach(model => {
      console.log(`  ✓ ${model.name} (${model.id})`);
      console.log(`    Capabilities: ${model.capabilities.join(', ')}`);
    });

    // Assertions
    expect(audioModels.length).toBe(3);
    expect(audioModels.map(m => m.name)).toEqual(
      expect.arrayContaining(['Whisper', 'Whisper Translation', 'TTS Model'])
    );
  });

  it('should verify each audio model individually', async () => {
    const allModels = await modelAggregatorService.aggregateAllModels();

    // Test Whisper Transcription
    const whisper = allModels.find(m => m.id === 'audio-whisper-transcription');
    expect(whisper).toBeDefined();
    expect(matchesCategory(whisper!, 'Audio')).toBe(true);
    console.log(`✓ Whisper Transcription matches Audio filter`);

    // Test Whisper Translation
    const whisperTrans = allModels.find(m => m.id === 'audio-whisper-translation');
    expect(whisperTrans).toBeDefined();
    expect(matchesCategory(whisperTrans!, 'Audio')).toBe(true);
    console.log(`✓ Whisper Translation matches Audio filter`);

    // Test TTS
    const tts = allModels.find(m => m.id === 'audio-tts');
    expect(tts).toBeDefined();
    expect(matchesCategory(tts!, 'Audio')).toBe(true);
    console.log(`✓ TTS Model matches Audio filter`);
  });

  it('should check capability matching for each audio model', async () => {
    const allModels = await modelAggregatorService.aggregateAllModels();
    const audioModels = allModels.filter(m => m.source_type === 'audio');
    const targetCaps = CATEGORY_MAP.Audio;

    console.log(`\n[DEBUG] Audio category target capabilities: ${targetCaps.join(', ')}\n`);

    audioModels.forEach(model => {
      console.log(`[MODEL] ${model.name}`);
      console.log(`  ID: ${model.id}`);
      console.log(`  Capabilities: ${model.capabilities.join(', ')}`);

      // Check each capability
      const matchingCaps: string[] = [];
      model.capabilities.forEach(cap => {
        const matches = targetCaps.filter(target =>
          cap.toLowerCase().includes(target.toLowerCase())
        );
        if (matches.length > 0) {
          matchingCaps.push(`${cap} → ${matches.join(', ')}`);
        }
      });

      console.log(`  Matching capabilities: ${matchingCaps.join('; ')}`);
      console.log(`  Matches Audio filter: ${matchesCategory(model, 'Audio')}`);
      console.log('');

      expect(matchesCategory(model, 'Audio')).toBe(true);
    });
  });

  it('should verify no Coding models match Audio filter', async () => {
    const allModels = await modelAggregatorService.aggregateAllModels();
    const codingModels = allModels.filter(m => m.category === 'Coding');

    codingModels.forEach(model => {
      const matches = matchesCategory(model, 'Audio');
      expect(matches).toBe(false);
    });

    console.log(`✓ ${codingModels.length} Coding models correctly excluded from Audio filter`);
  });

  it('should verify no Video models match Audio filter', async () => {
    const allModels = await modelAggregatorService.aggregateAllModels();
    const videoModels = allModels.filter(m => m.category === 'Video');

    videoModels.forEach(model => {
      const matches = matchesCategory(model, 'Audio');
      expect(matches).toBe(false);
    });

    console.log(`✓ ${videoModels.length} Video models correctly excluded from Audio filter`);
  });

  it('should verify no Image models match Audio filter', async () => {
    const allModels = await modelAggregatorService.aggregateAllModels();
    const imageModels = allModels.filter(m => m.category === 'Image');

    imageModels.forEach(model => {
      const matches = matchesCategory(model, 'Audio');
      expect(matches).toBe(false);
    });

    console.log(`✓ ${imageModels.length} Image models correctly excluded from Audio filter`);
  });

  it('should verify no Embedding models match Audio filter', async () => {
    const allModels = await modelAggregatorService.aggregateAllModels();
    const embeddingModels = allModels.filter(m => m.category === 'Embedding');

    embeddingModels.forEach(model => {
      const matches = matchesCategory(model, 'Audio');
      expect(matches).toBe(false);
    });

    console.log(`✓ ${embeddingModels.length} Embedding models correctly excluded from Audio filter`);
  });

  it('should print complete filtering breakdown by category', async () => {
    const allModels = await modelAggregatorService.aggregateAllModels();

    console.log('\n========== COMPLETE FILTER BREAKDOWN ==========');
    const categories: ModelCategory[] = ['All', 'Image', 'Video', 'Audio', 'Coding', 'Embedding'];

    categories.forEach(category => {
      const filtered = allModels.filter(m => matchesCategory(m, category));
      console.log(`\n${category}: ${filtered.length} models`);

      if (category === 'Audio') {
        filtered.forEach(m => {
          console.log(`  - ${m.name} [${m.source_type}]`);
        });
      }
    });

    console.log('\n================================================\n');

    // Verify Audio filter works
    const audioFiltered = allModels.filter(m => matchesCategory(m, 'Audio'));
    const audioModelCount = audioFiltered.filter(m => m.source_type === 'audio').length;
    expect(audioModelCount).toBe(3);
  });
});
