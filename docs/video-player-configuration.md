# Video Player Configuration

Comprehensive configuration service for HLS.js-based video player with adaptive bitrate streaming, quality controls, and optimal user experience.

## Location

`/lib/videoPlayerConfig.ts`

## Overview

The video player configuration service provides:
- HLS.js adaptive bitrate streaming configuration
- Quality level presets and controls
- Default player settings
- Playback speed controls
- Keyboard shortcut mappings
- Time formatting utilities
- User preference management

## Usage

### Import the Configuration

```typescript
import { videoPlayerConfig } from '@/lib/videoPlayerConfig';

// Use the complete configuration
const { hlsConfig, defaultSettings, qualityPresets } = videoPlayerConfig;
```

### Initialize HLS.js Player

```typescript
import Hls from 'hls.js';
import { hlsConfig } from '@/lib/videoPlayerConfig';

const video = document.querySelector('video');
const hls = new Hls(hlsConfig);
hls.loadSource('https://example.com/video.m3u8');
hls.attachMedia(video);
```

### Apply Default Settings

```typescript
import { defaultSettings } from '@/lib/videoPlayerConfig';

const video = document.querySelector('video');
video.autoplay = defaultSettings.autoplay;
video.controls = defaultSettings.controls;
video.muted = defaultSettings.muted;
video.preload = defaultSettings.preload;
video.volume = defaultSettings.volume;
video.playbackRate = defaultSettings.playbackRate;
```

## Configuration Options

### HLS.js Configuration (`hlsConfig`)

#### Buffer Settings
- **maxBufferLength**: `30` seconds - Maximum buffer length
- **maxMaxBufferLength**: `600` seconds (10 minutes) - Maximum allowed buffer
- **maxBufferSize**: `60 MB` - Maximum buffer size in bytes
- **maxBufferHole**: `0.5` seconds - Maximum buffer discontinuity tolerance
- **backBufferLength**: `90` seconds - Back buffer retention

#### Performance Settings
- **enableWorker**: `true` - Use Web Worker for fragment loading
- **lowLatencyMode**: `true` - Enable low latency for live streams
- **debug**: `false` (production) / `true` (development) - Debug logging

#### Adaptive Bitrate (ABR) Settings
- **startLevel**: `-1` - Auto quality selection (-1 = automatic)
- **abrEwmaDefaultEstimate**: `500000` - Initial bandwidth estimate (500 kbps)
- **abrBandWidthFactor**: `0.95` - Conservative bandwidth factor
- **abrBandWidthUpFactor**: `0.7` - Factor for switching up quality

#### Loading & Retry Configuration
- **Fragment Loading**:
  - Timeout: 20 seconds
  - Max retries: 6
  - Retry delay: 1 second
  - Max retry timeout: 64 seconds

- **Manifest Loading**:
  - Timeout: 10 seconds
  - Max retries: 4
  - Retry delay: 1 second
  - Max retry timeout: 64 seconds

- **Level Loading**:
  - Timeout: 10 seconds
  - Max retries: 4
  - Retry delay: 1 second
  - Max retry timeout: 64 seconds

### Default Player Settings (`defaultSettings`)

```typescript
{
  autoplay: false,           // Don't autoplay videos
  controls: true,            // Show native/custom controls
  muted: false,              // Not muted by default
  loop: false,               // Don't loop by default
  preload: 'metadata',       // Only preload metadata
  volume: 1,                 // Full volume (0-1 range)
  playbackRate: 1,           // Normal playback speed
  playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2]  // Available speeds
}
```

### Quality Presets (`qualityPresets`)

```typescript
{
  auto: -1,       // Automatic quality selection
  '4K': 2160,     // 4K UHD (2160p)
  '1440p': 1440,  // QHD (1440p)
  '1080p': 1080,  // Full HD (1080p)
  '720p': 720,    // HD (720p)
  '480p': 480,    // SD (480p)
  '360p': 360,    // Low quality (360p)
  '240p': 240     // Very low quality (240p)
}
```

### Playback Speeds (`playbackSpeeds`)

Available playback speeds: `[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]`

### Keyboard Shortcuts (`keyboardShortcuts`)

| Action | Key |
|--------|-----|
| Play/Pause | Space |
| Seek Forward | Arrow Right |
| Seek Backward | Arrow Left |
| Volume Up | Arrow Up |
| Volume Down | Arrow Down |
| Mute/Unmute | M |
| Fullscreen | F |
| Picture-in-Picture | P |
| Jump to 0% | 0 |
| Jump to 10% | 1 |
| Jump to 20% | 2 |
| ... | ... |
| Jump to 90% | 9 |

## Utility Functions

### `getQualityLabel(height: number): string`

Convert pixel height to quality label.

```typescript
getQualityLabel(1080) // Returns: "1080p"
getQualityLabel(2160) // Returns: "4K"
getQualityLabel(900)  // Returns: "900p"
```

### `formatTime(seconds: number): string`

Format seconds as human-readable time string.

```typescript
formatTime(90)    // Returns: "1:30"
formatTime(3661)  // Returns: "1:01:01"
formatTime(0)     // Returns: "0:00"
```

## Quality Selection Examples

### Auto Quality (Default)

```typescript
import Hls from 'hls.js';
import { hlsConfig } from '@/lib/videoPlayerConfig';

const hls = new Hls(hlsConfig);
// startLevel: -1 enables automatic quality selection
```

### Manual Quality Selection

```typescript
import { qualityPresets } from '@/lib/videoPlayerConfig';

// Set to 1080p
hls.currentLevel = hls.levels.findIndex(level =>
  level.height === qualityPresets['1080p']
);

// Set to auto
hls.currentLevel = -1;
```

### List Available Qualities

```typescript
import { getQualityLabel } from '@/lib/videoPlayerConfig';

hls.on(Hls.Events.MANIFEST_PARSED, () => {
  const qualities = hls.levels.map((level, index) => ({
    index,
    label: getQualityLabel(level.height),
    height: level.height,
    bitrate: level.bitrate
  }));

  console.log('Available qualities:', qualities);
});
```

## Adaptive Bitrate Behavior

The configuration is optimized for smooth playback with minimal buffering:

1. **Conservative Bandwidth Factor** (`0.95`): Prevents overestimating bandwidth and frequent quality switches
2. **Lower Up-Switch Factor** (`0.7`): Requires sustained higher bandwidth before upgrading quality
3. **30-Second Buffer**: Handles temporary network fluctuations
4. **Auto Quality by Default**: Adapts to user's network conditions

## Network Scenarios

### Poor Network
- Starts at lowest quality
- Gradually increases quality as buffer builds
- Falls back quickly if buffering occurs

### Good Network
- Starts at medium quality
- Increases to highest sustainable quality
- Maintains quality with 30s buffer cushion

### Variable Network
- Adjusts quality dynamically
- Conservative factor prevents rapid switching
- Buffer provides stability during fluctuations

## Testing Different Qualities

```typescript
import { qualityPresets, getQualityLabel } from '@/lib/videoPlayerConfig';

// Test all quality levels
Object.entries(qualityPresets).forEach(([label, height]) => {
  console.log(`${label}: ${height}p`);

  if (height !== -1) {
    const levelIndex = hls.levels.findIndex(l => l.height === height);
    if (levelIndex !== -1) {
      hls.currentLevel = levelIndex;
      console.log(`Set quality to ${getQualityLabel(height)}`);
    }
  }
});
```

## Performance Considerations

### Web Worker
- **enableWorker: true** offloads fragment parsing to a separate thread
- Improves main thread performance
- Better responsiveness during video playback

### Low Latency Mode
- **lowLatencyMode: true** reduces latency for live streams
- May increase buffering frequency on poor connections
- Optimal for real-time content

### Buffer Management
- 30-second buffer balances smoothness vs memory usage
- 10-minute max buffer prevents excessive memory consumption
- 90-second back buffer enables smooth seeking

## Migration from Legacy Configuration

The service maintains backward compatibility:

```typescript
// Old (deprecated)
import { defaultPlayerConfig, defaultHlsConfig } from '@/lib/videoPlayerConfig';

// New (recommended)
import { defaultSettings, hlsConfig } from '@/lib/videoPlayerConfig';

// Or use the unified configuration
import { videoPlayerConfig } from '@/lib/videoPlayerConfig';
const { hlsConfig, defaultSettings } = videoPlayerConfig;
```

## Related Files

- `/lib/videoPlayerConfig.ts` - Configuration service (this file)
- `/lib/__tests__/videoPlayerConfig.test.ts` - Test suite
- `/lib/video-service.ts` - Video service integration
- `/lib/videoStorage.ts` - Video storage utilities

## References

- [HLS.js Documentation](https://github.com/video-dev/hls.js/blob/master/docs/API.md)
- [HLS.js Configuration Options](https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning)
- [Adaptive Bitrate Streaming](https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/Adaptive_streaming)
