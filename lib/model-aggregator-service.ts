/**
 * Model Aggregator Service
 * Aggregates AI models from multiple backend API endpoints into a unified model list
 * Reference: docs/ai-models/AI_MODEL_REGISTRY_SYSTEM.md
 */

import apiClient from './api-client';
import { getThumbnailUrl } from './utils/thumbnail-generator';

// Unified model interface as per specification
export interface UnifiedAIModel {
  // Identification
  id: string;
  slug: string;
  name: string;

  // Categorization
  provider: string;
  category: ModelCategory;
  capabilities: string[];

  // Display
  thumbnail_url?: string;
  description: string;

  // Pricing
  pricing?: {
    credits: number;
    usd: number;
    unit?: string;
  };

  // Technical Details
  endpoint: string;
  method: 'GET' | 'POST';

  // Metadata
  is_default?: boolean;
  is_premium?: boolean;
  speed?: string;
  quality?: string;

  // Example prompts
  examplePrompts?: string[];

  // Source tracking
  source_type: 'chat' | 'image' | 'video' | 'audio' | 'embedding';
}

export type ModelCategory = 'All' | 'Image' | 'Video' | 'Audio' | 'Coding' | 'Embedding';

// Response types from backend APIs
interface ChatModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  available?: boolean;
}

interface ChatModelsResponse {
  object: string;
  data: ChatModel[];
}

interface EmbeddingModel {
  id: string;
  dimensions: number;
  description?: string;
  speed?: string;
  loaded?: boolean;
}

/**
 * Model Aggregator Service
 * Fetches and normalizes models from all available endpoints
 */
class ModelAggregatorService {
  /**
   * Aggregate all models from all endpoints
   */
  async aggregateAllModels(): Promise<UnifiedAIModel[]> {
    console.log('[ModelAggregator] Starting model aggregation...');
    const models: UnifiedAIModel[] = [];

    // Fetch from all endpoints in parallel
    const [chatModels, embeddingModels] = await Promise.allSettled([
      this.fetchChatModels(),
      this.fetchEmbeddingModels(),
    ]);

    // Add chat models
    if (chatModels.status === 'fulfilled') {
      console.log('[ModelAggregator] Chat models:', chatModels.value.length);
      models.push(...chatModels.value);
    } else {
      console.warn('[ModelAggregator] Chat models failed:', chatModels.reason);
    }

    // Add embedding models (API or fallback to hardcoded)
    if (embeddingModels.status === 'fulfilled' && embeddingModels.value.length > 0) {
      console.log('[ModelAggregator] Embedding models (from API):', embeddingModels.value.length);
      models.push(...embeddingModels.value);
    } else {
      console.warn('[ModelAggregator] Embedding models API failed or returned 0, using hardcoded fallback');
      const hardcodedEmbeddings = this.getHardcodedEmbeddingModels();
      console.log('[ModelAggregator] Embedding models (hardcoded fallback):', hardcodedEmbeddings.length);
      models.push(...hardcodedEmbeddings);
    }

    // Add hardcoded coding models
    const codingModels = this.getCodingModels();
    console.log('[ModelAggregator] Coding models (hardcoded):', codingModels.length);
    models.push(...codingModels);

    // Add hardcoded image generation models
    const imageModels = this.getImageGenerationModels();
    console.log('[ModelAggregator] Image models (hardcoded):', imageModels.length);
    models.push(...imageModels);

    // Add hardcoded video generation models
    const videoModels = this.getVideoGenerationModels();
    console.log('[ModelAggregator] Video models (hardcoded):', videoModels.length);
    models.push(...videoModels);

    // Add hardcoded audio models
    const audioModels = this.getAudioModels();
    console.log('[ModelAggregator] Audio models (hardcoded):', audioModels.length);
    models.push(...audioModels);

    console.log('[ModelAggregator] Total models aggregated:', models.length);
    console.log('[ModelAggregator] Sample of first model:', models[0]);

    return models;
  }

  /**
   * Fetch chat completion models from /v1/models
   */
  private async fetchChatModels(): Promise<UnifiedAIModel[]> {
    try {
      const response = await apiClient.get<ChatModelsResponse>('/v1/models');
      return response.data.data.map(model => this.transformChatModel(model));
    } catch (error) {
      console.error('Failed to fetch chat models:', error);
      return [];
    }
  }

  /**
   * Fetch embedding models
   * Note: Embeddings require project_id context (/v1/public/zerodb/{project_id}/embeddings/models)
   * which is not available in AI Settings page. Disabled for now.
   */
  private async fetchEmbeddingModels(): Promise<UnifiedAIModel[]> {
    // Disabled - requires project_id which is not available in this context
    return [];
  }

  /**
   * Transform chat model to unified format
   */
  private transformChatModel(model: ChatModel): UnifiedAIModel {
    const capabilities = ['text-generation', 'code'];
    const provider = model.owned_by || 'OpenAI';

    // Detect additional capabilities from model name
    if (model.id.includes('gpt-4') || model.id.includes('claude')) {
      capabilities.push('reasoning');
    }
    if (model.id.includes('vision') || model.id.includes('gpt-4')) {
      capabilities.push('vision');
    }

    // Determine example prompts based on model type
    let examplePrompts: string[] = [];
    if (model.id.includes('claude-3-5-sonnet') || model.id.includes('claude-3.5-sonnet')) {
      examplePrompts = [
        'Think step-by-step. State assumptions explicitly. Optimize for correctness over speed. If tradeoffs exist, explain them. Produce a structured, well-reasoned response.',
      ];
    } else if (model.id.includes('gpt-4')) {
      examplePrompts = [
        'Act as a senior expert in this domain. Provide a well-structured, accurate, and thoughtful response. Include examples where helpful. Balance depth with clarity.',
      ];
    } else if (model.id.includes('gpt-3.5-turbo')) {
      examplePrompts = [
        'Provide a clear, concise, and helpful response. Optimize for speed and clarity. Avoid unnecessary verbosity.',
      ];
    }

    return {
      id: `chat-${model.id}`,
      slug: model.id.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: this.formatModelName(model.id),
      provider: provider,
      category: 'Coding',
      capabilities,
      description: `${provider} model for text generation, coding, and complex reasoning tasks`,
      thumbnail_url: getThumbnailUrl({
        provider,
        category: 'Coding',
      }),
      examplePrompts: examplePrompts.length > 0 ? examplePrompts : undefined,
      endpoint: '/v1/chat/completions',
      method: 'POST',
      is_default: false,
      source_type: 'chat',
    };
  }

  /**
   * Transform embedding model to unified format
   */
  private transformEmbeddingModel(model: EmbeddingModel): UnifiedAIModel {
    const isDefault = model.id === 'BAAI/bge-small-en-v1.5';

    return {
      id: `embedding-${model.id}`,
      slug: model.id.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: model.id.split('/').pop() || model.id,
      provider: model.id.split('/')[0] || 'BAAI',
      category: 'Embedding',
      capabilities: ['embedding', 'semantic-search'],
      description: model.description || `Embedding model with ${model.dimensions} dimensions. ${model.speed || 'Medium'} speed.`,
      thumbnail_url: getThumbnailUrl({
        provider: model.id.split('/')[0] || 'BAAI',
        category: 'Embedding',
      }),
      examplePrompts: [
        'Generate embeddings optimized for semantic similarity search. Text should preserve meaning, intent, and context. Use full sentences rather than keywords.',
      ],
      endpoint: '/v1/embeddings',
      method: 'POST',
      is_default: isDefault,
      speed: model.speed,
      source_type: 'embedding',
    };
  }

  /**
   * Get hardcoded image generation models
   */
  private getImageGenerationModels(): UnifiedAIModel[] {
    const models = [
      {
        id: 'image-qwen-edit',
        slug: 'qwen-image-edit',
        name: 'Qwen Image Edit',
        provider: 'Qwen',
        category: 'Image',
        capabilities: ['image-generation', 'text-to-image'],
        description: 'High-quality image generation with LoRA style transfer support. Resolutions from 512x512 to 2048x2048.',
        thumbnail_url: getThumbnailUrl({
          provider: 'Qwen',
          category: 'Image',
        }),
        examplePrompts: [
          'Generate a high-resolution image with photorealistic detail. Lighting: realistic and balanced. Textures: sharp, natural, detailed. No distortion or oversaturation. Resolution: 2048x2048.',
        ],
        pricing: {
          credits: 50,
          usd: 0.025,
          unit: 'per image',
        },
        endpoint: '/v1/multimodal/image',
        method: 'POST',
        is_default: true,
        speed: 'Fast',
        quality: 'High',
        source_type: 'image',
      },
    ];
    console.log('[ModelAggregator] Image model created:', models[0]);
    return models;
  }

  /**
   * Get hardcoded video generation models
   */
  private getVideoGenerationModels(): UnifiedAIModel[] {
    return [
      // Image-to-Video models
      {
        id: 'video-wan22-i2v',
        slug: 'alibaba-wan-22-i2v-720p',
        name: 'Alibaba Wan 2.2 I2V 720p',
        provider: 'Alibaba',
        category: 'Video',
        capabilities: ['image-to-video', 'video-generation'],
        description: 'Wan 2.2 is an open-source AI video generation model that utilizes a diffusion transformer architecture for image-to-video generation',
        thumbnail_url: getThumbnailUrl({
          provider: 'Alibaba',
          category: 'Video',
        }),
        examplePrompts: [
          'Create a realistic 5-second video from this image. Motion should be minimal but believable. Maintain original composition and proportions. No stylistic exaggeration.',
        ],
        pricing: {
          credits: 400,
          usd: 0.20,
          unit: 'per 5s video',
        },
        endpoint: '/v1/multimodal/video/i2v',
        method: 'POST',
        is_default: true,
        speed: 'Fast',
        quality: 'High',
        source_type: 'video',
      },
      {
        id: 'video-seedance-i2v',
        slug: 'seedance-i2v',
        name: 'Seedance I2V',
        provider: 'Seedance',
        category: 'Video',
        capabilities: ['image-to-video', 'video-generation'],
        description: 'Advanced image-to-video generation with high-quality motion synthesis',
        thumbnail_url: getThumbnailUrl({
          provider: 'Seedance',
          category: 'Video',
        }),
        examplePrompts: [
          'Generate smooth, high-fidelity motion from this image. Preserve structural integrity of the subject. Motion should be realistic and physically grounded. Avoid jitter, warping, or excessive motion.',
        ],
        pricing: {
          credits: 520,
          usd: 0.26,
          unit: 'per 5s video',
        },
        endpoint: '/v1/multimodal/video/i2v',
        method: 'POST',
        speed: 'Medium',
        quality: 'High',
        source_type: 'video',
      },
      {
        id: 'video-sora2-i2v',
        slug: 'sora2-i2v',
        name: 'Sora2',
        provider: 'Sora',
        category: 'Video',
        capabilities: ['image-to-video', 'video-generation'],
        description: 'Premium cinematic quality image-to-video generation',
        thumbnail_url: getThumbnailUrl({
          provider: 'Sora',
          category: 'Video',
        }),
        examplePrompts: [
          'Animate this image into a cinematic scene. Preserve identity, proportions, and realism. Motion should be subtle and natural. Camera movement should feel intentional and film-like. Lighting continuity must remain consistent.',
        ],
        pricing: {
          credits: 800,
          usd: 0.40,
          unit: 'per 4s video',
        },
        endpoint: '/v1/multimodal/video/i2v',
        method: 'POST',
        is_premium: true,
        speed: 'Slow',
        quality: 'Cinematic',
        source_type: 'video',
      },
      // Text-to-Video models
      {
        id: 'video-t2v-generic',
        slug: 'text-to-video-model',
        name: 'Text-to-Video Model',
        provider: 'Generic',
        category: 'Video',
        capabilities: ['text-to-video', 'video-generation'],
        description: 'Premium text-to-video generation with 1-10 second duration. HD 1280x720 resolution.',
        thumbnail_url: getThumbnailUrl({
          provider: 'Generic',
          category: 'Video',
        }),
        examplePrompts: [
          'Create a 5–8 second HD cinematic video. Subject: [MAIN SUBJECT]. Environment: [DETAILED SETTING]. Lighting: professional film lighting. Camera: smooth cinematic movement. Mood: emotionally resonant, realistic. Avoid surreal or abstract visuals.',
        ],
        pricing: {
          credits: 1000,
          usd: 0.50,
          unit: 'per video',
        },
        endpoint: '/v1/multimodal/video/t2v',
        method: 'POST',
        is_premium: true,
        speed: 'Slow',
        quality: 'High',
        source_type: 'video',
      },
      {
        id: 'video-cogvideox-2b',
        slug: 'cogvideox-2b',
        name: 'CogVideoX-2B',
        provider: 'CogVideo',
        category: 'Video',
        capabilities: ['text-to-video', 'video-generation'],
        description: 'Text-to-video generation with 17, 33, or 49 frames. 8 FPS output in MP4 format.',
        thumbnail_url: getThumbnailUrl({
          provider: 'CogVideo',
          category: 'Video',
        }),
        examplePrompts: [
          'A cinematic shot of a subject in an environment. Camera motion: slow, steady tracking shot. Lighting: realistic, soft, natural. Style: grounded realism, not cartoonish. Motion should feel physically plausible. No sudden cuts.',
        ],
        pricing: {
          credits: 800,
          usd: 0.40,
          unit: 'per video',
        },
        endpoint: '/v1/multimodal/video/cogvideox',
        method: 'POST',
        speed: 'Slow',
        quality: 'High',
        source_type: 'video',
      },
    ];
  }

  /**
   * Get hardcoded coding models
   */
  private getCodingModels(): UnifiedAIModel[] {
    console.log('[ModelAggregator] getCodingModels called');
    return [
      {
        id: 'coding-nous-coder',
        slug: 'nous-coder',
        name: 'NousCoder',
        provider: 'Nous Research',
        category: 'Coding',
        capabilities: ['code', 'code-generation', 'text-generation'],
        description: 'Specialized coding model with advanced code generation capabilities and programming language support.',
        thumbnail_url: getThumbnailUrl({
          provider: 'Nous Research',
          category: 'Coding',
        }),
        examplePrompts: [
          'Write clean, production-ready code. Follow best practices and industry standards. Include comments only where clarity is required. Optimize for readability and maintainability. Assume this will be reviewed by senior engineers.',
        ],
        endpoint: '/v1/chat/completions',
        method: 'POST',
        speed: 'Fast',
        quality: 'High',
        source_type: 'chat',
      },
    ];
  }

  /**
   * Get hardcoded audio models
   */
  private getAudioModels(): UnifiedAIModel[] {
    return [
      {
        id: 'audio-whisper-transcription',
        slug: 'whisper-transcription',
        name: 'Whisper Transcription',
        provider: 'OpenAI',
        category: 'Audio',
        capabilities: ['audio', 'transcription', 'speech-to-text'],
        description: 'Speech-to-text transcription supporting 99+ languages. Convert audio/video to text.',
        thumbnail_url: getThumbnailUrl({
          provider: 'OpenAI',
          category: 'Audio',
        }),
        examplePrompts: [
          'Transcribe this audio verbatim. Preserve speaker intent and meaning. Use paragraph breaks for topic changes. Add speaker labels if multiple voices are present. Do not add commentary or interpretation.',
        ],
        pricing: {
          credits: 5,
          usd: 0.006,
          unit: 'per minute',
        },
        endpoint: '/api/v1/audio/transcriptions',
        method: 'POST',
        is_default: true,
        speed: 'Fast',
        source_type: 'audio',
      },
      {
        id: 'audio-whisper-translation',
        slug: 'whisper-translation',
        name: 'Whisper Translation',
        provider: 'OpenAI',
        category: 'Audio',
        capabilities: ['audio', 'translation'],
        description: 'Translate any language audio to English text using Whisper.',
        thumbnail_url: getThumbnailUrl({
          provider: 'OpenAI',
          category: 'Audio',
        }),
        examplePrompts: [
          'Translate this audio into fluent, natural English. Preserve intent, tone, and idiomatic meaning rather than literal phrasing. If cultural references appear, translate them in a way an English-speaking audience would understand. Do not summarize. Do not omit details.',
        ],
        pricing: {
          credits: 5,
          usd: 0.006,
          unit: 'per minute',
        },
        endpoint: '/api/v1/audio/translations',
        method: 'POST',
        speed: 'Fast',
        source_type: 'audio',
      },
      {
        id: 'audio-openai-tts',
        slug: 'openai-tts',
        name: 'Text-to-Speech',
        provider: 'OpenAI',
        category: 'Audio',
        capabilities: ['audio-generation', 'text-to-speech', 'speech'],
        description: 'Generate natural-sounding speech from text with multiple voice options.',
        thumbnail_url: getThumbnailUrl({
          provider: 'OpenAI',
          category: 'Audio',
        }),
        examplePrompts: [
          'Read the following text as a confident, calm, emotionally intelligent narrator. Use natural pacing, subtle emphasis, and realistic pauses. Avoid sounding robotic or overly dramatic. Tone: warm, articulate, professional. Audience: intelligent but non-technical adults.',
        ],
        pricing: {
          credits: 14,
          usd: 0.015,
          unit: 'per 1000 characters',
        },
        endpoint: '/api/v1/audio/speech',
        method: 'POST',
        speed: 'Fast',
        source_type: 'audio',
      },
      {
        id: 'audio-melotts',
        slug: 'melotts',
        name: 'MeloTTS',
        provider: 'HuggingFace',
        category: 'Audio',
        capabilities: ['audio-generation', 'text-to-speech', 'multilingual'],
        description: 'High-quality multilingual text-to-speech with natural prosody. Supports English, Spanish, French, Chinese, Japanese, and Korean. Deployed on T4 GPU for fast inference.',
        thumbnail_url: getThumbnailUrl({
          provider: 'HuggingFace',
          category: 'Audio',
        }),
        examplePrompts: [
          'Generate natural-sounding speech in multiple languages. Use realistic prosody and intonation. Maintain consistent voice quality across languages.',
        ],
        pricing: {
          credits: 6,
          usd: 0.0024,
          unit: 'per request',
        },
        endpoint: '/api/v1/audio/tts',
        method: 'POST',
        speed: 'Fast',
        source_type: 'audio',
      },
      {
        id: 'audio-kokoro-82m',
        slug: 'kokoro-82m',
        name: 'Kokoro-82M',
        provider: 'HuggingFace',
        category: 'Audio',
        capabilities: ['audio-generation', 'text-to-speech', 'fast-inference'],
        description: 'Lightweight and fast text-to-speech model with natural voice quality. Optimized for real-time applications. Deployed on T4 GPU with ultra-fast inference.',
        thumbnail_url: getThumbnailUrl({
          provider: 'HuggingFace',
          category: 'Audio',
        }),
        examplePrompts: [
          'Generate speech optimized for real-time applications. Prioritize low latency and natural voice quality. Maintain clarity and expressiveness.',
        ],
        pricing: {
          credits: 5,
          usd: 0.0024,
          unit: 'per request',
        },
        endpoint: '/api/v1/audio/tts',
        method: 'POST',
        speed: 'Fast',
        source_type: 'audio',
      },
      {
        id: 'audio-minimax-tts-sync',
        slug: 'minimax-tts-sync',
        name: 'MiniMax TTS Sync',
        provider: 'MiniMax',
        category: 'Audio',
        capabilities: ['audio-generation', 'text-to-speech', 'voice-profiles'],
        description: 'Premium real-time text-to-speech with diverse voice profiles. Delivers fast, natural-sounding audio with studio-grade clarity.',
        thumbnail_url: getThumbnailUrl({
          provider: 'MiniMax',
          category: 'Audio',
        }),
        examplePrompts: [
          'Generate professional-quality speech with customizable voice profiles. Use natural intonation and clear articulation. Support for various speaking styles.',
        ],
        pricing: {
          credits: 14,
          usd: 0.007,
          unit: 'per generation',
        },
        endpoint: '/api/v1/audio/tts',
        method: 'POST',
        speed: 'Fast',
        source_type: 'audio',
      },
      {
        id: 'audio-minimax-music-v2',
        slug: 'minimax-music-v2',
        name: 'MiniMax Music 2.5',
        provider: 'MiniMax',
        category: 'Audio',
        capabilities: ['audio-generation', 'music-generation', 'ai-composition'],
        description: 'AI-powered music generation engine that transforms text prompts and lyrics into original, studio-quality tracks. Control genre, mood, and style to produce dynamic 10–60 second compositions on demand.',
        thumbnail_url: getThumbnailUrl({
          provider: 'MiniMax',
          category: 'Audio',
        }),
        examplePrompts: [
          'Create original music compositions with genre and mood control. Generate coherent musical structure with proper instrumentation and arrangement.',
        ],
        pricing: {
          credits: 20,
          usd: 0.01,
          unit: 'per track',
        },
        endpoint: '/api/v1/audio/music',
        method: 'POST',
        speed: 'Medium',
        source_type: 'audio',
      },
    ];
  }

  /**
   * Get hardcoded embedding models
   */
  private getHardcodedEmbeddingModels(): UnifiedAIModel[] {
    return [
      {
        id: 'embedding-bge-small-en',
        slug: 'bge-small-en-v1-5',
        name: 'BGE Small EN v1.5',
        provider: 'BAAI',
        category: 'Embedding',
        capabilities: ['embedding', 'semantic-search'],
        description: 'Fast and efficient embedding model with 384 dimensions. Ideal for semantic search and text similarity tasks.',
        thumbnail_url: getThumbnailUrl({
          provider: 'BAAI',
          category: 'Embedding',
        }),
        examplePrompts: [
          'Generate embeddings optimized for semantic similarity search. Text should preserve meaning, intent, and context. Use full sentences rather than keywords.',
        ],
        endpoint: '/v1/embeddings',
        method: 'POST',
        is_default: true,
        speed: 'Fast',
        source_type: 'embedding',
      },
      {
        id: 'embedding-bge-base-en',
        slug: 'bge-base-en-v1-5',
        name: 'BGE Base EN v1.5',
        provider: 'BAAI',
        category: 'Embedding',
        capabilities: ['embedding', 'semantic-search'],
        description: 'Balanced embedding model with 768 dimensions. Good trade-off between speed and quality.',
        thumbnail_url: getThumbnailUrl({
          provider: 'BAAI',
          category: 'Embedding',
        }),
        examplePrompts: [
          'Generate embeddings optimized for semantic similarity search. Text should preserve meaning, intent, and context. Use full sentences rather than keywords.',
        ],
        endpoint: '/v1/embeddings',
        method: 'POST',
        speed: 'Medium',
        source_type: 'embedding',
      },
      {
        id: 'embedding-bge-large-en',
        slug: 'bge-large-en-v1-5',
        name: 'BGE Large EN v1.5',
        provider: 'BAAI',
        category: 'Embedding',
        capabilities: ['embedding', 'semantic-search'],
        description: 'High-quality embedding model with 1024 dimensions. Best for accuracy-critical applications.',
        thumbnail_url: getThumbnailUrl({
          provider: 'BAAI',
          category: 'Embedding',
        }),
        examplePrompts: [
          'Generate embeddings optimized for semantic similarity search. Text should preserve meaning, intent, and context. Use full sentences rather than keywords.',
        ],
        endpoint: '/v1/embeddings',
        method: 'POST',
        speed: 'Slow',
        quality: 'High',
        source_type: 'embedding',
      },
    ];
  }

  /**
   * Format model name for display
   */
  private formatModelName(id: string): string {
    // Convert IDs like "gpt-4" or "claude-3-5-sonnet-20241022" to readable names
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// Export singleton instance
export const modelAggregatorService = new ModelAggregatorService();
