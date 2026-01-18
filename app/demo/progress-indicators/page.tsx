import { Metadata } from 'next';
import ProgressIndicatorsDemoClient from './ProgressIndicatorsDemoClient';

export const metadata: Metadata = {
  title: 'Progress Indicators Demo',
  description: 'Live demonstration of streaming progress indicators for long-running operations',
};

export default function ProgressIndicatorsDemoPage() {
  return <ProgressIndicatorsDemoClient />;
}
