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

interface RegistryModel {
  model_id: string;
  name: string;
  provider: string;
  model_type: string;
  enabled: boolean;
  capabilities: string[];
  quality_score?: number;
  cost_per_request?: number;
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

    // Fetch from all API endpoints in parallel
    const [chatModels, embeddingModels, registryModels] = await Promise.allSettled([
      this.fetchChatModels(),
      this.fetchEmbeddingModels(),
      this.fetchRegistryModels(),
    ]);

    // Add chat models from /v1/models
    if (chatModels.status === 'fulfilled') {
      console.log('[ModelAggregator] Chat models:', chatModels.value.length);
      models.push(...chatModels.value);
    } else {
      console.warn('[ModelAggregator] Chat models failed:', chatModels.reason);
    }

    // Add registry models from /v1/public/multi-model/models (deduplicated)
    if (registryModels.status === 'fulfilled' && registryModels.value.length > 0) {
      const existingIds = new Set(models.map(m => m.name.toLowerCase()));
      const newRegistryModels = registryModels.value.filter(
        m => !existingIds.has(m.name.toLowerCase())
      );
      console.log('[ModelAggregator] Registry models (new):', newRegistryModels.length);
      models.push(...newRegistryModels);
    } else {
      console.warn('[ModelAggregator] Registry models failed:', registryModels.status === 'rejected' ? registryModels.reason : 'empty');
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

    // Add hardcoded models with individual error handling
    const hardcodedSources: Array<{ name: string; getter: () => UnifiedAIModel[] }> = [
      { name: 'Coding', getter: () => this.getCodingModels() },
      { name: 'Image', getter: () => this.getImageGenerationModels() },
      { name: 'Video', getter: () => this.getVideoGenerationModels() },
      { name: 'Audio', getter: () => this.getAudioModels() },
    ];

    for (const source of hardcodedSources) {
      try {
        const sourceModels = source.getter();
        console.log(`[ModelAggregator] ${source.name} models:`, sourceModels.length);
        models.push(...sourceModels);
      } catch (error) {
        console.error(`[ModelAggregator] ${source.name} models failed:`, error);
      }
    }

    console.log('[ModelAggregator] Total models aggregated:', models.length);

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
   * Fetch embedding models from /v1/public/embeddings/models
   */
  private async fetchEmbeddingModels(): Promise<UnifiedAIModel[]> {
    try {
      const response = await apiClient.get<EmbeddingModel[]>('/v1/public/embeddings/models');
      return response.data.map(model => this.transformEmbeddingModel(model));
    } catch (error) {
      console.error('Failed to fetch embedding models:', error);
      return [];
    }
  }

  /**
   * Fetch registered models from /v1/public/multi-model/models
   */
  private async fetchRegistryModels(): Promise<UnifiedAIModel[]> {
    try {
      const response = await apiClient.get<RegistryModel[]>('/v1/public/multi-model/models');
      const models = Array.isArray(response.data) ? response.data : [];
      return models
        .filter(m => m.enabled)
        .map(model => this.transformRegistryModel(model));
    } catch (error) {
      console.error('Failed to fetch registry models:', error);
      return [];
    }
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
   * Transform registry model to unified format
   */
  private transformRegistryModel(model: RegistryModel): UnifiedAIModel {
    // Map backend capabilities to frontend capability format
    const capabilities = (model.capabilities || []).map(cap =>
      cap.replace(/_/g, '-')
    );

    // Add 'code' capability for models with code-related capabilities
    if (capabilities.some(c => c.includes('code'))) {
      if (!capabilities.includes('code')) capabilities.push('code');
    }
    // Ensure text-generation is present for chat models
    if (model.model_type === 'chat' && !capabilities.includes('text-generation')) {
      capabilities.push('text-generation');
    }

    // Determine category based on model_type and capabilities
    let category: ModelCategory = 'Coding';
    if (model.model_type === 'embedding' || capabilities.includes('embedding')) {
      category = 'Embedding';
    } else if (model.model_type === 'multimodal' || capabilities.includes('vision')) {
      category = 'Coding';
    }

    return {
      id: `registry-${model.model_id}`,
      slug: model.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: model.name,
      provider: model.provider,
      category,
      capabilities,
      description: `${model.provider} ${model.name} - ${model.model_type} model`,
      thumbnail_url: getThumbnailUrl({
        provider: model.provider,
        category,
      }),
      endpoint: '/v1/public/multi-model/inference',
      method: 'POST' as const,
      source_type: 'chat' as const,
    };
  }

  /**
   * Get hardcoded image generation models
   */
  private getImageGenerationModels(): UnifiedAIModel[] {
    return [
      {
        id: 'image-qwen-edit',
        slug: 'qwen-image-edit',
        name: 'Qwen Image Edit',
        provider: 'Qwen',
        category: 'Image' as ModelCategory,
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
        method: 'POST' as const,
        is_default: true,
        speed: 'Fast',
        quality: 'High',
        source_type: 'image' as const,
      },
    ];
  }

  /**
   * Get hardcoded video generation models
   * Backend confirms these endpoints are operational via /v1/multimodal/health
   */
  private getVideoGenerationModels(): UnifiedAIModel[] {
    const video: ModelCategory = 'Video';
    const post = 'POST' as const;
    const videoSource = 'video' as const;
    return [
      {
        id: 'video-wan22-i2v',
        slug: 'alibaba-wan-22-i2v-720p',
        name: 'Alibaba Wan 2.2 I2V 720p',
        provider: 'Alibaba',
        category: video,
        capabilities: ['image-to-video', 'video-generation'],
        description: 'Wan 2.2 is an open-source AI video generation model that utilizes a diffusion transformer architecture for image-to-video generation',
        thumbnail_url: 'https://image.ainative.studio/asset/alibaba/wan-2i2v720.png',
        examplePrompts: [
          'Create a realistic 5-second video from this image. Motion should be minimal but believable. Maintain original composition and proportions. No stylistic exaggeration.',
        ],
        pricing: { credits: 400, usd: 0.20, unit: 'per 5s video' },
        endpoint: '/v1/multimodal/video/i2v',
        method: post,
        is_default: true,
        speed: 'Fast',
        quality: 'High',
        source_type: videoSource,
      },
      {
        id: 'video-seedance-i2v',
        slug: 'seedance-i2v',
        name: 'Seedance I2V',
        provider: 'Seedance',
        category: video,
        capabilities: ['image-to-video', 'video-generation'],
        description: 'Advanced image-to-video generation with high-quality motion synthesis',
        thumbnail_url: getThumbnailUrl({ provider: 'Seedance', category: 'Video' }),
        examplePrompts: [
          'Generate smooth, high-fidelity motion from this image. Preserve structural integrity of the subject. Motion should be realistic and physically grounded.',
        ],
        pricing: { credits: 520, usd: 0.26, unit: 'per 5s video' },
        endpoint: '/v1/multimodal/video/i2v',
        method: post,
        speed: 'Medium',
        quality: 'High',
        source_type: videoSource,
      },
      {
        id: 'video-sora2-i2v',
        slug: 'sora2-i2v',
        name: 'Sora2',
        provider: 'Sora',
        category: video,
        capabilities: ['image-to-video', 'video-generation'],
        description: 'Premium cinematic quality image-to-video generation',
        thumbnail_url: getThumbnailUrl({ provider: 'Sora', category: 'Video' }),
        examplePrompts: [
          'Animate this image into a cinematic scene. Preserve identity, proportions, and realism. Motion should be subtle and natural.',
        ],
        pricing: { credits: 800, usd: 0.40, unit: 'per 4s video' },
        endpoint: '/v1/multimodal/video/i2v',
        method: post,
        is_premium: true,
        speed: 'Slow',
        quality: 'Cinematic',
        source_type: videoSource,
      },
      {
        id: 'video-t2v-generic',
        slug: 'text-to-video-model',
        name: 'Text-to-Video Model',
        provider: 'Generic',
        category: video,
        capabilities: ['text-to-video', 'video-generation'],
        description: 'Premium text-to-video generation with 1-10 second duration. HD 1280x720 resolution.',
        thumbnail_url: getThumbnailUrl({ provider: 'Generic', category: 'Video' }),
        examplePrompts: [
          'Create a 5-8 second HD cinematic video. Subject: [MAIN SUBJECT]. Environment: [DETAILED SETTING]. Lighting: professional film lighting.',
        ],
        pricing: { credits: 1000, usd: 0.50, unit: 'per video' },
        endpoint: '/v1/multimodal/video/t2v',
        method: post,
        is_premium: true,
        speed: 'Slow',
        quality: 'High',
        source_type: videoSource,
      },
      {
        id: 'video-cogvideox-2b',
        slug: 'cogvideox-2b',
        name: 'CogVideoX-2B',
        provider: 'CogVideo',
        category: video,
        capabilities: ['text-to-video', 'video-generation'],
        description: 'Text-to-video generation with 17, 33, or 49 frames. 8 FPS output in MP4 format.',
        thumbnail_url: getThumbnailUrl({ provider: 'CogVideo', category: 'Video' }),
        examplePrompts: [
          'A cinematic shot of a subject in an environment. Camera motion: slow, steady tracking shot. Lighting: realistic, soft, natural.',
        ],
        pricing: { credits: 800, usd: 0.40, unit: 'per video' },
        endpoint: '/v1/multimodal/video/cogvideox',
        method: post,
        speed: 'Slow',
        quality: 'High',
        source_type: videoSource,
      },
    ];
  }

  /**
   * Get hardcoded coding models
   */
  private getCodingModels(): UnifiedAIModel[] {
    const coding: ModelCategory = 'Coding';
    const post = 'POST' as const;
    const chatSource = 'chat' as const;
    return [
      {
        id: 'coding-nous-coder',
        slug: 'nous-coder',
        name: 'NousCoder',
        provider: 'Nous Research',
        category: coding,
        capabilities: ['code', 'code-generation', 'text-generation'],
        description: 'Specialized coding model with advanced code generation capabilities and programming language support.',
        thumbnail_url: getThumbnailUrl({ provider: 'Nous Research', category: 'Coding' }),
        examplePrompts: [
          'Write clean, production-ready code. Follow best practices and industry standards. Optimize for readability and maintainability.',
        ],
        endpoint: '/v1/chat/completions',
        method: post,
        speed: 'Fast',
        quality: 'High',
        source_type: chatSource,
      },
    ];
  }

  /**
   * Get hardcoded audio models
   * Backend confirms tts endpoint operational via /v1/multimodal/health
   */
  private getAudioModels(): UnifiedAIModel[] {
    const audio: ModelCategory = 'Audio';
    const post = 'POST' as const;
    const audioSource = 'audio' as const;
    return [
      {
        id: 'audio-whisper-transcription',
        slug: 'whisper-transcription',
        name: 'Whisper',
        provider: 'OpenAI',
        category: audio,
        capabilities: ['audio', 'transcription', 'speech-to-text'],
        description: 'Speech-to-text transcription supporting 99+ languages. Convert audio/video to text.',
        thumbnail_url: getThumbnailUrl({ provider: 'OpenAI', category: 'Audio' }),
        examplePrompts: [
          'Transcribe this audio verbatim. Preserve speaker intent and meaning. Use paragraph breaks for topic changes.',
        ],
        endpoint: '/v1/audio/transcriptions',
        method: post,
        is_default: true,
        speed: 'Fast',
        source_type: audioSource,
      },
      {
        id: 'audio-whisper-translation',
        slug: 'whisper-translation',
        name: 'Whisper Translation',
        provider: 'OpenAI',
        category: audio,
        capabilities: ['audio', 'translation'],
        description: 'Translate any language audio to English text using Whisper.',
        thumbnail_url: getThumbnailUrl({ provider: 'OpenAI', category: 'Audio' }),
        examplePrompts: [
          'Translate this audio into fluent, natural English. Preserve intent, tone, and idiomatic meaning rather than literal phrasing.',
        ],
        endpoint: '/v1/audio/translations',
        method: post,
        speed: 'Fast',
        source_type: audioSource,
      },
      {
        id: 'audio-tts',
        slug: 'openai-tts',
        name: 'TTS Model',
        provider: 'OpenAI',
        category: audio,
        capabilities: ['audio-generation', 'text-to-speech', 'speech'],
        description: 'Generate natural-sounding speech from text with multiple voice options.',
        thumbnail_url: getThumbnailUrl({ provider: 'OpenAI', category: 'Audio' }),
        examplePrompts: [
          'Read the following text as a confident, calm narrator. Use natural pacing, subtle emphasis, and realistic pauses.',
        ],
        endpoint: '/v1/multimodal/tts',
        method: post,
        speed: 'Fast',
        source_type: audioSource,
      },
    ];
  }

  /**
   * Get hardcoded embedding models (fallback when API fails)
   */
  private getHardcodedEmbeddingModels(): UnifiedAIModel[] {
    const embedding: ModelCategory = 'Embedding';
    const post = 'POST' as const;
    const embeddingSource = 'embedding' as const;
    const prompt = 'Generate embeddings optimized for semantic similarity search. Use full sentences rather than keywords.';
    return [
      {
        id: 'embedding-bge-small-en',
        slug: 'bge-small-en-v1-5',
        name: 'BGE Small EN v1.5',
        provider: 'BAAI',
        category: embedding,
        capabilities: ['embedding', 'semantic-search'],
        description: 'Fast and efficient embedding model with 384 dimensions. Ideal for semantic search and text similarity tasks.',
        thumbnail_url: getThumbnailUrl({ provider: 'BAAI', category: 'Embedding' }),
        examplePrompts: [prompt],
        endpoint: '/v1/embeddings',
        method: post,
        is_default: true,
        speed: 'Fast',
        source_type: embeddingSource,
      },
      {
        id: 'embedding-bge-base-en',
        slug: 'bge-base-en-v1-5',
        name: 'BGE Base EN v1.5',
        provider: 'BAAI',
        category: embedding,
        capabilities: ['embedding', 'semantic-search'],
        description: 'Balanced embedding model with 768 dimensions. Good trade-off between speed and quality.',
        thumbnail_url: getThumbnailUrl({ provider: 'BAAI', category: 'Embedding' }),
        examplePrompts: [prompt],
        endpoint: '/v1/embeddings',
        method: post,
        speed: 'Medium',
        source_type: embeddingSource,
      },
      {
        id: 'embedding-bge-large-en',
        slug: 'bge-large-en-v1-5',
        name: 'BGE Large EN v1.5',
        provider: 'BAAI',
        category: embedding,
        capabilities: ['embedding', 'semantic-search'],
        description: 'High-quality embedding model with 1024 dimensions. Best for accuracy-critical applications.',
        thumbnail_url: getThumbnailUrl({ provider: 'BAAI', category: 'Embedding' }),
        examplePrompts: [prompt],
        endpoint: '/v1/embeddings',
        method: post,
        speed: 'Slow',
        quality: 'High',
        source_type: embeddingSource,
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
