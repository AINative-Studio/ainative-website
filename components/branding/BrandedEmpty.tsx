import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BrandedEmptyProps {
  /**
   * Main title for the empty state
   */
  title: string;

  /**
   * Description text explaining the empty state
   */
  description: string;

  /**
   * Label for the primary action button
   */
  actionLabel: string;

  /**
   * Route or URL for the primary action
   */
  actionHref: string;

  /**
   * Optional label for secondary action
   */
  secondaryActionLabel?: string;

  /**
   * Optional route or URL for secondary action
   */
  secondaryActionHref?: string;

  /**
   * Optional image URL (defaults to /card.png)
   */
  image?: string;

  /**
   * Optional icon to display instead of image
   */
  icon?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * BrandedEmpty - A reusable empty state component with branded styling
 *
 * Features:
 * - Centered layout with generous padding
 * - Image or icon display with controlled opacity
 * - Primary and optional secondary action buttons
 * - Responsive image sizing
 * - Helpful, actionable messaging
 *
 * @example
 * ```tsx
 * <BrandedEmpty
 *   title="No API Keys Yet"
 *   description="Create your first API key to start building with AI Native Studio"
 *   actionLabel="Create API Key"
 *   actionHref="/settings/developer"
 *   image="/card.png"
 * />
 * ```
 */
export const BrandedEmpty = React.forwardRef<HTMLDivElement, BrandedEmptyProps>(
  (
    {
      title,
      description,
      actionLabel,
      actionHref,
      secondaryActionLabel,
      secondaryActionHref,
      image = '/card.png',
      icon,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center py-24 px-6',
          className
        )}
      >
        {/* Image or Icon Display */}
        <div className="mb-8">
          {icon ? (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-dark-2/50 text-brand-primary">
              {icon}
            </div>
          ) : (
            <img
              src={image}
              alt=""
              className="w-64 md:w-96 opacity-60 hover:opacity-80 transition-opacity duration-300"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {title}
        </h3>

        {/* Description */}
        <p className="text-base md:text-lg text-gray-400 max-w-md mb-8">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Primary Action */}
          <Button
            asChild
            size="lg"
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold
                     shadow-ds-md hover:shadow-ds-lg transition-all duration-300
                     hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            <Link href={actionHref}>
              {actionLabel}
            </Link>
          </Button>

          {/* Secondary Action */}
          {secondaryActionLabel && secondaryActionHref && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gray-700 hover:bg-dark-2 text-gray-300 hover:text-white
                       transition-all duration-300 w-full sm:w-auto"
            >
              <Link href={secondaryActionHref}>
                {secondaryActionLabel}
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }
);

BrandedEmpty.displayName = 'BrandedEmpty';
