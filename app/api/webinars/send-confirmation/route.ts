/**
 * Send webinar registration confirmation email
 */

import { NextRequest, NextResponse } from 'next/server';

interface ConfirmationEmailData {
  email: string;
  name: string;
  webinarId: string;
  webinarTitle: string;
  webinarDate: string;
  registrationId: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: ConfirmationEmailData = await request.json();

    // Validate required fields
    if (!data.email || !data.name || !data.webinarId || !data.webinarTitle) {
      return NextResponse.json(
        { error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Format webinar date
    const webinarDate = new Date(data.webinarDate);
    const formattedDate = webinarDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    // TODO: Integrate with your email service (e.g., SendGrid, Resend, Postmark)
    // Example with Resend:
    /*
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'events@ainative.io',
      to: data.email,
      subject: `Registration Confirmed: ${data.webinarTitle}`,
      html: `
        <h1>You're Registered!</h1>
        <p>Hi ${data.name},</p>
        <p>Thank you for registering for <strong>${data.webinarTitle}</strong>.</p>
        <p><strong>Date & Time:</strong> ${formattedDate}</p>
        <p><strong>Confirmation Number:</strong> ${data.registrationId}</p>
        <p>We'll send you a reminder email before the webinar starts.</p>
        <p>Best regards,<br>The AI Native Team</p>
      `,
    });
    */

    // Log for development (replace with actual email service in production)
    console.log('[Webinar Registration Confirmation]', {
      to: data.email,
      name: data.name,
      webinar: data.webinarTitle,
      date: formattedDate,
      registrationId: data.registrationId,
    });

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
    });
  } catch (error) {
    console.error('[Send Confirmation Error]', error);
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to send confirmation email',
        },
      },
      { status: 500 }
    );
  }
}
