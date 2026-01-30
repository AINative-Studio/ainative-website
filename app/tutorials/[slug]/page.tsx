import { Metadata } from 'next';
import TutorialDetailClient from './TutorialDetailClient';
import { HowToSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';

interface TutorialDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Enable ISR with 10-minute revalidation
export const revalidate = 300; // 600 seconds (10 minutes)

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ainative.studio';

  // Format slug for title
  const title = resolvedParams.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Tutorials', url: `${siteUrl}/tutorials` },
    { name: title, url: `${siteUrl}/tutorials/${resolvedParams.slug}` }
  ];

  // HowTo steps for structured data (generic steps - in production, fetch from CMS)
  const howToSteps = [
    {
      name: 'Step 1: Setup',
      text: 'Install AI Native Studio and configure your development environment.',
    },
    {
      name: 'Step 2: Initialize Project',
      text: 'Create a new project and import the necessary AI Kit packages.',
    },
    {
      name: 'Step 3: Configure AI Model',
      text: 'Set up your AI model configuration and API keys.',
    },
    {
      name: 'Step 4: Implement Solution',
      text: 'Follow the tutorial steps to implement your AI-powered feature.',
    },
    {
      name: 'Step 5: Test and Deploy',
      text: 'Test your implementation and deploy to production.',
    }
  ];

  return (
    <>
      <HowToSchema
        title={title}
        description={`Learn ${title.toLowerCase()} with this step-by-step AINative tutorial`}
        steps={howToSteps}
        totalTime="PT15M"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <TutorialDetailClient slug={resolvedParams.slug} />
    </>
  );
}
