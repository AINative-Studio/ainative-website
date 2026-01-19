/**
 * Tutorial Completion API
 * POST /api/tutorials/[id]/complete - Mark tutorial as complete and earn certificate
 *
 * Uses persistent storage via TutorialProgressService
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-helpers';
import TutorialProgressService from '@/services/tutorialProgressService';

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

    // Get existing progress to check eligibility
    const currentProgress = await TutorialProgressService.getProgress(tutorialId, userId);

    // Check if user is eligible for certificate
    if (!currentProgress.certificateEligible) {
      return NextResponse.json(
        {
          error: 'Not eligible for certificate',
          message: 'Complete all chapters and pass all quizzes to earn certificate',
          eligibility: {
            chaptersComplete: currentProgress.completionPercentage >= 95,
            quizzesPassed:
              currentProgress.quizScores.length === 0 ||
              currentProgress.quizScores.every((q) => q.passed),
            currentCompletion: currentProgress.completionPercentage,
            passedQuizzes: currentProgress.quizScores.filter((q) => q.passed).length,
            totalQuizzes: currentProgress.quizScores.length,
          },
        },
        { status: 400 }
      );
    }

    // Mark tutorial as complete via service
    const progress = await TutorialProgressService.completeTutorial(tutorialId, userId);

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
      {
        error: 'Failed to complete tutorial',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
