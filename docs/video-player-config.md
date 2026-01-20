# Video Player Configuration Service

Comprehensive configuration service for the AINative video player with support for multiple video sources, theme customization, keyboard shortcuts, and analytics integration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Video Sources](#video-sources)
- [Theme Customization](#theme-customization)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Analytics Integration](#analytics-integration)
- [Presets](#presets)
- [API Reference](#api-reference)
- [Examples](#examples)

## Overview

The Video Player Configuration Service provides a centralized, type-safe way to configure video players throughout the AINative platform. It handles:

- Multiple video source types (YouTube, Vimeo, HLS, MP4, WebM)
- Player appearance and theme customization
- Keyboard shortcut configuration
- Analytics event tracking
- User preference persistence
- Accessibility features

## Features

- **Multi-source Support**: YouTube, Vimeo, HLS streams, direct MP4/WebM files
- **Theme System**: Pre-built themes (default, dark, light) with full customization
- **Keyboard Control**: Configurable shortcuts for all player functions
- **Analytics**: Comprehensive event tracking with custom endpoints
- **Persistence**: Automatic saving of user preferences
- **Type Safety**: Full TypeScript support with detailed type definitions
- **Validation**: Configuration validation with helpful error messages
- **Presets**: Ready-to-use configurations for common use cases

## Installation

The configuration service is part of the core library:

```typescript
import {
  videoPlayerConfigService,
  createDefaultConfig,
  type VideoPlayerConfig
} from '@/lib/videoPlayerConfig';
```

## Quick Start

### Basic Usage

```typescript
import { createDefaultConfig } from '@/lib/videoPlayerConfig';

// Create a config for a YouTube video
const config = createDefaultConfig('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

// Use with the video player hook
const { videoRef, state, controls } = useVideoPlayer({
  src: config.source.url,
  autoplay: config.autoplay,
  muted: config.muted,
});
```

### With Custom Overrides

```typescript
const config = createDefaultConfig('https://example.com/video.mp4', {
  autoplay: true,
  muted: true,
  theme: darkPlayerTheme,
  analytics: {
    enabled: true,
    customEndpoint: '/api/custom-analytics',
  },
});
```

## Configuration

### Complete Configuration Interface

```typescript
interface VideoPlayerConfig {
  // Source configuration
  source: VideoSourceConfig;

  // Playback settings
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  preload: 'none' | 'metadata' | 'auto';
  defaultVolume: number; // 0-1
  defaultPlaybackRate: PlaybackSpeed; // 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2
  defaultQuality: VideoQuality; // 'auto', '4k', '1440p', '1080p', '720p', etc.

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
```

## Video Sources

### Supported Source Types

```typescript
type VideoSourceType = 'youtube' | 'vimeo' | 'hls' | 'mp4' | 'webm' | 'direct';
```

### Source Detection

The service automatically detects video source types:

```typescript
import { detectVideoSourceType, extractVideoId } from '@/lib/videoPlayerConfig';

const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const sourceType = detectVideoSourceType(url); // 'youtube'
const videoId = extractVideoId(url, sourceType); // 'dQw4w9WgXcQ'
```

### Examples by Source Type

#### YouTube

```typescript
const config = createDefaultConfig('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
// source.type: 'youtube'
// source.videoId: 'dQw4w9WgXcQ'
```

#### Vimeo

```typescript
const config = createDefaultConfig('https://vimeo.com/123456789');
// source.type: 'vimeo'
// source.videoId: '123456789'
```

#### HLS Stream

```typescript
const config = createDefaultConfig('https://cdn.example.com/stream.m3u8');
// source.type: 'hls'
```

#### Direct File

```typescript
const config = createDefaultConfig('https://cdn.example.com/video.mp4');
// source.type: 'mp4'
```

## Theme Customization

### Pre-built Themes

```typescript
import {
  defaultPlayerTheme,
  darkPlayerTheme,
  lightPlayerTheme
} from '@/lib/videoPlayerConfig';

// Use a pre-built theme
const config = createDefaultConfig(videoUrl, {
  theme: darkPlayerTheme,
});
```

### Custom Theme

```typescript
const customTheme: PlayerTheme = {
  primaryColor: '#ff0000',
  secondaryColor: '#cc0000',
  backgroundColor: '#000000',
  controlsBackgroundColor: '#1a1a1a',
  controlsBackgroundOpacity: 0.8,
  textColor: '#ffffff',
  progressBarColor: '#ff0000',
  progressBarBufferedColor: 'rgba(255, 255, 255, 0.2)',
  progressBarHeight: 6,
  buttonSize: 48,
  borderRadius: 12,
  fontFamily: 'Inter, sans-serif',
  iconSet: 'rounded',
};

const config = createDefaultConfig(videoUrl, { theme: customTheme });
```

### Theme Properties

| Property | Type | Description |
|----------|------|-------------|
| `primaryColor` | string | Main accent color (buttons, highlights) |
| `secondaryColor` | string | Secondary accent color |
| `backgroundColor` | string | Player background color |
| `controlsBackgroundColor` | string | Controls bar background |
| `controlsBackgroundOpacity` | number | Controls bar opacity (0-1) |
| `textColor` | string | Text color |
| `progressBarColor` | string | Progress bar color |
| `progressBarBufferedColor` | string | Buffered section color |
| `progressBarHeight` | number | Progress bar height in pixels |
| `buttonSize` | number | Control button size in pixels |
| `borderRadius` | number | Border radius in pixels |
| `fontFamily` | string | Font family for text |
| `iconSet` | string | Icon style ('default', 'rounded', 'sharp', 'outlined') |

## Keyboard Shortcuts

### Default Shortcuts

```typescript
const defaultShortcuts = {
  playPause: ' ',              // Space bar
  seekForward: 'ArrowRight',   // Right arrow (10s)
  seekBackward: 'ArrowLeft',   // Left arrow (10s)
  volumeUp: 'ArrowUp',         // Up arrow
  volumeDown: 'ArrowDown',     // Down arrow
  mute: 'm',
  fullscreen: 'f',
  pictureInPicture: 'p',
  increaseSpeed: '>',
  decreaseSpeed: '<',
  resetSpeed: 'r',
  toggleCaptions: 'c',
  jumpToPercentage: {
    '0': 0,   // Jump to start
    '1': 10,  // Jump to 10%
    '2': 20,  // Jump to 20%
    // ... up to '9': 90
  },
};
```

### Custom Shortcuts

```typescript
const customShortcuts: KeyboardShortcutsConfig = {
  ...defaultKeyboardShortcuts,
  seekForwardAmount: 15,      // Seek 15s instead of 10s
  seekBackwardAmount: 15,
  volumeStep: 0.05,           // Smaller volume increments
  increaseSpeed: 'Shift+>',
  decreaseSpeed: 'Shift+<',
};

const config = createDefaultConfig(videoUrl, {
  keyboardShortcuts: customShortcuts,
});
```

## Analytics Integration

### Analytics Configuration

```typescript
const analyticsConfig: AnalyticsConfig = {
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
  progressInterval: 30,        // Track progress every 30 seconds
  trackBuffering: true,
  trackErrors: true,
  customEndpoint: '/api/v1/analytics/video-event',
  sendBeacon: true,            // Use navigator.sendBeacon for reliability
};
```

### Analytics Events

```typescript
import { analyticsEvents } from '@/lib/videoPlayerConfig';

// Available events:
analyticsEvents.PLAY              // 'video_play'
analyticsEvents.PAUSE             // 'video_pause'
analyticsEvents.SEEK              // 'video_seek'
analyticsEvents.VOLUME_CHANGE     // 'video_volume_change'
analyticsEvents.SPEED_CHANGE      // 'video_speed_change'
analyticsEvents.QUALITY_CHANGE    // 'video_quality_change'
analyticsEvents.FULLSCREEN_ENTER  // 'video_fullscreen_enter'
analyticsEvents.FULLSCREEN_EXIT   // 'video_fullscreen_exit'
analyticsEvents.PIP_ENTER         // 'video_pip_enter'
analyticsEvents.PIP_EXIT          // 'video_pip_exit'
analyticsEvents.BUFFER_START      // 'video_buffer_start'
analyticsEvents.BUFFER_END        // 'video_buffer_end'
analyticsEvents.ENDED             // 'video_ended'
analyticsEvents.ERROR             // 'video_error'
analyticsEvents.PROGRESS          // 'video_progress'
```

### Custom Analytics Endpoint

```typescript
const config = createDefaultConfig(videoUrl, {
  analytics: {
    ...defaultAnalyticsConfig,
    customEndpoint: 'https://analytics.example.com/track',
    sendBeacon: true,
  },
});
```

### Manual Event Tracking

```typescript
import { sendAnalyticsEvent } from '@/lib/videoPlayerConfig';

sendAnalyticsEvent(
  'custom_event',
  {
    videoId: 'video-123',
    customData: 'value',
  },
  analyticsConfig
);
```

## Presets

### Available Presets

#### Minimal Player

```typescript
import { videoPlayerConfigService } from '@/lib/videoPlayerConfig';

const config = createDefaultConfig(videoUrl,
  videoPlayerConfigService.presets.minimal
);
// No controls, no keyboard, no analytics
```

#### Autoplay

```typescript
const config = createDefaultConfig(videoUrl,
  videoPlayerConfigService.presets.autoplay
);
// Autoplay enabled, muted, looped
```

#### Accessible

```typescript
const config = createDefaultConfig(videoUrl,
  videoPlayerConfigService.presets.accessible
);
// Captions enabled, large font, keyboard navigation
```

#### Performance

```typescript
const config = createDefaultConfig(videoUrl,
  videoPlayerConfigService.presets.performance
);
// Reduced analytics, no preload
```

## API Reference

### Functions

#### `createDefaultConfig(sourceUrl, overrides?)`

Creates a complete configuration with sensible defaults.

```typescript
function createDefaultConfig(
  sourceUrl: string,
  overrides?: Partial<VideoPlayerConfig>
): VideoPlayerConfig
```

#### `validateConfig(config)`

Validates a configuration object.

```typescript
function validateConfig(config: Partial<VideoPlayerConfig>): {
  valid: boolean;
  errors: string[];
}
```

#### `getStoredPlayerConfig()`

Retrieves user preferences from localStorage.

```typescript
function getStoredPlayerConfig(): Partial<VideoPlayerConfig>
```

#### `savePlayerConfig(config)`

Saves user preferences to localStorage.

```typescript
function savePlayerConfig(config: Partial<VideoPlayerConfig>): void
```

#### `detectVideoSourceType(url)`

Detects the video source type from a URL.

```typescript
function detectVideoSourceType(url: string): VideoSourceType
```

#### `extractVideoId(url, sourceType)`

Extracts video ID from YouTube or Vimeo URLs.

```typescript
function extractVideoId(
  url: string,
  sourceType: VideoSourceType
): string | null
```

#### `formatTime(seconds)`

Formats time in mm:ss or hh:mm:ss format.

```typescript
function formatTime(seconds: number): string
```

#### `getQualityLabel(height)`

Returns a quality label from video height.

```typescript
function getQualityLabel(height: number): string
```

#### `sendAnalyticsEvent(eventName, data, config)`

Sends an analytics event.

```typescript
function sendAnalyticsEvent(
  eventName: string,
  data: Record<string, unknown>,
  config: AnalyticsConfig
): void
```

### Configuration Service

```typescript
import { videoPlayerConfigService } from '@/lib/videoPlayerConfig';

// Access all functions
videoPlayerConfigService.createDefaultConfig(url)
videoPlayerConfigService.validateConfig(config)
videoPlayerConfigService.getStoredPlayerConfig()
videoPlayerConfigService.savePlayerConfig(config)

// Access theme presets
videoPlayerConfigService.themes.default
videoPlayerConfigService.themes.dark
videoPlayerConfigService.themes.light

// Access configuration presets
videoPlayerConfigService.presets.minimal
videoPlayerConfigService.presets.autoplay
videoPlayerConfigService.presets.accessible
videoPlayerConfigService.presets.performance
```

## Examples

### Tutorial Video Player

```typescript
const tutorialConfig = createDefaultConfig(
  'https://cdn.ainative.com/tutorials/intro.m3u8',
  {
    autoplay: false,
    controls: true,
    theme: lightPlayerTheme,
    resumePlayback: true,
    captions: {
      enabled: true,
      language: 'en',
      fontSize: 'medium',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#000000',
      opacity: 0.8,
    },
    analytics: {
      ...defaultAnalyticsConfig,
      trackProgress: true,
      progressInterval: 15,
    },
  }
);
```

### Background Video

```typescript
const backgroundConfig = createDefaultConfig(
  'https://cdn.ainative.com/background.mp4',
  {
    autoplay: true,
    muted: true,
    loop: true,
    controls: false,
    keyboardEnabled: false,
    analytics: {
      ...defaultAnalyticsConfig,
      enabled: false,
    },
  }
);
```

### Live Stream

```typescript
const liveStreamConfig = createDefaultConfig(
  'https://stream.ainative.com/live/main.m3u8',
  {
    autoplay: true,
    muted: false,
    defaultQuality: 'auto',
    theme: darkPlayerTheme,
    analytics: {
      ...defaultAnalyticsConfig,
      trackBuffering: true,
      trackErrors: true,
      customEndpoint: '/api/v1/analytics/live-stream',
    },
  }
);
```

### Webinar Recording

```typescript
const webinarConfig = createDefaultConfig(
  'https://vimeo.com/987654321',
  {
    resumePlayback: true,
    theme: defaultPlayerTheme,
    captions: {
      enabled: true,
      language: 'en',
      fontSize: 'large',
      fontFamily: 'Inter, sans-serif',
      color: '#ffffff',
      backgroundColor: '#000000',
      opacity: 0.9,
    },
    analytics: {
      ...defaultAnalyticsConfig,
      trackProgress: true,
      progressInterval: 30,
      trackComplete: true,
    },
  }
);
```

### Mobile-Optimized Player

```typescript
const mobileConfig = createDefaultConfig(videoUrl, {
  preload: 'none',
  pictureInPictureEnabled: true,
  theme: {
    ...defaultPlayerTheme,
    buttonSize: 56,  // Larger for touch
    progressBarHeight: 6,
  },
  analytics: {
    ...defaultAnalyticsConfig,
    progressInterval: 60,  // Less frequent tracking
  },
});
```

## Best Practices

1. **Always validate configuration** before using it:
   ```typescript
   const validation = validateConfig(config);
   if (!validation.valid) {
     console.error('Invalid config:', validation.errors);
   }
   ```

2. **Use presets as a starting point** and override specific settings:
   ```typescript
   const config = createDefaultConfig(url, {
     ...videoPlayerConfigService.presets.accessible,
     theme: customTheme,
   });
   ```

3. **Save user preferences** when they change:
   ```typescript
   const handleVolumeChange = (volume: number) => {
     savePlayerConfig({ defaultVolume: volume });
   };
   ```

4. **Handle errors gracefully**:
   ```typescript
   const config = createDefaultConfig(url, {
     errorRetryAttempts: 3,
     errorRetryDelay: 2000,
   });
   ```

5. **Optimize for performance** on slower connections:
   ```typescript
   const config = createDefaultConfig(url, {
     preload: 'metadata',
     analytics: {
       ...defaultAnalyticsConfig,
       trackProgress: false,
     },
   });
   ```

## Related Documentation

- [Video Player Hook](/docs/hooks/useVideoPlayer.md)
- [Video Storage Service](/docs/video-storage.md)
- [Analytics Integration](/docs/analytics.md)
- [Accessibility Guidelines](/docs/accessibility.md)
