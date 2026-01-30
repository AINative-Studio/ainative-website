import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Pre-create motion component using motion.create() (motion() is deprecated)
const MotionCard = motion.create(Card);

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
   * Optional user name for personalization (e.g., "Welcome back, John!")
   */
  userName?: string;

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
   * Whether to enable entrance animations (defaults to true)
   */
  animate?: boolean;

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
 * - Smooth entrance/exit animations with framer-motion
 * - Personalization support with user name
 *
 * @example
 * ```tsx
 * <BrandedWelcome
 *   title="Welcome to AI Native Studio"
 *   description="Build AI-Powered Apps Effortlessly"
 *   actionLabel="Get Started"
 *   actionHref="/settings/developer"
 *   userName="John"
 *   backgroundImage="/card.png"
 *   showDismiss
 *   onDismiss={() => setShowWelcome(false)}
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
      userName,
      backgroundImage = '/card.png',
      showImage = true,
      showDismiss = false,
      onDismiss,
      animate = true,
      className,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const handleDismiss = React.useCallback(() => {
      setIsVisible(false);
      // Delay callback to allow exit animation
      setTimeout(() => {
        onDismiss?.();
      }, 300);
    }, [onDismiss]);

    // Animation variants
    const containerVariants = {
      hidden: {
        opacity: 0,
        y: -20,
        scale: 0.95
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
          staggerChildren: 0.1
        }
      },
      exit: {
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: {
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
        }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4
        }
      }
    } as const;

    const sparkleVariants = {
      hidden: { scale: 0, rotate: -180 },
      visible: {
        scale: 1,
        rotate: 0,
        transition: {
          type: "spring" as const,
          stiffness: 200,
          damping: 15
        }
      }
    } as const;

    // Shared content render function
    const renderContent = () => (
      <>
        {/* Background Image */}
        {showImage && (
          <div className="absolute inset-0 z-0 opacity-10" aria-hidden="true">
            <Image
              src={backgroundImage}
              alt=""
              fill
              className="object-cover object-center"
              priority={true}
              quality={90}
              sizes="100vw"
            />
          </div>
        )}

        {/* Decorative gradient orbs */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 bg-brand-primary/20 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-secondary/20 rounded-full blur-2xl"
          aria-hidden="true"
        />

        {/* Content Layer */}
        <CardContent className="relative z-10 p-6 sm:p-8 md:p-12">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              {/* Personalized greeting with icon */}
              {userName && (
                <motion.div
                  className="flex items-center gap-2"
                  {...(animate ? { variants: itemVariants } : {})}
                >
                  <motion.div
                    {...(animate ? { variants: sparkleVariants } : {})}
                  >
                    <Sparkles className="h-5 w-5 text-accent-secondary" aria-hidden="true" />
                  </motion.div>
                  <span className="text-sm text-gray-400">
                    Welcome back, <span className="text-white font-medium">{userName}</span>
                  </span>
                </motion.div>
              )}

              {/* Title with Gradient */}
              <motion.h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold"
                {...(animate ? { variants: itemVariants } : {})}
              >
                <span className="bg-gradient-to-r from-brand-primary to-accent-secondary bg-clip-text text-transparent">
                  {title}
                </span>
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl"
                {...(animate ? { variants: itemVariants } : {})}
              >
                {description}
              </motion.p>

              {/* Action Button */}
              <motion.div
                className="pt-2"
                {...(animate ? { variants: itemVariants } : {})}
              >
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
              </motion.div>
            </div>

            {/* Dismiss Button */}
            {showDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Dismiss welcome message"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </>
    );

    // Render animated version
    if (animate) {
      const content = (
        <MotionCard
          ref={ref}
          className={cn(
            'relative overflow-hidden border-none shadow-ds-lg',
            'bg-gradient-to-br from-dark-2 to-dark-3',
            className
          )}
          initial="hidden"
          animate={isVisible ? "visible" : "exit"}
          variants={containerVariants}
        >
          {renderContent()}
        </MotionCard>
      );

      if (onDismiss) {
        return (
          <AnimatePresence mode="wait">
            {isVisible && content}
          </AnimatePresence>
        );
      }

      return content;
    }

    // Render static version without animations
    return (
      <Card
        ref={ref}
        className={cn(
          'relative overflow-hidden border-none shadow-ds-lg',
          'bg-gradient-to-br from-dark-2 to-dark-3',
          className
        )}
      >
        {renderContent()}
      </Card>
    );
  }
);

BrandedWelcome.displayName = 'BrandedWelcome';
