import { Metadata } from 'next';
import TutorialListingClient from './TutorialListingClient';

export const metadata: Metadata = {
  title: 'Tutorials | AINative Studio',
  description: 'Step-by-step tutorials to master the AINative platform. Learn AI development from beginner to advanced levels.',
  openGraph: {
    title: 'AINative Tutorials',
    description: 'Step-by-step tutorials to master the AINative platform',
    type: 'website',
    url: 'https://www.ainative.studio/tutorials',
    images: [
      {
        url: '/og-tutorials.png',
        width: 1200,
        height: 630,
        alt: 'AI Native Studio Tutorials',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Tutorials',
    description: 'Step-by-step tutorials to master the AINative platform',
    images: ['/og-tutorials.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/tutorials',
  },
};

export default function TutorialsPage() {
  return <TutorialListingClient />;
}
