'use client';

/**
 * Lazy-loaded video player component
 * Reduces initial bundle by code-splitting video player and HLS.js
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const VideoPlayerSkeleton = () => (
  <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
    <Skeleton className="w-full h-full" />
  </div>
);

export const LazyVideoPlayer = dynamic(
  () => import('@/components/video/VideoPlayer').then((mod) => mod.VideoPlayer),
  {
    loading: () => <VideoPlayerSkeleton />,
    ssr: false,
  }
);
