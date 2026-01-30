/**
 * Integration Tests for TutorialProgressService
 *
 * Tests persistent storage, retry logic, fallback mechanisms, and migration utilities
 */


import TutorialProgressService from '../tutorialProgressService';
import apiClient from '@/lib/api-client';
import type { TutorialProgress, ChapterProgress, QuizScore } from '@/types/tutorial';

// Mock apiClient
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('TutorialProgressService', () => {
  const tutorialId = 'test-tutorial-123';
  const userId = 'user-456';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProgress', () => {
    it('should fetch progress from API successfully', async () => {
      const mockProgress: TutorialProgress = {
        tutorialId,
        userId,
        completionPercentage: 50,
        chaptersCompleted: 3,
        totalChapters: 6,
        chapterProgress: [],
        quizScores: [],
        certificateEligible: false,
        certificateEarned: false,
        totalWatchTime: 1200,
        lastWatchedAt: new Date(),
      };

      mockedApiClient.get.mockResolvedValue({ data: mockProgress , status: 200, statusText: 'OK' });

      const result = await TutorialProgressService.getProgress(tutorialId, userId);

      expect(result).toEqual(mockProgress);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/v1/tutorials/progress/${tutorialId}`,
        { params: { userId } }
      );
    });

    it('should fallback to localStorage on API failure', async () => {
      const mockProgress: TutorialProgress = {
        tutorialId,
        userId,
        completionPercentage: 30,
        chaptersCompleted: 2,
        totalChapters: 6,
        chapterProgress: [],
        quizScores: [],
        certificateEligible: false,
        certificateEarned: false,
        totalWatchTime: 800,
        lastWatchedAt: new Date(),
      };

      // Store in localStorage
      localStorageMock.setItem(
        `tutorial_progress_${tutorialId}_${userId}`,
        JSON.stringify(mockProgress)
      );

      // Mock API failure
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await TutorialProgressService.getProgress(tutorialId, userId);

      expect(result).toEqual(mockProgress);
    });

    it('should return default progress when no data exists', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Not found'));

      const result = await TutorialProgressService.getProgress(tutorialId, userId);

      expect(result).toEqual({
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
      });
    });

    it('should retry on network errors with exponential backoff', async () => {
      const mockProgress: TutorialProgress = {
        tutorialId,
        userId,
        completionPercentage: 50,
        chaptersCompleted: 3,
        totalChapters: 6,
        chapterProgress: [],
        quizScores: [],
        certificateEligible: false,
        certificateEarned: false,
        totalWatchTime: 1200,
        lastWatchedAt: new Date(),
      };

      // Fail twice, succeed on third attempt
      mockedApiClient.get
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: mockProgress, status: 200, statusText: 'OK' });

      const result = await TutorialProgressService.getProgress(tutorialId, userId);

      expect(result).toEqual(mockProgress);
      expect(apiClient.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('updateChapterProgress', () => {
    it('should update chapter progress successfully', async () => {
      const chapterUpdate: ChapterProgress = {
        chapterId: 'chapter-1',
        watchTime: 300,
        completed: true,
        lastPosition: 300,
      };

      const mockProgress: TutorialProgress = {
        tutorialId,
        userId,
        completionPercentage: 60,
        chaptersCompleted: 4,
        totalChapters: 6,
        chapterProgress: [chapterUpdate],
        quizScores: [],
        certificateEligible: false,
        certificateEarned: false,
        totalWatchTime: 1500,
        lastWatchedAt: new Date(),
      };

      mockedApiClient.post.mockResolvedValue({ data: mockProgress , status: 200, statusText: 'OK' });

      const result = await TutorialProgressService.updateChapterProgress(
        tutorialId,
        userId,
        { ...chapterUpdate, totalChapters: 6 }
      );

      expect(result).toEqual(mockProgress);
      expect(apiClient.post).toHaveBeenCalledWith(
        `/v1/tutorials/progress/${tutorialId}/chapter`,
        {
          userId,
          ...chapterUpdate,
          totalChapters: 6,
        }
      );
    });

    it('should update localStorage on API failure', async () => {
      const chapterUpdate: ChapterProgress = {
        chapterId: 'chapter-1',
        watchTime: 300,
        completed: true,
        lastPosition: 300,
      };

      mockedApiClient.post.mockRejectedValue(new Error('Network error'));

      await expect(
        TutorialProgressService.updateChapterProgress(tutorialId, userId, chapterUpdate)
      ).rejects.toThrow();

      // Check localStorage was updated
      const stored = localStorageMock.getItem(`tutorial_progress_${tutorialId}_${userId}`);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.chapterProgress).toContainEqual(
        expect.objectContaining({
          chapterId: 'chapter-1',
          completed: true,
        })
      );
    });
  });

  describe('updateQuizScore', () => {
    it('should update quiz score successfully', async () => {
      const quizScore: QuizScore = {
        quizId: 'quiz-1',
        score: 8,
        maxScore: 10,
        passed: true,
        attempts: 1,
        completedAt: new Date(),
      };

      const mockProgress: TutorialProgress = {
        tutorialId,
        userId,
        completionPercentage: 60,
        chaptersCompleted: 4,
        totalChapters: 6,
        chapterProgress: [],
        quizScores: [quizScore],
        certificateEligible: false,
        certificateEarned: false,
        totalWatchTime: 1500,
        lastWatchedAt: new Date(),
      };

      mockedApiClient.post.mockResolvedValue({ data: mockProgress , status: 200, statusText: 'OK' });

      const result = await TutorialProgressService.updateQuizScore(
        tutorialId,
        userId,
        quizScore
      );

      expect(result).toEqual(mockProgress);
      expect(apiClient.post).toHaveBeenCalledWith(
        `/v1/tutorials/progress/${tutorialId}/quiz`,
        {
          userId,
          ...quizScore,
        }
      );
    });

    it('should keep best score on multiple attempts', async () => {
      const firstAttempt: QuizScore = {
        quizId: 'quiz-1',
        score: 6,
        maxScore: 10,
        passed: false,
        attempts: 1,
        completedAt: new Date(),
      };

      // Store first attempt in localStorage
      const initialProgress: TutorialProgress = {
        tutorialId,
        userId,
        completionPercentage: 0,
        chaptersCompleted: 0,
        totalChapters: 6,
        chapterProgress: [],
        quizScores: [firstAttempt],
        certificateEligible: false,
        certificateEarned: false,
        totalWatchTime: 0,
        lastWatchedAt: new Date(),
      };

      localStorageMock.setItem(
        `tutorial_progress_${tutorialId}_${userId}`,
        JSON.stringify(initialProgress)
      );

      // Mock API failure to trigger localStorage fallback
      mockedApiClient.post.mockRejectedValue(new Error('Network error'));

      const secondAttempt: QuizScore = {
        quizId: 'quiz-1',
        score: 9,
        maxScore: 10,
        passed: true,
        attempts: 1,
        completedAt: new Date(),
      };

      await expect(
        TutorialProgressService.updateQuizScore(tutorialId, userId, secondAttempt)
      ).rejects.toThrow();

      // Check localStorage has the better score
      const stored = localStorageMock.getItem(`tutorial_progress_${tutorialId}_${userId}`);
      const parsed = JSON.parse(stored!);

      expect(parsed.quizScores[0].score).toBe(9);
      expect(parsed.quizScores[0].attempts).toBe(2);
      expect(parsed.quizScores[0].passed).toBe(true);
    });
  });

  describe('completeTutorial', () => {
    it('should mark tutorial as complete successfully', async () => {
      const mockProgress: TutorialProgress = {
        tutorialId,
        userId,
        completionPercentage: 100,
        chaptersCompleted: 6,
        totalChapters: 6,
        chapterProgress: [],
        quizScores: [],
        certificateEligible: true,
        certificateEarned: true,
        totalWatchTime: 3600,
        lastWatchedAt: new Date(),
      };

      mockedApiClient.post.mockResolvedValue({ data: mockProgress , status: 200, statusText: 'OK' });

      const result = await TutorialProgressService.completeTutorial(tutorialId, userId);

      expect(result.certificateEarned).toBe(true);
      expect(result.completionPercentage).toBe(100);
      expect(apiClient.post).toHaveBeenCalledWith(
        `/v1/tutorials/progress/${tutorialId}/complete`,
        { userId }
      );
    });
  });

  describe('resetProgress', () => {
    it('should reset progress successfully', async () => {
      mockedApiClient.delete.mockResolvedValue({ data: {}, status: 200, statusText: 'OK' });

      await TutorialProgressService.resetProgress(tutorialId, userId);

      expect(apiClient.delete).toHaveBeenCalledWith(
        `/v1/tutorials/progress/${tutorialId}`,
        { params: { userId } }
      );
    });

    it('should clear localStorage on reset', async () => {
      // Add data to localStorage
      localStorageMock.setItem(`tutorial_progress_${tutorialId}_${userId}`, 'test-data');

      mockedApiClient.delete.mockResolvedValue({ data: {}, status: 200, statusText: 'OK' });

      await TutorialProgressService.resetProgress(tutorialId, userId);

      const stored = localStorageMock.getItem(`tutorial_progress_${tutorialId}_${userId}`);
      expect(stored).toBeNull();
    });
  });

  describe('migrateLocalStorageToBackend', () => {
    it('should migrate localStorage data to backend', async () => {
      const localProgress: TutorialProgress = {
        tutorialId,
        userId,
        completionPercentage: 75,
        chaptersCompleted: 5,
        totalChapters: 6,
        chapterProgress: [
          {
            chapterId: 'chapter-1',
            watchTime: 300,
            completed: true,
            lastPosition: 300,
          },
        ],
        quizScores: [
          {
            quizId: 'quiz-1',
            score: 8,
            maxScore: 10,
            passed: true,
            attempts: 1,
            completedAt: new Date(),
          },
        ],
        certificateEligible: true,
        certificateEarned: false,
        totalWatchTime: 2400,
        lastWatchedAt: new Date(),
      };

      // Store in localStorage
      localStorageMock.setItem(
        `tutorial_progress_${tutorialId}_${userId}`,
        JSON.stringify(localProgress)
      );

      // Mock API calls
      mockedApiClient.get.mockRejectedValue(new Error('Not found'));
      mockedApiClient.post.mockResolvedValue({ data: localProgress , status: 200, statusText: 'OK' });

      const result = await TutorialProgressService.migrateLocalStorageToBackend(
        tutorialId,
        userId
      );

      expect(result.success).toBe(true);
      expect(apiClient.post).toHaveBeenCalledTimes(2); // chapter + quiz
    });

    it('should skip migration if backend has newer data', async () => {
      const localProgress: TutorialProgress = {
        tutorialId,
        userId,
        completionPercentage: 50,
        chaptersCompleted: 3,
        totalChapters: 6,
        chapterProgress: [],
        quizScores: [],
        certificateEligible: false,
        certificateEarned: false,
        totalWatchTime: 1200,
        lastWatchedAt: new Date('2026-01-01'),
      };

      const backendProgress: TutorialProgress = {
        ...localProgress,
        completionPercentage: 75,
        chaptersCompleted: 5,
        lastWatchedAt: new Date('2026-01-15'),
      };

      localStorageMock.setItem(
        `tutorial_progress_${tutorialId}_${userId}`,
        JSON.stringify(localProgress)
      );

      mockedApiClient.get.mockResolvedValue({ data: backendProgress , status: 200, statusText: 'OK' });

      const result = await TutorialProgressService.migrateLocalStorageToBackend(
        tutorialId,
        userId
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Backend data is more recent');
    });
  });
});
