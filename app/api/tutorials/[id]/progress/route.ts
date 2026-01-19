/**
 * Tutorial Progress API
 * GET /api/tutorials/[id]/progress - Get tutorial progress
 * DELETE /api/tutorials/[id]/progress - Reset progress
 *
 * Uses persistent storage via TutorialProgressService
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-helpers';
import TutorialProgressService from '@/services/tutorialProgressService';

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

    // Get progress from persistent storage
    const progress = await TutorialProgressService.getProgress(tutorialId, userId);

    return NextResponse.json(progress, { status: 200 });
  } catch (error) {
    console.error('Failed to get tutorial progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to get tutorial progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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

    // Reset progress in persistent storage
    await TutorialProgressService.resetProgress(tutorialId, userId);

    return NextResponse.json(
      { success: true, message: 'Progress reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to reset tutorial progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset tutorial progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
