/**
 * Code Review Demo Page
 * Demonstrates the /review command functionality
 */

import { Metadata } from 'next';
import { ReviewDemoClient } from './ReviewDemoClient';

export const metadata: Metadata = {
  title: 'Code Review Command Demo',
  description:
    'AI-powered code review with security, performance, and style analysis',
};

export default function ReviewDemoPage() {
  return <ReviewDemoClient />;
}
