import { Metadata } from 'next';
import VideoDetailClient from './VideoDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Mock video data for metadata generation
const mockVideos = [
  {
    slug: 'getting-started-ai-kit',
    title: 'Getting Started with AI Kit',
    description:
      'Learn how to set up and use AI Kit for your first AI-powered application.',
  },
  {
    slug: 'rag-applications-zerodb',
    title: 'Building RAG Applications with ZeroDB',
    description:
      'Deep dive into Retrieval-Augmented Generation using ZeroDB vector database.',
  },
  {
    slug: 'qnn-optimization-webinar',
    title: 'QNN Performance Optimization Webinar',
    description:
      'Live webinar on optimizing Quantum Neural Networks for production workloads.',
  },
  {
    slug: 'ai-code-editor-showcase',
    title: 'AI-Powered Code Editor Showcase',
    description:
      'See how our community members built an intelligent code editor using AI Kit.',
  },
  {
    slug: 'agent-swarm-demo',
    title: 'Agent Swarm Architecture Demo',
    description:
      'Live demonstration of multi-agent orchestration using AI Kit.',
  },
  {
    slug: 'semantic-search-guide',
    title: 'Semantic Search Implementation Guide',
    description:
      'Step-by-step tutorial on implementing semantic search using ZeroDB.',
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
  return <VideoDetailClient slug={resolvedParams.slug} />;
}
