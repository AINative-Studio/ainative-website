/**
 * useTutorialProgress Hook
 * Manages tutorial progress tracking, notes, bookmarks, and quiz scores
 */

import { useState, useEffect, useCallback } from 'react';
import {
  TutorialProgress,
  Note,
  Bookmark,
  Chapter,
  QuizResult,
  QUIZ_PASS_THRESHOLD,
} from '@/types/tutorial';

const STORAGE_PREFIX = 'tutorial_progress_';

/**
 * Load progress from localStorage
 */
function loadProgress(id: string, chapters: Chapter[]): TutorialProgress {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load tutorial progress:', error);
  }

  return {
    videoId: id,
    completedChapters: [],
    currentChapter: chapters[0]?.id || null,
    lastWatchedTime: 0,
    quizScores: {},
    notes: [],
    bookmarks: [],
    completionPercentage: 0,
    certificateEarned: false,
    lastUpdated: Date.now(),
  };
}

export function useTutorialProgress(videoId: string, chapters: Chapter[]) {
  const [progress, setProgress] = useState<TutorialProgress>(() => {
    return loadProgress(videoId, chapters);
  });

  /**
   * Save progress to localStorage
   */
  const saveProgress = useCallback(
    (newProgress: Partial<TutorialProgress>) => {
      const updated = {
        ...progress,
        ...newProgress,
        lastUpdated: Date.now(),
      };

      setProgress(updated);

      try {
        localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save tutorial progress:', error);
      }
    },
    [progress, videoId]
  );

  /**
   * Mark chapter as completed
   */
  const completeChapter = useCallback(
    (chapterId: string) => {
      if (!progress.completedChapters.includes(chapterId)) {
        const completedChapters = [...progress.completedChapters, chapterId];
        const completionPercentage = (completedChapters.length / chapters.length) * 100;

        saveProgress({
          completedChapters,
          completionPercentage,
          certificateEarned: completionPercentage === 100,
        });
      }
    },
    [progress.completedChapters, chapters.length, saveProgress]
  );

  /**
   * Set current chapter
   */
  const setCurrentChapter = useCallback(
    (chapterId: string) => {
      saveProgress({ currentChapter: chapterId });
    },
    [saveProgress]
  );

  /**
   * Update last watched time
   */
  const updateWatchTime = useCallback(
    (time: number) => {
      saveProgress({ lastWatchedTime: time });
    },
    [saveProgress]
  );

  /**
   * Get active chapter based on current time
   */
  const getActiveChapter = useCallback(
    (currentTime: number): Chapter | null => {
      return (
        chapters.find(
          (chapter) => currentTime >= chapter.startTime && currentTime < chapter.endTime
        ) || null
      );
    },
    [chapters]
  );

  /**
   * Add note at timestamp
   */
  const addNote = useCallback(
    (timestamp: number, content: string) => {
      const note: Note = {
        id: `note_${Date.now()}`,
        timestamp,
        content,
        createdAt: Date.now(),
      };

      saveProgress({
        notes: [...progress.notes, note],
      });
    },
    [progress.notes, saveProgress]
  );

  /**
   * Delete note
   */
  const deleteNote = useCallback(
    (noteId: string) => {
      saveProgress({
        notes: progress.notes.filter((n) => n.id !== noteId),
      });
    },
    [progress.notes, saveProgress]
  );

  /**
   * Add bookmark at timestamp
   */
  const addBookmark = useCallback(
    (timestamp: number, title: string) => {
      const bookmark: Bookmark = {
        id: `bookmark_${Date.now()}`,
        timestamp,
        title,
        createdAt: Date.now(),
      };

      saveProgress({
        bookmarks: [...progress.bookmarks, bookmark],
      });
    },
    [progress.bookmarks, saveProgress]
  );

  /**
   * Delete bookmark
   */
  const deleteBookmark = useCallback(
    (bookmarkId: string) => {
      saveProgress({
        bookmarks: progress.bookmarks.filter((b) => b.id !== bookmarkId),
      });
    },
    [progress.bookmarks, saveProgress]
  );

  /**
   * Save quiz result
   */
  const saveQuizResult = useCallback(
    (result: QuizResult) => {
      const passed = result.score / result.totalQuestions >= QUIZ_PASS_THRESHOLD;

      saveProgress({
        quizScores: {
          ...progress.quizScores,
          [result.chapterId]: result.score,
        },
      });

      return passed;
    },
    [progress.quizScores, saveProgress]
  );

  /**
   * Get quiz score for chapter
   */
  const getQuizScore = useCallback(
    (chapterId: string): number | null => {
      return progress.quizScores[chapterId] ?? null;
    },
    [progress.quizScores]
  );

  /**
   * Check if chapter is completed
   */
  const isChapterCompleted = useCallback(
    (chapterId: string): boolean => {
      return progress.completedChapters.includes(chapterId);
    },
    [progress.completedChapters]
  );

  /**
   * Export notes to markdown
   */
  const exportNotesToMarkdown = useCallback((): string => {
    const sortedNotes = [...progress.notes].sort((a, b) => a.timestamp - b.timestamp);

    let markdown = `# Tutorial Notes\n\n`;
    markdown += `Video: ${videoId}\n`;
    markdown += `Date: ${new Date().toLocaleDateString()}\n\n`;

    sortedNotes.forEach((note) => {
      const timestamp = formatTimestamp(note.timestamp);
      markdown += `## [${timestamp}]\n\n${note.content}\n\n`;
    });

    return markdown;
  }, [progress.notes, videoId]);

  /**
   * Reset progress
   */
  const resetProgress = useCallback(() => {
    const fresh = loadProgress(videoId, chapters);
    setProgress(fresh);
    localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
  }, [videoId, chapters]);

  /**
   * Auto-update active chapter based on time
   */
  useEffect(() => {
    const activeChapter = getActiveChapter(progress.lastWatchedTime);
    if (activeChapter && activeChapter.id !== progress.currentChapter) {
      setCurrentChapter(activeChapter.id);
    }
  }, [progress.lastWatchedTime, getActiveChapter, setCurrentChapter, progress.currentChapter]);

  return {
    progress,
    completeChapter,
    setCurrentChapter,
    updateWatchTime,
    getActiveChapter,
    addNote,
    deleteNote,
    addBookmark,
    deleteBookmark,
    saveQuizResult,
    getQuizScore,
    isChapterCompleted,
    exportNotesToMarkdown,
    resetProgress,
  };
}

/**
 * Format timestamp to HH:MM:SS or MM:SS
 */
function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
