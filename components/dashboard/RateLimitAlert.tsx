/**
 * Rate Limit Alert Component
 * Displays warnings when API usage approaches or exceeds tier limits
 *
 * @module RateLimitAlert
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useAPIUsage } from '@/hooks/useDashboardStats';
import { getTierLimits } from '@/hooks/useBilling';
import Link from 'next/link';

/**
 * Rate Limit Alert Props
 */
export interface RateLimitAlertProps {
  projectId?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  className?: string;
}

/**
 * Rate Limit Alert Component
 * Shows alerts at 80% (warning) and 100% (critical) usage thresholds
 *
 * @example
 * ```tsx
 * <RateLimitAlert projectId="abc123" />
 * ```
 */
export function RateLimitAlert({
  projectId,
  warningThreshold = 80,
  criticalThreshold = 100,
  className
}: RateLimitAlertProps) {
  const { data: usage, isLoading } = useAPIUsage(projectId);

  // Don't render anything while loading or if no data
  if (isLoading || !usage) {
    return null;
  }

  const currentTier = usage.current_tier || 'free';
  const limits = getTierLimits(currentTier);
  const totalRequests = usage.total_requests || 0;
  const requestLimit = limits.api_requests;

  // Calculate percentage
  const percentage = requestLimit === Infinity
    ? 0
    : (totalRequests / requestLimit) * 100;

  // Don't show alert if below warning threshold
  if (percentage < warningThreshold) {
    return null;
  }

  // Determine alert variant and content
  const isExceeded = percentage >= criticalThreshold;
  const variant = isExceeded ? 'destructive' : 'default';
  const Icon = isExceeded ? AlertCircle : AlertTriangle;
  const title = isExceeded ? 'Rate Limit Exceeded' : 'Approaching Rate Limit';

  const formattedRequests = totalRequests.toLocaleString();
  const formattedLimit = requestLimit === Infinity
    ? 'Unlimited'
    : requestLimit.toLocaleString();
  const formattedPercentage = percentage.toFixed(0);

  return (
    <Alert variant={variant} className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <div>
          <p className="text-sm">
            {isExceeded ? (
              <>
                You have exceeded your {currentTier} tier rate limit.{' '}
                <strong>{formattedRequests}</strong> of{' '}
                <strong>{formattedLimit}</strong> requests used ({formattedPercentage}%).
              </>
            ) : (
              <>
                You are approaching your {currentTier} tier rate limit.{' '}
                <strong>{formattedRequests}</strong> of{' '}
                <strong>{formattedLimit}</strong> requests used ({formattedPercentage}%).
              </>
            )}
          </p>
        </div>

        {isExceeded && (
          <div className="flex items-start gap-2 p-3 bg-background/50 rounded-md border">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs">
              Your API requests may be throttled or rejected. Please upgrade your plan
              or wait for the limit to reset.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant={isExceeded ? 'default' : 'outline'} size="sm" asChild>
            <Link href="/pricing">
              {isExceeded ? 'Upgrade Now' : 'View Plans'}
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/billing">
              View Usage Details
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default RateLimitAlert;
