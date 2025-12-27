import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Minus, ArrowRight, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// BrandedWelcome Component
// A welcome card for new users with call-to-action
// ============================================================================

interface BrandedWelcomeProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  showDismiss?: boolean;
  onDismiss?: () => void;
}

export function BrandedWelcome({
  title,
  description,
  actionLabel,
  actionHref,
  showDismiss = false,
  onDismiss,
}: BrandedWelcomeProps) {
  return (
    <Card className="relative overflow-hidden border-none bg-gradient-to-r from-[#4B6FED]/20 via-[#161B22] to-[#161B22] shadow-lg">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#4B6FED]/10 blur-3xl" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-gray-400 max-w-xl">{description}</p>
            <div className="pt-2">
              <Link href={actionHref}>
                <Button className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white font-medium group">
                  {actionLabel}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {showDismiss && onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-800"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// BrandedEmpty Component
// An empty state component with optional actions
// ============================================================================

interface BrandedEmptyProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  icon?: ReactNode;
}

export function BrandedEmpty({
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
  icon,
}: BrandedEmptyProps) {
  return (
    <Card className="border-none bg-[#161B22] shadow-lg">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 rounded-full bg-[#1C2128] p-4 text-[#4B6FED]">
          {icon || <Inbox className="h-10 w-10" />}
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 max-w-md mb-6">{description}</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && actionHref && (
            <Link href={actionHref}>
              <Button className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white font-medium">
                {actionLabel}
              </Button>
            </Link>
          )}

          {secondaryActionLabel && secondaryActionHref && (
            <Link href={secondaryActionHref}>
              <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white">
                {secondaryActionLabel}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EnhancedStatCard Component
// A stat card with trend indicator and optional background image
// ============================================================================

interface EnhancedStatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  backgroundImage?: string;
  className?: string;
}

export function EnhancedStatCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  backgroundImage,
  className,
}: EnhancedStatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up' ? 'text-green-400' :
    trend === 'down' ? 'text-red-400' :
    'text-gray-400';

  const trendBg =
    trend === 'up' ? 'bg-green-500/10' :
    trend === 'down' ? 'bg-red-500/10' :
    'bg-gray-500/10';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden border-none bg-[#161B22] shadow-lg h-full',
          className
        )}
      >
        {/* Background image overlay */}
        {backgroundImage && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161B22] via-[#161B22]/80 to-transparent" />
          </>
        )}

        <CardContent className="relative p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="rounded-lg bg-[#1C2128] p-2.5 text-[#4B6FED]">
              {icon}
            </div>

            {trendValue !== 0 && (
              <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', trendBg, trendColor)}>
                <TrendIcon className="h-3 w-3" />
                <span>{Math.abs(trendValue)}%</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
