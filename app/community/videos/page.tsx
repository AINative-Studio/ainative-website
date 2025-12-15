import { Metadata } from 'next';
import VideosClient from './VideosClient';

export const metadata: Metadata = {
  title: 'Community Videos | AINative Studio',
  description:
    'Browse tutorials, webinars, showcases, and demos created by the AINative community. Learn AI development through video content.',
  keywords: [
    'AI tutorials',
    'video tutorials',
    'webinars',
    'AINative demos',
    'AI development videos',
    'machine learning tutorials',
  ],
  openGraph: {
    title: 'Community Videos | AINative Studio',
    description:
      'Browse tutorials, webinars, showcases, and demos created by the AINative community.',
    type: 'website',
    url: 'https://www.ainative.studio/community/videos',
    images: [
      {
        url: '/og-videos.png',
        width: 1200,
        height: 630,
        alt: 'AINative Community Videos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community Videos | AINative Studio',
    description:
      'Browse tutorials, webinars, showcases, and demos created by the AINative community.',
  },
};

export default function CommunityVideosPage() {
  return <VideosClient />;
}
