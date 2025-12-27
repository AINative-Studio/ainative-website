import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EnhancedStatCardProps {
  /**
   * Title/label for the stat
   */
  title: string;

  /**
   * Numeric value to display
   */
  value: number;

  /**
   * Optional icon component (from lucide-react or custom)
   */
  icon?: React.ReactNode | LucideIcon;

  /**
   * Trend direction ('up' | 'down' | 'neutral')
   */
  trend?: 'up' | 'down' | 'neutral';

  /**
   * Trend value (percentage)
   */
  trendValue?: number;

  /**
   * Optional background image URL
   */
  backgroundImage?: string;

  /**
   * Format for the value ('number' | 'currency' | 'percentage')
   */
  format?: 'number' | 'currency' | 'percentage';

  /**
   * Currency code (used when format is 'currency')
   */
  currency?: string;

  /**
   * Whether to show sparkline chart (future enhancement)
   */
  showSparkline?: boolean;

  /**
   * Sparkline data points (future enhancement)
   */
  sparklineData?: number[];

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Custom color for the icon background
   */
  iconColor?: string;
}

/**
 * EnhancedStatCard - An enhanced stat card with gradient backgrounds and trend indicators
 *
 * Features:
 * - Gradient background overlay
 * - Custom branded icon in circular container
 * - Large number display with proper formatting
 * - Optional trend indicator with arrows
 * - Optional mini sparkline chart
 * - Hover effects (scale, shadow)
 * - Responsive design
 *
 * @example
 * ```tsx
 * <EnhancedStatCard
 *   title="Total API Calls"
 *   value={12543}
 *   icon={<Activity className="h-8 w-8" />}
 *   trend="up"
 *   trendValue={12.5}
 *   backgroundImage="/1.png"
 * />
 * ```
 */
export const EnhancedStatCard = React.forwardRef<HTMLDivElement, EnhancedStatCardProps>(
  (
    {
      title,
      value,
      icon,
      trend,
      trendValue,
      backgroundImage,
      format = 'number',
      currency = 'USD',
      showSparkline = false,
      sparklineData,
      className,
      iconColor = 'bg-brand-primary/10',
    },
    ref
  ) => {
    // Format the value based on the format type
    const formattedValue = React.useMemo(() => {
      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(value);
        case 'percentage':
          return `${value.toLocaleString()}%`;
        case 'number':
        default:
          return value.toLocaleString();
      }
    }, [value, format, currency]);

    // Determine trend color
    const trendColor = trend === 'up'
      ? 'text-green-400'
      : trend === 'down'
        ? 'text-red-400'
        : 'text-gray-400';

    // Render icon (handle both component and LucideIcon types)
    const renderIcon = () => {
      if (!icon) return null;

      // Check if it's a Lucide icon component (has a type property)
      if (typeof icon === 'function') {
        const IconComponent = icon as LucideIcon;
        return <IconComponent className="h-8 w-8" />;
      }

      // Otherwise treat as React node
      return icon;
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'relative overflow-hidden border-none shadow-ds-md',
          'bg-gradient-to-br from-dark-2 to-dark-3',
          'transition-all duration-300 hover:shadow-ds-lg hover:scale-105',
          'cursor-default',
          className
        )}
      >
        {/* Background Image */}
        {backgroundImage && (
          <div
            className="absolute inset-0 opacity-5 bg-cover bg-center z-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundRepeat: 'no-repeat',
            }}
            aria-hidden="true"
          />
        )}

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent z-0"
          aria-hidden="true"
        />

        {/* Content */}
        <CardContent className="relative z-10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              {/* Title */}
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                {title}
              </p>

              {/* Value */}
              <p className="text-3xl md:text-4xl font-bold text-white">
                {formattedValue}
              </p>

              {/* Trend Indicator */}
              {trend && trendValue !== undefined && (
                <div className={cn('flex items-center gap-1 text-sm font-medium', trendColor)}>
                  {trend === 'up' && <TrendingUp className="h-4 w-4" />}
                  {trend === 'down' && <TrendingDown className="h-4 w-4" />}
                  <span>
                    {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
                    {Math.abs(trendValue).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-1">vs last period</span>
                </div>
              )}

              {/* Sparkline (Placeholder for future implementation) */}
              {showSparkline && sparklineData && sparklineData.length > 0 && (
                <div className="h-12 flex items-end gap-0.5 opacity-50" aria-hidden="true">
                  {sparklineData.map((point, index) => {
                    const maxValue = Math.max(...sparklineData);
                    const heightPercentage = (point / maxValue) * 100;
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-brand-primary/40 rounded-t-sm transition-all duration-200 hover:bg-brand-primary/60"
                        style={{ height: `${heightPercentage}%` }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Icon Container */}
            {icon && (
              <div
                className={cn(
                  'flex items-center justify-center w-14 h-14 rounded-full',
                  'text-brand-primary transition-transform duration-300',
                  'group-hover:scale-110',
                  iconColor
                )}
              >
                {renderIcon()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

EnhancedStatCard.displayName = 'EnhancedStatCard';
