/**
 * Tutorial Completion API
 * POST /api/tutorials/[id]/complete - Mark tutorial as complete and earn certificate
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-helpers';
import type { TutorialProgress } from '@/types/tutorial';

// Shared progress store
const progressStore = new Map<string, TutorialProgress>();

/**
 * POST /api/tutorials/[id]/complete
 * Mark tutorial as complete
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

    // Get existing progress
    const progress = progressStore.get(key);

    if (!progress) {
      return NextResponse.json(
        { error: 'No progress found for this tutorial' },
        { status: 404 }
      );
    }

    // Check if user is eligible for certificate
    if (!progress.certificateEligible) {
      return NextResponse.json(
        {
          error: 'Not eligible for certificate',
          message: 'Complete all chapters and pass all quizzes to earn certificate',
          eligibility: {
            chaptersComplete: progress.completionPercentage >= 95,
            quizzesPassed:
              progress.quizScores.length === 0 || progress.quizScores.every((q) => q.passed),
            currentCompletion: progress.completionPercentage,
            passedQuizzes: progress.quizScores.filter((q) => q.passed).length,
            totalQuizzes: progress.quizScores.length,
          },
        },
        { status: 400 }
      );
    }

    // Mark certificate as earned
    progress.certificateEarned = true;
    progress.completionPercentage = 100;
    progress.lastWatchedAt = new Date();

    // Save updated progress
    progressStore.set(key, progress);

    return NextResponse.json(
      {
        success: true,
        message: 'Tutorial completed successfully!',
        certificateEarned: true,
        progress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to complete tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to complete tutorial' },
      { status: 500 }
    );
  }
}
