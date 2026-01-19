'use client';

/**
 * ThumbnailPreview Component
 * Displays video thumbnail preview on progress bar hover
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/videoPlayerConfig';

export interface ThumbnailPreviewProps {
  /**
   * Video element reference
   */
  videoRef: React.RefObject<HTMLVideoElement | null>;

  /**
   * Video duration in seconds
   */
  duration: number;

  /**
   * Whether the preview should be visible
   */
  isVisible: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  videoRef,
  duration,
  isVisible,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, time: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [thumbnailReady, setThumbnailReady] = useState(false);

  /**
   * Generate thumbnail at specific time
   */
  const generateThumbnail = useCallback(
    (time: number) => {
      if (!videoRef.current || !canvasRef.current || !previewVideoRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Create a clone of the video for thumbnail generation
      const previewVideo = previewVideoRef.current;

      // Set up event handler for when the preview video is ready
      const handleSeeked = () => {
        try {
          // Draw the current frame to canvas
          canvas.width = 160; // Thumbnail width
          canvas.height = 90; // Thumbnail height (16:9 aspect ratio)
          context.drawImage(previewVideo, 0, 0, canvas.width, canvas.height);
          setThumbnailReady(true);
        } catch (error) {
          console.warn('Failed to generate thumbnail:', error);
        }
      };

      previewVideo.addEventListener('seeked', handleSeeked, { once: true });

      // Seek to the desired time
      previewVideo.currentTime = time;
    },
    [videoRef]
  );

  /**
   * Handle progress bar hover
   */
  const handleProgressBarHover = useCallback(
    (e: MouseEvent) => {
      if (!isVisible || !duration) return;

      const progressBar = (e.currentTarget as HTMLElement).closest('.video-player__progress-container');
      if (!progressBar) return;

      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = Math.max(0, Math.min(duration, duration * percent));

      setPreviewPosition({
        x: e.clientX - rect.left,
        time,
      });

      setIsHovering(true);
      setThumbnailReady(false);

      // Debounce thumbnail generation
      const timeoutId = setTimeout(() => {
        generateThumbnail(time);
      }, 100);

      return () => clearTimeout(timeoutId);
    },
    [isVisible, duration, generateThumbnail]
  );

  const handleProgressBarLeave = useCallback(() => {
    setIsHovering(false);
    setThumbnailReady(false);
  }, []);

  /**
   * Set up preview video source
   */
  useEffect(() => {
    if (!videoRef.current || !previewVideoRef.current) return;

    // Clone the source from the main video
    const mainVideo = videoRef.current;
    const previewVideo = previewVideoRef.current;

    if (mainVideo.src) {
      previewVideo.src = mainVideo.src;
    } else if (mainVideo.currentSrc) {
      previewVideo.src = mainVideo.currentSrc;
    }

    // Set preview video properties
    previewVideo.muted = true;
    previewVideo.preload = 'metadata';
  }, [videoRef]);

  /**
   * Set up hover listeners on progress bar
   */
  useEffect(() => {
    if (!videoRef.current) return;

    const container = videoRef.current.closest('.video-player');
    const progressBar = container?.querySelector('.video-player__progress-container');

    if (!progressBar) return;

    progressBar.addEventListener('mousemove', handleProgressBarHover as EventListener);
    progressBar.addEventListener('mouseleave', handleProgressBarLeave);

    return () => {
      progressBar.removeEventListener('mousemove', handleProgressBarHover as EventListener);
      progressBar.removeEventListener('mouseleave', handleProgressBarLeave);
    };
  }, [videoRef, handleProgressBarHover, handleProgressBarLeave]);

  if (!isVisible || !isHovering) {
    return null;
  }

  return (
    <>
      {/* Hidden preview video for thumbnail generation */}
      <video
        ref={previewVideoRef}
        className="hidden"
        crossOrigin="anonymous"
        playsInline
      />

      {/* Thumbnail Preview */}
      <div
        className={cn(
          'absolute bottom-full mb-2 pointer-events-none z-50 transition-opacity',
          thumbnailReady ? 'opacity-100' : 'opacity-0',
          className
        )}
        style={{
          left: `${previewPosition.x}px`,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="bg-black rounded-lg shadow-2xl overflow-hidden border border-white/20">
          {/* Thumbnail Canvas */}
          <canvas
            ref={canvasRef}
            className="w-40 h-auto block"
            width={160}
            height={90}
          />

          {/* Time Display */}
          <div className="px-2 py-1 bg-black/90 text-white text-xs font-medium text-center">
            {formatTime(previewPosition.time)}
          </div>
        </div>

        {/* Arrow pointer */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/20" />
      </div>
    </>
  );
};
