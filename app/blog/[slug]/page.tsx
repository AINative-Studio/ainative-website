import React from "react";

import { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';
import { ArticleSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';
import { getCacheTags } from '@/lib/cache-config';

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Enable ISR with 5-minute revalidation
export const revalidate = 300; // 5 minutes

// Add cache tags for on-demand revalidation
export const tags = getCacheTags('blog');

async function fetchPostBySlug(slug: string) {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ainative-community-production.up.railway.app';
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/blog-posts?filters[slug][$eq]=${slug}&populate=*`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const post = await fetchPostBySlug(slug);

  const title = post?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  const description = post?.excerpt
    ? post.excerpt.slice(0, 155)
    : post?.content
      ? post.content.replace(/[#*_\[\]]/g, '').slice(0, 155)
      : `Read ${title} on the AINative Blog`;

  const ogImage = post?.featured_image?.url
    || post?.featured_image?.formats?.large?.url
    || '/og-blog.png';

  return {
    title: `${title} | AINative Blog`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.ainative.studio/blog/${slug}`,
      images: [{ url: ogImage }],
      ...(post?.published_date && { publishedTime: post.published_date }),
      ...(post?.updatedAt && { modifiedTime: post.updatedAt }),
    },
    alternates: { canonical: `https://www.ainative.studio/blog/${slug}` },
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
