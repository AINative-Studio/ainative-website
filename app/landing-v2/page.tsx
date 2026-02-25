import { Metadata } from 'next';
import LandingV2Client from './LandingV2Client';

export const metadata: Metadata = {
  title: 'AI Native Studio - Landing Page V2 Preview',
  description: 'Preview of the redesigned AI Native Studio landing page.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandingV2Page() {
  return <LandingV2Client />;
}
