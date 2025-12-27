/**
 * CalendarExport Component
 * Calendar download buttons for various platforms
 */

import React from 'react';
import { Webinar } from '@/lib/webinarAPI';
import {
  generateICalFile,
  downloadICalFile,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  CalendarEventData,
} from '@/lib/calendarGenerator';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';

interface CalendarExportProps {
  webinar: Webinar;
}

export function CalendarExport({ webinar }: CalendarExportProps) {
  const handleDownloadICS = async () => {
    const eventData: CalendarEventData = {
      title: webinar.title,
      description: webinar.description,
      startDate: new Date(webinar.date),
      duration: webinar.duration,
      location: webinar.meeting_url || 'Online',
      url: webinar.meeting_url,
      organizer: webinar.speaker
        ? {
            name: webinar.speaker.name,
            email: 'events@ainative.io',
          }
        : undefined,
    };

    try {
      const icsContent = await generateICalFile(eventData);
      downloadICalFile(icsContent, `${webinar.slug}.ics`);
    } catch (error) {
      console.error('Error generating calendar file:', error);
      alert('Failed to generate calendar file. Please try again.');
    }
  };

  const handleGoogleCalendar = () => {
    const eventData: CalendarEventData = {
      title: webinar.title,
      description: webinar.description,
      startDate: new Date(webinar.date),
      duration: webinar.duration,
      location: webinar.meeting_url || 'Online',
    };

    const url = generateGoogleCalendarUrl(eventData);
    window.open(url, '_blank');
  };

  const handleOutlookCalendar = () => {
    const eventData: CalendarEventData = {
      title: webinar.title,
      description: webinar.description,
      startDate: new Date(webinar.date),
      duration: webinar.duration,
      location: webinar.meeting_url || 'Online',
    };

    const url = generateOutlookCalendarUrl(eventData);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Add to Calendar:</p>
      <div className="grid grid-cols-1 gap-2">
        <Button variant="outline" size="sm" onClick={handleGoogleCalendar} className="w-full justify-start">
          <Calendar className="w-4 h-4 mr-2" />
          Google Calendar
        </Button>
        <Button variant="outline" size="sm" onClick={handleOutlookCalendar} className="w-full justify-start">
          <Calendar className="w-4 h-4 mr-2" />
          Outlook Calendar
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadICS} className="w-full justify-start">
          <Download className="w-4 h-4 mr-2" />
          Download .ics File
        </Button>
      </div>
    </div>
  );
}
