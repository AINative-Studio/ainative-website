import { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';
import { ArticleSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';
import { getRevalidateTime, getCacheTags } from '@/lib/cache-config';

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Enable ISR with 5-minute revalidation
export const revalidate = getRevalidateTime('content', 'blog'); // 300 seconds (5 minutes)

// Add cache tags for on-demand revalidation
export const tags = getCacheTags('blog');

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ainative.studio';

  // Generate title from slug for structured data
  const title = resolvedParams.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Blog', url: `${siteUrl}/blog` },
    { name: title, url: `${siteUrl}/blog/${resolvedParams.slug}` }
  ];

  // Article data for structured data
  const articleData = {
    title,
    description: 'Read this article on the AINative Blog',
    author: 'AI Native Studio',
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    image: `${siteUrl}/card.png`
  };

  return (
    <>
      <ArticleSchema article={articleData} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <BlogDetailClient slug={resolvedParams.slug} />
    </>
  );
}
