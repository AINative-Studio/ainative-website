import { Metadata } from 'next';
import AIUsageClient from './AIUsageClient';

export const metadata: Metadata = {
  title: 'AI Usage Analytics - AI Native Studio',
  description: 'Track your AI model usage, costs, and performance metrics',
};

export default function AIUsagePage() {
  return <AIUsageClient />;
}
