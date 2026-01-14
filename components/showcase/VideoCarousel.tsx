'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Clock, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VideoItem {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  duration: number;
}

interface VideoCarouselProps {
  videos: VideoItem[];
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  onVideoSelect?: (video: VideoItem) => void;
  onPlayVideo?: (video: VideoItem) => void;
  className?: string;
}

export function VideoCarousel({
  videos,
  autoAdvance = false,
  autoAdvanceDelay = 10,
  onVideoSelect,
  onPlayVideo,
  className,
}: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentVideo = videos[currentIndex];

  useEffect(() => {
    if (autoAdvance && !isHovering && videos.length > 1) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % videos.length);
      }, autoAdvanceDelay * 1000);
    }

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [autoAdvance, autoAdvanceDelay, currentIndex, isHovering, videos.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (onVideoSelect && currentVideo) {
      onVideoSelect(currentVideo);
    }
  }, [currentVideo, onVideoSelect]);

  if (videos.length === 0) return null;

  return (
    <div
      className={cn('relative group', className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentVideo.id}
            src={currentVideo.thumbnail}
            alt={currentVideo.title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        <Badge className="absolute bottom-3 right-3 bg-black/70 text-white backdrop-blur-sm">
          <Clock className="h-3 w-3 mr-1" />
          {formatDuration(currentVideo.duration)}
        </Badge>

        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-xl hover:scale-110 transition-all"
            onClick={() => onPlayVideo?.(currentVideo)}
          >
            <Play className="h-8 w-8 text-primary ml-1" />
          </Button>
        </div>

        {videos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {videos.length > 1 && (
          <Badge className="absolute top-3 right-3 bg-black/70 text-white backdrop-blur-sm">
            {currentIndex + 1} / {videos.length}
          </Badge>
        )}
      </div>

      {videos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative flex-shrink-0 w-24 h-16 rounded overflow-hidden border-2 transition-all',
                index === currentIndex
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 text-xs bg-black/70 text-white px-1 rounded">
                {formatDuration(video.duration)}
              </span>
            </button>
          ))}
        </div>
      )}

      {autoAdvance && videos.length > 1 && isHovering && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Auto-advancing in {autoAdvanceDelay}s
        </div>
      )}
    </div>
  );
}
