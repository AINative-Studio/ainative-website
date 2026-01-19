import { Metadata } from 'next';
import BlogListingClient from './BlogListingClient';

export const metadata: Metadata = {
  title: 'Blog | AINative Studio',
  description: 'Insights, tutorials, and updates from the AINative team. Learn about AI development, best practices, and the latest in AI-native tooling.',
  openGraph: {
    title: 'AINative Blog',
    description: 'Insights, tutorials, and updates from the AINative team',
    type: 'website',
    url: 'https://www.ainative.studio/blog',
    images: [
      {
        url: '/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'AI Native Studio Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Blog',
    description: 'Insights, tutorials, and updates from the AINative team',
    images: ['/og-blog.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/blog',
  },
};

export default function BlogPage() {
  return <BlogListingClient />;
}
