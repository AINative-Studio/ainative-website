import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

/**
 * Creates a new QueryClient instance with default options.
 *
 * For Next.js App Router, we need to create a new QueryClient for each request
 * on the server to avoid sharing state between requests.
 *
 * On the client, we reuse the same QueryClient instance.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds
        staleTime: 60 * 1000,
        // Cache data for 5 minutes after it becomes unused
        gcTime: 5 * 60 * 1000,
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
        // Retry failed requests once
        retry: 1,
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
      dehydrate: {
        // Include pending queries in dehydration for SSR
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

// Browser: Store QueryClient in a global variable to reuse across re-renders
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get a QueryClient instance.
 *
 * - Server: Creates a new client for each request
 * - Client: Reuses the same client across re-renders
 */
export function getQueryClient() {
  if (isServer) {
    // Server: Always create a new QueryClient
    return makeQueryClient();
  } else {
    // Browser: Reuse the existing QueryClient or create a new one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

// Re-export commonly used hooks and utilities for convenience
export {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  useSuspenseQuery,
  useSuspenseInfiniteQuery,
  useIsFetching,
  useIsMutating,
  QueryClientProvider,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";

// Re-export types
export type {
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  QueryFunction,
  MutationFunction,
} from "@tanstack/react-query";
