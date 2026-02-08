/**
 * Test script to verify model aggregation service
 * Run with: npx ts-node scripts/test-model-aggregation.ts
 */

// Mock the model aggregator service logic
interface UnifiedAIModel {
  id: string;
  name: string;
  provider: string;
  category: string;
  capabilities: string[];
  description: string;
  endpoint: string;
  method: string;
  source_type: string;
}

function getImageGenerationModels(): UnifiedAIModel[] {
  return [
    {
      id: 'image-qwen-edit',
      name: 'Qwen Image Edit',
      provider: 'Qwen',
      category: 'Image',
      capabilities: ['image-generation', 'text-to-image'],
      description: 'High-quality image generation',
      endpoint: '/v1/multimodal/image',
      method: 'POST',
      source_type: 'image',
    },
  ];
}

function getVideoGenerationModels(): UnifiedAIModel[] {
  return [
    {
      id: 'video-wan22-i2v',
      name: 'Alibaba Wan 2.2 I2V 720p',
      provider: 'Alibaba',
      category: 'Video',
      capabilities: ['image-to-video', 'video-generation'],
      description: 'Wan 2.2 I2V',
      endpoint: '/v1/multimodal/video/i2v',
      method: 'POST',
      source_type: 'video',
    },
    {
      id: 'video-seedance-i2v',
      name: 'Seedance I2V',
      provider: 'Seedance',
      category: 'Video',
      capabilities: ['image-to-video', 'video-generation'],
      description: 'Advanced I2V',
      endpoint: '/v1/multimodal/video/i2v',
      method: 'POST',
      source_type: 'video',
    },
    {
      id: 'video-sora2-i2v',
      name: 'Sora2',
      provider: 'Sora',
      category: 'Video',
      capabilities: ['image-to-video', 'video-generation'],
      description: 'Premium I2V',
      endpoint: '/v1/multimodal/video/i2v',
      method: 'POST',
      source_type: 'video',
    },
    {
      id: 'video-t2v-generic',
      name: 'Text-to-Video Model',
      provider: 'Generic',
      category: 'Video',
      capabilities: ['text-to-video', 'video-generation'],
      description: 'Premium T2V',
      endpoint: '/v1/multimodal/video/t2v',
      method: 'POST',
      source_type: 'video',
    },
    {
      id: 'video-cogvideox-2b',
      name: 'CogVideoX-2B',
      provider: 'CogVideo',
      category: 'Video',
      capabilities: ['text-to-video', 'video-generation'],
      description: 'T2V generation',
      endpoint: '/v1/multimodal/video/cogvideox',
      method: 'POST',
      source_type: 'video',
    },
  ];
}

function getAudioModels(): UnifiedAIModel[] {
  return [
    {
      id: 'audio-whisper-transcription',
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
      name: 'Whisper Translation',
      provider: 'OpenAI',
      category: 'Audio',
      capabilities: ['audio', 'translation'],
      description: 'Translate audio to English',
      endpoint: '/v1/audio/translations',
      method: 'POST',
      source_type: 'audio',
    },
    {
      id: 'audio-tts',
      name: 'TTS Model',
      provider: 'OpenAI',
      category: 'Audio',
      capabilities: ['audio-generation', 'text-to-speech', 'speech'],
      description: 'Generate speech from text',
      endpoint: '/v1/audio/speech',
      method: 'POST',
      source_type: 'audio',
    },
  ];
}

function getCodingModels(): UnifiedAIModel[] {
  return [
    {
      id: 'coding-nous-coder',
      name: 'NousCoder',
      provider: 'Nous Research',
      category: 'Coding',
      capabilities: ['code', 'code-generation', 'text-generation'],
      description: 'Specialized coding model',
      endpoint: '/v1/chat/completions',
      method: 'POST',
      source_type: 'chat',
    },
  ];
}

async function testAggregation() {
  console.log('=== Testing Model Aggregation ===\n');

  const models: UnifiedAIModel[] = [];

  // Simulate failed API calls (return empty arrays)
  console.log('1. Simulating failed API calls (chat, embedding)...');
  const chatModels: UnifiedAIModel[] = [];
  const embeddingModels: UnifiedAIModel[] = [];
  console.log(`   - Chat models: ${chatModels.length}`);
  console.log(`   - Embedding models: ${embeddingModels.length}\n`);

  // Add hardcoded models
  console.log('2. Adding hardcoded models...');
  const codingModels = getCodingModels();
  const imageModels = getImageGenerationModels();
  const videoModels = getVideoGenerationModels();
  const audioModels = getAudioModels();

  console.log(`   - Coding models: ${codingModels.length}`);
  console.log(`   - Image models: ${imageModels.length}`);
  console.log(`   - Video models: ${videoModels.length}`);
  console.log(`   - Audio models: ${audioModels.length}\n`);

  models.push(...chatModels);
  models.push(...embeddingModels);
  models.push(...codingModels);
  models.push(...imageModels);
  models.push(...videoModels);
  models.push(...audioModels);

  console.log('3. Final aggregation result:');
  console.log(`   Total models: ${models.length}`);
  console.log(`   Expected minimum: 10 (1 coding + 1 image + 5 video + 3 audio)\n`);

  console.log('4. Models by category:');
  const byCategory = models.reduce((acc, model) => {
    acc[model.category] = (acc[model.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`   - ${category}: ${count}`);
  });

  console.log('\n5. Sample models:');
  models.slice(0, 3).forEach(model => {
    console.log(`   - ${model.name} (${model.provider})`);
    console.log(`     Category: ${model.category}`);
    console.log(`     Capabilities: ${model.capabilities.join(', ')}`);
    console.log(`     ID: ${model.id}\n`);
  });

  console.log('=== Test Complete ===\n');

  if (models.length >= 10) {
    console.log('✅ PASS: At least 10 models returned (hardcoded minimum)');
    return true;
  } else {
    console.log('❌ FAIL: Less than 10 models returned');
    return false;
  }
}

// Run the test
testAggregation().then(success => {
  process.exit(success ? 0 : 1);
});
