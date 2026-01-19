/**
 * Generate and download webinar calendar file (.ics)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateICalFile, CalendarEventData } from '@/lib/calendarGenerator';

// Mock webinar data - replace with actual database/API call
async function fetchWebinarDetails(webinarId: string) {
  // TODO: Fetch from your database or CMS
  // For now, return mock data
  return {
    id: webinarId,
    title: 'AI Native Webinar',
    description: 'Join us for an exciting webinar on AI Native development',
    date: new Date().toISOString(),
    duration: 60,
    meeting_url: 'https://lu.ma/ainative-webinar',
    speaker: {
      name: 'AI Native Team',
      email: 'events@ainative.io',
    },
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: { message: 'Webinar ID is required' } },
        { status: 400 }
      );
    }

    // Fetch webinar details
    const webinar = await fetchWebinarDetails(id);

    if (!webinar) {
      return NextResponse.json(
        { error: { message: 'Webinar not found' } },
        { status: 404 }
      );
    }

    // Prepare calendar event data
    const calendarData: CalendarEventData = {
      title: webinar.title,
      description: webinar.description,
      startDate: new Date(webinar.date),
      duration: webinar.duration,
      location: webinar.meeting_url || 'Online',
      url: webinar.meeting_url,
      organizer: webinar.speaker
        ? {
            name: webinar.speaker.name,
            email: webinar.speaker.email || 'events@ainative.io',
          }
        : {
            name: 'AI Native',
            email: 'events@ainative.io',
          },
    };

    // Generate ICS content
    const icsContent = generateICalFile(calendarData);

    // Return as downloadable file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="webinar-${id}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[Calendar Generation Error]', error);
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to generate calendar file',
        },
      },
      { status: 500 }
    );
  }
}
