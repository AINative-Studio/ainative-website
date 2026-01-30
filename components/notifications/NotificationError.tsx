'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface NotificationErrorProps {
  error: Error | null;
  onRetry: () => void;
  isRetrying?: boolean;
  isOffline?: boolean;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function NotificationError({
  error,
  onRetry,
  isRetrying = false,
  isOffline = false,
}: NotificationErrorProps) {
  const getErrorMessage = () => {
    if (isOffline) {
      return 'You appear to be offline. Please check your internet connection and try again.';
    }

    if (error?.message?.includes('timeout')) {
      return 'The request timed out. The server may be experiencing high traffic. Please try again.';
    }

    if (error?.message?.includes('404')) {
      return 'The notification service is currently unavailable. Please try again later.';
    }

    if (error?.message?.includes('401') || error?.message?.includes('403')) {
      return 'You are not authorized to view notifications. Please log in again.';
    }

    if (error?.message?.includes('500') || error?.message?.includes('502') || error?.message?.includes('503')) {
      return 'The notification service is experiencing technical difficulties. Please try again in a few moments.';
    }

    return error?.message || 'Failed to load notifications. Please try again.';
  };

  const getErrorTitle = () => {
    if (isOffline) return 'Connection Lost';
    if (error?.message?.includes('401') || error?.message?.includes('403')) return 'Authentication Required';
    if (error?.message?.includes('500') || error?.message?.includes('502') || error?.message?.includes('503')) return 'Service Unavailable';
    return 'Unable to Load Notifications';
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="flex items-center justify-center min-h-[400px] p-8"
    >
      <div className="max-w-md w-full space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center backdrop-blur-sm">
              {isOffline ? (
                <WifiOff className="w-12 h-12 text-red-400" />
              ) : (
                <AlertCircle className="w-12 h-12 text-red-400" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          </div>
        </div>

        {/* Error Alert */}
        <Alert variant="destructive" className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-white">{getErrorTitle()}</AlertTitle>
          <AlertDescription className="text-gray-300 mt-2">
            {getErrorMessage()}
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>

          {isOffline && (
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="w-full gap-2 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Wifi className="w-4 h-4" />
              Reload Page
            </Button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500">
          If the problem persists, please contact{' '}
          <a
            href="mailto:support@ainative.studio"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            support@ainative.studio
          </a>
        </p>
      </div>
    </motion.div>
  );
}
