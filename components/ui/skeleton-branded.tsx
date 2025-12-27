import { cn } from '@/lib/utils';

function SkeletonBranded({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[#22263C]',
        'motion-reduce:animate-none',
        className
      )}
      {...props}
    />
  );
}

function BlogPostCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow">
      <div className="space-y-4">
        {/* Image skeleton */}
        <SkeletonBranded className="h-48 w-full rounded-lg" />

        {/* Category badge */}
        <SkeletonBranded className="h-6 w-20 rounded-full" />

        {/* Title */}
        <div className="space-y-2">
          <SkeletonBranded className="h-6 w-full" />
          <SkeletonBranded className="h-6 w-3/4" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <SkeletonBranded className="h-4 w-full" />
          <SkeletonBranded className="h-4 w-full" />
          <SkeletonBranded className="h-4 w-2/3" />
        </div>

        {/* Author and date */}
        <div className="flex items-center gap-3">
          <SkeletonBranded className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <SkeletonBranded className="h-4 w-32" />
            <SkeletonBranded className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardStatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow">
      <div className="space-y-3">
        {/* Header with icon and title */}
        <div className="flex items-center justify-between">
          <SkeletonBranded className="h-5 w-32" />
          <SkeletonBranded className="h-8 w-8 rounded-md" />
        </div>

        {/* Main stat value */}
        <SkeletonBranded className="h-8 w-24" />

        {/* Percentage change */}
        <SkeletonBranded className="h-4 w-28" />

        {/* Chart placeholder */}
        <SkeletonBranded className="h-16 w-full rounded-md" />
      </div>
    </div>
  );
}

function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonBranded
          key={i}
          className={cn(
            'h-4',
            i === 0 ? 'w-1/4' : i === columns - 1 ? 'w-1/6' : 'w-1/3'
          )}
        />
      ))}
    </div>
  );
}

function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <SkeletonBranded className="h-4 w-24" />
      <SkeletonBranded className="h-10 w-full rounded-md" />
    </div>
  );
}

export {
  SkeletonBranded,
  BlogPostCardSkeleton,
  DashboardStatCardSkeleton,
  TableRowSkeleton,
  FormFieldSkeleton
};
