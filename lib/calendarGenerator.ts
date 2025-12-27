/**
 * Calendar Generator Utilities
 * Generate calendar files and URLs for various platforms
 */

export function formatWebinarDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export interface CalendarEventData {
  title: string;
  description: string;
  startDate: Date;
  duration: number; // in minutes
  location: string;
  url?: string;
  organizer?: {
    name: string;
    email: string;
  };
}

function formatDateForICal(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
}

export function generateICalFile(event: CalendarEventData): string {
  const startDate = event.startDate;
  const endDate = new Date(startDate.getTime() + event.duration * 60 * 1000);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AINative//Webinar Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatDateForICal(startDate)}`,
    `DTEND:${formatDateForICal(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    event.url ? `URL:${event.url}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\r\n');
}

export function downloadICalFile(eventOrContent: CalendarEventData | string, filename?: string): void {
  const content = typeof eventOrContent === 'string'
    ? eventOrContent
    : generateICalFile(eventOrContent);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'event.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const startDate = event.startDate;
  const endDate = new Date(startDate.getTime() + event.duration * 60 * 1000);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateOutlookCalendarUrl(event: CalendarEventData): string {
  const startDate = event.startDate;
  const endDate = new Date(startDate.getTime() + event.duration * 60 * 1000);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
