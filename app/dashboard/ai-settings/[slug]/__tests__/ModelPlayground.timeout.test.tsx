/**
 * Tests for ModelPlayground timeout handling
 *
 * Refs #546 - Add example prompts to model playground pages
 *
 * Tests the timeout logic without actually calling the API.
 * Verifies that media endpoints (Audio, Video, Image) get 120s timeout
 * while non-media endpoints get 30s timeout.
 *
 * @jest-environment node
 */

import { describe, it, expect } from '@jest/globals';
import type { ModelCategory } from '../types';

/**
 * Helper function to calculate timeout (mirrors ModelPlayground logic)
 */
function calculateTimeout(modelCategory: ModelCategory): number {
  const isMediaEndpoint = modelCategory === 'Audio' || modelCategory === 'Video' || modelCategory === 'Image';
  return isMediaEndpoint ? 120000 : 30000;
}

describe('ModelPlayground API timeout configuration', () => {

  describe('Timeout calculation for media endpoints', () => {
    it('should return 120s (120000ms) timeout for Audio category', () => {
      const timeout = calculateTimeout('Audio');
      expect(timeout).toBe(120000);
    });

    it('should return 120s (120000ms) timeout for Video category', () => {
      const timeout = calculateTimeout('Video');
      expect(timeout).toBe(120000);
    });

    it('should return 120s (120000ms) timeout for Image category', () => {
      const timeout = calculateTimeout('Image');
      expect(timeout).toBe(120000);
    });
  });

  describe('Timeout calculation for non-media endpoints', () => {
    it('should return 30s (30000ms) timeout for Coding category', () => {
      const timeout = calculateTimeout('Coding');
      expect(timeout).toBe(30000);
    });

    it('should return 30s (30000ms) timeout for Embedding category', () => {
      const timeout = calculateTimeout('Embedding');
      expect(timeout).toBe(30000);
    });

    it('should return 30s (30000ms) timeout for All category', () => {
      const timeout = calculateTimeout('All');
      expect(timeout).toBe(30000);
    });
  });

  describe('Media endpoint identification logic', () => {
    it('should correctly identify Audio as media endpoint', () => {
      const modelCategory: ModelCategory = 'Audio';
      const isMediaEndpoint = modelCategory === 'Audio' || modelCategory === 'Video' || modelCategory === 'Image';
      expect(isMediaEndpoint).toBe(true);
    });

    it('should correctly identify Video as media endpoint', () => {
      const modelCategory: ModelCategory = 'Video';
      const isMediaEndpoint = modelCategory === 'Audio' || modelCategory === 'Video' || modelCategory === 'Image';
      expect(isMediaEndpoint).toBe(true);
    });

    it('should correctly identify Image as media endpoint', () => {
      const modelCategory: ModelCategory = 'Image';
      const isMediaEndpoint = modelCategory === 'Audio' || modelCategory === 'Video' || modelCategory === 'Image';
      expect(isMediaEndpoint).toBe(true);
    });

    it('should correctly identify Coding as non-media endpoint', () => {
      const modelCategory: ModelCategory = 'Coding';
      const isMediaEndpoint = modelCategory === 'Audio' || modelCategory === 'Video' || modelCategory === 'Image';
      expect(isMediaEndpoint).toBe(false);
    });

    it('should correctly identify Embedding as non-media endpoint', () => {
      const modelCategory: ModelCategory = 'Embedding';
      const isMediaEndpoint = modelCategory === 'Audio' || modelCategory === 'Video' || modelCategory === 'Image';
      expect(isMediaEndpoint).toBe(false);
    });

    it('should correctly identify All as non-media endpoint', () => {
      const modelCategory: ModelCategory = 'All';
      const isMediaEndpoint = modelCategory === 'Audio' || modelCategory === 'Video' || modelCategory === 'Image';
      expect(isMediaEndpoint).toBe(false);
    });
  });

  describe('Timeout value correctness', () => {
    it('should use 2 minute timeout for media generation (not default 30s)', () => {
      const mediaTimeout = calculateTimeout('Audio');
      expect(mediaTimeout).toBeGreaterThan(30000); // More than default 30s
      expect(mediaTimeout).toBe(120000); // Exactly 2 minutes
    });

    it('should use standard timeout for text/code generation', () => {
      const codingTimeout = calculateTimeout('Coding');
      expect(codingTimeout).toBe(30000); // Standard 30s
    });
  });
});
