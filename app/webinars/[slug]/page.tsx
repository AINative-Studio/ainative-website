import { Metadata } from 'next';
import WebinarDetailClient from './WebinarDetailClient';

interface WebinarDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: WebinarDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${title} | AINative Webinars`,
    description: `Watch or register for the ${title.toLowerCase()} webinar on AINative`,
    openGraph: {
      title: `${title} - AINative Webinar`,
      description: `Watch or register for the ${title.toLowerCase()} webinar on AINative`,
      type: 'article',
    },
  };
}

export default async function WebinarDetailPage({ params }: WebinarDetailPageProps) {
  const resolvedParams = await params;
  return <WebinarDetailClient slug={resolvedParams.slug} />;
}
