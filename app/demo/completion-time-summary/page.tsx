import { Metadata } from 'next';
import CompletionTimeSummaryClient from './CompletionTimeSummaryClient';

export const metadata: Metadata = {
  title: 'Completion Time Summary Demo',
  description: 'Track and analyze completion times across different time periods with interactive timeline visualization',
  openGraph: {
    title: 'Completion Time Summary Demo | AI Native Studio',
    description: 'Interactive demo showcasing time-based completion summaries with daily, weekly, and monthly trends',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Completion Time Summary Demo',
    description: 'Track completion times with interactive timeline visualization',
  },
};

export default function CompletionTimeSummaryPage() {
  return <CompletionTimeSummaryClient />;
}
