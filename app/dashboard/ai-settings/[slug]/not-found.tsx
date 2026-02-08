import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

/**
 * Model Not Found Page
 *
 * This page is displayed when a user navigates to a model slug that doesn't exist.
 * It's triggered by calling notFound() in the page.tsx component.
 *
 * Route examples that trigger this:
 * - /dashboard/ai-settings/invalid-model-slug
 * - /dashboard/ai-settings/model-that-doesnt-exist
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
        <FileQuestion className="w-8 h-8 text-gray-400" />
      </div>

      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Model Not Found</h1>
        <p className="text-sm text-gray-400 max-w-md">
          The AI model you're looking for doesn't exist or may have been removed.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/ai-settings"
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Browse All Models
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Need help?{' '}
          <a
            href="https://docs.ainative.studio/models"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View model documentation
          </a>
        </p>
      </div>
    </div>
  );
}
