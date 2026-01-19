/**
 * Chapter Progress API
 * POST /api/tutorials/[id]/progress/chapter - Update chapter progress
 *
 * Uses persistent storage via TutorialProgressService
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-helpers';
import TutorialProgressService from '@/services/tutorialProgressService';

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

    // Parse request body
    const body = await request.json();
    const { chapterId, watchTime, completed, lastPosition, totalChapters } = body;

    // Validate required fields
    if (!chapterId || typeof watchTime !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request: chapterId and watchTime are required' },
        { status: 400 }
      );
    }

    // Update chapter progress via service
    const progress = await TutorialProgressService.updateChapterProgress(
      tutorialId,
      userId,
      {
        chapterId,
        watchTime,
        completed: completed || false,
        lastPosition: lastPosition || watchTime,
        totalChapters,
      }
    );

    return NextResponse.json(
      { success: true, progress },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update chapter progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to update chapter progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
