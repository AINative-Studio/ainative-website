import * as React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BrandedWelcomeProps {
  /**
   * Main title of the welcome card
   */
  title: string;

  /**
   * Description text below the title
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
   * Optional background image URL (defaults to /card.png)
   */
  backgroundImage?: string;

  /**
   * Whether to show the background image (defaults to true)
   */
  showImage?: boolean;

  /**
   * Whether to show the dismiss button (defaults to false)
   */
  showDismiss?: boolean;

  /**
   * Callback when dismiss button is clicked
   */
  onDismiss?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * BrandedWelcome - A reusable welcome card component with branded styling
 *
 * Features:
 * - Optional background image with opacity control
 * - Gradient text support for branded appearance
 * - Responsive padding and sizing
 * - Optional dismiss button for returning users
 * - Z-index layering for proper content stacking
 *
 * @example
 * ```tsx
 * <BrandedWelcome
 *   title="Welcome to AI Native Studio"
 *   description="Build AI-Powered Apps Effortlessly"
 *   actionLabel="Get Started"
 *   actionHref="/settings/developer"
 *   backgroundImage="/card.png"
 * />
 * ```
 */
export const BrandedWelcome = React.forwardRef<HTMLDivElement, BrandedWelcomeProps>(
  (
    {
      title,
      description,
      actionLabel,
      actionHref,
      backgroundImage = '/card.png',
      showImage = true,
      showDismiss = false,
      onDismiss,
      className,
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'relative overflow-hidden border-none shadow-ds-lg',
          'bg-gradient-to-br from-dark-2 to-dark-3',
          className
        )}
      >
        {/* Background Image */}
        {showImage && (
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center z-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundRepeat: 'no-repeat',
            }}
            aria-hidden="true"
          />
        )}

        {/* Content Layer */}
        <CardContent className="relative z-10 p-8 md:p-12">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              {/* Title with Gradient */}
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-brand-primary to-accent-secondary bg-clip-text text-transparent">
                  {title}
                </span>
              </h2>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
                {description}
              </p>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold
                           shadow-lg hover:shadow-xl transition-all duration-300
                           hover:scale-105 active:scale-95"
                >
                  <Link href={actionHref}>
                    {actionLabel}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Dismiss Button */}
            {showDismiss && onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="text-gray-400 hover:text-white hover:bg-white/10"
                aria-label="Dismiss welcome message"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

BrandedWelcome.displayName = 'BrandedWelcome';
