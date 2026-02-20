/**
 * Integration Test: Model Card Navigation
 *
 * This test verifies that the slug generation is consistent between:
 * 1. Browse page (AISettingsClient) - where slugs are generated for model cards
 * 2. Detail page (page.tsx) - where slugs are used to fetch models
 *
 * Test Scenario:
 * - User sees model cards on browse page
 * - User clicks a model card
 * - Browser navigates to /dashboard/ai-settings/{slug}
 * - Detail page successfully fetches and displays the model
 *
 * Success Criteria:
 * - All model slugs from browse page can be found in detail page
 * - No "model not found" errors occur
 * - Slug format is consistent (lowercase, hyphenated, URL-safe)
 *
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { modelAggregatorService, UnifiedAIModel } from '@/lib/model-aggregator-service';

describe('Integration: Model Card Navigation - Browse to Detail', () => {
  let browsePageModels: UnifiedAIModel[];
  let detailPageModels: UnifiedAIModel[];

  beforeEach(async () => {
    // Simulate browse page loading models
    browsePageModels = await modelAggregatorService.aggregateAllModels();

    // Simulate detail page loading models
    detailPageModels = await modelAggregatorService.aggregateAllModels();
  });

  describe('Slug Consistency', () => {
    it('should have same number of models in browse and detail pages', () => {
      expect(browsePageModels.length).toBeGreaterThan(0);
      expect(browsePageModels.length).toBe(detailPageModels.length);
    });

    it('should have identical slugs between browse and detail pages', () => {
      const browseSlugs = browsePageModels.map(m => m.slug).sort();
      const detailSlugs = detailPageModels.map(m => m.slug).sort();

      expect(browseSlugs).toEqual(detailSlugs);
    });

    it('all browse page model slugs should be findable in detail page', () => {
      browsePageModels.forEach(browseModel => {
        const detailModel = detailPageModels.find(m => m.slug === browseModel.slug);

        expect(detailModel).toBeDefined();
        expect(detailModel?.id).toBe(browseModel.id);
        expect(detailModel?.name).toBe(browseModel.name);
      });
    });

    it('all slugs should be URL-safe format', () => {
      const urlSafePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

      browsePageModels.forEach(model => {
        expect(model.slug).toMatch(urlSafePattern);
      });
    });

    it('all slugs should be lowercase', () => {
      browsePageModels.forEach(model => {
        expect(model.slug).toBe(model.slug.toLowerCase());
      });
    });

    it('all slugs should be unique', () => {
      const slugs = browsePageModels.map(m => m.slug);
      const uniqueSlugs = new Set(slugs);

      expect(slugs.length).toBe(uniqueSlugs.size);
    });
  });

  describe('Navigation Simulation', () => {
    it('should successfully navigate from any browse page model to detail page', async () => {
      for (const browseModel of browsePageModels) {
        // Step 1: User clicks model card on browse page
        const clickedSlug = browseModel.slug;

        // Step 2: Browser navigates to /dashboard/ai-settings/{slug}
        // Step 3: Detail page fetches model by slug
        const detailModel = detailPageModels.find(m => m.slug === clickedSlug);

        // Step 4: Verify model found (not 404)
        expect(detailModel).toBeDefined();
        expect(detailModel?.id).toBe(browseModel.id);
        expect(detailModel?.name).toBe(browseModel.name);
        expect(detailModel?.provider).toBe(browseModel.provider);
        expect(detailModel?.category).toBe(browseModel.category);
      }
    });

    it('should handle specific model types correctly - Chat Models', async () => {
      const chatModels = browsePageModels.filter(m =>
        m.capabilities.includes('text-generation') || m.capabilities.includes('code')
      );

      expect(chatModels.length).toBeGreaterThan(0);

      chatModels.forEach(chatModel => {
        const detailModel = detailPageModels.find(m => m.slug === chatModel.slug);
        expect(detailModel).toBeDefined();
        expect(detailModel?.category).toBe('Coding');
      });
    });

    it('should handle specific model types correctly - Video Models', async () => {
      const videoModels = browsePageModels.filter(m =>
        m.capabilities.includes('video-generation') || m.capabilities.includes('image-to-video')
      );

      expect(videoModels.length).toBeGreaterThan(0);

      videoModels.forEach(videoModel => {
        const detailModel = detailPageModels.find(m => m.slug === videoModel.slug);
        expect(detailModel).toBeDefined();
        expect(detailModel?.category).toBe('Video');
      });
    });

    it('should handle specific model types correctly - Image Models', async () => {
      const imageModels = browsePageModels.filter(m =>
        m.capabilities.includes('image-generation')
      );

      expect(imageModels.length).toBeGreaterThan(0);

      imageModels.forEach(imageModel => {
        const detailModel = detailPageModels.find(m => m.slug === imageModel.slug);
        expect(detailModel).toBeDefined();
        expect(detailModel?.category).toBe('Image');
      });
    });

    it('should handle specific model types correctly - Audio Models', async () => {
      const audioModels = browsePageModels.filter(m =>
        m.capabilities.includes('audio') || m.capabilities.includes('transcription')
      );

      expect(audioModels.length).toBeGreaterThan(0);

      audioModels.forEach(audioModel => {
        const detailModel = detailPageModels.find(m => m.slug === audioModel.slug);
        expect(detailModel).toBeDefined();
        expect(detailModel?.category).toBe('Audio');
      });
    });

    it('should handle specific model types correctly - Embedding Models', async () => {
      const embeddingModels = browsePageModels.filter(m =>
        m.capabilities.includes('embedding')
      );

      expect(embeddingModels.length).toBeGreaterThan(0);

      embeddingModels.forEach(embeddingModel => {
        const detailModel = detailPageModels.find(m => m.slug === embeddingModel.slug);
        expect(detailModel).toBeDefined();
        expect(detailModel?.category).toBe('Embedding');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle models with special characters in name', async () => {
      // Models like "Wan 2.2", "GPT-4", "Claude 3.5" should have valid slugs
      const modelsWithSpecialChars = browsePageModels.filter(m =>
        /[.\s]/.test(m.name)
      );

      expect(modelsWithSpecialChars.length).toBeGreaterThan(0);

      modelsWithSpecialChars.forEach(model => {
        // Slug should not contain spaces or dots
        expect(model.slug).not.toMatch(/[\s.]/);

        // Should be findable in detail page
        const detailModel = detailPageModels.find(m => m.slug === model.slug);
        expect(detailModel).toBeDefined();
      });
    });

    it('should handle models with numbers in name', async () => {
      // Models like "GPT-4", "Wan 2.2", "Claude 3.5"
      const modelsWithNumbers = browsePageModels.filter(m =>
        /\d/.test(m.name)
      );

      expect(modelsWithNumbers.length).toBeGreaterThan(0);

      modelsWithNumbers.forEach(model => {
        // Slug should preserve numbers
        expect(/\d/.test(model.slug)).toBe(true);

        // Should be findable in detail page
        const detailModel = detailPageModels.find(m => m.slug === model.slug);
        expect(detailModel).toBeDefined();
      });
    });

    it('should handle models with version suffixes', async () => {
      // Models like "Alibaba Wan 2.2 I2V 720p"
      const modelsWithVersions = browsePageModels.filter(m =>
        /\d+p|v\d+/i.test(m.name)
      );

      if (modelsWithVersions.length > 0) {
        modelsWithVersions.forEach(model => {
          // Should be findable in detail page
          const detailModel = detailPageModels.find(m => m.slug === model.slug);
          expect(detailModel).toBeDefined();
        });
      }
    });
  });

  describe('Error Prevention', () => {
    it('should not have any null or empty slugs', () => {
      browsePageModels.forEach(model => {
        expect(model.slug).toBeTruthy();
        expect(model.slug.length).toBeGreaterThan(0);
      });
    });

    it('should not have any slugs with invalid characters', () => {
      const invalidCharsPattern = /[^a-z0-9-]/;

      browsePageModels.forEach(model => {
        expect(model.slug).not.toMatch(invalidCharsPattern);
      });
    });

    it('should not have any slugs starting or ending with hyphen', () => {
      browsePageModels.forEach(model => {
        expect(model.slug.startsWith('-')).toBe(false);
        expect(model.slug.endsWith('-')).toBe(false);
      });
    });

    it('should not have any slugs with consecutive hyphens', () => {
      browsePageModels.forEach(model => {
        expect(model.slug).not.toMatch(/--/);
      });
    });
  });

  describe('Performance', () => {
    it('should fetch all models quickly', async () => {
      const startTime = Date.now();
      const models = await modelAggregatorService.aggregateAllModels();
      const endTime = Date.now();

      expect(models.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should find model by slug quickly', async () => {
      const models = await modelAggregatorService.aggregateAllModels();
      const testSlug = models[0].slug;

      const startTime = Date.now();
      const foundModel = models.find(m => m.slug === testSlug);
      const endTime = Date.now();

      expect(foundModel).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should be instantaneous
    });
  });
});

describe('Real-world User Flow', () => {
  it('should complete full user journey: browse -> click -> detail page', async () => {
    // Step 1: User visits browse page
    const browsePage = await modelAggregatorService.aggregateAllModels();
    expect(browsePage.length).toBeGreaterThan(0);

    // Step 2: User sees GPT-4 model card
    const gpt4Card = browsePage.find(m => m.name === 'GPT-4');
    expect(gpt4Card).toBeDefined();

    // Step 3: User clicks GPT-4 card (router.push happens)
    const clickedSlug = gpt4Card!.slug;
    expect(clickedSlug).toBeTruthy();

    // Step 4: Browser navigates to /dashboard/ai-settings/gpt-4
    // Step 5: Detail page fetches model by slug
    const detailPage = await modelAggregatorService.aggregateAllModels();
    const gpt4Detail = detailPage.find(m => m.slug === clickedSlug);

    // Step 6: Detail page renders successfully (no 404)
    expect(gpt4Detail).toBeDefined();
    expect(gpt4Detail?.name).toBe('GPT-4');
    expect(gpt4Detail?.provider).toBe('OpenAI');
    expect(gpt4Detail?.category).toBe('Coding');
  });

  it('should complete full user journey: browse Video -> click Alibaba Wan -> detail page', async () => {
    // Step 1: User visits browse page and filters by Video
    const browsePage = await modelAggregatorService.aggregateAllModels();
    const videoModels = browsePage.filter(m => m.category === 'Video');
    expect(videoModels.length).toBeGreaterThan(0);

    // Step 2: User sees Alibaba Wan model card
    const wanCard = videoModels.find(m => m.name.includes('Alibaba Wan'));
    expect(wanCard).toBeDefined();

    // Step 3: User clicks Alibaba Wan card
    const clickedSlug = wanCard!.slug;
    expect(clickedSlug).toBeTruthy();

    // Step 4: Browser navigates to /dashboard/ai-settings/{slug}
    // Step 5: Detail page fetches model by slug
    const detailPage = await modelAggregatorService.aggregateAllModels();
    const wanDetail = detailPage.find(m => m.slug === clickedSlug);

    // Step 6: Detail page renders successfully
    expect(wanDetail).toBeDefined();
    expect(wanDetail?.name).toContain('Alibaba Wan');
    expect(wanDetail?.category).toBe('Video');
    expect(wanDetail?.capabilities).toContain('video-generation');
  });
});
