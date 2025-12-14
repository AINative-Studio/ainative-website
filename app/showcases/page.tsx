import { Metadata } from 'next';
import ShowcaseListingClient from './ShowcaseListingClient';

export const metadata: Metadata = {
  title: 'Community Showcase | AINative Studio',
  description: 'Discover inspiring projects built with AINative by our developer community. Explore demos, source code, and real-world implementations.',
  openGraph: {
    title: 'AINative Community Showcase',
    description: 'Discover inspiring projects built with AINative',
    type: 'website',
  },
};

export default function ShowcasesPage() {
  return <ShowcaseListingClient />;
}
