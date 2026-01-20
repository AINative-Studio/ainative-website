import { Metadata } from 'next';
import VideoDetailClient from './VideoDetailClient';
import { VideoSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';
import { getRevalidateTime, getCacheTags } from '@/lib/cache-config';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Enable ISR with 15-minute revalidation
export const revalidate = getRevalidateTime('content', 'video'); // 900 seconds (15 minutes)

// Add cache tags for on-demand revalidation
export const tags = getCacheTags('video');

// Mock video data for metadata generation
const mockVideos = [
  {
    slug: 'getting-started-ai-kit',
    title: 'Getting Started with AI Kit',
    description:
      'Learn how to set up and use AI Kit for your first AI-powered application.',
    duration: 'PT12M30S',
    uploadDate: '2025-01-10T10:00:00Z',
  },
  {
    slug: 'rag-applications-zerodb',
    title: 'Building RAG Applications with ZeroDB',
    description:
      'Deep dive into Retrieval-Augmented Generation using ZeroDB vector database.',
    duration: 'PT18M45S',
    uploadDate: '2025-01-12T14:00:00Z',
  },
  {
    slug: 'qnn-optimization-webinar',
    title: 'QNN Performance Optimization Webinar',
    description:
      'Live webinar on optimizing Quantum Neural Networks for production workloads.',
    duration: 'PT45M00S',
    uploadDate: '2025-01-15T16:00:00Z',
  },
  {
    slug: 'ai-code-editor-showcase',
    title: 'AI-Powered Code Editor Showcase',
    description:
      'See how our community members built an intelligent code editor using AI Kit.',
    duration: 'PT22M15S',
    uploadDate: '2025-01-08T11:00:00Z',
  },
  {
    slug: 'agent-swarm-demo',
    title: 'Agent Swarm Architecture Demo',
    description:
      'Live demonstration of multi-agent orchestration using AI Kit.',
    duration: 'PT15M30S',
    uploadDate: '2025-01-06T13:00:00Z',
  },
  {
    slug: 'semantic-search-guide',
    title: 'Semantic Search Implementation Guide',
    description:
      'Step-by-step tutorial on implementing semantic search using ZeroDB.',
    duration: 'PT20M00S',
    uploadDate: '2025-01-05T09:00:00Z',
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const video = mockVideos.find((v) => v.slug === resolvedParams.slug);

  if (!video) {
    return {
      title: 'Video Not Found | AINative Studio',
      description: 'The requested video could not be found.',
    };
  }

  return {
    title: `${video.title} | AINative Community Videos`,
    description: video.description,
    openGraph: {
      title: video.title,
      description: video.description,
      type: 'video.other',
      url: `https://www.ainative.studio/community/videos/${video.slug}`,
      images: [
        {
          url: `/images/videos/${video.slug}-poster.png`,
          width: 1280,
          height: 720,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: 'player',
      title: video.title,
      description: video.description,
    },
  };
}

export async function generateStaticParams() {
  return mockVideos.map((video) => ({
    slug: video.slug,
  }));
}

export default async function VideoDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ainative.studio';
  const video = mockVideos.find((v) => v.slug === resolvedParams.slug);

  if (!video) {
    return <VideoDetailClient slug={resolvedParams.slug} />;
  }

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Community', url: `${siteUrl}/community` },
    { name: 'Videos', url: `${siteUrl}/community/videos` },
    { name: video.title, url: `${siteUrl}/community/videos/${video.slug}` }
  ];

  // Video data for structured data
  const videoData = {
    title: video.title,
    description: video.description,
    thumbnailUrl: `${siteUrl}/images/videos/${video.slug}-poster.png`,
    uploadDate: video.uploadDate,
    duration: video.duration,
    embedUrl: `${siteUrl}/community/videos/${video.slug}/player`
  };

  return (
    <>
      <VideoSchema {...videoData} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <VideoDetailClient slug={resolvedParams.slug} />
    </>
  );
}
