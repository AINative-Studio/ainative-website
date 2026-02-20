/**
 * Unit Tests for Thumbnail Generator Utility
 *
 * Tests thumbnail generation logic with comprehensive coverage including:
 * - Provider-based thumbnail generation
 * - Category-based thumbnail fallbacks
 * - SVG data URL generation
 * - Thumbnail type detection
 * - Edge cases and error handling
 *
 * Target Coverage: >= 80%
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import {
  getThumbnailUrl,
  generateProviderThumbnail,
  generateCategoryThumbnail,
  isPlaceholderThumbnail,
  getThumbnailType,
  PROVIDER_COLORS,
  CATEGORY_COLORS,
} from '../thumbnail-generator';
import type { ModelCategory } from '../../model-aggregator';

describe('Thumbnail Generator Utility', () => {
  describe('PROVIDER_COLORS', () => {
    it('should have OpenAI colors defined', () => {
      expect(PROVIDER_COLORS.OpenAI).toBeDefined();
      expect(PROVIDER_COLORS.OpenAI.primary).toBe('#10A37F');
      expect(PROVIDER_COLORS.OpenAI.secondary).toBe('#1A7F64');
    });

    it('should have Anthropic colors defined', () => {
      expect(PROVIDER_COLORS.Anthropic).toBeDefined();
      expect(PROVIDER_COLORS.Anthropic.primary).toBe('#D97757');
      expect(PROVIDER_COLORS.Anthropic.secondary).toBe('#C4613D');
    });

    it('should have Generic fallback colors', () => {
      expect(PROVIDER_COLORS.Generic).toBeDefined();
      expect(PROVIDER_COLORS.Generic.primary).toBe('#8C8C8C');
      expect(PROVIDER_COLORS.Generic.secondary).toBe('#595959');
    });

    it('should have all required providers', () => {
      const requiredProviders = [
        'OpenAI',
        'Anthropic',
        'Alibaba',
        'Qwen',
        'Seedance',
        'Sora',
        'CogVideo',
        'BAAI',
        'Generic',
        'Generic T2V',
      ];

      requiredProviders.forEach((provider) => {
        expect(PROVIDER_COLORS[provider]).toBeDefined();
        expect(PROVIDER_COLORS[provider].primary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(PROVIDER_COLORS[provider].secondary).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('CATEGORY_COLORS', () => {
    it('should have all category colors defined', () => {
      const categories: ModelCategory[] = [
        'All',
        'Coding',
        'Image',
        'Video',
        'Audio',
        'Embedding',
      ];

      categories.forEach((category) => {
        expect(CATEGORY_COLORS[category]).toBeDefined();
        expect(CATEGORY_COLORS[category].primary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(CATEGORY_COLORS[category].secondary).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have unique colors for each category', () => {
      const categories: ModelCategory[] = [
        'All',
        'Coding',
        'Image',
        'Video',
        'Audio',
        'Embedding',
      ];

      const primaryColors = categories.map(
        (cat) => CATEGORY_COLORS[cat].primary
      );
      const uniquePrimary = new Set(primaryColors);

      expect(uniquePrimary.size).toBeGreaterThan(1);
    });
  });

  describe('getThumbnailUrl', () => {
    describe('Tier 1: Use provided thumbnail URL', () => {
      it('should return provided thumbnail URL when available', () => {
        const url = 'https://example.com/image.png';
        const result = getThumbnailUrl({ thumbnailUrl: url });
        expect(result).toBe(url);
      });

      it('should prioritize thumbnail URL over provider', () => {
        const url = 'https://example.com/image.png';
        const result = getThumbnailUrl({
          thumbnailUrl: url,
          provider: 'OpenAI',
        });
        expect(result).toBe(url);
      });

      it('should prioritize thumbnail URL over category', () => {
        const url = 'https://example.com/image.png';
        const result = getThumbnailUrl({
          thumbnailUrl: url,
          category: 'Coding',
        });
        expect(result).toBe(url);
      });

      it('should ignore empty string thumbnail URLs', () => {
        const result = getThumbnailUrl({
          thumbnailUrl: '',
          provider: 'OpenAI',
        });
        expect(result).not.toBe('');
        expect(isPlaceholderThumbnail(result)).toBe(true);
      });

      it('should ignore whitespace-only thumbnail URLs', () => {
        const result = getThumbnailUrl({
          thumbnailUrl: '   ',
          provider: 'OpenAI',
        });
        expect(isPlaceholderThumbnail(result)).toBe(true);
      });
    });

    describe('Tier 2: Generate provider-branded placeholder', () => {
      it('should generate provider placeholder for OpenAI', () => {
        const result = getThumbnailUrl({ provider: 'OpenAI' });
        expect(isPlaceholderThumbnail(result)).toBe(true);
        expect(result).toContain('data:image/svg+xml;base64');
      });

      it('should generate provider placeholder for Anthropic', () => {
        const result = getThumbnailUrl({ provider: 'Anthropic' });
        expect(isPlaceholderThumbnail(result)).toBe(true);
      });

      it('should use provider over category', () => {
        const result = getThumbnailUrl({
          provider: 'OpenAI',
          category: 'Coding',
        });
        expect(isPlaceholderThumbnail(result)).toBe(true);
        // getThumbnailType checks font-size to distinguish types
        // Provider placeholders use font-size="72"
        const decoded = Buffer.from(
          result.replace('data:image/svg+xml;base64,', ''),
          'base64'
        ).toString('utf-8');
        expect(decoded).toContain('font-size="72"');
      });

      it('should handle unknown providers with Generic fallback', () => {
        const result = getThumbnailUrl({ provider: 'UnknownProvider' });
        expect(isPlaceholderThumbnail(result)).toBe(true);
      });

      it('should ignore empty provider strings', () => {
        const result = getThumbnailUrl({ provider: '', category: 'Coding' });
        expect(getThumbnailType(result)).toBe('category-placeholder');
      });

      it('should support custom initials', () => {
        const result = getThumbnailUrl({
          provider: 'OpenAI',
          initials: 'GPT',
        });
        expect(isPlaceholderThumbnail(result)).toBe(true);
      });
    });

    describe('Tier 3: Generate category-based placeholder', () => {
      it('should generate category placeholder for Coding', () => {
        const result = getThumbnailUrl({ category: 'Coding' });
        expect(isPlaceholderThumbnail(result)).toBe(true);
        expect(getThumbnailType(result)).toBe('category-placeholder');
      });

      it('should generate category placeholder for Image', () => {
        const result = getThumbnailUrl({ category: 'Image' });
        expect(isPlaceholderThumbnail(result)).toBe(true);
      });

      it('should generate category placeholder for Video', () => {
        const result = getThumbnailUrl({ category: 'Video' });
        expect(isPlaceholderThumbnail(result)).toBe(true);
      });

      it('should generate category placeholder for Audio', () => {
        const result = getThumbnailUrl({ category: 'Audio' });
        expect(isPlaceholderThumbnail(result)).toBe(true);
      });

      it('should generate category placeholder for Embedding', () => {
        const result = getThumbnailUrl({ category: 'Embedding' });
        expect(isPlaceholderThumbnail(result)).toBe(true);
      });

      it('should generate category placeholder for All', () => {
        const result = getThumbnailUrl({ category: 'All' });
        expect(isPlaceholderThumbnail(result)).toBe(true);
      });
    });

    describe('Final fallback: Generic placeholder', () => {
      it('should generate Generic placeholder when no params provided', () => {
        const result = getThumbnailUrl({});
        expect(isPlaceholderThumbnail(result)).toBe(true);
      });

      it('should return valid data URL for empty params', () => {
        const result = getThumbnailUrl({});
        expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
      });
    });
  });

  describe('generateProviderThumbnail', () => {
    it('should generate valid SVG data URL', () => {
      const result = generateProviderThumbnail('OpenAI');
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('should generate different thumbnails for different providers', () => {
      const openai = generateProviderThumbnail('OpenAI');
      const anthropic = generateProviderThumbnail('Anthropic');
      expect(openai).not.toBe(anthropic);
    });

    it('should support custom initials', () => {
      const result = generateProviderThumbnail('OpenAI', 'GPT');
      expect(isPlaceholderThumbnail(result)).toBe(true);
    });

    it('should handle provider with no predefined colors', () => {
      const result = generateProviderThumbnail('CustomProvider');
      expect(isPlaceholderThumbnail(result)).toBe(true);
    });

    it('should decode to valid SVG structure', () => {
      const result = generateProviderThumbnail('OpenAI');
      const base64Part = result.replace('data:image/svg+xml;base64,', '');
      const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

      expect(decoded).toContain('<svg');
      expect(decoded).toContain('</svg>');
      expect(decoded).toContain('linearGradient');
      expect(decoded).toContain('rect');
      expect(decoded).toContain('text');
    });

    it('should include provider colors in SVG', () => {
      const result = generateProviderThumbnail('OpenAI');
      const base64Part = result.replace('data:image/svg+xml;base64,', '');
      const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

      expect(decoded).toContain(PROVIDER_COLORS.OpenAI.primary);
      expect(decoded).toContain(PROVIDER_COLORS.OpenAI.secondary);
    });
  });

  describe('generateCategoryThumbnail', () => {
    it('should generate valid SVG data URL for categories', () => {
      const categories: ModelCategory[] = [
        'Coding',
        'Image',
        'Video',
        'Audio',
        'Embedding',
      ];

      categories.forEach((category) => {
        const result = generateCategoryThumbnail(category);
        expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
      });
    });

    it('should generate different thumbnails for different categories', () => {
      const coding = generateCategoryThumbnail('Coding');
      const image = generateCategoryThumbnail('Image');
      expect(coding).not.toBe(image);
    });

    it('should decode to valid SVG with category icon', () => {
      const result = generateCategoryThumbnail('Coding');
      const base64Part = result.replace('data:image/svg+xml;base64,', '');
      const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

      expect(decoded).toContain('<svg');
      expect(decoded).toContain('</svg>');
      expect(decoded).toContain('</>'); // Coding icon
    });
  });

  describe('isPlaceholderThumbnail', () => {
    it('should return true for data URL thumbnails', () => {
      const result = generateProviderThumbnail('OpenAI');
      expect(isPlaceholderThumbnail(result)).toBe(true);
    });

    it('should return false for HTTP URLs', () => {
      expect(isPlaceholderThumbnail('https://example.com/image.png')).toBe(
        false
      );
    });

    it('should return false for HTTPS URLs', () => {
      expect(isPlaceholderThumbnail('https://example.com/image.png')).toBe(
        false
      );
    });

    it('should return false for empty strings', () => {
      expect(isPlaceholderThumbnail('')).toBe(false);
    });

    it('should return false for relative paths', () => {
      expect(isPlaceholderThumbnail('/images/thumbnail.png')).toBe(false);
    });

    it('should return true for all generated placeholders', () => {
      const provider = generateProviderThumbnail('OpenAI');
      const category = generateCategoryThumbnail('Coding');
      const url = getThumbnailUrl({ provider: 'Anthropic' });

      expect(isPlaceholderThumbnail(provider)).toBe(true);
      expect(isPlaceholderThumbnail(category)).toBe(true);
      expect(isPlaceholderThumbnail(url)).toBe(true);
    });
  });

  describe('getThumbnailType', () => {
    it('should return "real" for HTTP/HTTPS URLs', () => {
      expect(getThumbnailType('https://example.com/image.png')).toBe('real');
      expect(getThumbnailType('http://example.com/image.png')).toBe('real');
    });

    it('should return "provider-placeholder" for provider thumbnails', () => {
      const result = generateProviderThumbnail('OpenAI');
      // Verify it's a placeholder
      expect(isPlaceholderThumbnail(result)).toBe(true);
      // Verify it contains provider-specific font size
      const decoded = Buffer.from(
        result.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('utf-8');
      expect(decoded).toContain('font-size="72"');
    });

    it('should return "category-placeholder" for category thumbnails', () => {
      const result = generateCategoryThumbnail('Coding');
      expect(getThumbnailType(result)).toBe('category-placeholder');
    });

    it('should return "category-placeholder" for empty strings', () => {
      expect(getThumbnailType('')).toBe('category-placeholder');
    });

    it('should return "category-placeholder" for whitespace', () => {
      expect(getThumbnailType('   ')).toBe('category-placeholder');
    });

    it('should correctly identify thumbnail type from getThumbnailUrl', () => {
      const real = getThumbnailUrl({
        thumbnailUrl: 'https://example.com/image.png',
      });
      const provider = getThumbnailUrl({ provider: 'OpenAI' });
      const category = getThumbnailUrl({ category: 'Coding' });

      expect(getThumbnailType(real)).toBe('real');

      // Verify provider generates placeholder with correct font size
      expect(isPlaceholderThumbnail(provider)).toBe(true);
      const providerDecoded = Buffer.from(
        provider.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('utf-8');
      expect(providerDecoded).toContain('font-size="72"');

      // Verify category generates placeholder
      expect(getThumbnailType(category)).toBe('category-placeholder');
    });
  });

  describe('SVG Structure Validation', () => {
    it('should generate valid SVG with proper dimensions', () => {
      const result = generateProviderThumbnail('OpenAI');
      const base64Part = result.replace('data:image/svg+xml;base64,', '');
      const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

      expect(decoded).toContain('width="640"');
      expect(decoded).toContain('height="360"');
      expect(decoded).toContain('viewBox="0 0 640 360"');
    });

    it('should include gradient definition', () => {
      const result = generateProviderThumbnail('OpenAI');
      const base64Part = result.replace('data:image/svg+xml;base64,', '');
      const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

      expect(decoded).toContain('<defs>');
      expect(decoded).toContain('<linearGradient');
      expect(decoded).toContain('<stop');
      expect(decoded).toContain('</defs>');
    });

    it('should include text with proper styling', () => {
      const result = generateProviderThumbnail('OpenAI', 'OAI');
      const base64Part = result.replace('data:image/svg+xml;base64,', '');
      const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

      expect(decoded).toContain('<text');
      expect(decoded).toContain('font-family="Arial, sans-serif"');
      expect(decoded).toContain('font-weight="bold"');
      expect(decoded).toContain('fill="white"');
      expect(decoded).toContain('OAI');
    });

    it('should use correct font sizes for provider vs category', () => {
      const provider = generateProviderThumbnail('OpenAI');
      const category = generateCategoryThumbnail('Coding');

      const providerDecoded = Buffer.from(
        provider.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('utf-8');

      const categoryDecoded = Buffer.from(
        category.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('utf-8');

      expect(providerDecoded).toContain('font-size="72"');
      expect(categoryDecoded).toContain('font-size="60"');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined provider gracefully', () => {
      const result = getThumbnailUrl({
        provider: undefined,
        category: 'Coding',
      });
      expect(isPlaceholderThumbnail(result)).toBe(true);
    });

    it('should handle null thumbnail URL gracefully', () => {
      const result = getThumbnailUrl({
        thumbnailUrl: null as any,
        provider: 'OpenAI',
      });
      expect(isPlaceholderThumbnail(result)).toBe(true);
    });

    it('should handle multiple special characters in provider name', () => {
      const result = generateProviderThumbnail('Test-Provider_123');
      expect(isPlaceholderThumbnail(result)).toBe(true);
    });

    it('should handle very long provider names', () => {
      const longProvider =
        'ThisIsAVeryLongProviderNameThatShouldStillWorkCorrectly';
      const result = generateProviderThumbnail(longProvider);
      expect(isPlaceholderThumbnail(result)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should support full workflow from getThumbnailUrl', () => {
      const realUrl = 'https://example.com/image.png';
      const providerOnly = { provider: 'OpenAI' };
      const categoryOnly = { category: 'Coding' as ModelCategory };
      const nothing = {};

      const real = getThumbnailUrl({ thumbnailUrl: realUrl });
      const provider = getThumbnailUrl(providerOnly);
      const category = getThumbnailUrl(categoryOnly);
      const fallback = getThumbnailUrl(nothing);

      expect(getThumbnailType(real)).toBe('real');
      expect(isPlaceholderThumbnail(provider)).toBe(true);
      expect(getThumbnailType(category)).toBe('category-placeholder');
      expect(isPlaceholderThumbnail(fallback)).toBe(true);
    });

    it('should generate consistent results for same inputs', () => {
      const result1 = generateProviderThumbnail('OpenAI');
      const result2 = generateProviderThumbnail('OpenAI');
      expect(result1).toBe(result2);
    });

    it('should work with all ModelCategory types', () => {
      const categories: ModelCategory[] = [
        'All',
        'Image',
        'Video',
        'Audio',
        'Coding',
        'Embedding',
      ];

      categories.forEach((category) => {
        const result = getThumbnailUrl({ category });
        expect(isPlaceholderThumbnail(result)).toBe(true);
        expect(getThumbnailType(result)).toBe('category-placeholder');
      });
    });
  });
});
