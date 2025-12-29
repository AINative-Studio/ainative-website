import { Metadata } from 'next';
import QNNDashboardClient from './QNNDashboardClient';

export const metadata: Metadata = {
  title: 'QNN Dashboard',
  description: 'Manage your Quantum Neural Network models, training jobs, and performance metrics',
};

export default function QNNDashboardPage() {
  return <QNNDashboardClient />;
}
