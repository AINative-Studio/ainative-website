'use client';

/**
 * TutorialVideoPlayer Component
 * Complete tutorial video player with HLS streaming, chapter navigation,
 * progress tracking, and all advanced features integrated
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useChapterNavigation } from '@/hooks/useChapterNavigation';
import { useTutorialProgressSync } from '@/hooks/useTutorialProgressSync';
import { VideoPlayerControls } from './VideoPlayerControls';
import { ThumbnailPreview } from './ThumbnailPreview';
import { cn } from '@/lib/utils';
import { Play, Pause, Loader2 } from 'lucide-react';
import type { Chapter } from '@/types/tutorial';
import type { SubtitleTrack } from './VideoPlayerControls';

export interface TutorialVideoPlayerProps {
  /**
   * Tutorial ID for progress tracking
   */
  tutorialId: string;

  /**
   * HLS stream URL or direct video URL
   */
  src: string;

  /**
   * Video poster image
   */
  poster?: string;

  /**
   * Chapter markers
   */
  chapters?: Chapter[];

  /**
   * Subtitle/caption tracks
   */
  subtitles?: SubtitleTrack[];

  /**
   * Autoplay on mount
   */
  autoplay?: boolean;

  /**
   * Start muted
   */
  muted?: boolean;

  /**
   * Initial playback time (in seconds)
   */
  startTime?: number;

  /**
   * Enable automatic progress syncing
   */
  enableProgressTracking?: boolean;

  /**
   * Progress sync interval (milliseconds)
   */
  progressSyncInterval?: number;

  /**
   * Show thumbnail preview on hover
   */
  showThumbnailPreview?: boolean;

  /**
   * Show chapter markers on timeline
   */
  showChapterMarkers?: boolean;

  /**
   * Enable keyboard shortcuts
   */
  enableKeyboardShortcuts?: boolean;

  /**
   * Callback when video ends
   */
  onEnded?: () => void;

  /**
   * Callback when chapter changes
   */
  onChapterChange?: (chapter: Chapter) => void;

  /**
   * Callback when progress is saved
   */
  onProgressSaved?: () => void;

  /**
   * Callback when chapter is completed
   */
  onChapterCompleted?: (chapterId: string) => void;

  /**
   * Custom class name
   */
  className?: string;
}

export const TutorialVideoPlayer: React.FC<TutorialVideoPlayerProps> = ({
  tutorialId,
  src,
  poster,
  chapters = [],
  subtitles = [],
  autoplay = false,
  muted = false,
  startTime = 0,
  enableProgressTracking = true,
  progressSyncInterval = 10000,
  showThumbnailPreview = true,
  showChapterMarkers = true,
  enableKeyboardShortcuts = true,
  onEnded,
  onChapterChange,
  onProgressSaved,
  onChapterCompleted,
  className,
}) => {
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const hideControlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize video player
  const { videoRef, state, controls } = useVideoPlayer({
    src,
    videoId: tutorialId,
    autoplay,
    muted,
    onEnded,
  });

  // Chapter navigation
  const {
    currentChapter,
    goToChapter,
    nextChapter,
    previousChapter,
    hasNextChapter,
    hasPreviousChapter,
  } = useChapterNavigation({
    chapters,
    currentTime: state.currentTime,
    onSeek: controls.seek,
    onChapterChange,
  });

  // Tutorial progress tracking
  const { syncProgress, isSyncing } = useTutorialProgressSync({
    tutorialId,
    currentChapter,
    currentTime: state.currentTime,
    duration: state.duration,
    isPlaying: state.isPlaying,
    totalChapters: chapters.length,
    onProgressSaved,
    onChapterCompleted,
    syncInterval: progressSyncInterval,
  });

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          controls.togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          controls.seek(Math.min(state.currentTime + 5, state.duration));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          controls.seek(Math.max(state.currentTime - 5, 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          controls.setVolume(Math.min(state.volume + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          controls.setVolume(Math.max(state.volume - 0.1, 0));
          break;
        case 'm':
          e.preventDefault();
          controls.toggleMute();
          break;
        case 'f':
          e.preventDefault();
          controls.toggleFullscreen();
          break;
        case 'p':
          e.preventDefault();
          controls.togglePiP();
          break;
        case 'n':
          e.preventDefault();
          if (hasNextChapter) nextChapter();
          break;
        case 'b':
          e.preventDefault();
          if (hasPreviousChapter) previousChapter();
          break;
        default:
          // Number keys for jumping
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            const percent = parseInt(e.key) / 10;
            controls.seek(state.duration * percent);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enableKeyboardShortcuts,
    controls,
    state,
    hasNextChapter,
    hasPreviousChapter,
    nextChapter,
    previousChapter,
  ]);

  /**
   * Handle mouse movement to show/hide controls
   */
  const handleMouseMove = useCallback(() => {
    setIsControlsVisible(true);
    setIsHovering(true);

    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    if (state.isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  }, [state.isPlaying]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (state.isPlaying) {
      setIsControlsVisible(false);
    }
  }, [state.isPlaying]);

  /**
   * Resume from saved start time
   */
  useEffect(() => {
    if (startTime > 0 && videoRef.current && state.duration > 0) {
      controls.seek(startTime);
    }
  }, [startTime, state.duration]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      // Final progress sync
      if (enableProgressTracking) {
        syncProgress();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={cn(
        'relative w-full bg-black rounded-lg overflow-hidden group',
        state.isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      >
        {subtitles.map((subtitle) => (
          <track
            key={subtitle.id}
            kind="subtitles"
            label={subtitle.label}
            src={subtitle.url}
            srcLang={subtitle.language}
            default={subtitle.default}
          />
        ))}
      </video>

      {/* Buffering Indicator */}
      {state.isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <p className="text-white text-sm">Loading...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
          <div className="text-center p-6 max-w-md">
            <p className="text-red-500 font-semibold mb-2">Playback Error</p>
            <p className="text-white text-sm mb-4">{state.error}</p>
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload Player
            </button>
          </div>
        </div>
      )}

      {/* Center Play/Pause Button */}
      <button
        onClick={controls.togglePlay}
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-10',
          state.isPlaying && !isControlsVisible && 'opacity-0 pointer-events-none'
        )}
        aria-label={state.isPlaying ? 'Pause' : 'Play'}
      >
        <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
          {state.isPlaying ? (
            <Pause className="w-10 h-10 text-white" />
          ) : (
            <Play className="w-10 h-10 text-white ml-1" />
          )}
        </div>
      </button>

      {/* Current Chapter Badge */}
      {currentChapter && (
        <div
          className={cn(
            'absolute top-4 left-4 px-4 py-2 rounded-lg bg-black/70 backdrop-blur-sm text-white text-sm transition-opacity duration-300 z-20',
            !isControlsVisible && 'opacity-0'
          )}
        >
          <p className="font-semibold">{currentChapter.title}</p>
          {currentChapter.description && (
            <p className="text-xs text-gray-300 mt-1 max-w-md">{currentChapter.description}</p>
          )}
        </div>
      )}

      {/* Sync Status Indicator */}
      {isSyncing && enableProgressTracking && (
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs z-20">
          Syncing...
        </div>
      )}

      {/* Video Controls */}
      <VideoPlayerControls
        isPlaying={state.isPlaying}
        currentTime={state.currentTime}
        duration={state.duration}
        volume={state.volume}
        isMuted={state.isMuted}
        playbackRate={state.playbackRate}
        isFullscreen={state.isFullscreen}
        isPictureInPicture={state.isPiP}
        qualityLevels={state.qualities}
        currentQualityLevel={state.quality}
        chapters={chapters}
        currentChapter={currentChapter}
        subtitles={subtitles}
        isVisible={isControlsVisible}
        onPlayPause={controls.togglePlay}
        onSeek={controls.seek}
        onVolumeChange={controls.setVolume}
        onMuteToggle={controls.toggleMute}
        onPlaybackRateChange={controls.setPlaybackRate}
        onFullscreenToggle={controls.toggleFullscreen}
        onPictureInPictureToggle={controls.togglePiP}
        onQualityChange={controls.setQuality}
        onChapterSelect={goToChapter}
        onNextChapter={hasNextChapter ? nextChapter : undefined}
        onPreviousChapter={hasPreviousChapter ? previousChapter : undefined}
        showChapterMarkers={showChapterMarkers}
        showThumbnailPreview={showThumbnailPreview}
        videoRef={videoRef}
      />

      {/* Thumbnail Preview */}
      {showThumbnailPreview && (
        <ThumbnailPreview
          videoRef={videoRef}
          duration={state.duration}
          isVisible={isControlsVisible && isHovering}
        />
      )}

      {/* Keyboard Shortcuts Hint */}
      {enableKeyboardShortcuts && (
        <div
          className={cn(
            'absolute bottom-20 left-4 px-3 py-2 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs transition-opacity duration-300 z-10',
            !isControlsVisible && 'opacity-0'
          )}
        >
          <p className="font-semibold mb-1">Keyboard Shortcuts</p>
          <div className="space-y-0.5 text-[10px]">
            <p><kbd className="px-1 bg-white/20 rounded">Space</kbd> Play/Pause</p>
            <p><kbd className="px-1 bg-white/20 rounded">←/→</kbd> Seek</p>
            <p><kbd className="px-1 bg-white/20 rounded">↑/↓</kbd> Volume</p>
            <p><kbd className="px-1 bg-white/20 rounded">F</kbd> Fullscreen</p>
            <p><kbd className="px-1 bg-white/20 rounded">M</kbd> Mute</p>
            <p><kbd className="px-1 bg-white/20 rounded">N/B</kbd> Next/Prev Chapter</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialVideoPlayer;
