/**
 * Video Player Configuration
 */

// Format time in mm:ss or hh:mm:ss format
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

// Keyboard shortcuts configuration
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

// Available playback speeds
export const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Get quality label from height
export function getQualityLabel(height: number): string {
  if (height >= 2160) return '4K';
  if (height >= 1440) return '1440p';
  if (height >= 1080) return '1080p';
  if (height >= 720) return '720p';
  if (height >= 480) return '480p';
  if (height >= 360) return '360p';
  return `${height}p`;
}

// Default video player configuration
export const defaultPlayerConfig = {
  autoplay: false,
  muted: false,
  loop: false,
  preload: 'metadata' as const,
  volume: 1,
  playbackRate: 1,
};

// Default HLS.js configuration
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

// Local storage keys for user preferences
export const storageKeys = {
  VOLUME: 'video_player_volume',
  MUTED: 'video_player_muted',
  PLAYBACK_RATE: 'video_player_playback_rate',
  QUALITY: 'video_player_quality',
  CAPTIONS: 'video_player_captions',
};

// Helper to get stored preference from localStorage
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

// Helper to store preference in localStorage
export function storePreference<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

// Analytics event names
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
};
