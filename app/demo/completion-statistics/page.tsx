import { Metadata } from 'next';
import CompletionStatisticsClient from './CompletionStatisticsClient';

export const metadata: Metadata = {
  title: 'Completion Statistics Demo',
  description:
    'Interactive completion statistics dashboard with real-time metrics, charts, and performance analytics. Track completion rates, response times, and success rates with responsive data visualization.',
  keywords: [
    'completion statistics',
    'analytics dashboard',
    'performance metrics',
    'data visualization',
    'recharts',
    'api monitoring',
    'success rate tracking',
    'response time analytics',
  ],
  openGraph: {
    title: 'Completion Statistics Demo | AI Native Studio',
    description:
      'Real-time completion statistics with interactive charts showing completion rates, response times, and success metrics.',
    type: 'website',
    images: [
      {
        url: '/card.png',
        width: 1200,
        height: 630,
        alt: 'Completion Statistics Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Completion Statistics Demo | AI Native Studio',
    description:
      'Interactive analytics dashboard for tracking completion rates and performance metrics.',
    images: ['/card.png'],
  },
};

export default function CompletionStatisticsPage() {
  return <CompletionStatisticsClient />;
}
