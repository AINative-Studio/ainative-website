/**
 * Quiz Score API
 * POST /api/tutorials/[id]/progress/quiz - Record quiz score
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-helpers';
import type { TutorialProgress, QuizScore } from '@/types/tutorial';

// Shared progress store
const progressStore = new Map<string, TutorialProgress>();

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
    const key = `${tutorialId}_${userId}`;

    // Parse request body
    const body = await request.json();
    const { quizId, score, maxScore, passed } = body;

    if (!quizId || typeof score !== 'number' || typeof maxScore !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request: quizId, score, and maxScore are required' },
        { status: 400 }
      );
    }

    // Validate score
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

    // Get existing progress or create new
    const progress = progressStore.get(key) || {
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

    // Find existing quiz score or create new
    const existingIndex = progress.quizScores.findIndex((q) => q.quizId === quizId);

    const quizScore: QuizScore = {
      quizId,
      score,
      maxScore,
      passed: isPassed,
      attempts: 1,
      completedAt: new Date(),
    };

    if (existingIndex >= 0) {
      // Update existing quiz score (increment attempts)
      const existing = progress.quizScores[existingIndex];
      progress.quizScores[existingIndex] = {
        ...quizScore,
        attempts: (existing.attempts || 1) + 1,
        // Keep the best score
        score: Math.max(existing.score, score),
        passed: existing.passed || isPassed,
      };
    } else {
      // Add new quiz score
      progress.quizScores.push(quizScore);
    }

    // Update certificate eligibility
    progress.certificateEligible = updateCertificateEligibility(progress);

    // Update last watched timestamp
    progress.lastWatchedAt = new Date();

    // Save progress
    progressStore.set(key, progress);

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
      { error: 'Failed to record quiz score' },
      { status: 500 }
    );
  }
}
