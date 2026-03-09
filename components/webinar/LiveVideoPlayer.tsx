/**
 * Live Video Player Component
 * Based on aiKIT VideoRecorder for live webinar streaming
 * Adapted for viewing live streams in webinar context
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface LiveVideoPlayerProps {
  streamUrl?: string;
  posterUrl?: string;
  title?: string;
  className?: string;
  showLiveBadge?: boolean;
}

export const LiveVideoPlayer: React.FC<LiveVideoPlayerProps> = ({
  streamUrl,
  posterUrl,
  title,
  className = '',
  showLiveBadge = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (streamUrl && videoRef.current) {
      setIsLoading(true);
      setError(null);

      // For HLS streams (.m3u8)
      if (streamUrl.endsWith('.m3u8')) {
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          videoRef.current.src = streamUrl;
        } else {
          // Use HLS.js for other browsers
          import('hls.js').then(({ default: Hls }) => {
            if (Hls.isSupported() && videoRef.current) {
              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
              });

              hls.loadSource(streamUrl);
              hls.attachMedia(videoRef.current);

              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsLoading(false);
                videoRef.current?.play().catch(err => {
                  console.error('Auto-play failed:', err);
                });
              });

              hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                  setError('Failed to load live stream');
                  setIsLoading(false);
                }
              });

              return () => {
                hls.destroy();
              };
            } else {
              setError('HLS not supported in this browser');
              setIsLoading(false);
            }
          }).catch(err => {
            console.error('Failed to load HLS.js:', err);
            setError('Failed to initialize video player');
            setIsLoading(false);
          });
        }
      } else {
        // Direct video source
        videoRef.current.src = streamUrl;
        setIsLoading(false);
      }
    }
  }, [streamUrl]);

  return (
    <div className={`live-video-player relative ${className}`}>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          controls
          playsInline
          poster={posterUrl}
          className="w-full h-full object-contain"
          aria-label={title || 'Live webinar stream'}
        />

        {/* Live Badge */}
        {showLiveBadge && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-600 rounded-full animate-pulse">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span className="text-white font-bold text-sm">LIVE</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-white font-medium">Loading stream...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center p-6 max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 text-red-500">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Stream Error</h3>
              <p className="text-gray-300 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      {title && (
        <div className="mt-3 px-2">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
      )}
    </div>
  );
};

export default LiveVideoPlayer;
