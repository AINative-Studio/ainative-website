'use client';

/**
 * PreviewSelector Component
 *
 * Routes to the appropriate preview component based on result type.
 * Uses TypeScript discriminated unions for type-safe switching.
 *
 * This is the main router component that determines which specialized
 * preview component should render based on the PlaygroundResult type.
 *
 * Related: Issue #546 - Add example prompts to model playground pages
 */

import { PlaygroundResult, PreviewSelectorProps } from '../../types.preview';
import { TextPreview } from './TextPreview';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load preview components for better performance
// Note: Using .then(mod => mod.ComponentName) because components use named exports
const CodePreview = dynamic(() => import('./CodePreview').then(mod => mod.CodePreview), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const ImagePreview = dynamic(() => import('./ImagePreview').then(mod => mod.ImagePreview), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const VideoPreview = dynamic(() => import('./VideoPreview').then(mod => mod.VideoPreview), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const AudioPreview = dynamic(() => import('./AudioPreview').then(mod => mod.AudioPreview), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false,
});

const EmbeddingPreview = dynamic(() => import('./EmbeddingPreview').then(mod => mod.EmbeddingPreview), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

/**
 * PreviewSelector Component
 *
 * Type-safe routing component that renders the appropriate preview
 * based on the discriminated union type of PlaygroundResult.
 *
 * Features:
 * - Type-safe switching with exhaustiveness checking
 * - Lazy loading of heavy preview components
 * - Error boundary integration ready
 * - Loading state handling
 *
 * @param result - Discriminated union of all result types
 * @param onDownload - Optional callback for download actions
 * @param onCopy - Optional callback for copy actions
 */
export function PreviewSelector({
  result,
  onDownload,
  onCopy,
}: PreviewSelectorProps) {
  // Type-safe switch using discriminated union
  // TypeScript will ensure all cases are handled
  switch (result.type) {
    case 'text':
      return <TextPreview result={result} onCopy={onCopy} />;

    case 'code':
      return <CodePreview result={result} onCopy={onCopy} />;

    case 'image':
      return <ImagePreview result={result} onDownload={onDownload} />;

    case 'video':
      return <VideoPreview result={result} onDownload={onDownload} />;

    case 'audio':
      return <AudioPreview result={result} onDownload={onDownload} />;

    case 'embedding':
      return <EmbeddingPreview result={result} onCopy={onCopy} />;

    default:
      // TypeScript exhaustiveness check
      // If a new type is added to PlaygroundResult, this will cause a compile error
      const _exhaustive: never = result;
      return (
        <div className="p-6 text-center bg-white/[0.02] border border-white/10 rounded-xl">
          <p className="text-red-400 text-sm">Unknown result type</p>
        </div>
      );
  }
}

export default PreviewSelector;
