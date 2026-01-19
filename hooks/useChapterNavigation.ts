/**
 * useChapterNavigation Hook
 * Manages chapter navigation and tracking for video tutorials
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Chapter } from '@/types/tutorial';

export interface UseChapterNavigationOptions {
  /**
   * Array of chapter markers
   */
  chapters: Chapter[];

  /**
   * Current video playback time in seconds
   */
  currentTime: number;

  /**
   * Callback to seek video to specific time
   */
  onSeek: (time: number) => void;

  /**
   * Callback when current chapter changes
   */
  onChapterChange?: (chapter: Chapter) => void;
}

export interface UseChapterNavigationReturn {
  /**
   * Current active chapter based on playback time
   */
  currentChapter: Chapter | null;

  /**
   * Index of current chapter
   */
  currentChapterIndex: number;

  /**
   * Navigate to specific chapter
   */
  goToChapter: (chapterId: string) => void;

  /**
   * Go to next chapter
   */
  nextChapter: () => void;

  /**
   * Go to previous chapter
   */
  previousChapter: () => void;

  /**
   * Check if there's a next chapter
   */
  hasNextChapter: boolean;

  /**
   * Check if there's a previous chapter
   */
  hasPreviousChapter: boolean;

  /**
   * Get chapter by ID
   */
  getChapterById: (id: string) => Chapter | undefined;

  /**
   * Get progress within current chapter (0-100)
   */
  chapterProgress: number;
}

export function useChapterNavigation({
  chapters,
  currentTime,
  onSeek,
  onChapterChange,
}: UseChapterNavigationOptions): UseChapterNavigationReturn {
  const [previousChapterId, setPreviousChapterId] = useState<string | null>(null);

  /**
   * Sort chapters by start time to ensure correct order
   */
  const sortedChapters = useMemo(() => {
    return [...chapters].sort((a, b) => a.startTime - b.startTime);
  }, [chapters]);

  /**
   * Find current chapter based on playback time
   */
  const currentChapterIndex = useMemo(() => {
    if (sortedChapters.length === 0) return -1;

    // Find the chapter where currentTime is between startTime and endTime
    const index = sortedChapters.findIndex((chapter, idx) => {
      const nextChapter = sortedChapters[idx + 1];
      const isWithinRange = currentTime >= chapter.startTime;
      const isBeforeNext = !nextChapter || currentTime < nextChapter.startTime;
      return isWithinRange && isBeforeNext;
    });

    return index;
  }, [sortedChapters, currentTime]);

  const currentChapter = useMemo(() => {
    return currentChapterIndex >= 0 ? sortedChapters[currentChapterIndex] : null;
  }, [currentChapterIndex, sortedChapters]);

  /**
   * Calculate progress within current chapter
   */
  const chapterProgress = useMemo(() => {
    if (!currentChapter) return 0;

    const chapterDuration = currentChapter.endTime - currentChapter.startTime;
    const elapsed = currentTime - currentChapter.startTime;
    const progress = (elapsed / chapterDuration) * 100;

    return Math.max(0, Math.min(100, progress));
  }, [currentChapter, currentTime]);

  /**
   * Check navigation availability
   */
  const hasNextChapter = currentChapterIndex < sortedChapters.length - 1 && sortedChapters.length > 0;
  const hasPreviousChapter = currentChapterIndex > 0;

  /**
   * Navigate to specific chapter by ID
   */
  const goToChapter = useCallback(
    (chapterId: string) => {
      const chapter = sortedChapters.find((ch) => ch.id === chapterId);
      if (chapter) {
        onSeek(chapter.startTime);
      }
    },
    [sortedChapters, onSeek]
  );

  /**
   * Navigate to next chapter
   */
  const nextChapter = useCallback(() => {
    if (hasNextChapter) {
      const nextChap = sortedChapters[currentChapterIndex + 1];
      if (nextChap) {
        onSeek(nextChap.startTime);
      }
    }
  }, [hasNextChapter, sortedChapters, currentChapterIndex, onSeek]);

  /**
   * Navigate to previous chapter
   */
  const previousChapter = useCallback(() => {
    if (hasPreviousChapter) {
      const prevChap = sortedChapters[currentChapterIndex - 1];
      if (prevChap) {
        onSeek(prevChap.startTime);
      }
    }
  }, [hasPreviousChapter, sortedChapters, currentChapterIndex, onSeek]);

  /**
   * Get chapter by ID
   */
  const getChapterById = useCallback(
    (id: string) => {
      return sortedChapters.find((ch) => ch.id === id);
    },
    [sortedChapters]
  );

  /**
   * Trigger onChapterChange callback when chapter changes
   */
  useEffect(() => {
    if (currentChapter && currentChapter.id !== previousChapterId) {
      onChapterChange?.(currentChapter);
      setPreviousChapterId(currentChapter.id);
    }
  }, [currentChapter, previousChapterId, onChapterChange]);

  return {
    currentChapter,
    currentChapterIndex,
    goToChapter,
    nextChapter,
    previousChapter,
    hasNextChapter,
    hasPreviousChapter,
    getChapterById,
    chapterProgress,
  };
}
