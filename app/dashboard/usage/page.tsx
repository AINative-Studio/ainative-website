import { Metadata } from 'next';
import UsageClient from './UsageClient';

export const metadata: Metadata = {
  title: 'Usage',
  description: 'Monitor your AINative account usage, credits, and billing',
};

export default function UsagePage() {
  return <UsageClient />;
}
