/**
 * CalendarButtons Component
 * Quick action buttons for adding webinar to different calendar platforms
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  generateICalFile,
  downloadICalFile,
  CalendarEventData,
} from '@/lib/calendarGenerator';
import { Calendar, Download } from 'lucide-react';
import { Webinar } from '@/lib/webinarAPI';

export interface CalendarButtonsProps {
  webinar: Webinar;
  variant?: 'buttons' | 'dropdown';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function CalendarButtons({ webinar, variant = 'buttons', size = 'default', className = '' }: CalendarButtonsProps) {
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

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(eventData);
    window.open(url, '_blank');
  };

  const handleOutlookCalendar = () => {
    const url = generateOutlookCalendarUrl(eventData);
    window.open(url, '_blank');
  };

  const handleDownloadICS = () => {
    try {
      const icsContent = generateICalFile(eventData);
      const filename = webinar.slug || String(webinar.id);
      downloadICalFile(icsContent, filename + '.ics');
    } catch (error) {
      console.error('Error generating calendar file:', error);
      alert('Failed to generate calendar file. Please try again.');
    }
  };

  if (variant === 'dropdown') {
    return (
      <div className={'flex flex-col gap-2 ' + className}>
        <Button
          variant="outline"
          size={size}
          onClick={handleGoogleCalendar}
          className="w-full justify-start border-[#2D333B] text-gray-300 hover:border-[#4B6FED] hover:bg-[#4B6FED]/10"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Add to Google Calendar
        </Button>
        <Button
          variant="outline"
          size={size}
          onClick={handleOutlookCalendar}
          className="w-full justify-start border-[#2D333B] text-gray-300 hover:border-[#4B6FED] hover:bg-[#4B6FED]/10"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Add to Outlook
        </Button>
        <Button
          variant="outline"
          size={size}
          onClick={handleDownloadICS}
          className="w-full justify-start border-[#2D333B] text-gray-300 hover:border-[#4B6FED] hover:bg-[#4B6FED]/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Download .ics File
        </Button>
      </div>
    );
  }

  return (
    <div className={'flex flex-wrap gap-2 ' + className}>
      <Button
        variant="outline"
        size={size}
        onClick={handleGoogleCalendar}
        className="border-[#2D333B] text-gray-300 hover:border-[#4B6FED] hover:bg-[#4B6FED]/10"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Google
      </Button>
      <Button
        variant="outline"
        size={size}
        onClick={handleOutlookCalendar}
        className="border-[#2D333B] text-gray-300 hover:border-[#4B6FED] hover:bg-[#4B6FED]/10"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Outlook
      </Button>
      <Button
        variant="outline"
        size={size}
        onClick={handleDownloadICS}
        className="border-[#2D333B] text-gray-300 hover:border-[#4B6FED] hover:bg-[#4B6FED]/10"
      >
        <Download className="w-4 h-4 mr-2" />
        .ics
      </Button>
    </div>
  );
}
