import React from "react";

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
  const pageUrl = `https://www.ainative.studio/showcases/${slug}`;

  return {
    title: `${title} | AI Application Showcase - AINative Studio`,
    description: `Explore ${title} - a production AI application built with AINative Studio. See implementation details, tech stack, and real-world results.`,
    keywords: [
      title,
      'AI application showcase',
      'built with AINative',
      'AINative Studio project',
      'production AI example',
      'agentic AI application',
    ],
    openGraph: {
      title: `${title} - AINative Studio Showcase`,
      description: `Explore ${title} - a production AI application built with AINative Studio. See implementation details, tech stack, and real-world results.`,
      type: 'article',
      url: pageUrl,
      images: [
        {
          url: '/og-showcases.png',
          width: 1200,
          height: 630,
          alt: `${title} - AINative Studio Showcase`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - AINative Studio Showcase`,
      description: `Explore ${title} - a production AI application built with AINative Studio.`,
      images: ['/og-showcases.png'],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function ShowcaseDetailPage({ params }: ShowcaseDetailPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const pageUrl = `https://www.ainative.studio/showcases/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: `A production AI application built with AINative Studio`,
    url: pageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'AINative Studio',
      url: 'https://www.ainative.studio',
    },
    isPartOf: {
      '@type': 'ItemList',
      name: 'AINative Studio Showcases',
      url: 'https://www.ainative.studio/showcases',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShowcaseDetailClient slug={slug} />
    </>
  );
}
