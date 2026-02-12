'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Code, FileText, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { modelAggregatorService } from '@/lib/model-aggregator-service';
import { TabType, UnifiedAIModel } from './types';
import ModelPlayground from './components/ModelPlayground';
import ModelAPI from './components/ModelAPI';
import ModelReadme from './components/ModelReadme';

/**
 * Category filter options (matches browse page)
 */
const CATEGORIES = ['All', 'Image', 'Video', 'Audio', 'Coding', 'Embedding'] as const;

/**
 * Tab configuration
 */
const TABS = [
  { id: 'playground' as TabType, label: 'Playground', icon: Zap },
  { id: 'api' as TabType, label: 'API', icon: Code },
  { id: 'readme' as TabType, label: 'Readme', icon: FileText },
] as const;

/**
 * Props interface for ModelDetailClient
 */
interface ModelDetailClientProps {
  slug: string;
}

/**
 * Model Detail Client Component
 *
 * This component fetches model data client-side to avoid authentication issues
 * with server-side rendering. It uses React Query which shares the cache with
 * the browse page for optimal performance.
 *
 * Features:
 * - Client-side model fetching with authentication
 * - Tab navigation with URL state management
 * - Browser back/forward navigation support
 * - Shareable URLs with tab state
 * - Shared React Query cache with browse page (instant navigation!)
 */
export default function ModelDetailClient({ slug }: ModelDetailClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fetch all models using React Query (shares cache with browse page)
  const { data: models, isLoading, error } = useQuery({
    queryKey: ['ai-models-aggregated'],
    queryFn: async () => {
      console.log('[ModelDetail] Fetching models from aggregator service...');
      const result = await modelAggregatorService.aggregateAllModels();
      console.log('[ModelDetail] Models fetched:', result.length);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Find the model by slug
  const model = models?.find(m => m.slug === slug);

  // Filter tabs based on model category - embedding models don't have playground
  const availableTabs = model?.category === 'Embedding'
    ? TABS.filter(tab => tab.id !== 'playground')
    : TABS;

  // Default to 'api' for embeddings, 'playground' for others
  const defaultTab = model?.category === 'Embedding' ? 'api' : 'playground';

  // Read active tab from URL query params, default based on model category
  const activeTab = (searchParams.get('tab') as TabType) || defaultTab;

  /**
   * Update active tab and sync with URL
   *
   * This function:
   * 1. Updates the URL query param
   * 2. Doesn't cause a full page reload
   * 3. Doesn't scroll to top
   * 4. Updates browser history (back button works)
   */
  const setActiveTab = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);

    // Update URL without page reload or scroll
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" role="progressbar"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-red-400">Failed to load model</p>
          <p className="text-sm text-gray-400">{(error as Error).message}</p>
          <Link
            href="/dashboard/ai-settings"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Models
          </Link>
        </div>
      </div>
    );
  }

  // Model not found
  if (!model) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-white">Model not found</p>
          <p className="text-sm text-gray-400">The model &quot;{slug}&quot; could not be found.</p>
          <Link
            href="/dashboard/ai-settings"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Models
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1">
        <Link
          href="/dashboard/ai-settings"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mr-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Models
        </Link>

        {/* Category filters (matches browse page) */}
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/dashboard/ai-settings?category=${cat}`}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${
              cat === model.category
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Model Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-white mb-1">{model.name}</h1>
        <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
          {model.description || `${model.provider} AI model for ${model.category} tasks.`}
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-0">
        {availableTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              aria-selected={isActive}
              role="tab"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div role="tabpanel" aria-label={`${activeTab} tab`}>
        {activeTab === 'playground' && (
          <motion.div
            key="playground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ModelPlayground model={model} slug={slug} />
          </motion.div>
        )}

        {activeTab === 'api' && (
          <motion.div
            key="api"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ModelAPI model={model} slug={slug} />
          </motion.div>
        )}

        {activeTab === 'readme' && (
          <motion.div
            key="readme"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ModelReadme model={model} slug={slug} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
