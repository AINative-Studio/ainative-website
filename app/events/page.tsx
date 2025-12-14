import { Metadata } from 'next';
import EventsCalendarClient from './EventsCalendarClient';

export const metadata: Metadata = {
  title: 'Events & Workshops | AINative Studio',
  description: 'Join us for webinars, workshops, and office hours. Learn from experts and build with the AINative community.',
  openGraph: {
    title: 'AINative Events & Workshops',
    description: 'Join us for webinars, workshops, and office hours',
    type: 'website',
  },
};

export default function EventsPage() {
  return <EventsCalendarClient />;
}
