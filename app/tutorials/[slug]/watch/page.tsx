import { Metadata } from 'next';
import TutorialWatchClient from './TutorialWatchClient';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // TODO: Fetch tutorial title from API for better SEO
  return {
    title: 'Watch Tutorial',
    description: 'Watch and learn with interactive tutorials featuring video lessons, quizzes, and progress tracking.',
    robots: { index: false, follow: false }, // Don't index watch pages
  };
}

export default function TutorialWatchPage({ params }: Props) {
  return <TutorialWatchClient slug={params.slug} />;
}
