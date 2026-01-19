/**
 * Quiz Score API
 * POST /api/tutorials/[id]/progress/quiz - Record quiz score
 *
 * Uses persistent storage via TutorialProgressService
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-helpers';
import TutorialProgressService from '@/services/tutorialProgressService';

/**
 * POST /api/tutorials/[id]/progress/quiz
 * Record quiz score
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = await getUserId();
    const tutorialId = resolvedParams.id;

    // Parse request body
    const body = await request.json();
    const { quizId, score, maxScore, passed } = body;

    // Validate required fields
    if (!quizId || typeof score !== 'number' || typeof maxScore !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request: quizId, score, and maxScore are required' },
        { status: 400 }
      );
    }

    // Validate score range
    if (score < 0 || score > maxScore) {
      return NextResponse.json(
        { error: 'Invalid score: must be between 0 and maxScore' },
        { status: 400 }
      );
    }

    // Calculate pass threshold (70%)
    const PASS_THRESHOLD = 0.7;
    const calculatedPassed = score >= maxScore * PASS_THRESHOLD;
    const isPassed = passed !== undefined ? passed : calculatedPassed;

    // Update quiz score via service
    const progress = await TutorialProgressService.updateQuizScore(
      tutorialId,
      userId,
      {
        quizId,
        score,
        maxScore,
        passed: isPassed,
        attempts: 1,
        completedAt: new Date(),
      }
    );

    return NextResponse.json(
      {
        success: true,
        passed: isPassed,
        progress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to record quiz score:', error);
    return NextResponse.json(
      {
        error: 'Failed to record quiz score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
