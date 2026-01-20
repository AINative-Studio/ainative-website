/**
 * Video Player Configuration Service
 * Centralized configuration for video player with multiple source support,
 * theme customization, keyboard shortcuts, and analytics integration
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Supported video source types
 */
export type VideoSourceType = 'youtube' | 'vimeo' | 'hls' | 'mp4' | 'webm' | 'direct';

/**
 * Video quality settings
 */
export type VideoQuality = 'auto' | '4k' | '1440p' | '1080p' | '720p' | '480p' | '360p' | '240p';

/**
 * Playback speed options
 */
export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

/**
 * Caption/subtitle configuration
 */
export interface CaptionConfig {
  enabled: boolean;
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
  color: string;
  backgroundColor: string;
  opacity: number;
}

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcutsConfig {
  playPause: string;
  seekForward: string;
  seekBackward: string;
  seekForwardAmount: number; // seconds
  seekBackwardAmount: number; // seconds
  volumeUp: string;
  volumeDown: string;
  volumeStep: number; // 0-1
  mute: string;
  fullscreen: string;
  pictureInPicture: string;
  increaseSpeed: string;
  decreaseSpeed: string;
  resetSpeed: string;
  toggleCaptions: string;
  jumpToPercentage: Record<string, number>; // '0'-'9' -> 0-90%
}

/**
 * Player theme configuration
 */
export interface PlayerTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  controlsBackgroundColor: string;
  controlsBackgroundOpacity: number;
  textColor: string;
  progressBarColor: string;
  progressBarBufferedColor: string;
  progressBarHeight: number;
  buttonSize: number;
  borderRadius: number;
  fontFamily: string;
  iconSet: 'default' | 'rounded' | 'sharp' | 'outlined';
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  enabled: boolean;
  trackPlay: boolean;
  trackPause: boolean;
  trackSeek: boolean;
  trackVolumeChange: boolean;
  trackSpeedChange: boolean;
  trackQualityChange: boolean;
  trackFullscreen: boolean;
  trackPiP: boolean;
  trackComplete: boolean;
  trackProgress: boolean;
  progressInterval: number; // seconds
  trackBuffering: boolean;
  trackErrors: boolean;
  customEndpoint?: string;
  sendBeacon: boolean; // Use navigator.sendBeacon for reliability
}

/**
 * Video source configuration
 */
export interface VideoSourceConfig {
  type: VideoSourceType;
  url: string;
  videoId?: string; // For YouTube/Vimeo
  poster?: string;
  thumbnails?: string[];
  captions?: Array<{
    label: string;
    language: string;
    src: string;
    default?: boolean;
  }>;
}

/**
 * Complete video player configuration
 */
export interface VideoPlayerConfig {
  // Source configuration
  source: VideoSourceConfig;

  // Playback settings
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  preload: 'none' | 'metadata' | 'auto';
  defaultVolume: number;
  defaultPlaybackRate: PlaybackSpeed;
  defaultQuality: VideoQuality;

  // UI configuration
  controls: boolean;
  controlsList: Array<'play' | 'volume' | 'progress' | 'time' | 'quality' | 'speed' | 'captions' | 'fullscreen' | 'pip'>;
  theme: PlayerTheme;

  // Captions
  captions: CaptionConfig;

  // Keyboard shortcuts
  keyboardShortcuts: KeyboardShortcutsConfig;
  keyboardEnabled: boolean;

  // Analytics
  analytics: AnalyticsConfig;

  // Resume playback
  resumePlayback: boolean;
  saveProgressInterval: number; // seconds

  // Advanced features
  pictureInPictureEnabled: boolean;
  airPlayEnabled: boolean;
  chromecastEnabled: boolean;

  // Error handling
  errorRetryAttempts: number;
  errorRetryDelay: number; // milliseconds
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format time in mm:ss or hh:mm:ss format
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Detect video source type from URL
 */
export function detectVideoSourceType(url: string): VideoSourceType {
  if (!url) return 'direct';

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (lowerUrl.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (lowerUrl.includes('.m3u8')) {
    return 'hls';
  }
  if (lowerUrl.endsWith('.mp4')) {
    return 'mp4';
  }
  if (lowerUrl.endsWith('.webm')) {
    return 'webm';
  }

  return 'direct';
}

/**
 * Extract video ID from URL (YouTube/Vimeo)
 */
export function extractVideoId(url: string, sourceType: VideoSourceType): string | null {
  if (!url) return null;

  try {
    if (sourceType === 'youtube') {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
        /youtube\.com\/embed\/([^?&\s]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
    }

    if (sourceType === 'vimeo') {
      const pattern = /vimeo\.com\/(\d+)/;
      const match = url.match(pattern);
      if (match) return match[1];
    }
  } catch (error) {
    console.error('Failed to extract video ID:', error);
  }

  return null;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default keyboard shortcuts configuration
 */
export const defaultKeyboardShortcuts: KeyboardShortcutsConfig = {
  playPause: ' ',
  seekForward: 'ArrowRight',
  seekBackward: 'ArrowLeft',
  seekForwardAmount: 10,
  seekBackwardAmount: 10,
  volumeUp: 'ArrowUp',
  volumeDown: 'ArrowDown',
  volumeStep: 0.1,
  mute: 'm',
  fullscreen: 'f',
  pictureInPicture: 'p',
  increaseSpeed: '>',
  decreaseSpeed: '<',
  resetSpeed: 'r',
  toggleCaptions: 'c',
  jumpToPercentage: {
    '0': 0,
    '1': 10,
    '2': 20,
    '3': 30,
    '4': 40,
    '5': 50,
    '6': 60,
    '7': 70,
    '8': 80,
    '9': 90,
  },
};

/**
 * Legacy keyboard shortcuts (for backward compatibility)
 */
export const keyboardShortcuts = {
  PLAY_PAUSE: ' ',
  SEEK_FORWARD: 'ArrowRight',
  SEEK_BACKWARD: 'ArrowLeft',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  MUTE: 'm',
  FULLSCREEN: 'f',
  PICTURE_IN_PICTURE: 'p',
  JUMP_0: '0',
  JUMP_1: '1',
  JUMP_2: '2',
  JUMP_3: '3',
  JUMP_4: '4',
  JUMP_5: '5',
  JUMP_6: '6',
  JUMP_7: '7',
  JUMP_8: '8',
  JUMP_9: '9',
};

/**
 * Available playback speeds
 */
export const playbackSpeeds: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/**
 * Default player theme
 */
export const defaultPlayerTheme: PlayerTheme = {
  primaryColor: '#3b82f6', // blue-500
  secondaryColor: '#60a5fa', // blue-400
  backgroundColor: '#000000',
  controlsBackgroundColor: '#000000',
  controlsBackgroundOpacity: 0.7,
  textColor: '#ffffff',
  progressBarColor: '#3b82f6',
  progressBarBufferedColor: 'rgba(255, 255, 255, 0.3)',
  progressBarHeight: 4,
  buttonSize: 40,
  borderRadius: 8,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  iconSet: 'default',
};

/**
 * Dark theme variant
 */
export const darkPlayerTheme: PlayerTheme = {
  ...defaultPlayerTheme,
  backgroundColor: '#0f172a', // slate-900
  controlsBackgroundColor: '#1e293b', // slate-800
  primaryColor: '#60a5fa', // blue-400
};

/**
 * Light theme variant
 */
export const lightPlayerTheme: PlayerTheme = {
  ...defaultPlayerTheme,
  backgroundColor: '#f1f5f9', // slate-100
  controlsBackgroundColor: '#ffffff',
  textColor: '#0f172a',
  primaryColor: '#2563eb', // blue-600
  progressBarBufferedColor: 'rgba(0, 0, 0, 0.1)',
};

/**
 * Default captions configuration
 */
export const defaultCaptionConfig: CaptionConfig = {
  enabled: false,
  language: 'en',
  fontSize: 'medium',
  fontFamily: 'Arial, sans-serif',
  color: '#ffffff',
  backgroundColor: '#000000',
  opacity: 0.75,
};

/**
 * Default analytics configuration
 */
export const defaultAnalyticsConfig: AnalyticsConfig = {
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
  progressInterval: 30, // Every 30 seconds
  trackBuffering: true,
  trackErrors: true,
  sendBeacon: true,
};

/**
 * Create default video player configuration
 */
export function createDefaultConfig(sourceUrl: string, overrides?: Partial<VideoPlayerConfig>): VideoPlayerConfig {
  const sourceType = detectVideoSourceType(sourceUrl);
  const videoId = extractVideoId(sourceUrl, sourceType);

  const defaultConfig: VideoPlayerConfig = {
    source: {
      type: sourceType,
      url: sourceUrl,
      videoId: videoId || undefined,
    },
    autoplay: false,
    muted: false,
    loop: false,
    preload: 'metadata',
    defaultVolume: 1,
    defaultPlaybackRate: 1,
    defaultQuality: 'auto',
    controls: true,
    controlsList: ['play', 'volume', 'progress', 'time', 'quality', 'speed', 'captions', 'fullscreen', 'pip'],
    theme: defaultPlayerTheme,
    captions: defaultCaptionConfig,
    keyboardShortcuts: defaultKeyboardShortcuts,
    keyboardEnabled: true,
    analytics: defaultAnalyticsConfig,
    resumePlayback: true,
    saveProgressInterval: 5,
    pictureInPictureEnabled: true,
    airPlayEnabled: true,
    chromecastEnabled: false,
    errorRetryAttempts: 3,
    errorRetryDelay: 1000,
  };

  return { ...defaultConfig, ...overrides };
}

/**
 * Get quality label from height
 */
export function getQualityLabel(height: number): string {
  if (height >= 2160) return '4K';
  if (height >= 1440) return '1440p';
  if (height >= 1080) return '1080p';
  if (height >= 720) return '720p';
  if (height >= 480) return '480p';
  if (height >= 360) return '360p';
  return `${height}p`;
}

/**
 * Legacy default video player configuration (for backward compatibility)
 */
export const defaultPlayerConfig = {
  autoplay: false,
  muted: false,
  loop: false,
  preload: 'metadata' as const,
  volume: 1,
  playbackRate: 1,
};

/**
 * Default HLS.js configuration
 */
export const defaultHlsConfig = {
  enableWorker: true,
  lowLatencyMode: false,
  maxBufferLength: 30,
  maxMaxBufferLength: 600,
  maxBufferSize: 60 * 1000 * 1000, // 60 MB
  maxBufferHole: 0.5,
  startLevel: -1, // Auto quality selection
  abrEwmaDefaultEstimate: 500000,
  abrBandWidthFactor: 0.95,
  abrBandWidthUpFactor: 0.7,
};

// ============================================================================
// STORAGE AND PERSISTENCE
// ============================================================================

/**
 * Local storage keys for user preferences
 */
export const storageKeys = {
  VOLUME: 'video_player_volume',
  MUTED: 'video_player_muted',
  PLAYBACK_RATE: 'video_player_playback_rate',
  QUALITY: 'video_player_quality',
  CAPTIONS: 'video_player_captions',
  THEME: 'video_player_theme',
  KEYBOARD_SHORTCUTS: 'video_player_keyboard_shortcuts',
  ANALYTICS_ENABLED: 'video_player_analytics_enabled',
};

/**
 * Helper to get stored preference from localStorage
 */
export function getStoredPreference<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return defaultValue;
}

/**
 * Helper to store preference in localStorage
 */
export function storePreference<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

/**
 * Get stored player configuration
 */
export function getStoredPlayerConfig(): Partial<VideoPlayerConfig> {
  return {
    defaultVolume: getStoredPreference(storageKeys.VOLUME, 1),
    muted: getStoredPreference(storageKeys.MUTED, false),
    defaultPlaybackRate: getStoredPreference(storageKeys.PLAYBACK_RATE, 1),
    defaultQuality: getStoredPreference(storageKeys.QUALITY, 'auto'),
    theme: getStoredPreference(storageKeys.THEME, defaultPlayerTheme),
    keyboardShortcuts: getStoredPreference(storageKeys.KEYBOARD_SHORTCUTS, defaultKeyboardShortcuts),
    analytics: {
      ...defaultAnalyticsConfig,
      enabled: getStoredPreference(storageKeys.ANALYTICS_ENABLED, true),
    },
  };
}

/**
 * Save player configuration to storage
 */
export function savePlayerConfig(config: Partial<VideoPlayerConfig>): void {
  if (config.defaultVolume !== undefined) {
    storePreference(storageKeys.VOLUME, config.defaultVolume);
  }
  if (config.muted !== undefined) {
    storePreference(storageKeys.MUTED, config.muted);
  }
  if (config.defaultPlaybackRate !== undefined) {
    storePreference(storageKeys.PLAYBACK_RATE, config.defaultPlaybackRate);
  }
  if (config.defaultQuality !== undefined) {
    storePreference(storageKeys.QUALITY, config.defaultQuality);
  }
  if (config.theme !== undefined) {
    storePreference(storageKeys.THEME, config.theme);
  }
  if (config.keyboardShortcuts !== undefined) {
    storePreference(storageKeys.KEYBOARD_SHORTCUTS, config.keyboardShortcuts);
  }
  if (config.analytics?.enabled !== undefined) {
    storePreference(storageKeys.ANALYTICS_ENABLED, config.analytics.enabled);
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Analytics event names
 */
export const analyticsEvents = {
  PLAY: 'video_play',
  PAUSE: 'video_pause',
  SEEK: 'video_seek',
  QUALITY_CHANGE: 'video_quality_change',
  VOLUME_CHANGE: 'video_volume_change',
  SPEED_CHANGE: 'video_speed_change',
  FULLSCREEN: 'video_fullscreen',
  FULLSCREEN_ENTER: 'video_fullscreen_enter',
  FULLSCREEN_EXIT: 'video_fullscreen_exit',
  PIP: 'video_pip',
  PIP_ENTER: 'video_pip_enter',
  PIP_EXIT: 'video_pip_exit',
  ERROR: 'video_error',
  BUFFER: 'video_buffer',
  BUFFER_START: 'video_buffer_start',
  BUFFER_END: 'video_buffer_end',
  COMPLETE: 'video_complete',
  ENDED: 'video_ended',
  CAPTIONS_TOGGLE: 'video_captions_toggle',
  PROGRESS: 'video_progress',
};

/**
 * Send analytics event
 */
export function sendAnalyticsEvent(
  eventName: string,
  data: Record<string, unknown>,
  config: AnalyticsConfig
): void {
  if (!config.enabled) return;

  const endpoint = config.customEndpoint || '/api/v1/analytics/video-event';
  const payload = {
    event: eventName,
    ...data,
    timestamp: Date.now(),
  };

  // Use sendBeacon for reliability (especially for page unload events)
  if (config.sendBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon(endpoint, blob);
  } else {
    // Fallback to fetch
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.warn('Analytics tracking failed:', err);
    });
  }
}

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

/**
 * Validate video player configuration
 */
export function validateConfig(config: Partial<VideoPlayerConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate volume
  if (config.defaultVolume !== undefined) {
    if (config.defaultVolume < 0 || config.defaultVolume > 1) {
      errors.push('defaultVolume must be between 0 and 1');
    }
  }

  // Validate playback rate
  if (config.defaultPlaybackRate !== undefined) {
    if (!playbackSpeeds.includes(config.defaultPlaybackRate)) {
      errors.push(`defaultPlaybackRate must be one of: ${playbackSpeeds.join(', ')}`);
    }
  }

  // Validate theme colors
  if (config.theme) {
    const colorFields = [
      'primaryColor',
      'secondaryColor',
      'backgroundColor',
      'controlsBackgroundColor',
      'textColor',
      'progressBarColor',
    ];

    for (const field of colorFields) {
      const value = config.theme[field as keyof PlayerTheme];
      if (value && typeof value === 'string' && !isValidColor(value)) {
        errors.push(`theme.${field} must be a valid color`);
      }
    }
  }

  // Validate analytics intervals
  if (config.analytics?.progressInterval !== undefined) {
    if (config.analytics.progressInterval < 1) {
      errors.push('analytics.progressInterval must be at least 1 second');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a string is a valid color (hex, rgb, rgba, etc.)
 */
function isValidColor(color: string): boolean {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;

  // Check hex and rgb patterns first
  if (hexPattern.test(color) || rgbPattern.test(color)) {
    return true;
  }

  // Check CSS.supports if available (browser environment)
  if (typeof CSS !== 'undefined' && CSS.supports) {
    return CSS.supports('color', color);
  }

  // Fallback: accept common color keywords
  const commonColors = [
    'transparent', 'black', 'white', 'red', 'green', 'blue',
    'yellow', 'orange', 'purple', 'pink', 'gray', 'grey'
  ];
  return commonColors.includes(color.toLowerCase());
}

// ============================================================================
// CONFIGURATION PRESETS
// ============================================================================

/**
 * Minimal player configuration (no controls)
 */
export const minimalPlayerConfig: Partial<VideoPlayerConfig> = {
  controls: false,
  keyboardEnabled: false,
  resumePlayback: false,
  analytics: {
    ...defaultAnalyticsConfig,
    enabled: false,
  },
};

/**
 * Auto-play configuration (with muted for browser policy compliance)
 */
export const autoplayPlayerConfig: Partial<VideoPlayerConfig> = {
  autoplay: true,
  muted: true,
  loop: true,
};

/**
 * Accessibility-focused configuration
 */
export const accessiblePlayerConfig: Partial<VideoPlayerConfig> = {
  keyboardEnabled: true,
  controls: true,
  captions: {
    ...defaultCaptionConfig,
    enabled: true,
    fontSize: 'large',
  },
};

/**
 * Performance-optimized configuration
 */
export const performancePlayerConfig: Partial<VideoPlayerConfig> = {
  preload: 'none',
  analytics: {
    ...defaultAnalyticsConfig,
    trackProgress: false,
    progressInterval: 60,
  },
};

// ============================================================================
// EXPORT CONFIGURATION SERVICE
// ============================================================================

/**
 * Video Player Configuration Service
 */
export const videoPlayerConfigService = {
  createDefaultConfig,
  getStoredPlayerConfig,
  savePlayerConfig,
  validateConfig,
  detectVideoSourceType,
  extractVideoId,
  formatTime,
  getQualityLabel,
  sendAnalyticsEvent,

  // Theme presets
  themes: {
    default: defaultPlayerTheme,
    dark: darkPlayerTheme,
    light: lightPlayerTheme,
  },

  // Config presets
  presets: {
    minimal: minimalPlayerConfig,
    autoplay: autoplayPlayerConfig,
    accessible: accessiblePlayerConfig,
    performance: performancePlayerConfig,
  },
};
