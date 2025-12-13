import { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // For now, use generic metadata. In production, fetch the blog post for dynamic metadata
  return {
    title: `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | AINative Blog`,
    description: 'Read this article on the AINative Blog',
    openGraph: {
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: 'Read this article on the AINative Blog',
      type: 'article',
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = await params;
  return <BlogDetailClient slug={resolvedParams.slug} />;
}
