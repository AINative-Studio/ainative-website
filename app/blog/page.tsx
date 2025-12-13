import { Metadata } from 'next';
import BlogListingClient from './BlogListingClient';

export const metadata: Metadata = {
  title: 'Blog | AINative Studio',
  description: 'Insights, tutorials, and updates from the AINative team. Learn about AI development, best practices, and the latest in AI-native tooling.',
  openGraph: {
    title: 'AINative Blog',
    description: 'Insights, tutorials, and updates from the AINative team',
    type: 'website',
  },
};

export default function BlogPage() {
  return <BlogListingClient />;
}
