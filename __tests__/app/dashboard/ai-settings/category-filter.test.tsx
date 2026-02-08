/**
 * Tests for category filtering in AI Settings
 * Verifies that audio models show up when "Audio" filter is selected
 * @jest-environment node
 */

import { UnifiedAIModel, ModelCategory } from '@/lib/model-aggregator-service';

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

describe('Category Filter - Audio Models', () => {
  // Sample audio models matching the actual implementation
  const audioModels: UnifiedAIModel[] = [
    {
      id: 'audio-whisper-transcription',
      slug: 'whisper-transcription',
      name: 'Whisper',
      provider: 'OpenAI',
      category: 'Audio',
      capabilities: ['audio', 'transcription', 'speech-to-text'],
      description: 'Speech-to-text transcription',
      endpoint: '/v1/audio/transcriptions',
      method: 'POST',
      source_type: 'audio',
    },
    {
      id: 'audio-whisper-translation',
      slug: 'whisper-translation',
      name: 'Whisper Translation',
      provider: 'OpenAI',
      category: 'Audio',
      capabilities: ['audio', 'translation'],
      description: 'Audio translation',
      endpoint: '/v1/audio/translations',
      method: 'POST',
      source_type: 'audio',
    },
    {
      id: 'audio-tts',
      slug: 'openai-tts',
      name: 'TTS Model',
      provider: 'OpenAI',
      category: 'Audio',
      capabilities: ['audio-generation', 'text-to-speech', 'speech'],
      description: 'Text-to-speech',
      endpoint: '/v1/audio/speech',
      method: 'POST',
      source_type: 'audio',
    },
  ];

  // Sample non-audio models to verify they don't match
  const nonAudioModels: UnifiedAIModel[] = [
    {
      id: 'video-wan22-i2v',
      slug: 'alibaba-wan-22-i2v-720p',
      name: 'Alibaba Wan 2.2 I2V 720p',
      provider: 'Alibaba',
      category: 'Video',
      capabilities: ['image-to-video', 'video-generation'],
      description: 'Video generation',
      endpoint: '/v1/multimodal/video/i2v',
      method: 'POST',
      source_type: 'video',
    },
    {
      id: 'chat-gpt-4',
      slug: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      category: 'Coding',
      capabilities: ['text-generation', 'code', 'reasoning', 'vision'],
      description: 'Chat model',
      endpoint: '/v1/chat/completions',
      method: 'POST',
      source_type: 'chat',
    },
  ];

  describe('Audio category filter', () => {
    it('should match Whisper Transcription model', () => {
      const model = audioModels[0];
      const matches = matchesCategory(model, 'Audio');

      expect(matches).toBe(true);
      expect(model.name).toBe('Whisper');
      expect(model.capabilities).toContain('audio');
      expect(model.capabilities).toContain('transcription');
      expect(model.capabilities).toContain('speech-to-text');
    });

    it('should match Whisper Translation model', () => {
      const model = audioModels[1];
      const matches = matchesCategory(model, 'Audio');

      expect(matches).toBe(true);
      expect(model.name).toBe('Whisper Translation');
      expect(model.capabilities).toContain('audio');
      expect(model.capabilities).toContain('translation');
    });

    it('should match TTS Model', () => {
      const model = audioModels[2];
      const matches = matchesCategory(model, 'Audio');

      expect(matches).toBe(true);
      expect(model.name).toBe('TTS Model');
      expect(model.capabilities).toContain('audio-generation');
      expect(model.capabilities).toContain('text-to-speech');
      expect(model.capabilities).toContain('speech');
    });

    it('should match all audio models when Audio filter is selected', () => {
      const matchedModels = audioModels.filter(m => matchesCategory(m, 'Audio'));

      expect(matchedModels).toHaveLength(3);
      expect(matchedModels.map(m => m.name)).toEqual([
        'Whisper',
        'Whisper Translation',
        'TTS Model'
      ]);
    });

    it('should not match video models when Audio filter is selected', () => {
      const videoModel = nonAudioModels[0];
      const matches = matchesCategory(videoModel, 'Audio');

      expect(matches).toBe(false);
      expect(videoModel.category).toBe('Video');
    });

    it('should not match chat models when Audio filter is selected', () => {
      const chatModel = nonAudioModels[1];
      const matches = matchesCategory(chatModel, 'Audio');

      expect(matches).toBe(false);
      expect(chatModel.category).toBe('Coding');
    });
  });

  describe('All category filter', () => {
    it('should match all models when "All" filter is selected', () => {
      const allModels = [...audioModels, ...nonAudioModels];
      const matchedModels = allModels.filter(m => matchesCategory(m, 'All'));

      expect(matchedModels).toHaveLength(allModels.length);
    });
  });

  describe('Category mapping verification', () => {
    it('should have correct Audio category mapping', () => {
      expect(CATEGORY_MAP.Audio).toEqual([
        'audio',
        'speech',
        'transcription',
        'translation',
        'audio-generation',
        'text-to-speech'
      ]);
    });

    it('should match audio capability', () => {
      const targetCaps = CATEGORY_MAP.Audio;
      const modelCap = 'audio';

      const matches = targetCaps.some(target =>
        modelCap.toLowerCase().includes(target.toLowerCase())
      );

      expect(matches).toBe(true);
    });

    it('should match transcription capability', () => {
      const targetCaps = CATEGORY_MAP.Audio;
      const modelCap = 'transcription';

      const matches = targetCaps.some(target =>
        modelCap.toLowerCase().includes(target.toLowerCase())
      );

      expect(matches).toBe(true);
    });

    it('should match translation capability', () => {
      const targetCaps = CATEGORY_MAP.Audio;
      const modelCap = 'translation';

      const matches = targetCaps.some(target =>
        modelCap.toLowerCase().includes(target.toLowerCase())
      );

      expect(matches).toBe(true);
    });

    it('should match audio-generation capability', () => {
      const targetCaps = CATEGORY_MAP.Audio;
      const modelCap = 'audio-generation';

      const matches = targetCaps.some(target =>
        modelCap.toLowerCase().includes(target.toLowerCase())
      );

      expect(matches).toBe(true);
    });

    it('should match text-to-speech capability', () => {
      const targetCaps = CATEGORY_MAP.Audio;
      const modelCap = 'text-to-speech';

      const matches = targetCaps.some(target =>
        modelCap.toLowerCase().includes(target.toLowerCase())
      );

      expect(matches).toBe(true);
    });

    it('should match speech capability', () => {
      const targetCaps = CATEGORY_MAP.Audio;
      const modelCap = 'speech';

      const matches = targetCaps.some(target =>
        modelCap.toLowerCase().includes(target.toLowerCase())
      );

      expect(matches).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle case-insensitive matching', () => {
      const model: UnifiedAIModel = {
        id: 'test-model',
        slug: 'test',
        name: 'Test Model',
        provider: 'Test',
        category: 'Audio',
        capabilities: ['AUDIO', 'TRANSCRIPTION'], // uppercase
        description: 'Test',
        endpoint: '/test',
        method: 'POST',
        source_type: 'audio',
      };

      const matches = matchesCategory(model, 'Audio');
      expect(matches).toBe(true);
    });

    it('should handle partial capability matches', () => {
      const model: UnifiedAIModel = {
        id: 'test-model',
        slug: 'test',
        name: 'Test Model',
        provider: 'Test',
        category: 'Audio',
        capabilities: ['audio-processing'], // contains 'audio'
        description: 'Test',
        endpoint: '/test',
        method: 'POST',
        source_type: 'audio',
      };

      const matches = matchesCategory(model, 'Audio');
      expect(matches).toBe(true);
    });

    it('should not match if no capabilities overlap', () => {
      const model: UnifiedAIModel = {
        id: 'test-model',
        slug: 'test',
        name: 'Test Model',
        provider: 'Test',
        category: 'Audio',
        capabilities: ['image-generation', 'vision'], // no audio capabilities
        description: 'Test',
        endpoint: '/test',
        method: 'POST',
        source_type: 'audio',
      };

      const matches = matchesCategory(model, 'Audio');
      expect(matches).toBe(false);
    });
  });
});
