import { Metadata } from 'next';
import QNNDashboardClient from './QNNDashboardClient';

export const metadata: Metadata = {
  title: 'QNN Dashboard | AINative Studio',
  description: 'Quantum Neural Network dashboard for model management, training, benchmarking, and monitoring',
};

export default function QNNDashboardPage() {
  return <QNNDashboardClient />;
}
