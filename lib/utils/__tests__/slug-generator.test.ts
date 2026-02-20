/**
 * Unit Tests for Slug Generator Utility
 *
 * Tests slug generation logic with comprehensive coverage including:
 * - Basic slug generation
 * - Provider prefix handling
 * - Version and suffix appending
 * - Slug validation
 * - Unique slug generation
 * - Batch operations
 * - Edge cases and error handling
 *
 * Target Coverage: >= 80%
 */

import { describe, it, expect } from '@jest/globals';
import {
  generateSlug,
  isValidSlug,
  generateUniqueSlug,
  parseSlug,
  batchGenerateSlugs,
  assertValidSlug,
  SLUG_EXAMPLES,
} from '../slug-generator';

describe('Slug Generator Utility', () => {
  describe('generateSlug - Basic Functionality', () => {
    it('should convert simple model name to lowercase', () => {
      expect(generateSlug('GPT-4')).toBe('gpt-4');
    });

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('GPT 4 Turbo')).toBe('gpt-4-turbo');
    });

    it('should replace slashes with hyphens', () => {
      expect(generateSlug('BAAI/bge-small-en-v1.5')).toBe(
        'baai-bge-small-en-v1-5'
      );
    });

    it('should replace underscores with hyphens', () => {
      expect(generateSlug('model_name_v1')).toBe('model-name-v1');
    });

    it('should replace dots with hyphens', () => {
      expect(generateSlug('model.name.v1.5')).toBe('model-name-v1-5');
    });

    it('should remove consecutive hyphens', () => {
      expect(generateSlug('model---name')).toBe('model-name');
    });

    it('should trim leading hyphens', () => {
      expect(generateSlug('---model-name')).toBe('model-name');
    });

    it('should trim trailing hyphens', () => {
      expect(generateSlug('model-name---')).toBe('model-name');
    });

    it('should handle multiple special characters', () => {
      expect(generateSlug('model!@#$%name')).toBe('model-name');
    });

    it('should preserve numbers', () => {
      expect(generateSlug('GPT-4-1234')).toBe('gpt-4-1234');
    });

    it('should handle mixed case properly', () => {
      expect(generateSlug('OpenAI-GPT-3.5-Turbo')).toBe('openai-gpt-3-5-turbo');
    });

    it('should throw error for empty identifier', () => {
      expect(() => generateSlug('')).toThrow(
        'Model identifier is required for slug generation'
      );
    });
  });

  describe('generateSlug - Provider Prefix', () => {
    it('should add provider prefix for common model names', () => {
      const result = generateSlug('gpt-4', { provider: 'OpenAI' });
      expect(result).toBe('openai-gpt-4');
    });

    it('should add provider prefix for claude models', () => {
      const result = generateSlug('claude-3-5-sonnet', {
        provider: 'Anthropic',
      });
      expect(result).toBe('anthropic-claude-3-5-sonnet');
    });

    it('should add provider prefix for whisper models', () => {
      const result = generateSlug('Whisper', { provider: 'OpenAI' });
      expect(result).toBe('openai-whisper');
    });

    it('should not add provider prefix for non-common models', () => {
      const result = generateSlug('unique-model-xyz', { provider: 'Custom' });
      expect(result).toBe('unique-model-xyz');
    });

    it('should force provider prefix when requested', () => {
      const result = generateSlug('unique-model', {
        provider: 'Custom',
        forceProviderPrefix: true,
      });
      expect(result).toBe('custom-unique-model');
    });

    it('should not duplicate provider prefix if already present', () => {
      const result = generateSlug('openai-gpt-4', { provider: 'OpenAI' });
      expect(result).toBe('openai-gpt-4');
    });

    it('should normalize provider name in prefix', () => {
      const result = generateSlug('gpt-4', { provider: 'Open AI Corp' });
      expect(result).toBe('open-ai-corp-gpt-4');
    });

    it('should handle empty provider string gracefully', () => {
      const result = generateSlug('gpt-4', { provider: '' });
      expect(result).toBe('gpt-4');
    });
  });

  describe('generateSlug - Version and Suffix', () => {
    it('should append version when provided', () => {
      const result = generateSlug('model-name', { version: 'v2' });
      expect(result).toBe('model-name-v2');
    });

    it('should append suffix when provided', () => {
      const result = generateSlug('model-name', { suffix: '720p' });
      expect(result).toBe('model-name-720p');
    });

    it('should append both version and suffix', () => {
      const result = generateSlug('model-name', {
        version: 'v2',
        suffix: '720p',
      });
      expect(result).toBe('model-name-v2-720p');
    });

    it('should combine provider, version, and suffix', () => {
      const result = generateSlug('wan-i2v', {
        provider: 'Alibaba',
        forceProviderPrefix: true,
        suffix: '720p',
      });
      expect(result).toBe('alibaba-wan-i2v-720p');
    });

    it('should not duplicate version if already present', () => {
      const result = generateSlug('model-v2', { version: 'v2' });
      expect(result).toBe('model-v2');
    });

    it('should not duplicate suffix if already present', () => {
      const result = generateSlug('model-720p', { suffix: '720p' });
      expect(result).toBe('model-720p');
    });

    it('should normalize version string', () => {
      const result = generateSlug('model', { version: 'V 2.0' });
      expect(result).toBe('model-v-2-0');
    });

    it('should normalize suffix string', () => {
      const result = generateSlug('model', { suffix: '1080p HD' });
      expect(result).toBe('model-1080p-hd');
    });
  });

  describe('isValidSlug', () => {
    it('should return true for valid slugs', () => {
      expect(isValidSlug('gpt-4')).toBe(true);
      expect(isValidSlug('claude-3-5-sonnet')).toBe(true);
      expect(isValidSlug('model-name-123')).toBe(true);
      expect(isValidSlug('a')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(isValidSlug('')).toBe(false);
    });

    it('should return false for slugs with uppercase letters', () => {
      expect(isValidSlug('Model-Name')).toBe(false);
    });

    it('should return false for slugs with spaces', () => {
      expect(isValidSlug('model name')).toBe(false);
    });

    it('should return false for slugs with special characters', () => {
      expect(isValidSlug('model_name')).toBe(false);
      expect(isValidSlug('model.name')).toBe(false);
      expect(isValidSlug('model@name')).toBe(false);
    });

    it('should return false for slugs starting with hyphen', () => {
      expect(isValidSlug('-model-name')).toBe(false);
    });

    it('should return false for slugs ending with hyphen', () => {
      expect(isValidSlug('model-name-')).toBe(false);
    });

    it('should return false for slugs with consecutive hyphens', () => {
      expect(isValidSlug('model--name')).toBe(false);
    });

    it('should return false for slugs exceeding 100 characters', () => {
      const longSlug = 'a'.repeat(101);
      expect(isValidSlug(longSlug)).toBe(false);
    });

    it('should return true for slugs at exactly 100 characters', () => {
      const maxSlug = 'a'.repeat(100);
      expect(isValidSlug(maxSlug)).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(isValidSlug(null as any)).toBe(false);
      expect(isValidSlug(undefined as any)).toBe(false);
    });
  });

  describe('generateUniqueSlug', () => {
    it('should return base slug if no collision', () => {
      const result = generateUniqueSlug('gpt-4', ['claude-3', 'llama-2']);
      expect(result).toBe('gpt-4');
    });

    it('should append -v2 for first collision', () => {
      const result = generateUniqueSlug('gpt-4', ['gpt-4']);
      expect(result).toBe('gpt-4-v2');
    });

    it('should increment version for multiple collisions', () => {
      const result = generateUniqueSlug('gpt-4', ['gpt-4', 'gpt-4-v2']);
      expect(result).toBe('gpt-4-v3');
    });

    it('should find next available version number', () => {
      const result = generateUniqueSlug('gpt-4', [
        'gpt-4',
        'gpt-4-v2',
        'gpt-4-v3',
        'gpt-4-v4',
      ]);
      expect(result).toBe('gpt-4-v5');
    });

    it('should work with empty existing slugs array', () => {
      const result = generateUniqueSlug('gpt-4', []);
      expect(result).toBe('gpt-4');
    });

    it('should handle complex slug names', () => {
      const result = generateUniqueSlug('openai-gpt-4-turbo', [
        'openai-gpt-4-turbo',
      ]);
      expect(result).toBe('openai-gpt-4-turbo-v2');
    });
  });

  describe('parseSlug', () => {
    it('should convert slug to title case', () => {
      expect(parseSlug('gpt-4')).toBe('Gpt 4');
    });

    it('should handle multi-word slugs', () => {
      expect(parseSlug('claude-3-5-sonnet')).toBe('Claude 3 5 Sonnet');
    });

    it('should handle single word slugs', () => {
      expect(parseSlug('whisper')).toBe('Whisper');
    });

    it('should handle empty slugs', () => {
      expect(parseSlug('')).toBe('');
    });

    it('should handle slugs with numbers', () => {
      expect(parseSlug('model-v2-720p')).toBe('Model V2 720p');
    });
  });

  describe('batchGenerateSlugs', () => {
    it('should generate slugs for multiple models', () => {
      const models = [
        { identifier: 'GPT-4', provider: 'OpenAI' },
        { identifier: 'Claude-3', provider: 'Anthropic' },
        { identifier: 'Llama-2', provider: 'Meta' },
      ];

      const slugs = batchGenerateSlugs(models);
      expect(slugs).toHaveLength(3);
      expect(slugs).toContain('openai-gpt-4');
      expect(slugs).toContain('anthropic-claude-3');
      // Llama is a common model name, so it gets provider prefix
      expect(slugs).toContain('meta-llama-2');
    });

    it('should ensure all slugs are unique', () => {
      const models = [
        { identifier: 'GPT-4', provider: 'OpenAI' },
        { identifier: 'GPT-4', provider: 'Azure' },
        { identifier: 'GPT-4', provider: 'Custom' },
      ];

      const slugs = batchGenerateSlugs(models);
      const uniqueSlugs = new Set(slugs);
      expect(slugs).toHaveLength(3);
      expect(uniqueSlugs.size).toBe(3);
    });

    it('should handle models without providers', () => {
      const models = [
        { identifier: 'model-a' },
        { identifier: 'model-b' },
        { identifier: 'model-c' },
      ];

      const slugs = batchGenerateSlugs(models);
      expect(slugs).toEqual(['model-a', 'model-b', 'model-c']);
    });

    it('should handle empty array', () => {
      const slugs = batchGenerateSlugs([]);
      expect(slugs).toEqual([]);
    });

    it('should resolve collisions within batch', () => {
      const models = [
        { identifier: 'model-1' },
        { identifier: 'model-1' },
        { identifier: 'model-1' },
      ];

      const slugs = batchGenerateSlugs(models);
      expect(slugs).toEqual(['model-1', 'model-1-v2', 'model-1-v3']);
    });

    it('should handle mixed collision scenarios', () => {
      const models = [
        { identifier: 'GPT-4', provider: 'OpenAI' },
        { identifier: 'GPT-4' },
        { identifier: 'gpt-4' },
        { identifier: 'GPT 4', provider: 'Azure' },
      ];

      const slugs = batchGenerateSlugs(models);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });

  describe('assertValidSlug', () => {
    it('should not throw for valid slugs', () => {
      expect(() => assertValidSlug('gpt-4')).not.toThrow();
      expect(() => assertValidSlug('claude-3-5-sonnet')).not.toThrow();
    });

    it('should throw for invalid slugs', () => {
      expect(() => assertValidSlug('Invalid-Slug')).toThrow(
        'Invalid slug: "Invalid-Slug"'
      );
      expect(() => assertValidSlug('slug_with_underscore')).toThrow();
      expect(() => assertValidSlug('-slug')).toThrow();
      expect(() => assertValidSlug('slug-')).toThrow();
      expect(() => assertValidSlug('')).toThrow();
    });

    it('should include slug in error message', () => {
      expect(() => assertValidSlug('Bad Slug')).toThrow(
        'Invalid slug: "Bad Slug"'
      );
    });

    it('should throw descriptive error message', () => {
      expect(() => assertValidSlug('bad_slug')).toThrow(
        'Slugs must contain only lowercase letters, numbers, and hyphens'
      );
    });
  });

  describe('SLUG_EXAMPLES', () => {
    it('should have gpt-4 example', () => {
      expect(SLUG_EXAMPLES['gpt-4']).toBeDefined();
      expect(isValidSlug(SLUG_EXAMPLES['gpt-4'])).toBe(true);
    });

    it('should have claude example', () => {
      expect(SLUG_EXAMPLES['claude-3-5-sonnet']).toBeDefined();
      expect(isValidSlug(SLUG_EXAMPLES['claude-3-5-sonnet'])).toBe(true);
    });

    it('should have all examples as valid slugs', () => {
      Object.values(SLUG_EXAMPLES).forEach((slug) => {
        expect(isValidSlug(slug)).toBe(true);
      });
    });

    it('should have diverse examples covering different scenarios', () => {
      expect(SLUG_EXAMPLES).toHaveProperty('gpt-4');
      expect(SLUG_EXAMPLES).toHaveProperty('claude-3-5-sonnet');
      expect(SLUG_EXAMPLES).toHaveProperty('alibaba-wan-22-i2v');
      expect(SLUG_EXAMPLES).toHaveProperty('baai-bge-small-en-v1-5');
    });
  });

  describe('Edge Cases', () => {
    it('should handle Unicode characters', () => {
      const result = generateSlug('model-名称-测试');
      expect(isValidSlug(result)).toBe(true);
    });

    it('should handle very long identifiers', () => {
      const longIdentifier = 'this-is-a-very-long-model-identifier-'.repeat(10);
      const result = generateSlug(longIdentifier);
      // Note: slug generation doesn't truncate, so very long identifiers remain long
      // This is expected behavior - validation should happen separately via isValidSlug
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should handle identifiers with only special characters', () => {
      const result = generateSlug('!!!@@@###');
      expect(result).toBe('');
    });

    it('should handle consecutive special characters', () => {
      const result = generateSlug('model!!!name');
      expect(result).toBe('model-name');
    });

    it('should handle whitespace variations', () => {
      expect(generateSlug('model   name')).toBe('model-name');
      expect(generateSlug('model\tname')).toBe('model-name');
      expect(generateSlug('model\nname')).toBe('model-name');
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle OpenAI model identifiers', () => {
      expect(generateSlug('gpt-4')).toBe('gpt-4');
      expect(generateSlug('gpt-3.5-turbo')).toBe('gpt-3-5-turbo');
      expect(generateSlug('text-davinci-003')).toBe('text-davinci-003');
    });

    it('should handle Anthropic model identifiers', () => {
      expect(generateSlug('claude-3-5-sonnet-20241022')).toBe(
        'claude-3-5-sonnet-20241022'
      );
      expect(generateSlug('claude-instant-v1')).toBe('claude-instant-v1');
    });

    it('should handle embedding model identifiers', () => {
      expect(generateSlug('BAAI/bge-small-en-v1.5')).toBe(
        'baai-bge-small-en-v1-5'
      );
      expect(generateSlug('sentence-transformers/all-MiniLM-L6-v2')).toBe(
        'sentence-transformers-all-minilm-l6-v2'
      );
    });

    it('should handle video model identifiers', () => {
      // wan22-i2v doesn't need provider prefix by default (not a common name)
      expect(
        generateSlug('wan-i2v', { provider: 'Alibaba', forceProviderPrefix: true, suffix: '720p' })
      ).toBe('alibaba-wan-i2v-720p');
      expect(generateSlug('cogvideox-2b')).toBe('cogvideox-2b');
    });

    it('should handle audio model identifiers', () => {
      expect(generateSlug('Whisper', { provider: 'OpenAI' })).toBe(
        'openai-whisper'
      );
      expect(generateSlug('whisper-large-v3')).toBe('whisper-large-v3');
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end: generate, validate, parse', () => {
      const identifier = 'GPT-4 Turbo';
      const slug = generateSlug(identifier);

      expect(isValidSlug(slug)).toBe(true);
      expect(parseSlug(slug)).toBeTruthy();
    });

    it('should work with provider prefix end-to-end', () => {
      const identifier = 'GPT-4';
      const slug = generateSlug(identifier, { provider: 'OpenAI' });

      expect(isValidSlug(slug)).toBe(true);
      expect(slug).toContain('openai');
      expect(slug).toContain('gpt-4');
    });

    it('should handle batch generation with validation', () => {
      const models = [
        { identifier: 'GPT-4', provider: 'OpenAI' },
        { identifier: 'Claude-3', provider: 'Anthropic' },
        { identifier: 'Llama-2', provider: 'Meta' },
      ];

      const slugs = batchGenerateSlugs(models);

      slugs.forEach((slug) => {
        expect(isValidSlug(slug)).toBe(true);
      });
    });

    it('should maintain consistency across multiple calls', () => {
      const identifier = 'test-model-123';
      const slug1 = generateSlug(identifier);
      const slug2 = generateSlug(identifier);
      expect(slug1).toBe(slug2);
    });
  });
});
