/**
 * Tutorial Progress API
 * GET /api/tutorials/[id]/progress - Get tutorial progress
 * DELETE /api/tutorials/[id]/progress - Reset progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-helpers';
import type { TutorialProgress } from '@/types/tutorial';

// In-memory storage for demo (replace with database in production)
const progressStore = new Map<string, TutorialProgress>();

/**
 * Generate default progress for a tutorial
 */
function getDefaultProgress(tutorialId: string, userId: string | null): TutorialProgress {
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
 * GET /api/tutorials/[id]/progress
 * Get tutorial progress for current user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = await getUserId();
    const tutorialId = resolvedParams.id;
    const key = `${tutorialId}_${userId}`;

    // Get progress from storage or return default
    const progress = progressStore.get(key) || getDefaultProgress(tutorialId, userId);

    return NextResponse.json(progress, { status: 200 });
  } catch (error) {
    console.error('Failed to get tutorial progress:', error);
    return NextResponse.json(
      { error: 'Failed to get tutorial progress' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tutorials/[id]/progress
 * Reset tutorial progress for current user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = await getUserId();
    const tutorialId = resolvedParams.id;
    const key = `${tutorialId}_${userId}`;

    // Remove progress from storage
    progressStore.delete(key);

    return NextResponse.json(
      { success: true, message: 'Progress reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to reset tutorial progress:', error);
    return NextResponse.json(
      { error: 'Failed to reset tutorial progress' },
      { status: 500 }
    );
  }
}
