import { Metadata } from 'next';
import WebinarDetailClient from './WebinarDetailClient';
import { VideoSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ainative.studio';

  // Format slug for title
  const title = resolvedParams.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Webinars', url: `${siteUrl}/webinars` },
    { name: title, url: `${siteUrl}/webinars/${resolvedParams.slug}` }
  ];

  // Video data for structured data (in production, fetch from CMS)
  const videoData = {
    title,
    description: `Watch or register for the ${title.toLowerCase()} webinar on AINative`,
    thumbnailUrl: `${siteUrl}/card.png`,
    uploadDate: new Date().toISOString(),
    duration: 'PT45M',
    embedUrl: `${siteUrl}/webinars/${resolvedParams.slug}/player`
  };

  return (
    <>
      <VideoSchema {...videoData} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <WebinarDetailClient slug={resolvedParams.slug} />
    </>
  );
}
