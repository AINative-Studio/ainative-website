'use client';

import { useState, useRef } from 'react';
import { Download, AlertCircle, Play, Pause } from 'lucide-react';
import { VideoPreviewProps } from '../../types.preview';
import { PreviewContainer } from './PreviewContainer';

/**
 * VideoPreview Component
 *
 * Displays video results using HTML5 <video> element with native controls.
 * This component handles video playback from AI video generation models like:
 * - Sora2
 * - CogVideoX-2B
 * - Seedance I2V
 * - Alibaba Wan 2.2
 *
 * Features:
 * - Native browser controls (play, pause, seek, volume, fullscreen)
 * - Poster image/thumbnail support
 * - Multiple format support (MP4, WebM, MOV)
 * - Download functionality
 * - Responsive sizing
 * - Error handling for unsupported formats
 * - Accessibility (keyboard controls, ARIA)
 * - Dark mode compatible
 *
 * Technical Decision:
 * Uses HTML5 <video> instead of Remotion because:
 * - Remotion is for programmatic video *generation*, not playback
 * - Native controls are lightweight and well-tested
 * - No additional bundle size
 * - Better browser compatibility
 *
 * Refs: Issue #546
 * Architecture: /docs/architecture/PREVIEW_COMPONENTS_ARCHITECTURE.md
 */
export function VideoPreview({ result, onDownload }: VideoPreviewProps) {
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * Handle video errors (codec issues, network errors, etc.)
   */
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;

    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          setVideoError('Video playback was aborted');
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          setVideoError('Network error occurred while loading video');
          break;
        case MediaError.MEDIA_ERR_DECODE:
          setVideoError('Video codec not supported by your browser');
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          setVideoError('Video format not supported. Try downloading to view.');
          break;
        default:
          setVideoError('An unknown error occurred while loading video');
      }
    }
  };

  /**
   * Download video file
   */
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download implementation
      const link = document.createElement('a');
      link.href = result.url;
      link.download = `video-${Date.now()}.${result.format || 'mp4'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /**
   * Toggle play/pause
   */
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  /**
   * Format duration in seconds to MM:SS
   */
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PreviewContainer
      result={result}
      showDownload={true}
      onDownload={handleDownload}
    >
      <div className="space-y-4">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden group">
          {videoError ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-red-400 text-sm font-medium mb-2">Failed to load video</p>
              <p className="text-gray-500 text-xs max-w-md mb-4">{videoError}</p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download Video
              </button>
            </div>
          ) : !result.url ? (
            /* No Video URL State */
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-400 text-sm font-medium mb-2">No video available</p>
              <p className="text-gray-500 text-xs max-w-md">
                Video generation is in progress or failed. Please try again.
              </p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                src={result.url}
                poster={result.thumbnail_url || undefined}
                controls
                preload="metadata"
                className="w-full h-auto max-h-[600px] object-contain"
                onError={handleVideoError}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                aria-label="AI generated video preview"
              >
                {/* Fallback for multiple formats */}
                {result.format === 'mp4' && (
                  <source src={result.url} type="video/mp4" />
                )}
                {result.format === 'webm' && (
                  <source src={result.url} type="video/webm" />
                )}
                {result.format === 'mov' && (
                  <source src={result.url} type="video/quicktime" />
                )}
                <p className="text-gray-400 text-sm p-8">
                  Your browser does not support video playback.
                  <button
                    onClick={handleDownload}
                    className="text-primary hover:underline ml-2"
                  >
                    Download video
                  </button>
                  to view it.
                </p>
              </video>

              {/* Custom Play/Pause Overlay (shows on hover when paused) */}
              {!isPlaying && (
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Play video"
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </button>
              )}
            </>
          )}
        </div>

        {/* Video Metadata */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {result.duration_seconds !== undefined && (
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">Duration</span>
              <span className="text-gray-300 font-medium">
                {formatDuration(result.duration_seconds)}
              </span>
            </div>
          )}
          {result.width && result.height && (
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">Dimensions</span>
              <span className="text-gray-300 font-medium">
                {result.width} × {result.height}
              </span>
            </div>
          )}
          {result.format && (
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">Format</span>
              <span className="text-gray-300 font-medium uppercase">
                {result.format}
              </span>
            </div>
          )}
          {result.supports_streaming !== undefined && (
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">Streaming</span>
              <span className="text-gray-300 font-medium">
                {result.supports_streaming ? 'Supported' : 'Not supported'}
              </span>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 leading-relaxed">
          Use the player controls to play, pause, seek, adjust volume, and enter fullscreen.
          Keyboard shortcuts: Space (play/pause), Arrow keys (seek), M (mute), F (fullscreen).
        </p>
      </div>
    </PreviewContainer>
  );
}
