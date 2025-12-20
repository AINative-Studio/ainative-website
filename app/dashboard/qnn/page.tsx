import { Metadata } from 'next';
import QNNDashboardClient from './QNNDashboardClient';

export const metadata: Metadata = {
  title: 'Quantum Computing - AI Native Studio',
  description: 'Execute quantum circuits on simulators and real quantum hardware',
};

export default function QNNPage() {
  return <QNNDashboardClient />;
}
