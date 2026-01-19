# Video Player Quick Reference

## Quick Start

### Basic Usage

```tsx
import { TutorialVideoPlayer } from '@/components/video';

<TutorialVideoPlayer
  tutorialId="my-tutorial"
  src="https://cdn.example.com/video.m3u8"
  poster="/images/poster.jpg"
/>
```

### With Chapters

```tsx
const chapters = [
  { id: '1', title: 'Intro', startTime: 0, endTime: 120 },
  { id: '2', title: 'Content', startTime: 120, endTime: 480 },
];

<TutorialVideoPlayer
  tutorialId="tutorial-123"
  src={videoUrl}
  chapters={chapters}
  showChapterMarkers={true}
/>
```

### With Progress Tracking

```tsx
<TutorialVideoPlayer
  tutorialId="tutorial-123"
  src={videoUrl}
  chapters={chapters}
  enableProgressTracking={true}
  onChapterCompleted={(id) => console.log('Completed:', id)}
  onProgressSaved={() => console.log('Progress saved')}
/>
```

## Component Props Cheatsheet

### TutorialVideoPlayer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tutorialId` | `string` | **required** | Tutorial ID for tracking |
| `src` | `string` | **required** | HLS stream URL |
| `poster` | `string` | `undefined` | Poster image URL |
| `chapters` | `Chapter[]` | `[]` | Chapter markers |
| `subtitles` | `SubtitleTrack[]` | `[]` | Subtitle tracks |
| `autoplay` | `boolean` | `false` | Auto-play on mount |
| `muted` | `boolean` | `false` | Start muted |
| `startTime` | `number` | `0` | Start position (seconds) |
| `enableProgressTracking` | `boolean` | `true` | Enable auto progress sync |
| `progressSyncInterval` | `number` | `10000` | Sync interval (ms) |
| `showThumbnailPreview` | `boolean` | `true` | Show hover thumbnails |
| `showChapterMarkers` | `boolean` | `true` | Show chapter markers |
| `enableKeyboardShortcuts` | `boolean` | `true` | Enable shortcuts |

## Type Definitions

### Chapter

```typescript
interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  description?: string;
  thumbnail?: string;
  completed?: boolean;
}
```

### SubtitleTrack

```typescript
interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url: string;
  default?: boolean;
}
```

## Hooks Quick Reference

### useVideoPlayer

```tsx
const { videoRef, state, controls } = useVideoPlayer({
  src: videoUrl,
  videoId: 'my-video',
  autoplay: false,
});

// State
state.isPlaying
state.currentTime
state.duration
state.volume
state.quality
state.qualities

// Controls
controls.play()
controls.pause()
controls.seek(time)
controls.setVolume(volume)
controls.setQuality(quality)
```

### useChapterNavigation

```tsx
const {
  currentChapter,
  goToChapter,
  nextChapter,
  previousChapter,
} = useChapterNavigation({
  chapters,
  currentTime,
  onSeek: controls.seek,
});
```

### useTutorialProgressSync

```tsx
const { syncProgress, completeCurrentChapter } = useTutorialProgressSync({
  tutorialId,
  currentChapter,
  currentTime,
  duration,
  isPlaying,
  totalChapters: chapters.length,
});
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` | Seek -5s |
| `→` | Seek +5s |
| `↑` | Volume +10% |
| `↓` | Volume -10% |
| `M` | Mute |
| `F` | Fullscreen |
| `P` | PiP |
| `N` | Next Chapter |
| `B` | Previous Chapter |
| `0-9` | Jump 0-90% |

## Common Patterns

### Resume from Last Position

```tsx
const { progress } = useTutorialProgress(tutorialId);

<TutorialVideoPlayer
  tutorialId={tutorialId}
  src={videoUrl}
  startTime={progress?.lastPosition || 0}
/>
```

### Show Progress Bar

```tsx
import { Progress } from '@/components/ui/progress';

const { progress } = useTutorialProgress(tutorialId);

<Progress value={progress.completionPercentage} />
<p>{progress.chaptersCompleted} / {progress.totalChapters}</p>
```

### Track Analytics

```tsx
<TutorialVideoPlayer
  tutorialId={tutorialId}
  src={videoUrl}
  onProgress={(time, duration) => {
    // Send to analytics
    trackEvent('video_progress', { time, duration });
  }}
  onChapterChange={(chapter) => {
    trackEvent('chapter_view', { chapter: chapter.title });
  }}
/>
```

### Custom Error Handling

```tsx
const [error, setError] = useState(null);

<TutorialVideoPlayer
  tutorialId={tutorialId}
  src={videoUrl}
  onError={(err) => setError(err.message)}
/>

{error && <Alert variant="destructive">{error}</Alert>}
```

## Configuration

### Change Sync Interval

```tsx
<TutorialVideoPlayer
  tutorialId={tutorialId}
  src={videoUrl}
  progressSyncInterval={5000} // 5 seconds
/>
```

### Disable Features

```tsx
<TutorialVideoPlayer
  tutorialId={tutorialId}
  src={videoUrl}
  showThumbnailPreview={false}
  showChapterMarkers={false}
  enableKeyboardShortcuts={false}
  enableProgressTracking={false}
/>
```

### Custom Styling

```tsx
<TutorialVideoPlayer
  tutorialId={tutorialId}
  src={videoUrl}
  className="rounded-2xl shadow-2xl border-4 border-primary"
/>
```

## API Routes

### Get Progress

```typescript
GET /api/tutorials/[id]/progress

Response: TutorialProgress
```

### Update Chapter

```typescript
POST /api/tutorials/[id]/progress/chapter

Body: {
  chapterId: string;
  watchTime: number;
  completed: boolean;
  lastPosition: number;
  totalChapters: number;
}
```

### Reset Progress

```typescript
DELETE /api/tutorials/[id]/progress

Response: { success: boolean }
```

## Troubleshooting

### Video Not Playing

1. Check URL is valid HLS stream
2. Verify CORS headers
3. Check browser console for errors
4. Test with `curl` or `ffprobe`

### Progress Not Saving

1. Check API endpoint is accessible
2. Verify authentication
3. Check network tab for failed requests
4. Verify tutorial ID matches

### Chapters Not Showing

1. Ensure `chapters` prop is provided
2. Check `startTime` < `endTime`
3. Verify `duration` is loaded
4. Check `showChapterMarkers={true}`

### Poor Quality

1. Check HLS manifest has multiple levels
2. Verify network speed
3. Try manual quality selection
4. Check HLS config in `/lib/videoPlayerConfig.ts`

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile Safari (iOS 14+)
✅ Chrome Mobile (Android 5+)

## Performance Tips

1. **Lazy Load**: Use dynamic imports
   ```tsx
   const Player = dynamic(() => import('@/components/video'), { ssr: false });
   ```

2. **Preload Metadata**: Already set by default
   ```tsx
   <video preload="metadata" />
   ```

3. **Optimize Thumbnails**: Keep resolution low (160x90)

4. **Debounce Updates**: Already implemented in hooks

## Common Import Paths

```tsx
// Components
import { TutorialVideoPlayer } from '@/components/video';
import { VideoPlayer } from '@/components/video/VideoPlayer';

// Hooks
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useChapterNavigation } from '@/hooks/useChapterNavigation';
import { useTutorialProgress } from '@/hooks/useTutorialProgress';
import { useTutorialProgressSync } from '@/hooks/useTutorialProgressSync';

// Types
import type { Chapter, TutorialProgress } from '@/types/tutorial';
import type { SubtitleTrack } from '@/components/video';

// Config
import { formatTime, playbackSpeeds } from '@/lib/videoPlayerConfig';
```

## Examples Location

Full examples: `/docs/video-player-examples.md`

1. Basic Tutorial
2. Tutorial with Chapters
3. Tutorial with Subtitles
4. Progress Tracking
5. Webinar Player
6. Video Showcase
7. Custom Styling
8. Player with Sidebar
9. Playlist Player
10. Advanced Integration

## Documentation

- **Main Docs**: `/docs/video-player-component.md`
- **Examples**: `/docs/video-player-examples.md`
- **Summary**: `/docs/video-player-implementation-summary.md`
- **Quick Ref**: `/docs/video-player-quick-reference.md` (this file)

---

For detailed documentation, see `/docs/video-player-component.md`
