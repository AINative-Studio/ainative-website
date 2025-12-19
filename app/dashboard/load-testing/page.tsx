import { Metadata } from 'next';
import LoadTestingClient from './LoadTestingClient';

export const metadata: Metadata = {
  title: 'Load Testing | AINative Dashboard',
  description: 'Run performance and load tests on your AI applications. Create test scenarios, execute tests, and analyze results.',
};

export default function LoadTestingPage() {
  return <LoadTestingClient />;
}
