/**
 * Calendar utilities for generating iCal and Google Calendar files
 */

export interface CalendarEvent {
    title: string;
    description: string;
    location?: string;
    startTime: Date;
    endTime: Date;
    url?: string;
}

/**
 * Format date for iCal format (YYYYMMDDTHHmmssZ)
 */
function formatICalDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generate iCal (.ics) file content
 */
export function generateICalFile(event: CalendarEvent): string {
    const now = new Date();
    const dtstamp = formatICalDate(now);
    const dtstart = formatICalDate(event.startTime);
    const dtend = formatICalDate(event.endTime);

    // Generate unique ID
    const uid = `${now.getTime()}@ainative.io`;

    // Escape special characters in text fields
    const escapeText = (text: string) =>
        text.replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n');

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AINative//Webinar Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${escapeText(event.title)}`,
        `DESCRIPTION:${escapeText(event.description)}`,
    ];

    if (event.location) {
        lines.push(`LOCATION:${escapeText(event.location)}`);
    }

    if (event.url) {
        lines.push(`URL:${event.url}`);
    }

    lines.push(
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
    );

    return lines.join('\r\n');
}

/**
 * Download iCal file
 */
export function downloadICalFile(event: CalendarEvent, filename?: string): void {
    const icalContent = generateICalFile(event);
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
    const formatGoogleDate = (date: Date) =>
        date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        details: event.description,
        dates: `${formatGoogleDate(event.startTime)}/${formatGoogleDate(event.endTime)}`,
    });

    if (event.location) {
        params.append('location', event.location);
    }

    if (event.url) {
        params.append('sprop', `website:${event.url}`);
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Open Google Calendar in new tab
 */
export function addToGoogleCalendar(event: CalendarEvent): void {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Generate Outlook calendar URL
 */
export function generateOutlookCalendarUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
        subject: event.title,
        body: event.description,
        startdt: event.startTime.toISOString(),
        enddt: event.endTime.toISOString(),
        path: '/calendar/action/compose',
        rru: 'addevent',
    });

    if (event.location) {
        params.append('location', event.location);
    }

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Open Outlook Calendar in new tab
 */
export function addToOutlookCalendar(event: CalendarEvent): void {
    const url = generateOutlookCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Download calendar file for all platforms
 */
export function downloadCalendarFile(event: CalendarEvent): void {
    downloadICalFile(event);
}
