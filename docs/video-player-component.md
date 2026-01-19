# Video Player Component Documentation

## Overview

The AINative Studio video player system provides a comprehensive, production-ready HLS video player with advanced features including chapter navigation, progress tracking, quality selection, subtitle support, and thumbnail previews.

## Architecture

### Component Structure

```
components/video/
├── TutorialVideoPlayer.tsx    # Main integrated player component
├── VideoPlayer.tsx             # Base HLS video player
├── VideoPlayerControls.tsx     # Control interface
├── ChapterMarkers.tsx          # Chapter timeline markers
└── ThumbnailPreview.tsx        # Hover thumbnail preview

hooks/
├── useVideoPlayer.ts           # Core video player logic
├── useChapterNavigation.ts     # Chapter navigation management
└── useTutorialProgressSync.ts  # Progress tracking API integration

lib/
├── videoPlayerConfig.ts        # Configuration and utilities
└── videoStorage.ts             # Local storage for bookmarks/progress
```

## Components

### TutorialVideoPlayer

The complete tutorial video player with all features integrated.

#### Props

```typescript
interface TutorialVideoPlayerProps {
  tutorialId: string;              // Tutorial ID for progress tracking
  src: string;                     // HLS stream URL or direct video URL
  poster?: string;                 // Video poster image
  chapters?: Chapter[];            // Chapter markers
  subtitles?: SubtitleTrack[];     // Subtitle/caption tracks
  autoplay?: boolean;              // Autoplay on mount
  muted?: boolean;                 // Start muted
  startTime?: number;              // Initial playback time (seconds)
  enableProgressTracking?: boolean; // Enable automatic progress syncing
  progressSyncInterval?: number;   // Progress sync interval (ms)
  showThumbnailPreview?: boolean;  // Show thumbnail on hover
  showChapterMarkers?: boolean;    // Show chapter markers on timeline
  enableKeyboardShortcuts?: boolean; // Enable keyboard shortcuts
  onEnded?: () => void;            // Callback when video ends
  onChapterChange?: (chapter: Chapter) => void; // Callback on chapter change
  onProgressSaved?: () => void;    // Callback when progress is saved
  onChapterCompleted?: (chapterId: string) => void; // Callback on chapter completion
  className?: string;              // Custom class name
}
```

#### Usage Example

```tsx
import { TutorialVideoPlayer } from '@/components/video/TutorialVideoPlayer';

export default function TutorialPage() {
  const chapters = [
    {
      id: 'intro',
      title: 'Introduction',
      startTime: 0,
      endTime: 120,
      description: 'Getting started with the tutorial',
    },
    {
      id: 'setup',
      title: 'Environment Setup',
      startTime: 120,
      endTime: 300,
      description: 'Setting up your development environment',
    },
    {
      id: 'coding',
      title: 'Writing Code',
      startTime: 300,
      endTime: 600,
      description: 'Building the application',
    },
  ];

  const subtitles = [
    {
      id: 'en',
      label: 'English',
      language: 'en',
      url: '/subtitles/tutorial-en.vtt',
      default: true,
    },
    {
      id: 'es',
      label: 'Spanish',
      language: 'es',
      url: '/subtitles/tutorial-es.vtt',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tutorial: Getting Started</h1>

      <TutorialVideoPlayer
        tutorialId="tutorial-123"
        src="https://cdn.example.com/tutorials/123/master.m3u8"
        poster="/images/tutorial-123-poster.jpg"
        chapters={chapters}
        subtitles={subtitles}
        enableProgressTracking={true}
        showThumbnailPreview={true}
        showChapterMarkers={true}
        onChapterChange={(chapter) => {
          console.log('Current chapter:', chapter.title);
        }}
        onChapterCompleted={(chapterId) => {
          console.log('Chapter completed:', chapterId);
        }}
      />

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Tutorial Content</h2>
        {/* Additional content */}
      </div>
    </div>
  );
}
```

### VideoPlayer (Base Component)

The base video player component without tutorial-specific features.

#### Usage Example

```tsx
import { VideoPlayer } from '@/components/video/VideoPlayer';

export default function VideoPage() {
  return (
    <VideoPlayer
      videoId="video-456"
      src="https://cdn.example.com/videos/456/master.m3u8"
      poster="/images/video-456-poster.jpg"
      autoplay={false}
      controls={true}
      onPlay={() => console.log('Video started')}
      onEnded={() => console.log('Video ended')}
    />
  );
}
```

## Hooks

### useVideoPlayer

Core hook for video player state management and HLS initialization.

```typescript
const { videoRef, state, controls } = useVideoPlayer({
  src: 'https://cdn.example.com/video.m3u8',
  videoId: 'my-video',
  autoplay: false,
  muted: false,
  onPlay: () => console.log('Playing'),
  onPause: () => console.log('Paused'),
  onEnded: () => console.log('Ended'),
});
```

#### State Object

```typescript
interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  playbackRate: number;
  buffered: number;
  quality: number | 'auto';
  qualities: Array<{ height: number; bitrate: number }>;
  isBuffering: boolean;
  error: string | null;
  captionsEnabled: boolean;
}
```

#### Controls Object

```typescript
interface VideoControls {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (quality: number | 'auto') => void;
  toggleFullscreen: () => void;
  togglePiP: () => void;
}
```

### useChapterNavigation

Hook for managing chapter navigation.

```typescript
const {
  currentChapter,
  currentChapterIndex,
  goToChapter,
  nextChapter,
  previousChapter,
  hasNextChapter,
  hasPreviousChapter,
  getChapterById,
  chapterProgress,
} = useChapterNavigation({
  chapters: myChapters,
  currentTime: state.currentTime,
  onSeek: controls.seek,
  onChapterChange: (chapter) => console.log('Chapter changed:', chapter),
});
```

### useTutorialProgressSync

Hook for syncing tutorial progress with the API.

```typescript
const { syncProgress, completeCurrentChapter, isSyncing, lastSyncTime } =
  useTutorialProgressSync({
    tutorialId: 'tutorial-123',
    currentChapter: currentChapter,
    currentTime: state.currentTime,
    duration: state.duration,
    isPlaying: state.isPlaying,
    totalChapters: chapters.length,
    onProgressSaved: () => console.log('Progress saved'),
    onChapterCompleted: (id) => console.log('Chapter completed:', id),
    syncInterval: 10000, // 10 seconds
  });
```

## Features

### HLS Streaming

- Automatic quality switching based on network conditions
- Manual quality selection
- Support for multiple bitrate streams
- Buffering optimization
- Error recovery and retry logic

### Chapter Navigation

- Visual chapter markers on timeline
- Click to jump to chapter
- Next/Previous chapter buttons
- Keyboard shortcuts (N for next, B for previous)
- Chapter progress tracking
- Automatic chapter change detection

### Progress Tracking

- Automatic progress syncing every 10 seconds (configurable)
- Chapter completion detection (90% threshold)
- Resume playback from last position
- Integration with tutorial progress API
- Local storage backup

### Quality Selection

- Auto quality (adaptive streaming)
- Manual quality selection (4K, 1440p, 1080p, 720p, 480p, 360p)
- Smooth quality transitions
- Quality preference persistence

### Playback Controls

- Play/Pause
- Seek bar with progress visualization
- Volume control with slider
- Playback speed (0.25x - 2x)
- Fullscreen mode
- Picture-in-Picture mode
- Time display

### Subtitle Support

- Multiple subtitle tracks
- Language selection
- Show/hide subtitles
- WebVTT format support
- Subtitle preference persistence

### Thumbnail Preview

- Generate thumbnails on hover
- Show preview at hover position
- Display timestamp
- Smooth animations

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Space | Play/Pause |
| ← | Seek backward 5s |
| → | Seek forward 5s |
| ↑ | Volume up |
| ↓ | Volume down |
| M | Toggle mute |
| F | Toggle fullscreen |
| P | Toggle Picture-in-Picture |
| N | Next chapter |
| B | Previous chapter |
| 0-9 | Jump to 0%-90% |

### Responsive Design

- Mobile-optimized controls
- Touch-friendly interface
- Adaptive layout for different screen sizes
- Fullscreen support on all devices

### Accessibility

- ARIA labels on all controls
- Keyboard navigation support
- Screen reader compatible
- High contrast controls
- Focus indicators

## API Integration

### Tutorial Progress API

The video player integrates with the tutorial progress tracking API:

#### Endpoints

**Get Progress**
```
GET /api/tutorials/[id]/progress
```

**Update Chapter Progress**
```
POST /api/tutorials/[id]/progress/chapter
Body: {
  chapterId: string;
  watchTime: number;
  completed: boolean;
  lastPosition: number;
  totalChapters: number;
}
```

**Reset Progress**
```
DELETE /api/tutorials/[id]/progress
```

#### Progress Object

```typescript
interface TutorialProgress {
  tutorialId: string;
  userId: string | null;
  completionPercentage: number;
  chaptersCompleted: number;
  totalChapters: number;
  chapterProgress: ChapterProgress[];
  quizScores: QuizScore[];
  certificateEligible: boolean;
  certificateEarned: boolean;
  totalWatchTime: number;
  lastWatchedAt: Date | null;
}
```

## Configuration

### Video Player Config

Located in `/lib/videoPlayerConfig.ts`:

```typescript
// Playback speeds
export const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// HLS configuration
export const defaultHlsConfig = {
  enableWorker: true,
  lowLatencyMode: false,
  maxBufferLength: 30,
  maxMaxBufferLength: 600,
  startLevel: -1, // Auto quality
};

// Storage keys
export const storageKeys = {
  VOLUME: 'video_player_volume',
  MUTED: 'video_player_muted',
  PLAYBACK_RATE: 'video_player_playback_rate',
  QUALITY: 'video_player_quality',
  CAPTIONS: 'video_player_captions',
};
```

## Best Practices

### Video Sources

1. **Use HLS Streaming**: Recommended format for tutorials and webinars
   - Adaptive bitrate streaming
   - Better user experience across varying network conditions
   - Industry standard format

2. **Provide Multiple Quality Levels**:
   - 1080p for high-quality playback
   - 720p for standard quality
   - 480p for mobile/slower connections
   - 360p as fallback

3. **Include Poster Images**:
   - Use 16:9 aspect ratio
   - Recommended resolution: 1920x1080
   - File size: < 200KB

### Chapter Organization

1. **Keep Chapters Focused**: Each chapter should cover a single topic
2. **Reasonable Length**: 2-5 minutes per chapter ideal
3. **Clear Titles**: Use descriptive chapter names
4. **Add Descriptions**: Provide context for each chapter

### Progress Tracking

1. **Set Appropriate Sync Interval**: 10-15 seconds recommended
2. **Handle Offline Scenarios**: Store progress locally as backup
3. **Implement Retry Logic**: Handle API failures gracefully

### Performance

1. **Lazy Load Components**: Use dynamic imports for heavy components
2. **Optimize Thumbnails**: Generate at appropriate resolution
3. **Preload Metadata**: Use `preload="metadata"` attribute
4. **Cleanup on Unmount**: Properly destroy HLS instance

## Troubleshooting

### Video Not Playing

1. Check HLS stream URL is valid
2. Verify CORS headers on video CDN
3. Check browser HLS support (use hls.js for non-Safari browsers)
4. Inspect network tab for failed requests

### Progress Not Syncing

1. Verify API endpoints are accessible
2. Check authentication/authorization
3. Inspect console for API errors
4. Verify tutorial ID is correct

### Chapter Markers Not Showing

1. Ensure chapters array is provided
2. Check chapter startTime/endTime values
3. Verify duration is loaded
4. Check CSS styles not hiding markers

### Poor Quality Selection

1. Check available quality levels in HLS manifest
2. Verify network speed
3. Test manual quality selection
4. Check HLS configuration settings

## Advanced Usage

### Custom Player with Chapters

```tsx
import { useState } from 'react';
import { TutorialVideoPlayer } from '@/components/video/TutorialVideoPlayer';
import { Card } from '@/components/ui/card';

export default function CustomTutorialPlayer() {
  const [currentChapter, setCurrentChapter] = useState(null);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <TutorialVideoPlayer
          tutorialId="tutorial-789"
          src="/videos/tutorial-789.m3u8"
          chapters={chapters}
          onChapterChange={setCurrentChapter}
        />
      </div>

      <div className="col-span-1">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Current Chapter</h3>
          {currentChapter && (
            <div>
              <p className="font-medium">{currentChapter.title}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {currentChapter.description}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
```

### Progress Dashboard

```tsx
import { useTutorialProgress } from '@/hooks/useTutorialProgress';

export function TutorialProgressDashboard({ tutorialId }) {
  const { progress, isLoading } = useTutorialProgress(tutorialId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Progress</h3>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {progress.chaptersCompleted} / {progress.totalChapters} chapters completed
          </p>
        </div>
      </div>

      {progress.certificateEligible && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            🎉 You're eligible for a certificate!
          </p>
        </div>
      )}
    </div>
  );
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 5+)

## Dependencies

- `hls.js` - HLS streaming support
- `lucide-react` - Icons
- `@radix-ui/react-*` - UI components (via shadcn/ui)
- `next` - Next.js framework
- `react` - React library

## License

This component is part of the AINative Studio project.
