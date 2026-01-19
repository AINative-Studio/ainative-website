/**
 * Chapter Progress API
 * POST /api/tutorials/[id]/progress/chapter - Update chapter progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-helpers';
import type { TutorialProgress, ChapterProgress } from '@/types/tutorial';

// Shared progress store (same as parent route)
const progressStore = new Map<string, TutorialProgress>();

/**
 * Calculate completion percentage based on chapter progress
 */
function calculateCompletionPercentage(progress: TutorialProgress): number {
  if (progress.totalChapters === 0) return 0;

  const completedCount = progress.chapterProgress.filter((c) => c.completed).length;
  return Math.round((completedCount / progress.totalChapters) * 100);
}

/**
 * Update certificate eligibility based on progress
 */
function updateCertificateEligibility(progress: TutorialProgress): boolean {
  // Require 95% chapter completion
  const chaptersComplete = progress.completionPercentage >= 95;

  // Require all quizzes passed
  const quizzesPassed =
    progress.quizScores.length === 0 || progress.quizScores.every((q) => q.passed);

  return chaptersComplete && quizzesPassed;
}

/**
 * POST /api/tutorials/[id]/progress/chapter
 * Update chapter progress
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = await getUserId();
    const tutorialId = resolvedParams.id;
    const key = `${tutorialId}_${userId}`;

    // Parse request body
    const body = await request.json();
    const { chapterId, watchTime, completed, lastPosition, totalChapters } = body;

    if (!chapterId || typeof watchTime !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request: chapterId and watchTime are required' },
        { status: 400 }
      );
    }

    // Get existing progress or create new
    const progress: TutorialProgress = progressStore.get(key) || {
      tutorialId,
      userId,
      completionPercentage: 0,
      chaptersCompleted: 0,
      totalChapters: totalChapters || 0,
      chapterProgress: [] as ChapterProgress[],
      quizScores: [],
      certificateEligible: false,
      certificateEarned: false,
      totalWatchTime: 0,
      lastWatchedAt: null,
    };

    // Update total chapters if provided
    if (totalChapters && totalChapters > progress.totalChapters) {
      progress.totalChapters = totalChapters;
    }

    // Find existing chapter progress or create new
    const existingIndex = progress.chapterProgress.findIndex(
      (c) => c.chapterId === chapterId
    );

    const chapterUpdate: ChapterProgress = {
      chapterId,
      completed: completed || false,
      watchTime,
      lastPosition: lastPosition || watchTime,
    };

    if (existingIndex >= 0) {
      // Update existing chapter progress
      const existing = progress.chapterProgress[existingIndex];
      progress.chapterProgress[existingIndex] = {
        ...existing,
        ...chapterUpdate,
        watchTime: Math.max(existing.watchTime, watchTime),
      };
    } else {
      // Add new chapter progress
      progress.chapterProgress.push(chapterUpdate);
    }

    // Update total watch time
    progress.totalWatchTime = progress.chapterProgress.reduce(
      (sum, c) => sum + c.watchTime,
      0
    );

    // Update chapters completed count
    progress.chaptersCompleted = progress.chapterProgress.filter((c) => c.completed).length;

    // Recalculate completion percentage
    progress.completionPercentage = calculateCompletionPercentage(progress);

    // Update certificate eligibility
    progress.certificateEligible = updateCertificateEligibility(progress);

    // Update last watched timestamp
    progress.lastWatchedAt = new Date();

    // Save progress
    progressStore.set(key, progress);

    return NextResponse.json(
      { success: true, progress },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update chapter progress:', error);
    return NextResponse.json(
      { error: 'Failed to update chapter progress' },
      { status: 500 }
    );
  }
}
