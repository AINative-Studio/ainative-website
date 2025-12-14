import { Metadata } from 'next';
import ShowcaseDetailClient from './ShowcaseDetailClient';

interface ShowcaseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ShowcaseDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${title} | AINative Showcase`,
    description: `Explore ${title.toLowerCase()} - a project built with AINative by our developer community`,
    openGraph: {
      title: `${title} - AINative Showcase`,
      description: `Explore ${title.toLowerCase()} - a project built with AINative`,
      type: 'article',
    },
  };
}

export default async function ShowcaseDetailPage({ params }: ShowcaseDetailPageProps) {
  const resolvedParams = await params;
  return <ShowcaseDetailClient slug={resolvedParams.slug} />;
}
