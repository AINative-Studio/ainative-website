/**
 * Model Aggregator Service
 * Aggregates AI models from multiple backend API endpoints into a unified model list
 * Reference: docs/ai-models/AI_MODEL_REGISTRY_SYSTEM.md
 * Refs #566 - Replace hardcoded models with AI Registry API
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
  available?: boolean;

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

// AI Registry API response types (Refs #566)
interface AIRegistryModel {
  id: string;
  name: string;
  provider: string;
  category: string;
  capabilities: string[];
  description: string;
  thumbnail_url?: string;
  endpoint: string;
  method?: string;
  pricing?: {
    credits: number;
    usd: number;
    unit?: string;
  };
  is_default?: boolean;
  is_premium?: boolean;
  speed?: string;
  quality?: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: unknown;
    description: string;
    min?: number;
    max?: number;
    options?: unknown[];
  }>;
  example_request?: string;
  example_response?: string;
  examplePrompts?: string[];
}

interface AIRegistryResponse {
  models: AIRegistryModel[];
  total?: number;
}

// Multimodal health check response
interface MultimodalHealthResponse {
  status: string;
  services: {
    [key: string]: {
      available: boolean;
      models?: string[];
    };
  };
}

/**
 * Model Aggregator Service
 * Fetches and normalizes models from all available endpoints
 */
class ModelAggregatorService {
  private healthCheckCache: MultimodalHealthResponse | null = null;
  private healthCheckTimestamp: number = 0;
  private readonly HEALTH_CHECK_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Aggregate all models from all endpoints (Refs #566)
   * Fetches from AI Registry API instead of hardcoded data
   */
  async aggregateAllModels(): Promise<UnifiedAIModel[]> {
    console.log('[ModelAggregator] Starting model aggregation (using AI Registry API)...');
    const models: UnifiedAIModel[] = [];

    // Fetch multimodal health status first
    const healthStatus = await this.fetchMultimodalHealth();

    // Fetch from all endpoints in parallel (Refs #566)
    const [chatModels, embeddingModels, registryModels] = await Promise.allSettled([
      this.fetchChatModels(),
      this.fetchEmbeddingModels(),
      this.fetchAIRegistryModels(), // NEW: Replaces hardcoded Image/Video/Audio
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

    // Add models from AI Registry (Image, Video, Audio) - Refs #566
    if (registryModels.status === 'fulfilled' && registryModels.value.length > 0) {
      console.log('[ModelAggregator] AI Registry models (from API):', registryModels.value.length);
      // Apply health check status
      const modelsWithHealth = registryModels.value.map(model => ({
        ...model,
        available: this.checkModelAvailability(model, healthStatus),
      }));
      models.push(...modelsWithHealth);
    }

    // Always add hardcoded models, skip duplicates by ID
    const existingIds = new Set(models.map(m => m.id));
    const allHardcoded = [
      ...this.getCodingModels(),
      ...this.getImageGenerationModels(),
      ...this.getVideoGenerationModels(),
      ...this.getAudioModels(),
    ];
    for (const hm of allHardcoded) {
      if (!existingIds.has(hm.id)) {
        models.push(hm);
        existingIds.add(hm.id);
      }
    }
    console.log(`[ModelAggregator] Added hardcoded models. Total now: ${models.length}`);

    console.log('[ModelAggregator] Total models aggregated:', models.length);
    console.log('[ModelAggregator] Sample of first model:', models[0]);

    return models;
  }

  /**
   * Fetch multimodal service health status (Refs #566)
   */
  private async fetchMultimodalHealth(): Promise<MultimodalHealthResponse | null> {
    // Use cache if still valid
    const now = Date.now();
    if (this.healthCheckCache && (now - this.healthCheckTimestamp) < this.HEALTH_CHECK_TTL) {
      console.log('[ModelAggregator] Using cached health check');
      return this.healthCheckCache;
    }

    try {
      const response = await apiClient.get<MultimodalHealthResponse>('/api/v1/multimodal/health');
      this.healthCheckCache = response.data;
      this.healthCheckTimestamp = now;
      console.log('[ModelAggregator] Multimodal health check:', response.data);
      return response.data;
    } catch (error) {
      console.error('[ModelAggregator] Failed to fetch multimodal health:', error);
      return null;
    }
  }

  /**
   * Fetch models from AI Registry API (Refs #566)
   * Replaces hardcoded Image, Video, and Audio models
   */
  private async fetchAIRegistryModels(): Promise<UnifiedAIModel[]> {
    try {
      const response = await apiClient.get<AIRegistryResponse>('/api/v1/public/ai-registry/models');
      const registryModels = response.data.models || [];

      console.log('[ModelAggregator] Fetched from AI Registry:', registryModels.length, 'models');

      return registryModels.map(model => this.transformRegistryModel(model));
    } catch (error) {
      console.error('[ModelAggregator] Failed to fetch AI Registry models:', error);
      return [];
    }
  }

  /**
   * Transform AI Registry model to UnifiedAIModel format (Refs #566)
   */
  private transformRegistryModel(model: AIRegistryModel): UnifiedAIModel {
    // Map category string to ModelCategory
    const categoryMap: Record<string, ModelCategory> = {
      image: 'Image',
      video: 'Video',
      audio: 'Audio',
      coding: 'Coding',
      embedding: 'Embedding',
    };

    const category = categoryMap[(model.category || 'coding').toLowerCase()] || 'Coding';

    // Determine source_type from category
    const sourceTypeMap: Record<string, UnifiedAIModel['source_type']> = {
      Image: 'image',
      Video: 'video',
      Audio: 'audio',
      Coding: 'chat',
      Embedding: 'embedding',
    };

    return {
      id: model.id,
      slug: this.generateSlug(model.name),
      name: model.name,
      provider: model.provider,
      category,
      capabilities: model.capabilities || [],
      description: model.description || '',
      thumbnail_url: model.thumbnail_url || getThumbnailUrl({
        provider: model.provider,
        category,
      }),
      endpoint: model.endpoint,
      method: (model.method as 'GET' | 'POST') || 'POST',
      pricing: model.pricing,
      is_default: model.is_default || false,
      is_premium: model.is_premium || false,
      speed: model.speed,
      quality: model.quality,
      examplePrompts: model.examplePrompts || [],
      source_type: sourceTypeMap[category] || 'chat',
    };
  }

  /**
   * Check if model is available based on health status (Refs #566)
   */
  private checkModelAvailability(
    model: UnifiedAIModel,
    healthStatus: MultimodalHealthResponse | null
  ): boolean {
    if (!healthStatus || !healthStatus.services) {
      return true; // Assume available if no health data
    }

    // Map category to service name
    const serviceMap: Record<string, string> = {
      Image: 'image',
      Video: 'video',
      Audio: 'audio',
    };

    const serviceName = serviceMap[model.category];
    if (!serviceName) {
      return true; // Non-multimodal models are always available
    }

    const service = healthStatus.services[serviceName];
    return service?.available !== false;
  }

  /**
   * Fetch chat completion models from /v1/models
   */
  private async fetchChatModels(): Promise<UnifiedAIModel[]> {
    try {
      const response = await apiClient.get<ChatModelsResponse>('/api/v1/models');
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
      endpoint: '/api/v1/chat/completions',
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
      endpoint: '/api/v1/embeddings',
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
          'A futuristic AI development workspace floating in space, holographic code editors orbiting a glowing quantum processor core, neon blue and violet light trails connecting data streams, ultra-detailed digital art, 8K resolution, cinematic composition with volumetric lighting',
        ],
        pricing: {
          credits: 50,
          usd: 0.025,
          unit: 'per image',
        },
        endpoint: '/api/v1/multimodal/image',
        method: 'POST',
        is_default: true,
        speed: 'Fast',
        quality: 'High',
        source_type: 'image',
      },
      {
        id: 'image-minimax-01',
        slug: 'minimax-image-01',
        name: 'MiniMax Image-01',
        provider: 'MiniMax',
        category: 'Image',
        capabilities: ['image-generation', 'text-to-image', 'image-to-image'],
        description: 'MiniMax\'s image generation model supporting text-to-image and image-to-image with custom aspect ratios and high-resolution output.',
        thumbnail_url: getThumbnailUrl({ provider: 'MiniMax', category: 'Image' }),
        examplePrompts: [
          'A photorealistic portrait of a diverse group of developers collaborating around holographic displays in a glass-walled modern office, golden hour light streaming in, shallow depth of field, 8K detail',
        ],
        pricing: { credits: 40, usd: 0.02, unit: 'per image' },
        endpoint: '/api/v1/multimodal/image',
        method: 'POST',
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
          'Smooth camera push-in on a developer at their desk, dual monitors glowing with code, ambient RGB lighting shifts from blue to purple, coffee steam rising in slow motion, shallow depth of field, cinematic 24fps',
        ],
        pricing: {
          credits: 400,
          usd: 0.20,
          unit: 'per 5s video',
        },
        endpoint: '/api/v1/multimodal/video/i2v',
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
        endpoint: '/api/v1/multimodal/video/i2v',
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
        endpoint: '/api/v1/multimodal/video/i2v',
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
          'A photorealistic aerial drone shot soaring over a neon-lit city at night, reflections on wet streets, autonomous vehicles gliding below, holographic advertisements floating between skyscrapers, 4K cinematic, smooth camera movement',
        ],
        pricing: {
          credits: 1000,
          usd: 0.50,
          unit: 'per video',
        },
        endpoint: '/api/v1/multimodal/video/t2v',
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
          'Close-up of a humanoid robot hand typing code on a mechanical keyboard, lines of green code reflecting in its polished chrome surface, rack-focus from the hand to a holographic display showing neural network visualizations, warm tungsten backlight, shallow depth of field, 4K cinematic',
        ],
        pricing: {
          credits: 800,
          usd: 0.40,
          unit: 'per video',
        },
        endpoint: '/api/v1/multimodal/video/cogvideox',
        method: 'POST',
        speed: 'Slow',
        quality: 'High',
        source_type: 'video',
      },
      {
        id: 'video-minimax-hailuo',
        slug: 'minimax-hailuo',
        name: 'MiniMax Hailuo 2.3',
        provider: 'MiniMax',
        category: 'Video',
        capabilities: ['video-generation', 'text-to-video', 'image-to-video'],
        description: 'MiniMax\'s flagship video generation model. Creates high-quality 720p 25fps videos from text prompts or images with cinematic motion and realistic physics.',
        thumbnail_url: getThumbnailUrl({ provider: 'MiniMax', category: 'Video' }),
        examplePrompts: [
          'A time-lapse of a futuristic city being built block by block, cranes moving in synchrony, sunset golden hour lighting, aerial drone perspective, 4K quality',
        ],
        pricing: { credits: 500, usd: 0.25, unit: 'per video' },
        endpoint: '/api/v1/multimodal/video/t2v',
        method: 'POST',
        speed: 'Medium',
        quality: 'High',
        source_type: 'video',
      },
      {
        id: 'video-minimax-hailuo-fast',
        slug: 'minimax-hailuo-fast',
        name: 'MiniMax Hailuo 2.3 Fast',
        provider: 'MiniMax',
        category: 'Video',
        capabilities: ['video-generation', 'text-to-video', 'fast-generation'],
        description: 'Fast variant of MiniMax Hailuo — generates videos in seconds. Ideal for prototyping and real-time applications. 720p quality.',
        thumbnail_url: getThumbnailUrl({ provider: 'MiniMax', category: 'Video' }),
        examplePrompts: [
          'Smooth dolly shot through a neon-lit Tokyo alley at night, rain reflecting lights, pedestrians with umbrellas, cyberpunk atmosphere',
        ],
        pricing: { credits: 300, usd: 0.15, unit: 'per video' },
        endpoint: '/api/v1/multimodal/video/t2v',
        method: 'POST',
        speed: 'Fast',
        quality: 'Medium',
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
        endpoint: '/api/v1/chat/completions',
        method: 'POST',
        speed: 'Fast',
        quality: 'High',
        source_type: 'chat',
      },
      {
        id: 'coding-llama4-maverick',
        slug: 'llama-4-maverick',
        name: 'Llama 4 Maverick 17B',
        provider: 'Meta',
        category: 'Coding',
        capabilities: ['code', 'code-generation', 'text-generation', 'chat'],
        description: 'Meta\'s Llama 4 Maverick — 400B parameter MoE model with 17B active parameters. Excellent at code generation, reasoning, and multilingual tasks.',
        thumbnail_url: getThumbnailUrl({ provider: 'Meta', category: 'Coding' }),
        examplePrompts: [
          'Build a production-ready REST API in Python using FastAPI with proper error handling, input validation, and async database operations. Include comprehensive docstrings and type hints.',
        ],
        endpoint: '/api/v1/chat/completions',
        method: 'POST',
        speed: 'Fast',
        quality: 'High',
        source_type: 'chat',
      },
      {
        id: 'coding-gpt4',
        slug: 'gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        category: 'Coding',
        capabilities: ['code', 'code-generation', 'text-generation', 'chat', 'reasoning'],
        description: 'OpenAI\'s GPT-4 — state-of-the-art language model with strong code generation, complex reasoning, and instruction following.',
        thumbnail_url: getThumbnailUrl({ provider: 'OpenAI', category: 'Coding' }),
        examplePrompts: [
          'Design and implement a rate limiter middleware in TypeScript for an Express.js API. Support sliding window algorithm, configurable limits per endpoint, and Redis-backed distributed counting.',
        ],
        endpoint: '/api/v1/chat/completions',
        method: 'POST',
        speed: 'Medium',
        quality: 'High',
        source_type: 'chat',
      },
      {
        id: 'coding-claude-sonnet',
        slug: 'claude-3-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        category: 'Coding',
        capabilities: ['code', 'code-generation', 'text-generation', 'chat', 'reasoning'],
        description: 'Anthropic\'s Claude 3.5 Sonnet — excellent at code generation with strong safety and instruction following. Ideal for complex multi-file refactoring.',
        thumbnail_url: getThumbnailUrl({ provider: 'Anthropic', category: 'Coding' }),
        examplePrompts: [
          'Refactor this monolithic React component into smaller, reusable components with proper TypeScript types, custom hooks for state management, and unit tests using React Testing Library.',
        ],
        endpoint: '/api/v1/chat/completions',
        method: 'POST',
        speed: 'Medium',
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
          'Welcome to AI Native Lab. We are building the future of AI-powered software development. Our platform gives developers access to autonomous coding agents, multimodal AI models, and a complete data infrastructure called ZeroDB. From text-to-speech and image generation to full-stack code deployment — AI Native Lab is where builders ship faster with AI.',
        ],
        pricing: {
          credits: 14,
          usd: 0.015,
          unit: 'per 1000 characters',
        },
        endpoint: '/api/v1/multimodal/tts',
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
          'AI Native Lab is redefining how software gets built. Our autonomous agents write, test, and deploy production code while developers focus on what matters — building great products. With ZeroDB powering the data layer and multimodal AI handling everything from voice to video, the future of development is here.',
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
          'Ship faster with AI Native Lab. Our platform connects you to the most powerful AI models on the planet — all through a single API. Text to speech, image generation, video creation, and autonomous coding agents. Start building today.',
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
          'Introducing Cody — your AI-powered full-stack engineer. Cody writes production-ready code using test-driven development, handles pull requests, and deploys to production autonomously. Built by AI Native Lab for developers who want to ship 10x faster.',
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
          'Create an inspiring, upbeat electronic track with ambient synth pads, a driving four-on-the-floor beat, and a soaring melodic hook. Genre: future bass meets lo-fi. Mood: optimistic and forward-looking. Perfect for a tech product launch video. Duration: 30 seconds.',
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
        endpoint: '/api/v1/embeddings',
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
        endpoint: '/api/v1/embeddings',
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
        endpoint: '/api/v1/embeddings',
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

  /**
   * Generate URL-friendly slug from model name (Refs #566)
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// Export singleton instance
export const modelAggregatorService = new ModelAggregatorService();
