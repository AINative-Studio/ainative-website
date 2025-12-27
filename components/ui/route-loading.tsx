import * as React from 'react';
import { Spinner } from '@/components/ui/spinner-branded';
import { cn } from '@/lib/utils';

/**
 * RouteLoadingFallback - Branded loading state for lazy-loaded routes
 * Provides smooth loading transitions while code chunks are being fetched
 */
export const RouteLoadingFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    message?: string;
    minimal?: boolean;
  }
>(({ className, message = 'Loading...', minimal = false, ...props }, ref) => {
  if (minimal) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-[200px] w-full items-center justify-center',
          className
        )}
        {...props}
      >
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background',
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" variant="primary" label={message} />
        <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>
    </div>
  );
});
RouteLoadingFallback.displayName = 'RouteLoadingFallback';

/**
 * DashboardLoadingFallback - Loading state for dashboard routes
 * Matches the dashboard layout structure
 */
export const DashboardLoadingFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-background',
        className
      )}
      {...props}
    >
      <Spinner size="xl" variant="primary" label="Loading dashboard..." />
    </div>
  );
});
DashboardLoadingFallback.displayName = 'DashboardLoadingFallback';

/**
 * CommunityLoadingFallback - Loading state for community pages
 */
export const CommunityLoadingFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex min-h-screen w-full items-center justify-center bg-background',
        className
      )}
      {...props}
    >
      <Spinner size="xl" variant="primary" label="Loading community content..." />
    </div>
  );
});
CommunityLoadingFallback.displayName = 'CommunityLoadingFallback';
