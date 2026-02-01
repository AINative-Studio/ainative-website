'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminCardProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'outlined';
  hoverable?: boolean;
  'aria-label'?: string;
}

export default function AdminCard({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  loading = false,
  error,
  onRetry,
  empty = false,
  emptyMessage = 'No data to display',
  emptyIcon: EmptyIcon = Inbox,
  variant = 'default',
  hoverable = false,
  'aria-label': ariaLabel,
}: AdminCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const renderContent = () => {
    // Priority: error > loading > empty > content
    if (error) {
      return (
        <div className="py-8">
          <Alert variant="destructive" className="border-red-800 bg-red-900/20">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <AlertDescription className="text-red-300 ml-2">
              {error}
            </AlertDescription>
          </Alert>
          {onRetry && (
            <div className="mt-4 text-center">
              <Button
                onClick={onRetry}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-900/20"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (loading) {
      return (
        <div className="space-y-4 py-4" aria-label="Loading...">
          <Skeleton className="h-4 w-full bg-gray-700" />
          <Skeleton className="h-4 w-3/4 bg-gray-700" />
          <Skeleton className="h-4 w-5/6 bg-gray-700" />
          <p className="sr-only">Loading...</p>
        </div>
      );
    }

    if (empty) {
      return (
        <div className="py-12 text-center">
          <EmptyIcon className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      );
    }

    return children;
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          'bg-surface-secondary border-border',
          variant === 'outlined' && 'border-2',
          hoverable && 'hover:shadow-lg hover:border-brand-primary/30 transition-all duration-200',
          className
        )}
        role={title ? 'region' : undefined}
        aria-label={ariaLabel || title}
        aria-busy={loading}
      >
        {(title || description || Icon || actions) && (
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="flex items-start gap-3 flex-1">
              {Icon && (
                <div className="mt-1">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
              )}
              <div className="flex-1">
                {title && (
                  <CardTitle className="text-white text-lg">
                    <h3>{title}</h3>
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className="text-gray-400 mt-1">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </CardHeader>
        )}
        <CardContent className={cn(!title && !description && !Icon && !actions && 'pt-6')}>
          {renderContent()}
        </CardContent>
      </Card>
    </motion.div>
  );
}
