# Tutorial Watch Page Documentation

## Overview

The Tutorial Watch Page is a comprehensive video learning platform built with Next.js 16, featuring HLS video playback, interactive quizzes, chapter navigation, note-taking, and certificate generation.

## Features

### 1. HLS Video Player
- **Adaptive Streaming**: Automatic quality selection based on network conditions
- **Manual Quality Control**: Switch between available quality levels (360p - 4K)
- **Playback Speed**: 0.25x to 2x speed controls
- **Picture-in-Picture**: Watch videos while working in other tabs
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Progress Tracking**: Automatic save and resume functionality
- **Fullscreen Support**: Immersive viewing experience

### 2. Chapter Navigation
- **Visual Chapter List**: Thumbnails and timestamps for each chapter
- **Progress Indicators**: Track completed chapters
- **Quick Navigation**: Click to jump to any chapter
- **Current Chapter Highlight**: Always know where you are
- **Chapter Duration**: See how long each section takes

### 3. Interactive Quizzes
- **Chapter-Based Questions**: Quiz questions tied to specific chapters
- **Multiple Choice Format**: Easy to understand and answer
- **Instant Feedback**: Know immediately if answers are correct
- **Score Tracking**: Monitor your progress across chapters
- **Pass/Fail Threshold**: 70% required to pass
- **Retry Functionality**: Take quizzes multiple times
- **Answer Review**: See explanations for correct answers

### 4. Notes & Bookmarks
- **Timestamped Notes**: Add notes at any point in the video
- **Quick Note Entry**: Add notes without leaving the video
- **Edit & Delete**: Manage your notes easily
- **Bookmarks**: Save important moments for quick access
- **Search**: Find notes and bookmarks instantly
- **Export**: Download all notes and bookmarks as Markdown

### 5. Certificate Generation
- **Completion Certificate**: Beautiful PNG certificate upon completion
- **Customizable Name**: Add your name to the certificate
- **Tutorial Details**: Includes tutorial title, difficulty, and duration
- **Unique Certificate ID**: Each certificate has a unique identifier
- **High Quality**: Suitable for printing or sharing

### 6. Progress Tracking
- **Auto-Save**: Progress saved every 5 seconds
- **Resume Playback**: Pick up where you left off
- **Chapter Completion**: Track which chapters you've finished
- **Quiz Scores**: Remember your best scores
- **Overall Progress**: Visual progress bar showing completion percentage

## File Structure

```
app/tutorials/[slug]/watch/
├── page.tsx                      # Server component with metadata
└── TutorialWatchClient.tsx       # Main client component

components/
├── video/
│   └── VideoPlayer.tsx           # HLS video player component
└── tutorial/
    ├── ChapterNavigation.tsx     # Chapter list and navigation
    ├── QuizPanel.tsx             # Interactive quiz system
    ├── NotesPanel.tsx            # Notes and bookmarks management
    └── CertificateGenerator.tsx  # Certificate creation and download

hooks/
└── useVideoPlayer.ts             # Video player logic and HLS management

lib/
└── videoPlayerConfig.ts          # Video player configuration and utilities

types/
└── tutorial.ts                   # TypeScript type definitions

styles/
└── video-player.css              # Video player styling
```

## Components

### VideoPlayer

HLS video player with full controls.

**Props:**
- `src` (string): HLS video URL
- `poster` (string, optional): Poster image URL
- `onTimeUpdate` (function): Callback when video time updates
- `autoplay` (boolean): Auto-play video on load
- `muted` (boolean): Start muted
- `onPlay` (function): Callback when video plays
- `onPause` (function): Callback when video pauses
- `onEnded` (function): Callback when video ends
- `onError` (function): Callback on error

**Features:**
- HLS.js for adaptive streaming
- Native HLS support for Safari
- Keyboard shortcuts
- Picture-in-picture
- Quality selection
- Speed controls

### ChapterNavigation

Visual chapter list with progress tracking.

**Props:**
- `chapters` (Chapter[]): Array of chapter objects
- `currentChapter` (string | null): ID of current chapter
- `completedChapters` (string[]): Array of completed chapter IDs
- `currentTime` (number): Current video time in seconds
- `onChapterClick` (function): Callback when chapter is clicked

**Features:**
- Auto-scroll to active chapter
- Progress indicators
- Duration display
- Thumbnail previews
- Click to seek

### QuizPanel

Interactive quiz system with scoring.

**Props:**
- `chapterId` (string): Current chapter ID
- `questions` (QuizQuestion[]): Array of quiz questions
- `onComplete` (function): Callback when quiz is completed
- `previousScore` (number, optional): Previous quiz score

**Features:**
- Multiple choice questions
- Progress tracking
- Answer review
- Score visualization
- Retry functionality
- Pass/fail threshold (70%)

### NotesPanel

Notes and bookmarks management.

**Props:**
- `notes` (Note[]): Array of note objects
- `bookmarks` (Bookmark[]): Array of bookmark objects
- `onAddNote` (function): Callback to add a note
- `onEditNote` (function): Callback to edit a note
- `onDeleteNote` (function): Callback to delete a note
- `onDeleteBookmark` (function): Callback to delete a bookmark
- `onJumpToTimestamp` (function): Callback to seek to timestamp

**Features:**
- Timestamped notes
- Note editing
- Bookmark management
- Search functionality
- Markdown export
- Jump to timestamp

### CertificateGenerator

Certificate creation and download.

**Props:**
- `certificateData` (CertificateData): Certificate information

**Features:**
- Canvas-based rendering
- Custom name input
- High-quality PNG export
- Unique certificate ID
- Visual preview

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| → | Seek forward 5s |
| ← | Seek backward 5s |
| ↑ | Volume up |
| ↓ | Volume down |
| M | Mute/Unmute |
| F | Fullscreen |
| P | Picture-in-Picture |
| 0-9 | Jump to 0%-90% |

## LocalStorage Keys

The tutorial watch page uses localStorage for progress tracking:

- `tutorial-{slug}-progress` - Video progress and quiz scores
- `tutorial-{slug}-notes` - User notes
- `tutorial-{slug}-bookmarks` - User bookmarks
- `tutorial-{slug}-completed` - Completion status

## API Endpoints

### GET /api/tutorials/[slug]

Fetch tutorial data including chapters, quizzes, and metadata.

**Response:**
```json
{
  "id": "tutorial-id",
  "title": "Tutorial Title",
  "description": "Tutorial description",
  "slug": "tutorial-slug",
  "duration": 3600,
  "video_url": "https://cdn.example.com/video.m3u8",
  "chapters": [...],
  "quiz_questions": [...],
  "difficulty": "intermediate",
  "estimated_duration": 60
}
```

### POST /api/tutorials/[slug]/complete

Mark tutorial as completed (optional, requires authentication).

**Request Body:**
```json
{
  "completedAt": "2024-01-18T12:00:00.000Z",
  "progress": 100
}
```

## Usage Example

### Creating a Tutorial

To add a new tutorial to the watch page, create a tutorial object in your backend:

```typescript
const tutorial: Tutorial = {
  id: "intro-to-ai",
  title: "Introduction to AI",
  description: "Learn the basics of artificial intelligence",
  slug: "intro-to-ai",
  category: "tutorial",
  duration: 1800, // 30 minutes
  video_url: "https://cdn.example.com/intro-ai.m3u8",
  thumbnail_url: "https://cdn.example.com/intro-ai-thumb.jpg",
  poster_url: "https://cdn.example.com/intro-ai-poster.jpg",
  difficulty: "beginner",
  estimated_duration: 30,
  completion_certificate: true,
  chapters: [
    {
      id: "ch1",
      title: "What is AI?",
      startTime: 0,
      endTime: 300,
      description: "Introduction to artificial intelligence"
    },
    {
      id: "ch2",
      title: "Types of AI",
      startTime: 300,
      endTime: 900,
      description: "Overview of different AI types"
    }
  ],
  quiz_questions: [
    {
      id: "q1",
      chapterId: "ch1",
      question: "What does AI stand for?",
      options: [
        "Artificial Intelligence",
        "Advanced Intelligence",
        "Automated Intelligence",
        "None of the above"
      ],
      correctAnswer: 0,
      explanation: "AI stands for Artificial Intelligence"
    }
  ],
  code_snippets: [],
  prerequisites: [],
  learning_objectives: [
    "Understand what AI is",
    "Learn about different types of AI"
  ]
};
```

### Accessing the Watch Page

Navigate to: `/tutorials/[slug]/watch`

Example: `/tutorials/intro-to-ai/watch`

## Customization

### Styling

Customize the video player appearance by modifying `/styles/video-player.css`:

```css
/* Change primary color */
.video-player__progress-bar {
  background: #your-color;
}

/* Customize controls background */
.video-player__controls {
  background: linear-gradient(to top, rgba(your-color), transparent);
}
```

### Pass Threshold

Change the quiz pass threshold in `/types/tutorial.ts`:

```typescript
export const QUIZ_PASS_THRESHOLD = 0.7; // 70% pass threshold
```

### Auto-save Interval

Modify the progress save interval in `TutorialWatchClient.tsx`:

```typescript
// Save progress every 5 seconds
if (Math.floor(time) % 5 === 0) {
  saveProgress(time);
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note:** HLS playback requires either:
- Browser with native HLS support (Safari)
- HLS.js library support (Chrome, Firefox, Edge)

## Performance Considerations

1. **Video Encoding**: Use HLS with multiple quality levels for adaptive streaming
2. **Thumbnail Loading**: Lazy load chapter thumbnails
3. **LocalStorage Limits**: Monitor localStorage usage for notes/bookmarks
4. **Analytics**: Batch analytics events to reduce API calls

## Troubleshooting

### Video Won't Play
- Check HLS stream URL is accessible
- Verify browser supports HLS (or HLS.js is loaded)
- Check network connectivity

### Progress Not Saving
- Check localStorage is enabled
- Verify browser doesn't have storage restrictions
- Check for quota exceeded errors

### Quizzes Not Showing
- Ensure quiz questions have correct `chapterId`
- Verify questions exist for current chapter
- Check quiz component is rendering

### Certificate Not Generating
- Ensure tutorial is marked as completed (95%+ progress)
- Check canvas API support
- Verify certificate data is complete

## Future Enhancements

- [ ] Backend progress sync (currently localStorage only)
- [ ] Social sharing for certificates
- [ ] Discussion/Comments feature
- [ ] Collaborative notes
- [ ] Video annotations
- [ ] Closed captions support
- [ ] Multi-language support
- [ ] Mobile app integration
- [ ] Offline viewing support
- [ ] Learning path integration

## Support

For issues or questions, please contact support or file an issue in the repository.
