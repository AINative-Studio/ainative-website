import { Metadata } from 'next';
import WebinarListingClient from './WebinarListingClient';

export const metadata: Metadata = {
  title: 'Webinars | AINative Studio',
  description: 'Join live webinars or watch recordings to master AI/ML, quantum computing, and cutting-edge technology.',
  openGraph: {
    title: 'AINative Webinars',
    description: 'Learn from the experts through live webinars and on-demand recordings',
    type: 'website',
  },
};

export default function WebinarsPage() {
  return <WebinarListingClient />;
}
