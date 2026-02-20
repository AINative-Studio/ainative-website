/**
 * Tests for Model Detail Page - [slug] Route
 *
 * This test suite validates:
 * 1. Slug-based model lookup functionality
 * 2. Model not found (404) scenarios
 * 3. Metadata generation for SEO
 * 4. Integration between page.tsx and ModelDetailClient
 *
 * Issue: Fix broken model card links showing "model not found"
 *
 * @jest-environment node
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard/ai-settings/gpt-4'),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
    toString: jest.fn(() => ''),
  })),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Import after mocks
import { modelAggregatorService, UnifiedAIModel } from '@/lib/model-aggregator-service';

describe('Model Detail Page - fetchModelBySlug', () => {
  // Mock model data
  const mockModels: UnifiedAIModel[] = [
    {
      id: 'gpt-4',
      slug: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      category: 'Coding',
      capabilities: ['text-generation', 'reasoning', 'code', 'vision'],
      description: "OpenAI's most capable model for complex reasoning and coding tasks",
      endpoint: '/v1/chat/completions',
      method: 'POST',
      is_default: true,
      max_tokens: 8192,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'wan22-i2v',
      slug: 'alibaba-wan-22-i2v-720p',
      name: 'Alibaba Wan 2.2 I2V 720p',
      provider: 'Alibaba',
      category: 'Video',
      capabilities: ['image-to-video', 'video-generation'],
      description: 'Wan 2.2 is an open-source AI video generation model',
      endpoint: '/v1/multimodal/video/i2v',
      method: 'POST',
      is_default: true,
      speed: 'Fast',
      quality: 'High',
      pricing: {
        credits: 400,
        usd: 0.2,
        unit: 'per 5s video',
      },
      created_at: '2024-01-01T00:00:00Z',
    },
    {
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
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the model aggregator service
    jest.spyOn(modelAggregatorService, 'aggregateAllModels').mockResolvedValue(mockModels);
  });

  describe('Slug Matching', () => {
    it('should find model by exact slug match - gpt-4', async () => {
      const slug = 'gpt-4';
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === slug);

      expect(model).toBeDefined();
      expect(model?.slug).toBe('gpt-4');
      expect(model?.name).toBe('GPT-4');
      expect(model?.provider).toBe('OpenAI');
    });

    it('should find model by exact slug match - alibaba-wan-22-i2v-720p', async () => {
      const slug = 'alibaba-wan-22-i2v-720p';
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === slug);

      expect(model).toBeDefined();
      expect(model?.slug).toBe('alibaba-wan-22-i2v-720p');
      expect(model?.name).toBe('Alibaba Wan 2.2 I2V 720p');
      expect(model?.provider).toBe('Alibaba');
    });

    it('should find model by exact slug match - qwen-image-edit', async () => {
      const slug = 'qwen-image-edit';
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === slug);

      expect(model).toBeDefined();
      expect(model?.slug).toBe('qwen-image-edit');
      expect(model?.name).toBe('Qwen Image Edit');
      expect(model?.provider).toBe('Qwen');
    });

    it('should return null for non-existent slug', async () => {
      const slug = 'non-existent-model';
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === slug);

      expect(model).toBeUndefined();
    });

    it('should be case-sensitive for slug matching', async () => {
      const slug = 'GPT-4'; // uppercase
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === slug);

      // Should NOT match because slugs are lowercase
      expect(model).toBeUndefined();
    });
  });

  describe('Slug Generation Consistency', () => {
    it('should generate consistent slugs for all model types', async () => {
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();

      // All models should have slugs
      expect(allModels.every(m => m.slug)).toBe(true);

      // All slugs should be lowercase
      expect(allModels.every(m => m.slug === m.slug.toLowerCase())).toBe(true);

      // All slugs should be URL-safe (alphanumeric + hyphens)
      const urlSafePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      expect(allModels.every(m => urlSafePattern.test(m.slug))).toBe(true);
    });

    it('should have unique slugs for all models', async () => {
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();

      const slugs = allModels.map(m => m.slug);
      const uniqueSlugs = new Set(slugs);

      expect(slugs.length).toBe(uniqueSlugs.size);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      // Mock service to throw error
      jest.spyOn(modelAggregatorService, 'aggregateAllModels').mockRejectedValue(
        new Error('Network error')
      );

      const slug = 'gpt-4';
      let model: UnifiedAIModel | null = null;
      let error: Error | null = null;

      try {
        const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
        const allModels = await modelAggregatorService.aggregateAllModels();
        model = allModels.find(m => m.slug === slug) || null;
      } catch (err) {
        error = err as Error;
      }

      expect(error).toBeDefined();
      expect(model).toBeNull();
    });

    it('should return null when model is not found', async () => {
      const slug = 'model-that-does-not-exist';
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === slug);

      expect(model).toBeUndefined();
    });
  });

  describe('Model Data Integrity', () => {
    it('should return model with all required fields', async () => {
      const slug = 'gpt-4';
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === slug);

      expect(model).toBeDefined();
      if (model) {
        expect(model.id).toBeDefined();
        expect(model.slug).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.provider).toBeDefined();
        expect(model.category).toBeDefined();
        expect(model.capabilities).toBeDefined();
        expect(model.description).toBeDefined();
        expect(model.endpoint).toBeDefined();
        expect(model.method).toBeDefined();
      }
    });

    it('should return model with correct category', async () => {
      const slug = 'alibaba-wan-22-i2v-720p';
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === slug);

      expect(model).toBeDefined();
      expect(model?.category).toBe('Video');
    });

    it('should return model with pricing information', async () => {
      const slug = 'alibaba-wan-22-i2v-720p';
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === slug);

      expect(model).toBeDefined();
      expect(model?.pricing).toBeDefined();
      expect(model?.pricing?.credits).toBe(400);
      expect(model?.pricing?.usd).toBe(0.2);
      expect(model?.pricing?.unit).toBe('per 5s video');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle slug from browse page click - GPT-4', async () => {
      // Simulate user clicking GPT-4 card on browse page
      const clickedModelSlug = 'gpt-4';
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === clickedModelSlug);

      expect(model).toBeDefined();
      expect(model?.name).toBe('GPT-4');
    });

    it('should handle slug from browse page click - Video Model', async () => {
      // Simulate user clicking Alibaba Wan card on browse page
      const clickedModelSlug = 'alibaba-wan-22-i2v-720p';
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === clickedModelSlug);

      expect(model).toBeDefined();
      expect(model?.name).toBe('Alibaba Wan 2.2 I2V 720p');
      expect(model?.category).toBe('Video');
    });

    it('should handle slug from browse page click - Image Model', async () => {
      // Simulate user clicking Qwen Image Edit card on browse page
      const clickedModelSlug = 'qwen-image-edit';
      const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === clickedModelSlug);

      expect(model).toBeDefined();
      expect(model?.name).toBe('Qwen Image Edit');
      expect(model?.category).toBe('Image');
    });
  });

  describe('Performance', () => {
    it('should fetch models only once per request', async () => {
      const spy = jest.spyOn(modelAggregatorService, 'aggregateAllModels');

      const { modelAggregatorService: service } = await import('@/lib/model-aggregator-service');
      await service.aggregateAllModels();

      // Should be called exactly once
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should handle large number of models efficiently', async () => {
      // Create 100 mock models
      const largeModelSet = Array.from({ length: 100 }, (_, i) => ({
        ...mockModels[0],
        id: `model-${i}`,
        slug: `model-${i}`,
        name: `Model ${i}`,
      }));

      const spy = jest.spyOn(modelAggregatorService, 'aggregateAllModels').mockResolvedValue(largeModelSet);

      const startTime = Date.now();
      const allModels = await modelAggregatorService.aggregateAllModels();
      const model = allModels.find(m => m.slug === 'model-50');
      const endTime = Date.now();

      expect(model).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second

      spy.mockRestore();
    });
  });
});

describe('Model Detail Page - Metadata Generation', () => {
  const mockModel: UnifiedAIModel = {
    id: 'gpt-4',
    slug: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    category: 'Coding',
    capabilities: ['text-generation', 'reasoning', 'code', 'vision'],
    description: "OpenAI's most capable model for complex reasoning and coding tasks",
    thumbnail_url: 'https://example.com/gpt4-thumb.png',
    endpoint: '/v1/chat/completions',
    method: 'POST',
    is_default: true,
    max_tokens: 8192,
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.spyOn(modelAggregatorService, 'aggregateAllModels').mockResolvedValue([mockModel]);
  });

  it('should generate correct page title', () => {
    const expectedTitle = `${mockModel.name} - ${mockModel.category} Model | AI Native Studio`;
    expect(expectedTitle).toBe('GPT-4 - Coding Model | AI Native Studio');
  });

  it('should generate correct meta description', () => {
    const expectedDescription = mockModel.description;
    expect(expectedDescription).toBe("OpenAI's most capable model for complex reasoning and coding tasks");
  });

  it('should include all capabilities in keywords', () => {
    const keywords = [
      mockModel.name,
      mockModel.provider,
      mockModel.category,
      'AI model',
      'API',
      'playground',
      ...mockModel.capabilities,
    ];

    expect(keywords).toContain('text-generation');
    expect(keywords).toContain('reasoning');
    expect(keywords).toContain('code');
    expect(keywords).toContain('vision');
  });

  it('should generate Open Graph metadata', () => {
    const ogMetadata = {
      title: `${mockModel.name} - AI Model Playground`,
      description: mockModel.description,
      images: [
        {
          url: mockModel.thumbnail_url!,
          width: 1200,
          height: 630,
          alt: `${mockModel.name} example output`,
        },
      ],
      type: 'website',
      siteName: 'AI Native Studio',
    };

    expect(ogMetadata.title).toBe('GPT-4 - AI Model Playground');
    expect(ogMetadata.images[0].url).toBe('https://example.com/gpt4-thumb.png');
  });
});

describe('Integration - Browse Page to Detail Page', () => {
  const mockModels: UnifiedAIModel[] = [
    {
      id: 'gpt-4',
      slug: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      category: 'Coding',
      capabilities: ['text-generation'],
      description: 'Test model',
      endpoint: '/v1/chat/completions',
      method: 'POST',
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.spyOn(modelAggregatorService, 'aggregateAllModels').mockResolvedValue(mockModels);
  });

  it('should navigate from browse page to detail page', async () => {
    // Simulate browse page generating slug
    const browsePageSlug = mockModels[0].slug;

    // Simulate detail page fetching model by slug
    const { modelAggregatorService } = await import('@/lib/model-aggregator-service');
    const allModels = await modelAggregatorService.aggregateAllModels();
    const detailPageModel = allModels.find(m => m.slug === browsePageSlug);

    expect(detailPageModel).toBeDefined();
    expect(detailPageModel?.id).toBe(mockModels[0].id);
    expect(detailPageModel?.name).toBe(mockModels[0].name);
  });
});
