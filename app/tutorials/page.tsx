import { Metadata } from 'next';
import TutorialListingClient from './TutorialListingClient';

export const metadata: Metadata = {
  title: 'Tutorials | AINative Studio',
  description: 'Step-by-step tutorials to master the AINative platform. Learn AI development from beginner to advanced levels.',
  openGraph: {
    title: 'AINative Tutorials',
    description: 'Step-by-step tutorials to master the AINative platform',
    type: 'website',
  },
};

export default function TutorialsPage() {
  return <TutorialListingClient />;
}
