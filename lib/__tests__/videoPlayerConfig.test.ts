/**
 * Video Player Configuration Service Tests
 */

import {
  formatTime,
  detectVideoSourceType,
  extractVideoId,
  getQualityLabel,
  createDefaultConfig,
  validateConfig,
  getStoredPreference,
  storePreference,
  getStoredPlayerConfig,
  savePlayerConfig,
  sendAnalyticsEvent,
  videoPlayerConfigService,
  defaultPlayerTheme,
  darkPlayerTheme,
  lightPlayerTheme,
  defaultKeyboardShortcuts,
  playbackSpeeds,
  storageKeys,
  analyticsEvents,
  type VideoSourceType,
  type VideoPlayerConfig,
  type PlaybackSpeed,
} from '../videoPlayerConfig';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({}),
  } as Response)
);

// Mock navigator.sendBeacon
Object.defineProperty(navigator, 'sendBeacon', {
  value: jest.fn(() => true),
  writable: true,
});

describe('Video Player Configuration Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('formatTime', () => {
    it('formats time in mm:ss format for durations under 1 hour', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(45)).toBe('0:45');
      expect(formatTime(125)).toBe('2:05');
      expect(formatTime(599)).toBe('9:59');
    });

    it('formats time in hh:mm:ss format for durations over 1 hour', () => {
      expect(formatTime(3600)).toBe('1:00:00');
      expect(formatTime(3665)).toBe('1:01:05');
      expect(formatTime(7325)).toBe('2:02:05');
    });

    it('handles invalid input', () => {
      expect(formatTime(-10)).toBe('0:00');
      expect(formatTime(NaN)).toBe('0:00');
    });

    it('handles edge cases', () => {
      expect(formatTime(0.5)).toBe('0:00');
      expect(formatTime(3599.9)).toBe('59:59');
    });
  });

  describe('detectVideoSourceType', () => {
    it('detects YouTube URLs', () => {
      expect(detectVideoSourceType('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube');
      expect(detectVideoSourceType('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
      expect(detectVideoSourceType('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('youtube');
    });

    it('detects Vimeo URLs', () => {
      expect(detectVideoSourceType('https://vimeo.com/123456789')).toBe('vimeo');
      expect(detectVideoSourceType('https://player.vimeo.com/video/123456789')).toBe('vimeo');
    });

    it('detects HLS streams', () => {
      expect(detectVideoSourceType('https://example.com/video.m3u8')).toBe('hls');
      expect(detectVideoSourceType('https://cdn.example.com/stream.M3U8')).toBe('hls');
    });

    it('detects MP4 files', () => {
      expect(detectVideoSourceType('https://example.com/video.mp4')).toBe('mp4');
      expect(detectVideoSourceType('https://cdn.example.com/movie.MP4')).toBe('mp4');
    });

    it('detects WebM files', () => {
      expect(detectVideoSourceType('https://example.com/video.webm')).toBe('webm');
    });

    it('returns direct for unknown sources', () => {
      expect(detectVideoSourceType('https://example.com/video')).toBe('direct');
      expect(detectVideoSourceType('')).toBe('direct');
    });
  });

  describe('extractVideoId', () => {
    it('extracts YouTube video IDs', () => {
      expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube')).toBe('dQw4w9WgXcQ');
      expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ', 'youtube')).toBe('dQw4w9WgXcQ');
      expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ', 'youtube')).toBe('dQw4w9WgXcQ');
    });

    it('extracts Vimeo video IDs', () => {
      expect(extractVideoId('https://vimeo.com/123456789', 'vimeo')).toBe('123456789');
    });

    it('returns null for invalid URLs', () => {
      expect(extractVideoId('', 'youtube')).toBe(null);
      expect(extractVideoId('https://example.com', 'youtube')).toBe(null);
    });

    it('returns null for non-YouTube/Vimeo sources', () => {
      expect(extractVideoId('https://example.com/video.mp4', 'mp4')).toBe(null);
    });
  });

  describe('getQualityLabel', () => {
    it('returns correct quality labels', () => {
      expect(getQualityLabel(2160)).toBe('4K');
      expect(getQualityLabel(1440)).toBe('1440p');
      expect(getQualityLabel(1080)).toBe('1080p');
      expect(getQualityLabel(720)).toBe('720p');
      expect(getQualityLabel(480)).toBe('480p');
      expect(getQualityLabel(360)).toBe('360p');
      expect(getQualityLabel(240)).toBe('240p');
    });

    it('handles edge cases', () => {
      expect(getQualityLabel(3840)).toBe('4K');
      expect(getQualityLabel(144)).toBe('144p');
    });
  });

  describe('createDefaultConfig', () => {
    it('creates default config for YouTube URL', () => {
      const config = createDefaultConfig('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      expect(config.source.type).toBe('youtube');
      expect(config.source.url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(config.source.videoId).toBe('dQw4w9WgXcQ');
      expect(config.autoplay).toBe(false);
      expect(config.muted).toBe(false);
      expect(config.defaultVolume).toBe(1);
      expect(config.keyboardEnabled).toBe(true);
    });

    it('creates default config for HLS stream', () => {
      const config = createDefaultConfig('https://example.com/stream.m3u8');

      expect(config.source.type).toBe('hls');
      expect(config.source.url).toBe('https://example.com/stream.m3u8');
      expect(config.source.videoId).toBeUndefined();
    });

    it('applies overrides correctly', () => {
      const config = createDefaultConfig('https://example.com/video.mp4', {
        autoplay: true,
        muted: true,
        defaultVolume: 0.5,
        loop: true,
      });

      expect(config.autoplay).toBe(true);
      expect(config.muted).toBe(true);
      expect(config.defaultVolume).toBe(0.5);
      expect(config.loop).toBe(true);
    });

    it('includes all required configuration fields', () => {
      const config = createDefaultConfig('https://example.com/video.mp4');

      expect(config).toHaveProperty('source');
      expect(config).toHaveProperty('controls');
      expect(config).toHaveProperty('theme');
      expect(config).toHaveProperty('captions');
      expect(config).toHaveProperty('keyboardShortcuts');
      expect(config).toHaveProperty('analytics');
      expect(config).toHaveProperty('resumePlayback');
      expect(config).toHaveProperty('errorRetryAttempts');
    });
  });

  describe('validateConfig', () => {
    it('validates valid configuration', () => {
      const config: Partial<VideoPlayerConfig> = {
        defaultVolume: 0.5,
        defaultPlaybackRate: 1.5,
        theme: defaultPlayerTheme,
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects invalid volume', () => {
      const config: Partial<VideoPlayerConfig> = {
        defaultVolume: 1.5,
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('defaultVolume must be between 0 and 1');
    });

    it('detects invalid playback rate', () => {
      const config: Partial<VideoPlayerConfig> = {
        defaultPlaybackRate: 3 as PlaybackSpeed,
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('detects invalid theme colors', () => {
      const config: Partial<VideoPlayerConfig> = {
        theme: {
          ...defaultPlayerTheme,
          primaryColor: 'invalid-color',
        },
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('primaryColor'))).toBe(true);
    });

    it('validates analytics intervals', () => {
      const config: Partial<VideoPlayerConfig> = {
        analytics: {
          enabled: true,
          trackPlay: true,
          trackPause: true,
          trackSeek: true,
          trackVolumeChange: true,
          trackSpeedChange: true,
          trackQualityChange: true,
          trackFullscreen: true,
          trackPiP: true,
          trackComplete: true,
          trackProgress: true,
          progressInterval: 0,
          trackBuffering: true,
          trackErrors: true,
          sendBeacon: true,
        },
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('analytics.progressInterval must be at least 1 second');
    });

    it('handles empty configuration', () => {
      const result = validateConfig({});
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Storage functions', () => {
    describe('getStoredPreference', () => {
      it('returns stored value', () => {
        localStorageMock.setItem('test_key', JSON.stringify({ value: 'test' }));
        const result = getStoredPreference('test_key', { value: 'default' });
        expect(result).toEqual({ value: 'test' });
      });

      it('returns default value when key does not exist', () => {
        const result = getStoredPreference('nonexistent', 'default');
        expect(result).toBe('default');
      });

      it('returns default value on parse error', () => {
        localStorageMock.setItem('invalid', 'invalid-json');
        const result = getStoredPreference('invalid', 'default');
        expect(result).toBe('default');
      });
    });

    describe('storePreference', () => {
      it('stores value in localStorage', () => {
        storePreference('test_key', { value: 'test' });
        const stored = localStorageMock.getItem('test_key');
        expect(stored).toBe(JSON.stringify({ value: 'test' }));
      });

      it('handles different data types', () => {
        storePreference('number', 42);
        storePreference('boolean', true);
        storePreference('array', [1, 2, 3]);

        expect(getStoredPreference('number', 0)).toBe(42);
        expect(getStoredPreference('boolean', false)).toBe(true);
        expect(getStoredPreference('array', [])).toEqual([1, 2, 3]);
      });
    });

    describe('getStoredPlayerConfig', () => {
      it('returns default config when nothing is stored', () => {
        const config = getStoredPlayerConfig();

        expect(config.defaultVolume).toBe(1);
        expect(config.muted).toBe(false);
        expect(config.defaultPlaybackRate).toBe(1);
        expect(config.defaultQuality).toBe('auto');
      });

      it('returns stored preferences', () => {
        storePreference(storageKeys.VOLUME, 0.7);
        storePreference(storageKeys.PLAYBACK_RATE, 1.5);
        storePreference(storageKeys.QUALITY, '720p');

        const config = getStoredPlayerConfig();

        expect(config.defaultVolume).toBe(0.7);
        expect(config.defaultPlaybackRate).toBe(1.5);
        expect(config.defaultQuality).toBe('720p');
      });
    });

    describe('savePlayerConfig', () => {
      it('saves volume preference', () => {
        savePlayerConfig({ defaultVolume: 0.8 });
        expect(getStoredPreference(storageKeys.VOLUME, 1)).toBe(0.8);
      });

      it('saves playback rate preference', () => {
        savePlayerConfig({ defaultPlaybackRate: 1.25 });
        expect(getStoredPreference(storageKeys.PLAYBACK_RATE, 1)).toBe(1.25);
      });

      it('saves theme preference', () => {
        savePlayerConfig({ theme: darkPlayerTheme });
        expect(getStoredPreference(storageKeys.THEME, defaultPlayerTheme)).toEqual(darkPlayerTheme);
      });

      it('saves multiple preferences at once', () => {
        savePlayerConfig({
          defaultVolume: 0.6,
          defaultPlaybackRate: 2,
          defaultQuality: '1080p',
        });

        expect(getStoredPreference(storageKeys.VOLUME, 1)).toBe(0.6);
        expect(getStoredPreference(storageKeys.PLAYBACK_RATE, 1)).toBe(2);
        expect(getStoredPreference(storageKeys.QUALITY, 'auto')).toBe('1080p');
      });
    });
  });

  describe('sendAnalyticsEvent', () => {
    const mockConfig = {
      enabled: true,
      trackPlay: true,
      trackPause: true,
      trackSeek: true,
      trackVolumeChange: true,
      trackSpeedChange: true,
      trackQualityChange: true,
      trackFullscreen: true,
      trackPiP: true,
      trackComplete: true,
      trackProgress: true,
      progressInterval: 30,
      trackBuffering: true,
      trackErrors: true,
      sendBeacon: true,
    };

    it('sends analytics event with sendBeacon when enabled', () => {
      const mockSendBeacon = jest.fn(() => true);
      Object.defineProperty(navigator, 'sendBeacon', {
        value: mockSendBeacon,
        writable: true,
      });

      sendAnalyticsEvent('test_event', { videoId: 'video-123' }, mockConfig);

      expect(mockSendBeacon).toHaveBeenCalledWith(
        '/api/v1/analytics/video-event',
        expect.any(Blob)
      );
    });

    it('uses fetch when sendBeacon is disabled', () => {
      const configWithoutBeacon = { ...mockConfig, sendBeacon: false };

      sendAnalyticsEvent('test_event', { videoId: 'video-123' }, configWithoutBeacon);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/analytics/video-event',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test_event'),
        })
      );
    });

    it('uses custom endpoint when provided', () => {
      const configWithCustomEndpoint = { ...mockConfig, customEndpoint: '/custom/analytics' };

      sendAnalyticsEvent('test_event', { videoId: 'video-123' }, configWithCustomEndpoint);

      // Check that sendBeacon or fetch was called with the custom endpoint
      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        '/custom/analytics',
        expect.any(Blob)
      );
    });

    it('does not send events when analytics is disabled', () => {
      const disabledConfig = { ...mockConfig, enabled: false };

      sendAnalyticsEvent('test_event', { videoId: 'video-123' }, disabledConfig);

      expect(navigator.sendBeacon).not.toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('includes timestamp in payload', () => {
      const mockFetch = jest.fn(() => Promise.resolve({} as Response));
      global.fetch = mockFetch;
      const configWithoutBeacon = { ...mockConfig, sendBeacon: false };

      const beforeTimestamp = Date.now();
      sendAnalyticsEvent('test_event', { videoId: 'video-123' }, configWithoutBeacon);
      const afterTimestamp = Date.now();

      expect(mockFetch).toHaveBeenCalled();
      const calls = mockFetch.mock.calls;
      if (calls.length > 0) {
        const firstCall = calls[0] as unknown as [string, RequestInit];
        if (firstCall && firstCall[1]?.body) {
          const callBody = JSON.parse(firstCall[1].body as string);
          expect(callBody.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
          expect(callBody.timestamp).toBeLessThanOrEqual(afterTimestamp);
        }
      }
    });
  });

  describe('videoPlayerConfigService', () => {
    it('exposes all utility functions', () => {
      expect(videoPlayerConfigService.createDefaultConfig).toBeDefined();
      expect(videoPlayerConfigService.getStoredPlayerConfig).toBeDefined();
      expect(videoPlayerConfigService.savePlayerConfig).toBeDefined();
      expect(videoPlayerConfigService.validateConfig).toBeDefined();
      expect(videoPlayerConfigService.detectVideoSourceType).toBeDefined();
      expect(videoPlayerConfigService.extractVideoId).toBeDefined();
      expect(videoPlayerConfigService.formatTime).toBeDefined();
      expect(videoPlayerConfigService.getQualityLabel).toBeDefined();
      expect(videoPlayerConfigService.sendAnalyticsEvent).toBeDefined();
    });

    it('provides theme presets', () => {
      expect(videoPlayerConfigService.themes.default).toEqual(defaultPlayerTheme);
      expect(videoPlayerConfigService.themes.dark).toEqual(darkPlayerTheme);
      expect(videoPlayerConfigService.themes.light).toEqual(lightPlayerTheme);
    });

    it('provides configuration presets', () => {
      expect(videoPlayerConfigService.presets.minimal).toBeDefined();
      expect(videoPlayerConfigService.presets.autoplay).toBeDefined();
      expect(videoPlayerConfigService.presets.accessible).toBeDefined();
      expect(videoPlayerConfigService.presets.performance).toBeDefined();
    });

    it('minimal preset disables controls and analytics', () => {
      const minimal = videoPlayerConfigService.presets.minimal;
      expect(minimal.controls).toBe(false);
      expect(minimal.keyboardEnabled).toBe(false);
      expect(minimal.analytics?.enabled).toBe(false);
    });

    it('autoplay preset enables autoplay with muted', () => {
      const autoplay = videoPlayerConfigService.presets.autoplay;
      expect(autoplay.autoplay).toBe(true);
      expect(autoplay.muted).toBe(true);
      expect(autoplay.loop).toBe(true);
    });

    it('accessible preset enables captions and keyboard', () => {
      const accessible = videoPlayerConfigService.presets.accessible;
      expect(accessible.keyboardEnabled).toBe(true);
      expect(accessible.captions?.enabled).toBe(true);
      expect(accessible.captions?.fontSize).toBe('large');
    });

    it('performance preset reduces tracking', () => {
      const performance = videoPlayerConfigService.presets.performance;
      expect(performance.preload).toBe('none');
      expect(performance.analytics?.trackProgress).toBe(false);
      expect(performance.analytics?.progressInterval).toBeGreaterThan(30);
    });
  });

  describe('Constants and defaults', () => {
    it('defines playback speeds', () => {
      expect(playbackSpeeds).toEqual([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
    });

    it('defines keyboard shortcuts', () => {
      expect(defaultKeyboardShortcuts.playPause).toBe(' ');
      expect(defaultKeyboardShortcuts.fullscreen).toBe('f');
      expect(defaultKeyboardShortcuts.mute).toBe('m');
      expect(defaultKeyboardShortcuts.pictureInPicture).toBe('p');
    });

    it('defines analytics event names', () => {
      expect(analyticsEvents.PLAY).toBe('video_play');
      expect(analyticsEvents.PAUSE).toBe('video_pause');
      expect(analyticsEvents.ENDED).toBe('video_ended');
      expect(analyticsEvents.FULLSCREEN_ENTER).toBe('video_fullscreen_enter');
    });

    it('defines storage keys', () => {
      expect(storageKeys.VOLUME).toBe('video_player_volume');
      expect(storageKeys.QUALITY).toBe('video_player_quality');
      expect(storageKeys.CAPTIONS).toBe('video_player_captions');
    });

    it('defines theme presets with valid colors', () => {
      expect(defaultPlayerTheme.primaryColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(darkPlayerTheme.primaryColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(lightPlayerTheme.primaryColor).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});
