/**
 * Tutorial Progress Service
 * Persistent storage for tutorial progress using backend API
 *
 * Features:
 * - Backend database integration via API
 * - Local storage fallback for offline support
 * - Retry logic with exponential backoff
 * - Type-safe operations
 * - Migration utilities for existing data
 */

import type {
  TutorialProgress,
  ChapterProgress,
  QuizScore
} from '@/types/tutorial';
import apiClient from '@/utils/apiClient';

const API_BASE = '/v1/tutorials/progress';
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Retry configuration
 */
interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: RETRY_ATTEMPTS,
  delayMs: RETRY_DELAY_MS,
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute with retry logic and exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  let delay = config.delayMs;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if ((error as any)?.response?.status >= 400 &&
          (error as any)?.response?.status < 500) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxAttempts) {
        break;
      }

      // Wait before retrying with exponential backoff
      await sleep(delay);
      delay *= config.backoffMultiplier;
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * Local storage fallback utilities
 */
class LocalStorageFallback {
  private static readonly PREFIX = 'tutorial_progress_';

  static save(tutorialId: string, userId: string | null, progress: TutorialProgress): void {
    if (typeof window === 'undefined') return;

    try {
      const key = this.getKey(tutorialId, userId);
      localStorage.setItem(key, JSON.stringify(progress));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  static load(tutorialId: string, userId: string | null): TutorialProgress | null {
    if (typeof window === 'undefined') return null;

    try {
      const key = this.getKey(tutorialId, userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  }

  static remove(tutorialId: string, userId: string | null): void {
    if (typeof window === 'undefined') return;

    try {
      const key = this.getKey(tutorialId, userId);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  private static getKey(tutorialId: string, userId: string | null): string {
    return `${this.PREFIX}${tutorialId}_${userId || 'anonymous'}`;
  }
}

/**
 * Tutorial Progress Service
 */
export class TutorialProgressService {
  /**
   * Get tutorial progress for a user
   */
  static async getProgress(
    tutorialId: string,
    userId: string | null
  ): Promise<TutorialProgress> {
    try {
      const response = await withRetry(async () => {
        const url = userId
          ? `${API_BASE}/${tutorialId}?userId=${encodeURIComponent(userId)}`
          : `${API_BASE}/${tutorialId}`;
        return await apiClient.get(url);
      });

      const progress = response.data as TutorialProgress;

      // Update local storage cache
      LocalStorageFallback.save(tutorialId, userId, progress);

      return progress;
    } catch (error) {
      console.warn('Failed to fetch progress from API, trying localStorage:', error);

      // Fallback to localStorage
      const localProgress = LocalStorageFallback.load(tutorialId, userId);

      if (localProgress) {
        return localProgress;
      }

      // Return default progress if no data found
      return this.getDefaultProgress(tutorialId, userId);
    }
  }

  /**
   * Update chapter progress
   */
  static async updateChapterProgress(
    tutorialId: string,
    userId: string | null,
    chapterUpdate: ChapterProgress & { totalChapters?: number }
  ): Promise<TutorialProgress> {
    try {
      const response = await withRetry(async () => {
        return await apiClient.post(
          `${API_BASE}/${tutorialId}/chapter`,
          {
            userId,
            ...chapterUpdate,
          }
        );
      });

      const progress = response.data as TutorialProgress;

      // Update local storage cache
      LocalStorageFallback.save(tutorialId, userId, progress);

      return progress;
    } catch (error) {
      console.error('Failed to update chapter progress:', error);

      // Fallback: update localStorage and return it
      const current = LocalStorageFallback.load(tutorialId, userId) ||
                     this.getDefaultProgress(tutorialId, userId);

      // Update chapter progress locally
      const existingIndex = current.chapterProgress.findIndex(
        c => c.chapterId === chapterUpdate.chapterId
      );

      if (existingIndex >= 0) {
        current.chapterProgress[existingIndex] = {
          ...current.chapterProgress[existingIndex],
          ...chapterUpdate,
        };
      } else {
        current.chapterProgress.push({
          chapterId: chapterUpdate.chapterId,
          completed: chapterUpdate.completed,
          watchTime: chapterUpdate.watchTime,
          lastPosition: chapterUpdate.lastPosition,
        });
      }

      // Recalculate stats
      current.chaptersCompleted = current.chapterProgress.filter(c => c.completed).length;
      if (current.totalChapters > 0) {
        current.completionPercentage = Math.round(
          (current.chaptersCompleted / current.totalChapters) * 100
        );
      }
      current.lastWatchedAt = new Date();

      LocalStorageFallback.save(tutorialId, userId, current);

      throw error; // Re-throw to let caller know API failed
    }
  }

  /**
   * Update quiz score
   */
  static async updateQuizScore(
    tutorialId: string,
    userId: string | null,
    quizScore: QuizScore
  ): Promise<TutorialProgress> {
    try {
      const response = await withRetry(async () => {
        return await apiClient.post(
          `${API_BASE}/${tutorialId}/quiz`,
          {
            userId,
            ...quizScore,
          }
        );
      });

      const progress = response.data as TutorialProgress;

      // Update local storage cache
      LocalStorageFallback.save(tutorialId, userId, progress);

      return progress;
    } catch (error) {
      console.error('Failed to update quiz score:', error);

      // Fallback: update localStorage and return it
      const current = LocalStorageFallback.load(tutorialId, userId) ||
                     this.getDefaultProgress(tutorialId, userId);

      // Update quiz score locally
      const existingIndex = current.quizScores.findIndex(
        q => q.quizId === quizScore.quizId
      );

      if (existingIndex >= 0) {
        const existing = current.quizScores[existingIndex];
        current.quizScores[existingIndex] = {
          ...quizScore,
          attempts: (existing.attempts || 1) + 1,
          score: Math.max(existing.score, quizScore.score),
          passed: existing.passed || quizScore.passed,
        };
      } else {
        current.quizScores.push(quizScore);
      }

      current.lastWatchedAt = new Date();

      LocalStorageFallback.save(tutorialId, userId, current);

      throw error; // Re-throw to let caller know API failed
    }
  }

  /**
   * Mark tutorial as complete and earn certificate
   */
  static async completeTutorial(
    tutorialId: string,
    userId: string | null
  ): Promise<TutorialProgress> {
    try {
      const response = await withRetry(async () => {
        return await apiClient.post(
          `${API_BASE}/${tutorialId}/complete`,
          { userId }
        );
      });

      const progress = response.data as TutorialProgress;

      // Update local storage cache
      LocalStorageFallback.save(tutorialId, userId, progress);

      return progress;
    } catch (error) {
      console.error('Failed to complete tutorial:', error);

      // Fallback: update localStorage
      const current = LocalStorageFallback.load(tutorialId, userId) ||
                     this.getDefaultProgress(tutorialId, userId);

      current.certificateEarned = true;
      current.completionPercentage = 100;
      current.lastWatchedAt = new Date();

      LocalStorageFallback.save(tutorialId, userId, current);

      throw error; // Re-throw to let caller know API failed
    }
  }

  /**
   * Reset tutorial progress
   */
  static async resetProgress(
    tutorialId: string,
    userId: string | null
  ): Promise<void> {
    try {
      await withRetry(async () => {
        const url = userId
          ? `${API_BASE}/${tutorialId}?userId=${encodeURIComponent(userId)}`
          : `${API_BASE}/${tutorialId}`;
        return await apiClient.delete(url);
      });

      // Clear local storage cache
      LocalStorageFallback.remove(tutorialId, userId);
    } catch (error) {
      console.error('Failed to reset progress:', error);

      // Fallback: clear localStorage
      LocalStorageFallback.remove(tutorialId, userId);

      throw error;
    }
  }

  /**
   * Get default progress structure
   */
  private static getDefaultProgress(
    tutorialId: string,
    userId: string | null
  ): TutorialProgress {
    return {
      tutorialId,
      userId,
      completionPercentage: 0,
      chaptersCompleted: 0,
      totalChapters: 0,
      chapterProgress: [],
      quizScores: [],
      certificateEligible: false,
      certificateEarned: false,
      totalWatchTime: 0,
      lastWatchedAt: null,
    };
  }

  /**
   * Migrate data from localStorage to backend (migration utility)
   */
  static async migrateLocalStorageToBackend(
    tutorialId: string,
    userId: string | null
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Load from localStorage
      const localProgress = LocalStorageFallback.load(tutorialId, userId);

      if (!localProgress) {
        return { success: false, error: 'No local data found' };
      }

      // Check if backend already has data
      try {
        const existingProgress = await this.getProgress(tutorialId, userId);

        // If backend has more recent data, skip migration
        if (existingProgress.lastWatchedAt && localProgress.lastWatchedAt) {
          const backendTime = new Date(existingProgress.lastWatchedAt).getTime();
          const localTime = new Date(localProgress.lastWatchedAt).getTime();

          if (backendTime >= localTime) {
            return { success: false, error: 'Backend data is more recent' };
          }
        }
      } catch {
        // No existing data, proceed with migration
      }

      // Migrate chapter progress
      for (const chapter of localProgress.chapterProgress) {
        await this.updateChapterProgress(tutorialId, userId, {
          ...chapter,
          totalChapters: localProgress.totalChapters,
        });
      }

      // Migrate quiz scores
      for (const quiz of localProgress.quizScores) {
        await this.updateQuizScore(tutorialId, userId, quiz);
      }

      // Mark as complete if applicable
      if (localProgress.certificateEarned) {
        await this.completeTutorial(tutorialId, userId);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Batch migrate all localStorage tutorials to backend
   */
  static async migrateAllLocalStorage(
    userId: string | null
  ): Promise<{ migrated: number; failed: number; errors: string[] }> {
    if (typeof window === 'undefined') {
      return { migrated: 0, failed: 0, errors: ['Not in browser environment'] };
    }

    const results = { migrated: 0, failed: 0, errors: [] as string[] };

    try {
      // Find all tutorial progress keys
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith('tutorial_progress_')
      );

      for (const key of keys) {
        // Extract tutorial ID from key
        const match = key.match(/tutorial_progress_(.+)_/);
        if (!match) continue;

        const tutorialId = match[1];

        // Attempt migration
        const result = await this.migrateLocalStorageToBackend(tutorialId, userId);

        if (result.success) {
          results.migrated++;
        } else {
          results.failed++;
          if (result.error) {
            results.errors.push(`${tutorialId}: ${result.error}`);
          }
        }
      }
    } catch (error) {
      results.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return results;
  }
}

export default TutorialProgressService;
