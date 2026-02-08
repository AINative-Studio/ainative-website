import { Metadata } from 'next';
import ModelDetailClient from './ModelDetailClient';
import { ModelDetailPageParams, ModelDetailPageSearchParams } from './types';

/**
 * Generate static metadata for model detail pages
 *
 * Note: We use generic metadata here to avoid server-side API calls without auth.
 * The actual model data is fetched client-side where authentication is available.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<ModelDetailPageParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Generic metadata - actual model details fetched client-side
  return {
    title: `AI Model - ${slug} | AI Native Studio`,
    description: 'Explore and test AI models with interactive playground, API documentation, and integration examples.',
  };
}

/**
 * Model Detail Page
 *
 * Route: /dashboard/ai-settings/[slug]?tab=[playground|api|readme]
 *
 * Note: This page delegates ALL model fetching to the client component.
 * Server-side fetching would fail due to missing authentication cookies.
 * The client component uses React Query which shares cache with the browse page.
 */
export default async function ModelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<ModelDetailPageParams>;
  searchParams: Promise<ModelDetailPageSearchParams>;
}) {
  const { slug } = await params;
  await searchParams;

  // Pass only the slug - client component fetches model data
  return <ModelDetailClient slug={slug} />;
}

/**
 * Static Params Generation (Optional)
 *
 * Uncomment this to enable static generation for known model slugs.
 * This pre-renders pages at build time for better performance.
 *
 * Note: Only enable this if you have a fixed set of models.
 * If models are dynamic (user-created), leave this commented out.
 */
// export async function generateStaticParams(): Promise<ModelDetailPageParams[]> {
//   // Fetch all model slugs
//   const models = await fetchAllModels();
//
//   // Return array of params for static generation
//   return models.map((model) => ({
//     slug: model.slug,
//   }));
// }

/**
 * Revalidate Configuration
 *
 * This controls how often the page data is refreshed.
 * - false: Never revalidate (use for static models)
 * - number: Revalidate every N seconds (use for dynamic models)
 */
export const revalidate = 300; // Revalidate every 5 minutes
