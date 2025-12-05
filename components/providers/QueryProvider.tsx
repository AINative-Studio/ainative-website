"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/react-query";

/**
 * QueryProvider wraps the application with React Query's QueryClientProvider.
 *
 * This component:
 * - Creates a stable QueryClient instance for the browser
 * - Provides React Query context to all child components
 * - Includes DevTools in development mode
 *
 * Usage in layout.tsx:
 * ```tsx
 * <QueryProvider>
 *   {children}
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside useState to ensure it's created only once per component lifecycle
  // This is the recommended pattern for Next.js App Router
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}

// Re-export HydrationBoundary for use in server components
export { HydrationBoundary } from "@tanstack/react-query";
