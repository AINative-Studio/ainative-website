/**
 * EvaluationDashboard Usage Examples
 *
 * This file demonstrates various ways to use the EvaluationDashboard component
 * in your QNN application.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QNNProvider } from '@/contexts/QNNContext';
import EvaluationDashboard from './EvaluationDashboard';

// ============================================
// Example 1: Basic Usage
// ============================================

/**
 * Simplest way to use the Evaluation Dashboard
 * Wrap it in QueryClientProvider and QNNProvider
 */
export function BasicEvaluationExample() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <QNNProvider>
        <div className="container mx-auto p-6">
          <EvaluationDashboard />
        </div>
      </QNNProvider>
    </QueryClientProvider>
  );
}

// ============================================
// Example 2: With Custom Styling
// ============================================

/**
 * Add custom wrapper styling or additional context
 */
export function StyledEvaluationExample() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <QNNProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Model Evaluation
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Analyze model performance with comprehensive metrics and visualizations
              </p>
            </div>
            <EvaluationDashboard />
          </div>
        </div>
      </QNNProvider>
    </QueryClientProvider>
  );
}

// ============================================
// Example 3: In a Tabbed Dashboard
// ============================================

/**
 * Integrate with other QNN components in a tabbed interface
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrainingHistory from './TrainingHistory';
import BenchmarkingDashboard from './BenchmarkingDashboard';

export function TabbedQNNDashboard() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <QNNProvider>
        <div className="container mx-auto p-6">
          <Tabs defaultValue="training" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
              <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
            </TabsList>

            <TabsContent value="training">
              <TrainingHistory />
            </TabsContent>

            <TabsContent value="evaluation">
              <EvaluationDashboard />
            </TabsContent>

            <TabsContent value="benchmarks">
              <BenchmarkingDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </QNNProvider>
    </QueryClientProvider>
  );
}

// ============================================
// Example 4: With Pre-selected Model
// ============================================

/**
 * Use with QNN context to pre-select a model
 */
import { useEffect } from 'react';
import { useQNN } from '@/hooks/useQNN';

function EvaluationWithPreselection({ modelId }: { modelId: string }) {
  const qnn = useQNN();

  useEffect(() => {
    // Pre-select the model when component mounts
    qnn.state.setSelectedModel({ id: modelId, name: modelId });
  }, [modelId, qnn.state]);

  return <EvaluationDashboard />;
}

export function PreselectedModelExample() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <QNNProvider>
        <div className="container mx-auto p-6">
          <EvaluationWithPreselection modelId="model-123" />
        </div>
      </QNNProvider>
    </QueryClientProvider>
  );
}

// ============================================
// Example 5: With Custom Query Configuration
// ============================================

/**
 * Configure React Query with custom settings for evaluation data
 */
export function CustomQueryConfigExample() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <QNNProvider>
        <div className="container mx-auto p-6">
          <EvaluationDashboard />
        </div>
      </QNNProvider>
    </QueryClientProvider>
  );
}

// ============================================
// Example 6: Next.js App Router
// ============================================

/**
 * In Next.js, create pages in the app directory:
 * - app/qnn/page.tsx -> redirects to /qnn/evaluation
 * - app/qnn/evaluation/page.tsx -> renders <EvaluationDashboard />
 * - app/qnn/training/page.tsx -> renders <TrainingHistory />
 * - app/qnn/benchmarks/page.tsx -> renders <BenchmarkingDashboard />
 *
 * Wrap the root layout with QueryClientProvider and QNNProvider
 */

// ============================================
// Example 7: With Custom Export Handler
// ============================================

/**
 * Wrap the component to add custom export handling
 */
import { useCallback } from 'react';
import { toast } from 'sonner';

function EvaluationWithCustomExport() {
  const handleExportSuccess = useCallback((format: 'json' | 'pdf') => {
    toast.success(`Evaluation report exported as ${format.toUpperCase()}`, {
      description: 'Your file has been downloaded successfully',
    });
  }, []);

  return (
    <div>
      <EvaluationDashboard />
      {/* You can add custom export buttons here if needed */}
    </div>
  );
}

export function CustomExportExample() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <QNNProvider>
        <div className="container mx-auto p-6">
          <EvaluationWithCustomExport />
        </div>
      </QNNProvider>
    </QueryClientProvider>
  );
}

// ============================================
// Example 8: With Error Boundary
// ============================================

/**
 * Add error handling for robust production use
 */
import { ErrorBoundary } from 'react-error-boundary';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function EvaluationErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="p-4 rounded-full bg-red-500/10 mb-4">
        <AlertCircle className="h-12 w-12 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Evaluation Dashboard Error
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md">
        {error.message || 'Something went wrong while loading the evaluation dashboard.'}
      </p>
      <Button onClick={resetErrorBoundary} variant="outline">
        Try Again
      </Button>
    </div>
  );
}

export function RobustEvaluationExample() {
  const queryClient = new QueryClient();

  return (
    <ErrorBoundary FallbackComponent={EvaluationErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <QNNProvider>
          <div className="container mx-auto p-6">
            <EvaluationDashboard />
          </div>
        </QNNProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// ============================================
// Example 9: With Loading Overlay
// ============================================

/**
 * Add a custom loading overlay while data is being fetched
 */
import { useIsFetching } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

function LoadingOverlay() {
  const isFetching = useIsFetching();

  if (!isFetching) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          Loading evaluation data...
        </span>
      </div>
    </div>
  );
}

export function EvaluationWithLoadingIndicator() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <QNNProvider>
        <div className="container mx-auto p-6">
          <LoadingOverlay />
          <EvaluationDashboard />
        </div>
      </QNNProvider>
    </QueryClientProvider>
  );
}

// ============================================
// Example 10: Complete Production Setup
// ============================================

/**
 * Full production-ready setup with all best practices
 */
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';

function EvaluationSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[120px] w-full" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}

export function ProductionEvaluationDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
      },
      mutations: {
        retry: 1,
      },
    },
  });

  return (
    <ErrorBoundary FallbackComponent={EvaluationErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <QNNProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <Suspense fallback={<EvaluationSkeleton />}>
                <EvaluationDashboard />
              </Suspense>
            </div>
          </div>
          <Toaster />
        </QNNProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
