import { Metadata } from 'next';
import TutorialDetailClient from './TutorialDetailClient';

interface TutorialDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: TutorialDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Format slug for title: convert-kebab-case to Title Case
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${title} | AINative Tutorials`,
    description: `Learn ${title.toLowerCase()} with this step-by-step AINative tutorial`,
    openGraph: {
      title: `${title} - AINative Tutorial`,
      description: `Learn ${title.toLowerCase()} with this step-by-step AINative tutorial`,
      type: 'article',
    },
  };
}

export default async function TutorialDetailPage({ params }: TutorialDetailPageProps) {
  const resolvedParams = await params;
  return <TutorialDetailClient slug={resolvedParams.slug} />;
}
