/**
 * Model Aggregator Service
 * Aggregates AI models from multiple backend API endpoints
 * Transforms responses into unified UnifiedAIModel format
 */

import apiClient from './api-client';
import { getThumbnailUrl } from './utils/thumbnail-generator';

export type ModelCategory = 'All' | 'Image' | 'Video' | 'Audio' | 'Coding' | 'Embedding';

export interface ModelParameter {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
  description: string;
  min?: number;
  max?: number;
  options?: unknown[];
}

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
    unit: string;
  };

  // Technical Details
  endpoint: string;
  method: 'GET' | 'POST';
  parameters?: ModelParameter[];

  // Metadata
  is_default?: boolean;
  is_premium?: boolean;
  speed?: string;
  quality?: string;

  // API Integration
  example_request?: string;
  example_response?: string;

  // Documentation
  readme?: string;

  // Example prompts for playground
  examplePrompts?: string[];
}

// API Response Types
interface ChatModelResponse {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  available: boolean;
}

interface ChatModelsData {
  models?: ChatModelResponse[];
}

interface EmbeddingModelResponse {
  id: string;
  dimensions: number;
  description?: string;
  speed: string;
  loaded: boolean;
}

/**
 * ModelAggregatorService
 * Fetches and transforms models from multiple sources
 */
export class ModelAggregatorService {
  /**
   * Fetch chat/text completion models from /v1/models
   */
  async fetchChatModels(): Promise<UnifiedAIModel[]> {
    try {
      const response = await apiClient.get<ChatModelsData>('/v1/models');
      const models = response.data.models || [];

      return models.map(model => this.transformChatModel(model));
    } catch (error) {
      console.error('Error fetching chat models:', error);
      throw error;
    }
  }

  /**
   * Fetch embedding models from /v1/public/embeddings/models
   */
  async fetchEmbeddingModels(): Promise<UnifiedAIModel[]> {
    try {
      const response = await apiClient.get<EmbeddingModelResponse[]>('/v1/public/embeddings/models');
      const models = Array.isArray(response.data) ? response.data : [];

      return models.map((model, index) => this.transformEmbeddingModel(model, index === 0));
    } catch (error) {
      console.error('Error fetching embedding models:', error);
      throw error;
    }
  }

  /**
   * Return hardcoded image generation models
   */
  async fetchImageModels(): Promise<UnifiedAIModel[]> {
    return [
      {
        id: 'qwen-image-edit',
        slug: 'qwen-image-edit',
        name: 'Qwen Image Edit',
        provider: 'Qwen',
        category: 'Image',
        capabilities: ['image-generation', 'text-to-image'],
        description: 'High-quality image generation with LoRA style transfer support',
        thumbnail_url: getThumbnailUrl({
          provider: 'Qwen',
          category: 'Image',
        }),
        endpoint: '/v1/multimodal/image',
        method: 'POST',
        pricing: {
          credits: 50,
          usd: 0.025,
          unit: 'per image',
        },
        examplePrompts: [
          'a futuristic cyberpunk city at night with neon lights reflecting on wet streets, ultra detailed, 8k',
          'majestic dragon perched on a mountain peak during golden hour, fantasy art style, highly detailed',
          'cozy coffee shop interior with warm lighting, wooden furniture, and plants by the window, photorealistic',
        ],
        parameters: [
          {
            name: 'prompt',
            type: 'string',
            required: true,
            description: 'Image description (max 2000 chars)',
          },
          {
            name: 'width',
            type: 'integer',
            required: false,
            default: 1024,
            min: 512,
            max: 2048,
            description: 'Image width in pixels',
          },
          {
            name: 'height',
            type: 'integer',
            required: false,
            default: 1024,
            min: 512,
            max: 2048,
            description: 'Image height in pixels',
          },
          {
            name: 'style',
            type: 'string',
            required: false,
            description: 'Optional LoRA style',
          },
        ],
      },
    ];
  }

  /**
   * Return hardcoded video generation models
   */
  async fetchVideoModels(): Promise<UnifiedAIModel[]> {
    return [
      // Alibaba Wan 2.2 (default i2v)
      {
        id: 'wan22-i2v',
        slug: 'alibaba-wan-22-i2v-720p',
        name: 'Alibaba Wan 2.2 I2V 720p',
        provider: 'Alibaba',
        category: 'Video',
        capabilities: ['image-to-video', 'video-generation'],
        description: 'Wan 2.2 is an open-source AI video generation model that utilizes a diffusion transformer architecture and a novel 3D spatio-temporal VAE for image-to-video generation',
        thumbnail_url: 'https://image.ainative.studio/asset/alibaba/wan-2i2v720.png',
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
        examplePrompts: [
          'cinematic shot: slow-tracking camera glides parallel to a giant white origami boat floating gracefully through a tranquil underground cave river',
          'a serene mountain landscape with morning mist rolling over the peaks, camera slowly panning left to reveal a hidden waterfall',
          'close-up of delicate cherry blossom petals gently falling in slow motion against a soft bokeh background',
        ],
        parameters: [
          {
            name: 'image',
            type: 'string',
            required: true,
            description: 'Source image URL',
          },
          {
            name: 'prompt',
            type: 'string',
            required: true,
            description: 'Motion description',
          },
          {
            name: 'duration',
            type: 'integer',
            required: false,
            default: 8,
            options: [5, 8, 10, 15],
            description: 'Video duration in seconds',
          },
          {
            name: 'num_inference_steps',
            type: 'integer',
            required: false,
            default: 40,
            min: 1,
            max: 100,
            description: 'Quality control',
          },
          {
            name: 'guidance',
            type: 'number',
            required: false,
            default: 5,
            description: 'How closely to follow prompt',
          },
        ],
        example_request: `curl -X POST https://api.ainative.studio/v1/multimodal/video/i2v \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -d '{
    "input": {
      "prompt": "cinematic shot: slow-tracking camera glides parallel to a giant white origami boat...",
      "image": "https://image.ainative.studio/asset/alibaba/wan-2i2v720.png"
    },
    "num_inference_steps": 40,
    "guidance": 5,
    "size": "1280*720",
    "duration": 8
  }'`,
      },
      // Seedance i2v
      {
        id: 'seedance-i2v',
        slug: 'seedance-i2v',
        name: 'Seedance I2V',
        provider: 'Seedance',
        category: 'Video',
        capabilities: ['image-to-video', 'video-generation'],
        description: 'High-quality image-to-video generation with Seedance AI',
        thumbnail_url: getThumbnailUrl({
          provider: 'Seedance',
          category: 'Video',
        }),
        endpoint: '/v1/multimodal/video/i2v',
        method: 'POST',
        pricing: {
          credits: 520,
          usd: 0.26,
          unit: 'per 5s video',
        },
        parameters: [
          {
            name: 'image_url',
            type: 'string',
            required: true,
            description: 'Source image URL',
          },
          {
            name: 'motion_prompt',
            type: 'string',
            required: true,
            description: 'Motion description',
          },
          {
            name: 'provider',
            type: 'string',
            required: true,
            default: 'seedance',
            description: 'Provider identifier',
          },
        ],
      },
      // Sora2 (premium i2v)
      {
        id: 'sora2-i2v',
        slug: 'sora2-i2v',
        name: 'Sora2 I2V',
        provider: 'Sora',
        category: 'Video',
        capabilities: ['image-to-video', 'video-generation'],
        description: 'Premium cinematic quality image-to-video generation',
        thumbnail_url: getThumbnailUrl({
          provider: 'Sora',
          category: 'Video',
        }),
        endpoint: '/v1/multimodal/video/i2v',
        method: 'POST',
        is_premium: true,
        quality: 'Cinematic',
        pricing: {
          credits: 800,
          usd: 0.40,
          unit: 'per 4s video',
        },
        parameters: [
          {
            name: 'image_url',
            type: 'string',
            required: true,
            description: 'Source image URL',
          },
          {
            name: 'motion_prompt',
            type: 'string',
            required: true,
            description: 'Motion description',
          },
          {
            name: 'provider',
            type: 'string',
            required: true,
            default: 'sora2',
            description: 'Provider identifier',
          },
        ],
      },
      // Text-to-Video
      {
        id: 't2v',
        slug: 'text-to-video',
        name: 'Text-to-Video',
        provider: 'Generic T2V',
        category: 'Video',
        capabilities: ['text-to-video', 'video-generation'],
        description: 'Generate HD videos from text descriptions',
        thumbnail_url: getThumbnailUrl({
          provider: 'Generic T2V',
          category: 'Video',
        }),
        endpoint: '/v1/multimodal/video/t2v',
        method: 'POST',
        is_premium: true,
        pricing: {
          credits: 1000,
          usd: 0.50,
          unit: 'per video',
        },
        parameters: [
          {
            name: 'prompt',
            type: 'string',
            required: true,
            description: 'Video description (max 1000 chars)',
          },
          {
            name: 'duration',
            type: 'integer',
            required: false,
            default: 5,
            min: 1,
            max: 10,
            description: 'Video duration in seconds',
          },
        ],
      },
      // CogVideoX
      {
        id: 'cogvideox',
        slug: 'cogvideox-2b',
        name: 'CogVideoX-2B',
        provider: 'CogVideo',
        category: 'Video',
        capabilities: ['text-to-video', 'video-generation'],
        description: 'Advanced text-to-video generation with CogVideoX architecture',
        thumbnail_url: getThumbnailUrl({
          provider: 'CogVideo',
          category: 'Video',
        }),
        endpoint: '/v1/multimodal/video/cogvideox',
        method: 'POST',
        pricing: {
          credits: 800,
          usd: 0.40,
          unit: 'per video',
        },
        parameters: [
          {
            name: 'prompt',
            type: 'string',
            required: true,
            description: 'Video description',
          },
          {
            name: 'num_frames',
            type: 'integer',
            required: false,
            default: 49,
            options: [17, 33, 49],
            description: 'Number of frames to generate',
          },
          {
            name: 'guidance_scale',
            type: 'number',
            required: false,
            description: 'Control prompt adherence',
          },
          {
            name: 'inference_steps',
            type: 'integer',
            required: false,
            description: 'Quality control',
          },
        ],
      },
    ];
  }

  /**
   * Return hardcoded audio models
   */
  async fetchAudioModels(): Promise<UnifiedAIModel[]> {
    return [
      // Whisper Transcription
      {
        id: 'whisper-transcription',
        slug: 'whisper-transcription',
        name: 'Whisper Transcription',
        provider: 'OpenAI',
        category: 'Audio',
        capabilities: ['audio', 'transcription', 'speech-to-text'],
        description: 'Convert audio/video to text in 99+ languages',
        thumbnail_url: getThumbnailUrl({
          provider: 'OpenAI',
          category: 'Audio',
        }),
        endpoint: '/v1/audio/transcriptions',
        method: 'POST',
        parameters: [
          {
            name: 'file',
            type: 'file',
            required: true,
            description: 'Audio file to transcribe',
          },
          {
            name: 'language',
            type: 'string',
            required: false,
            description: 'Language code (e.g., en, es, fr)',
          },
        ],
      },
      // Whisper Translation
      {
        id: 'whisper-translation',
        slug: 'whisper-translation',
        name: 'Whisper Translation',
        provider: 'OpenAI',
        category: 'Audio',
        capabilities: ['audio', 'translation'],
        description: 'Translate any language audio to English text',
        thumbnail_url: getThumbnailUrl({
          provider: 'OpenAI',
          category: 'Audio',
        }),
        endpoint: '/v1/audio/translations',
        method: 'POST',
        parameters: [
          {
            name: 'file',
            type: 'file',
            required: true,
            description: 'Audio file to translate',
          },
        ],
      },
      // Text-to-Speech
      {
        id: 'tts',
        slug: 'text-to-speech',
        name: 'Text-to-Speech',
        provider: 'OpenAI',
        category: 'Audio',
        capabilities: ['audio-generation', 'text-to-speech'],
        description: 'Generate natural-sounding speech from text',
        thumbnail_url: getThumbnailUrl({
          provider: 'OpenAI',
          category: 'Audio',
        }),
        endpoint: '/v1/audio/speech',
        method: 'POST',
        parameters: [
          {
            name: 'text',
            type: 'string',
            required: true,
            description: 'Text to convert to speech',
          },
          {
            name: 'voice',
            type: 'string',
            required: false,
            description: 'Voice option',
          },
        ],
      },
    ];
  }

  /**
   * Aggregate all models from all sources
   */
  async aggregateAllModels(): Promise<UnifiedAIModel[]> {
    const results = await Promise.allSettled([
      this.fetchChatModels(),
      this.fetchEmbeddingModels(),
      this.fetchImageModels(),
      this.fetchVideoModels(),
      this.fetchAudioModels(),
    ]);

    const allModels: UnifiedAIModel[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allModels.push(...result.value);
      } else {
        console.error('Failed to fetch models:', result.reason);
      }
    });

    return allModels;
  }

  // Private transformation methods

  private transformChatModel(model: ChatModelResponse): UnifiedAIModel {
    const provider = this.getProviderFromOwner(model.owned_by);
    const modelInfo = this.getChatModelInfo(model.id);

    return {
      id: model.id,
      slug: this.generateSlug(model.id),
      name: modelInfo.name,
      provider,
      category: 'Coding',
      capabilities: modelInfo.capabilities,
      description: modelInfo.description,
      thumbnail_url: getThumbnailUrl({
        provider,
        category: 'Coding',
      }),
      endpoint: '/v1/chat/completions',
      method: 'POST',
      parameters: [
        {
          name: 'messages',
          type: 'array',
          required: true,
          description: 'Conversation history',
        },
        {
          name: 'temperature',
          type: 'number',
          required: false,
          default: 1,
          min: 0,
          max: 2,
          description: 'Sampling temperature',
        },
        {
          name: 'max_tokens',
          type: 'integer',
          required: false,
          description: 'Maximum tokens to generate',
        },
      ],
    };
  }

  private transformEmbeddingModel(model: EmbeddingModelResponse, isDefault: boolean): UnifiedAIModel {
    const name = model.id.split('/').pop() || model.id;

    return {
      id: model.id,
      slug: this.generateSlug(name),
      name,
      provider: 'BAAI',
      category: 'Embedding',
      capabilities: ['embedding', 'semantic-search'],
      description: model.description || `${model.dimensions}-dimensional embedding model`,
      thumbnail_url: getThumbnailUrl({
        provider: 'BAAI',
        category: 'Embedding',
      }),
      endpoint: '/v1/embeddings',
      method: 'POST',
      speed: model.speed,
      is_default: isDefault,
      parameters: [
        {
          name: 'input',
          type: 'string',
          required: true,
          description: 'Text to embed',
        },
        {
          name: 'model',
          type: 'string',
          required: false,
          default: model.id,
          description: 'Model identifier',
        },
      ],
    };
  }

  private getProviderFromOwner(ownedBy: string): string {
    const providerMap: Record<string, string> = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      meta: 'Meta',
      google: 'Google',
    };

    return providerMap[ownedBy.toLowerCase()] || ownedBy;
  }

  private getChatModelInfo(modelId: string): { name: string; capabilities: string[]; description: string } {
    // GPT-4 variants
    if (modelId.startsWith('gpt-4')) {
      return {
        name: 'GPT-4',
        capabilities: ['text-generation', 'reasoning', 'code', 'vision'],
        description: "OpenAI's most capable model for complex reasoning and coding tasks",
      };
    }

    // GPT-3.5 variants
    if (modelId.startsWith('gpt-3.5')) {
      return {
        name: 'GPT-3.5 Turbo',
        capabilities: ['text-generation', 'code'],
        description: 'Fast conversations and simple tasks',
      };
    }

    // Claude variants
    if (modelId.includes('claude')) {
      return {
        name: 'Claude 3.5 Sonnet',
        capabilities: ['text-generation', 'reasoning', 'code', 'vision'],
        description: 'Long context window, detailed analysis, and advanced reasoning capabilities',
      };
    }

    // Default fallback
    return {
      name: modelId,
      capabilities: ['text-generation'],
      description: 'AI language model',
    };
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// Export singleton instance
export const modelAggregatorService = new ModelAggregatorService();
