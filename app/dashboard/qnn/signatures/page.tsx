import { Metadata } from 'next';
import SignaturesClient from './SignaturesClient';

export const metadata: Metadata = {
  title: 'QNN Signatures',
  description: 'Manage quantum-resistant signatures for model authentication and integrity verification',
};

export default function SignaturesPage() {
  return <SignaturesClient />;
}
