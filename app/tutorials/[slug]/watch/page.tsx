import { Metadata } from 'next';
import TutorialWatchClient from './TutorialWatchClient';

interface TutorialWatchPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: TutorialWatchPageProps): Promise<Metadata> {
  // TODO: Fetch tutorial title from API for better SEO
  return {
    title: 'Watch Tutorial',
    description: 'Watch and learn with interactive tutorials featuring video lessons, quizzes, and progress tracking.',
    robots: { index: false, follow: false }, // Don't index watch pages
  };
}

export default async function TutorialWatchPage({ params }: TutorialWatchPageProps) {
  const resolvedParams = await params;
  return <TutorialWatchClient slug={resolvedParams.slug} />;
}
