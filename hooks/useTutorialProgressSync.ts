/**
 * useTutorialProgressSync Hook
 * Syncs video playback progress with tutorial progress tracking API
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { Chapter } from '@/types/tutorial';

export interface UseTutorialProgressSyncOptions {
  /**
   * Tutorial ID
   */
  tutorialId: string;

  /**
   * Current chapter being watched
   */
  currentChapter: Chapter | null;

  /**
   * Current playback time in seconds
   */
  currentTime: number;

  /**
   * Video duration in seconds
   */
  duration: number;

  /**
   * Is video currently playing
   */
  isPlaying: boolean;

  /**
   * Total number of chapters
   */
  totalChapters: number;

  /**
   * Callback when progress is saved
   */
  onProgressSaved?: () => void;

  /**
   * Callback when chapter is completed
   */
  onChapterCompleted?: (chapterId: string) => void;

  /**
   * Sync interval in milliseconds (default: 10000 = 10 seconds)
   */
  syncInterval?: number;
}

export interface UseTutorialProgressSyncReturn {
  /**
   * Manually trigger progress sync
   */
  syncProgress: () => Promise<void>;

  /**
   * Mark current chapter as complete
   */
  completeCurrentChapter: () => Promise<void>;

  /**
   * Is currently syncing progress
   */
  isSyncing: boolean;

  /**
   * Last sync timestamp
   */
  lastSyncTime: number | null;
}

export function useTutorialProgressSync({
  tutorialId,
  currentChapter,
  currentTime,
  duration,
  isPlaying,
  totalChapters,
  onProgressSaved,
  onChapterCompleted,
  syncInterval = 10000, // 10 seconds default
}: UseTutorialProgressSyncOptions): UseTutorialProgressSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncTimeRef = useRef<number | null>(null);
  const completedChaptersRef = useRef<Set<string>>(new Set());
  const lastSyncedTimeRef = useRef<number>(0);

  /**
   * Sync progress to API
   */
  const syncProgress = useCallback(async () => {
    if (!currentChapter || duration === 0) return;

    try {
      setIsSyncing(true);
      const chapterDuration = currentChapter.endTime - currentChapter.startTime;
      const watchTime = Math.max(0, currentTime - currentChapter.startTime);
      const chapterCompleted = watchTime >= chapterDuration * 0.9; // 90% threshold

      // Call API to update chapter progress
      const response = await fetch(`/api/tutorials/${tutorialId}/progress/chapter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: currentChapter.id,
          watchTime: Math.round(watchTime),
          completed: chapterCompleted,
          lastPosition: Math.round(currentTime),
          totalChapters,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync progress: ${response.statusText}`);
      }

      lastSyncTimeRef.current = Date.now();
      lastSyncedTimeRef.current = currentTime;
      onProgressSaved?.();

      // Mark chapter as completed if threshold reached
      if (chapterCompleted && !completedChaptersRef.current.has(currentChapter.id)) {
        completedChaptersRef.current.add(currentChapter.id);
        onChapterCompleted?.(currentChapter.id);
      }
    } catch (error) {
      console.error('Failed to sync tutorial progress:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [tutorialId, currentChapter, currentTime, duration, totalChapters, onProgressSaved, onChapterCompleted]);

  /**
   * Manually mark current chapter as complete
   */
  const completeCurrentChapter = useCallback(async () => {
    if (!currentChapter) return;

    try {
      setIsSyncing(true);
      const chapterDuration = currentChapter.endTime - currentChapter.startTime;

      const response = await fetch(`/api/tutorials/${tutorialId}/progress/chapter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: currentChapter.id,
          watchTime: Math.round(chapterDuration),
          completed: true,
          lastPosition: Math.round(currentChapter.endTime),
          totalChapters,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to complete chapter: ${response.statusText}`);
      }

      completedChaptersRef.current.add(currentChapter.id);
      onChapterCompleted?.(currentChapter.id);
    } catch (error) {
      console.error('Failed to complete chapter:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [tutorialId, currentChapter, totalChapters, onChapterCompleted]);

  /**
   * Set up automatic progress syncing
   */
  useEffect(() => {
    // Clear existing interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    // Only sync while playing and if enough time has passed
    if (isPlaying && currentChapter) {
      syncIntervalRef.current = setInterval(() => {
        // Only sync if playback position has changed significantly (> 2 seconds)
        if (Math.abs(currentTime - lastSyncedTimeRef.current) > 2) {
          syncProgress();
        }
      }, syncInterval);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isPlaying, currentChapter, currentTime, syncInterval, syncProgress]);

  /**
   * Sync progress when video is paused or ends
   */
  useEffect(() => {
    if (!isPlaying && currentChapter && currentTime > 0) {
      // Debounce to avoid too many API calls
      const timeSinceLastSync = lastSyncTimeRef.current
        ? Date.now() - lastSyncTimeRef.current
        : syncInterval + 1;

      if (timeSinceLastSync > 3000) { // At least 3 seconds since last sync
        syncProgress();
      }
    }
  }, [isPlaying, currentChapter, currentTime, syncInterval, syncProgress]);

  /**
   * Sync progress when chapter changes
   */
  useEffect(() => {
    if (currentChapter) {
      // Small delay to ensure currentTime is updated
      const timeout = setTimeout(() => {
        syncProgress();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [currentChapter?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Final sync before unmount
   */
  useEffect(() => {
    return () => {
      if (currentChapter && currentTime > 0) {
        // Fire and forget final sync
        syncProgress();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    syncProgress,
    completeCurrentChapter,
    isSyncing,
    lastSyncTime: lastSyncTimeRef.current,
  };
}
