'use client';

/**
 * ChapterMarkers Component
 * Displays chapter markers on the video timeline
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Chapter } from '@/types/tutorial';

export interface ChapterMarkersProps {
  /**
   * Array of chapter markers
   */
  chapters: Chapter[];

  /**
   * Video duration in seconds
   */
  duration: number;

  /**
   * Callback when chapter marker is clicked
   */
  onChapterClick?: (chapterId: string) => void;

  /**
   * Custom class name
   */
  className?: string;
}

export const ChapterMarkers: React.FC<ChapterMarkersProps> = ({
  chapters,
  duration,
  onChapterClick,
  className,
}) => {
  /**
   * Calculate marker positions
   */
  const markerPositions = useMemo(() => {
    if (!duration || duration === 0) return [];

    return chapters.map((chapter) => ({
      ...chapter,
      position: (chapter.startTime / duration) * 100,
    }));
  }, [chapters, duration]);

  if (markerPositions.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn('absolute inset-0', className)}>
        {markerPositions.map((marker) => (
          <Tooltip key={marker.id}>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  'absolute top-0 w-0.5 h-full bg-white/60 hover:bg-white hover:w-1 transition-all z-10',
                  'after:absolute after:-left-1 after:-right-1 after:top-0 after:bottom-0 after:content-[""]'
                )}
                style={{ left: `${marker.position}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onChapterClick?.(marker.id);
                }}
                aria-label={`Go to ${marker.title}`}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-semibold text-sm">{marker.title}</p>
                {marker.description && (
                  <p className="text-xs text-muted-foreground">{marker.description}</p>
                )}
                {marker.completed && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span>✓</span>
                    <span>Completed</span>
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
