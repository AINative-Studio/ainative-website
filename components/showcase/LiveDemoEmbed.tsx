'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveDemoEmbedProps {
  demoUrl: string;
  title?: string;
  environment?: 'production' | 'staging' | 'development';
  isAvailable?: boolean;
  screenshotUrl?: string;
  className?: string;
  defaultExpanded?: boolean;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

export function LiveDemoEmbed({
  demoUrl,
  title = 'Live Demo',
  environment = 'production',
  isAvailable = true,
  screenshotUrl,
  className,
  defaultExpanded = false,
}: LiveDemoEmbedProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [showScreenshot, setShowScreenshot] = useState(!defaultExpanded);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const environmentColors = {
    production: 'bg-green-500',
    staging: 'bg-yellow-500',
    development: 'bg-blue-500',
  };

  const deviceDimensions = {
    desktop: 'w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full',
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const refreshIframe = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      setHasError(false);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const openInNewTab = () => {
    window.open(demoUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setShowScreenshot(false);
    }
  };

  if (!isAvailable) {
    return (
      <Card className={cn('border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10', className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-400">
                Demo Temporarily Unavailable
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                The live demo is currently undergoing maintenance. Please try again later.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {title}
            </CardTitle>
            <Badge className={cn('text-xs', environmentColors[environment])}>
              {environment}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Mode Toggles */}
            {isExpanded && (
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceMode('desktop')}
                  className="h-7 px-2"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={deviceMode === 'tablet' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceMode('tablet')}
                  className="h-7 px-2"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceMode('mobile')}
                  className="h-7 px-2"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Refresh Button */}
            {isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshIframe}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            )}

            {/* Open in New Tab */}
            <Button variant="ghost" size="sm" onClick={openInNewTab}>
              <ExternalLink className="h-4 w-4" />
            </Button>

            {/* Expand/Collapse */}
            <Button variant="ghost" size="sm" onClick={toggleExpand}>
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Screenshot Preview (when collapsed) */}
        {showScreenshot && screenshotUrl && !isExpanded && (
          <div
            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
            onClick={toggleExpand}
          >
            <img
              src={screenshotUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <Button size="lg" className="rounded-full">
                <ExternalLink className="h-5 w-5 mr-2" />
                Open Live Demo
              </Button>
            </div>
          </div>
        )}

        {/* Iframe Embed (when expanded) */}
        {isExpanded && (
          <div className="space-y-4">
            <div className={cn('mx-auto transition-all duration-300', deviceDimensions[deviceMode])}>
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                {/* Loading State */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading demo...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {hasError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
                    <div className="text-center p-6">
                      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
                      <p className="font-medium mb-2">Failed to load demo</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        The demo couldn't be loaded in an embedded view.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={refreshIframe}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                        <Button onClick={openInNewTab}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Iframe */}
                <iframe
                  ref={iframeRef}
                  src={demoUrl}
                  className={cn(
                    'w-full border-0',
                    deviceMode === 'desktop' && 'h-[600px]',
                    deviceMode === 'tablet' && 'h-[768px]',
                    deviceMode === 'mobile' && 'h-[667px]'
                  )}
                  title={title}
                  onLoad={handleLoad}
                  onError={handleError}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Help Text */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {deviceMode === 'desktop' && 'Desktop View'}
                {deviceMode === 'tablet' && 'Tablet View (768px)'}
                {deviceMode === 'mobile' && 'Mobile View (375px)'}
              </span>
              <span>
                Demo running in {environment} environment
              </span>
            </div>
          </div>
        )}

        {/* Collapsed State - Just button */}
        {!isExpanded && !showScreenshot && (
          <Button onClick={toggleExpand} className="w-full">
            <Monitor className="h-4 w-4 mr-2" />
            Load Live Demo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
