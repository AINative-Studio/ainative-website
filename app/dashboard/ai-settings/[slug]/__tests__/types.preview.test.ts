/**
 * Tests for preview type transformations
 *
 * Refs #546 - Add example prompts to model playground pages
 *
 * @jest-environment node
 */

import { transformToPlaygroundResult } from '../types.preview';

describe('transformToPlaygroundResult', () => {
  describe('Audio transformation', () => {
    it('should transform backend audio response with base64 to data URL', () => {
      const apiResponse = {
        audio_base64: 'fake-base64-data',
        format: 'mp3',
        duration_ms: 5000,
        credits_used: 14,
        usage_id: 'test-id',
        credits_remaining: 986,
      };

      const result = transformToPlaygroundResult(apiResponse, 'Audio');

      expect(result.type).toBe('audio');
      expect(result.url).toBe('data:audio/mp3;base64,fake-base64-data');
      expect(result.duration_seconds).toBe(5);
      expect(result.format).toBe('mp3');
      expect(result.cost_credits).toBe(14);
    });

    it('should handle audio response with audio_url field', () => {
      const apiResponse = {
        audio_url: 'https://example.com/audio.mp3',
        format: 'mp3',
        duration: 5,
        credits_used: 14,
      };

      const result = transformToPlaygroundResult(apiResponse, 'Audio');

      expect(result.type).toBe('audio');
      expect(result.url).toBe('https://example.com/audio.mp3');
      expect(result.duration_seconds).toBe(5);
    });

    it('should default to empty string when no URL or base64 provided', () => {
      const apiResponse = {
        format: 'mp3',
      };

      const result = transformToPlaygroundResult(apiResponse, 'Audio');

      expect(result.type).toBe('audio');
      expect(result.url).toBe('');
    });

    it('should handle transcript field for Whisper results', () => {
      const apiResponse = {
        audio_url: 'https://example.com/audio.mp3',
        transcript: 'This is the transcribed text.',
        format: 'mp3',
        duration_ms: 45600,
      };

      const result = transformToPlaygroundResult(apiResponse, 'Audio');

      expect(result.type).toBe('audio');
      expect(result.transcript).toBe('This is the transcribed text.');
      expect(result.duration_seconds).toBe(45.6);
    });
  });

  describe('Video transformation', () => {
    it('should transform backend video response with base64 to data URL', () => {
      const apiResponse = {
        video_base64: 'fake-video-base64',
        format: 'mp4',
        duration_s: 5.2,
        fps: 30,
        credits_used: 400,
      };

      const result = transformToPlaygroundResult(apiResponse, 'Video');

      expect(result.type).toBe('video');
      expect(result.url).toBe('data:video/mp4;base64,fake-video-base64');
      expect(result.duration_seconds).toBe(5.2);
      expect(result.format).toBe('mp4');
    });
  });

  describe('Image transformation', () => {
    it('should transform backend image response with base64 to data URL', () => {
      const apiResponse = {
        image_base64: 'fake-image-base64',
        format: 'png',
        width: 1024,
        height: 1024,
        credits_used: 50,
      };

      const result = transformToPlaygroundResult(apiResponse, 'Image');

      expect(result.type).toBe('image');
      expect(result.url).toBe('data:image/png;base64,fake-image-base64');
      expect(result.width).toBe(1024);
      expect(result.height).toBe(1024);
    });
  });
});
