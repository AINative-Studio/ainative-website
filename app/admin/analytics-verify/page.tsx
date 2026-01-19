import type { Metadata } from 'next';
import AnalyticsVerifyClient from './AnalyticsVerifyClient';

export const metadata: Metadata = {
  title: 'Analytics Verification Dashboard',
  description: 'Real-time verification of all analytics tracking services',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Admin page for verifying analytics integration
 * Server component that delegates to client component for real-time checks
 */
export default function AnalyticsVerifyPage() {
  return <AnalyticsVerifyClient />;
}
