'use client';

/**
 * Lazy-loaded markdown and syntax highlighting components
 * These are heavy dependencies that should be code-split
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MarkdownSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

export const LazyReactMarkdown = dynamic(
  () => import('react-markdown'),
  {
    loading: () => <MarkdownSkeleton />,
    ssr: false,
  }
);

export const LazySyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  {
    loading: () => <Skeleton className="h-32 w-full" />,
    ssr: false,
  }
);
