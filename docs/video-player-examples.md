# Video Player Usage Examples

## Table of Contents

1. [Basic Tutorial Video](#basic-tutorial-video)
2. [Tutorial with Chapters](#tutorial-with-chapters)
3. [Tutorial with Subtitles](#tutorial-with-subtitles)
4. [Tutorial with Progress Tracking](#tutorial-with-progress-tracking)
5. [Webinar Player](#webinar-player)
6. [Video Showcase](#video-showcase)
7. [Custom Styled Player](#custom-styled-player)
8. [Player with Sidebar](#player-with-sidebar)
9. [Playlist Player](#playlist-player)
10. [Advanced Integration](#advanced-integration)

---

## 1. Basic Tutorial Video

Simple tutorial video without chapters or advanced features.

```tsx
import { TutorialVideoPlayer } from '@/components/video';

export default function BasicTutorial() {
  return (
    <div className="container mx-auto py-8">
      <TutorialVideoPlayer
        tutorialId="intro-tutorial"
        src="https://cdn.example.com/videos/intro.m3u8"
        poster="/images/intro-poster.jpg"
        autoplay={false}
        muted={false}
      />
    </div>
  );
}
```

---

## 2. Tutorial with Chapters

Full-featured tutorial with chapter navigation.

```tsx
import { TutorialVideoPlayer } from '@/components/video';
import type { Chapter } from '@/types/tutorial';

export default function ChapteredTutorial() {
  const chapters: Chapter[] = [
    {
      id: 'intro',
      title: 'Introduction to React',
      startTime: 0,
      endTime: 180,
      description: 'Overview of React and its core concepts',
    },
    {
      id: 'components',
      title: 'Building Components',
      startTime: 180,
      endTime: 420,
      description: 'Learn how to create reusable React components',
    },
    {
      id: 'hooks',
      title: 'React Hooks',
      startTime: 420,
      endTime: 720,
      description: 'Understanding useState, useEffect, and custom hooks',
    },
    {
      id: 'routing',
      title: 'Routing with React Router',
      startTime: 720,
      endTime: 960,
      description: 'Set up navigation in your React application',
    },
  ];

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">React Fundamentals</h1>

      <TutorialVideoPlayer
        tutorialId="react-fundamentals"
        src="https://cdn.example.com/tutorials/react-fundamentals.m3u8"
        poster="/images/react-fundamentals-poster.jpg"
        chapters={chapters}
        showChapterMarkers={true}
        enableProgressTracking={true}
        onChapterChange={(chapter) => {
          console.log('Now watching:', chapter.title);
        }}
      />

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">What You'll Learn</h2>
        <ul className="space-y-2">
          {chapters.map((chapter) => (
            <li key={chapter.id} className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <div>
                <strong>{chapter.title}</strong>
                <p className="text-sm text-muted-foreground">{chapter.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## 3. Tutorial with Subtitles

Video player with multiple subtitle tracks.

```tsx
import { TutorialVideoPlayer } from '@/components/video';
import type { SubtitleTrack } from '@/components/video';

export default function MultilingualTutorial() {
  const subtitles: SubtitleTrack[] = [
    {
      id: 'en',
      label: 'English',
      language: 'en',
      url: '/subtitles/tutorial-en.vtt',
      default: true,
    },
    {
      id: 'es',
      label: 'Español',
      language: 'es',
      url: '/subtitles/tutorial-es.vtt',
    },
    {
      id: 'fr',
      label: 'Français',
      language: 'fr',
      url: '/subtitles/tutorial-fr.vtt',
    },
    {
      id: 'de',
      label: 'Deutsch',
      language: 'de',
      url: '/subtitles/tutorial-de.vtt',
    },
    {
      id: 'ja',
      label: '日本語',
      language: 'ja',
      url: '/subtitles/tutorial-ja.vtt',
    },
  ];

  return (
    <TutorialVideoPlayer
      tutorialId="multilingual-tutorial"
      src="https://cdn.example.com/tutorials/multilingual.m3u8"
      poster="/images/multilingual-poster.jpg"
      subtitles={subtitles}
      showThumbnailPreview={true}
    />
  );
}
```

---

## 4. Tutorial with Progress Tracking

Track user progress and provide completion feedback.

```tsx
'use client';

import { useState } from 'react';
import { TutorialVideoPlayer } from '@/components/video';
import { useTutorialProgress } from '@/hooks/useTutorialProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

export default function TrackedTutorial({ tutorialId }: { tutorialId: string }) {
  const { progress, isLoading } = useTutorialProgress(tutorialId);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());

  const chapters = [
    { id: 'ch1', title: 'Setup', startTime: 0, endTime: 120 },
    { id: 'ch2', title: 'Basics', startTime: 120, endTime: 300 },
    { id: 'ch3', title: 'Advanced', startTime: 300, endTime: 480 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TutorialVideoPlayer
          tutorialId={tutorialId}
          src={`https://cdn.example.com/tutorials/${tutorialId}.m3u8`}
          chapters={chapters}
          enableProgressTracking={true}
          progressSyncInterval={10000}
          onChapterCompleted={(chapterId) => {
            setCompletedChapters((prev) => new Set(prev).add(chapterId));
          }}
        />
      </div>

      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLoading && progress && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Completion</span>
                    <span className="font-semibold">{progress.completionPercentage}%</span>
                  </div>
                  <Progress value={progress.completionPercentage} />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Chapters</p>
                  <div className="space-y-2">
                    {chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{chapter.title}</span>
                        {completedChapters.has(chapter.id) ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground">Not completed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {progress.certificateEligible && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      🎉 Certificate Eligible!
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 5. Webinar Player

Live or recorded webinar with minimal controls.

```tsx
import { TutorialVideoPlayer } from '@/components/video';

export default function WebinarPlayer() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">AI Native Development Webinar</h1>
          <Badge variant="secondary">Live</Badge>
        </div>
        <p className="text-muted-foreground">
          Join us for an in-depth discussion on AI-native development practices
        </p>
      </div>

      <TutorialVideoPlayer
        tutorialId="webinar-2024-01"
        src="https://cdn.example.com/webinars/2024-01-live.m3u8"
        poster="/images/webinar-poster.jpg"
        autoplay={true}
        muted={true}
        showChapterMarkers={false}
        showThumbnailPreview={false}
        enableProgressTracking={false}
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Speakers</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Speaker list */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Q&A</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Q&A section */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 6. Video Showcase

Simple video showcase without tutorial features.

```tsx
import { VideoPlayer } from '@/components/video';

export default function VideoShowcase() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Product Demo</h1>

      <VideoPlayer
        videoId="product-demo"
        src="https://cdn.example.com/demos/product.m3u8"
        poster="/images/product-demo-poster.jpg"
        autoplay={false}
        controls={true}
        onEnded={() => {
          // Track video completion
          console.log('Demo video watched');
        }}
      />
    </div>
  );
}
```

---

## 7. Custom Styled Player

Video player with custom styling.

```tsx
import { TutorialVideoPlayer } from '@/components/video';

export default function CustomStyledPlayer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="container max-w-6xl mx-auto">
        <TutorialVideoPlayer
          tutorialId="styled-tutorial"
          src="https://cdn.example.com/tutorials/styled.m3u8"
          poster="/images/styled-poster.jpg"
          className="rounded-2xl shadow-2xl border-4 border-white/10"
        />
      </div>
    </div>
  );
}
```

---

## 8. Player with Sidebar

Video player with collapsible sidebar for notes and resources.

```tsx
'use client';

import { useState } from 'react';
import { TutorialVideoPlayer } from '@/components/video';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function PlayerWithSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Video Section */}
      <div className={`flex-1 p-6 ${sidebarOpen ? 'lg:mr-96' : ''}`}>
        <TutorialVideoPlayer
          tutorialId="tutorial-with-sidebar"
          src="https://cdn.example.com/tutorials/sidebar.m3u8"
          chapters={[
            { id: '1', title: 'Introduction', startTime: 0, endTime: 120 },
            { id: '2', title: 'Main Content', startTime: 120, endTime: 480 },
          ]}
        />
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed right-0 top-0 h-full bg-background border-l
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          w-96
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Resources</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Tabs defaultValue="notes" className="flex-1">
            <TabsList className="w-full justify-start px-4">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="p-4">
              {/* Notes content */}
            </TabsContent>

            <TabsContent value="resources" className="p-4">
              {/* Resources content */}
            </TabsContent>

            <TabsContent value="transcript" className="p-4">
              {/* Transcript content */}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sidebar Toggle (when closed) */}
      {!sidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-4"
          onClick={() => setSidebarOpen(true)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
```

---

## 9. Playlist Player

Video player with playlist navigation.

```tsx
'use client';

import { useState } from 'react';
import { TutorialVideoPlayer } from '@/components/video';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PlayCircle, CheckCircle2 } from 'lucide-react';

interface PlaylistItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  src: string;
  poster: string;
  completed: boolean;
}

export default function PlaylistPlayer() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const playlist: PlaylistItem[] = [
    {
      id: '1',
      title: 'Getting Started',
      description: 'Introduction to the platform',
      duration: '10:30',
      src: 'https://cdn.example.com/playlist/video-1.m3u8',
      poster: '/images/video-1-poster.jpg',
      completed: false,
    },
    {
      id: '2',
      title: 'Basic Concepts',
      description: 'Understanding core concepts',
      duration: '15:45',
      src: 'https://cdn.example.com/playlist/video-2.m3u8',
      poster: '/images/video-2-poster.jpg',
      completed: false,
    },
    {
      id: '3',
      title: 'Advanced Features',
      description: 'Exploring advanced functionality',
      duration: '20:15',
      src: 'https://cdn.example.com/playlist/video-3.m3u8',
      poster: '/images/video-3-poster.jpg',
      completed: false,
    },
  ];

  const currentVideo = playlist[currentVideoIndex];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tutorial Series</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <TutorialVideoPlayer
            tutorialId={currentVideo.id}
            src={currentVideo.src}
            poster={currentVideo.poster}
            onEnded={() => {
              // Auto-play next video
              if (currentVideoIndex < playlist.length - 1) {
                setCurrentVideoIndex(currentVideoIndex + 1);
              }
            }}
          />

          <div className="mt-4">
            <h2 className="text-2xl font-semibold">{currentVideo.title}</h2>
            <p className="text-muted-foreground mt-1">{currentVideo.description}</p>
          </div>
        </div>

        {/* Playlist */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Playlist ({playlist.length} videos)</h3>
            <div className="space-y-2">
              {playlist.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentVideoIndex(index)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-colors',
                    currentVideoIndex === index
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'hover:bg-muted border-2 border-transparent'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <PlayCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.duration}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## 10. Advanced Integration

Complete integration with authentication, analytics, and advanced features.

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { TutorialVideoPlayer } from '@/components/video';
import { useTutorialProgress } from '@/hooks/useTutorialProgress';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdvancedTutorialPlayer({ tutorialId }: { tutorialId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { progress, updateProgress } = useTutorialProgress(tutorialId);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // Require authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?redirect=/tutorials/${tutorialId}`);
    }
  }, [status, router, tutorialId]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <TutorialVideoPlayer
        tutorialId={tutorialId}
        src={`https://cdn.example.com/tutorials/${tutorialId}/master.m3u8`}
        startTime={progress?.lastPosition || 0}
        enableProgressTracking={true}
        onProgressSaved={() => {
          if (analyticsEnabled) {
            // Track to analytics service
            fetch('/api/analytics/video-progress', {
              method: 'POST',
              body: JSON.stringify({ tutorialId, userId: session?.user?.id }),
            });
          }
        }}
        onChapterCompleted={(chapterId) => {
          toast.success('Chapter completed!', {
            description: 'Your progress has been saved.',
          });

          if (analyticsEnabled) {
            fetch('/api/analytics/chapter-complete', {
              method: 'POST',
              body: JSON.stringify({
                tutorialId,
                chapterId,
                userId: session?.user?.id,
              }),
            });
          }
        }}
        onEnded={() => {
          toast.success('Tutorial completed!', {
            description: 'Check your dashboard for your certificate.',
            action: {
              label: 'View Certificate',
              onClick: () => router.push(`/certificates/${tutorialId}`),
            },
          });
        }}
      />
    </div>
  );
}
```

---

## WebVTT Subtitle Format Example

Create subtitle files in WebVTT format:

```vtt
WEBVTT

1
00:00:00.000 --> 00:00:05.000
Welcome to this tutorial on React fundamentals.

2
00:00:05.000 --> 00:00:10.000
In this video, we'll cover the basics of React components.

3
00:00:10.000 --> 00:00:15.000
Let's start by understanding what a component is.

4
00:00:15.000 --> 00:00:20.000
A component is a reusable piece of UI that encapsulates its own logic.
```

---

## HLS Manifest Example

Example HLS master playlist:

```m3u8
#EXTM3U
#EXT-X-VERSION:3

#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=842x480
480p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p.m3u8
```

---

## Tips and Best Practices

### 1. Performance Optimization

```tsx
// Use dynamic import for video player
import dynamic from 'next/dynamic';

const TutorialVideoPlayer = dynamic(
  () => import('@/components/video/TutorialVideoPlayer'),
  { ssr: false }
);
```

### 2. Error Handling

```tsx
const [videoError, setVideoError] = useState<string | null>(null);

<TutorialVideoPlayer
  tutorialId="my-tutorial"
  src={videoSrc}
  onError={(error) => {
    setVideoError(error.message);
    // Log to error tracking service
  }}
/>

{videoError && (
  <Alert variant="destructive">
    <AlertDescription>{videoError}</AlertDescription>
  </Alert>
)}
```

### 3. Responsive Layout

```tsx
<div className="w-full max-w-7xl mx-auto px-4">
  <div className="aspect-video">
    <TutorialVideoPlayer
      tutorialId="responsive-tutorial"
      src={videoSrc}
      className="w-full h-full"
    />
  </div>
</div>
```

### 4. SEO Optimization

```tsx
export const metadata: Metadata = {
  title: 'React Tutorial - Getting Started',
  description: 'Learn React fundamentals in this comprehensive tutorial',
  openGraph: {
    title: 'React Tutorial - Getting Started',
    description: 'Learn React fundamentals in this comprehensive tutorial',
    images: ['/images/react-tutorial-poster.jpg'],
    type: 'video.other',
  },
};
```

---

These examples demonstrate the flexibility and power of the video player component system. Mix and match features to create the perfect video experience for your use case.
