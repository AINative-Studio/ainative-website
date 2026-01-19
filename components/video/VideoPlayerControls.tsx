'use client';

/**
 * VideoPlayerControls Component
 * Complete video player control interface with progress bar, volume, quality, chapters, and settings
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  PictureInPicture,
  SkipForward,
  SkipBack,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime, playbackSpeeds, getQualityLabel } from '@/lib/videoPlayerConfig';
import { ChapterMarkers } from './ChapterMarkers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import type { Chapter } from '@/types/tutorial';

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url: string;
  default?: boolean;
}

export interface QualityLevel {
  height: number;
  bitrate: number;
}

export interface VideoPlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isPictureInPicture: boolean;
  qualityLevels: QualityLevel[];
  currentQualityLevel: number | 'auto';
  chapters?: Chapter[];
  currentChapter?: Chapter | null;
  subtitles?: SubtitleTrack[];
  isVisible: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onFullscreenToggle: () => void;
  onPictureInPictureToggle: () => void;
  onQualityChange: (level: number | 'auto') => void;
  onChapterSelect?: (chapterId: string) => void;
  onNextChapter?: () => void;
  onPreviousChapter?: () => void;
  onSubtitleChange?: (subtitleId: string | null) => void;
  showChapterMarkers?: boolean;
  showThumbnailPreview?: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  isFullscreen,
  isPictureInPicture,
  qualityLevels,
  currentQualityLevel,
  chapters = [],
  currentChapter,
  subtitles = [],
  isVisible,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onPlaybackRateChange,
  onFullscreenToggle,
  onPictureInPictureToggle,
  onQualityChange,
  onChapterSelect,
  onNextChapter,
  onPreviousChapter,
  onSubtitleChange,
  showChapterMarkers = true,
  videoRef,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(
    subtitles.find((s) => s.default)?.id || null
  );

  /**
   * Calculate progress percentage
   */
  const progressPercent = useMemo(() => {
    if (!duration || duration === 0) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  /**
   * Handle progress bar seek
   */
  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || !duration) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = duration * percent;
      onSeek(Math.max(0, Math.min(duration, time)));
    },
    [duration, onSeek]
  );

  /**
   * Handle progress bar drag
   */
  const handleProgressBarMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      handleProgressBarClick(e);
    },
    [handleProgressBarClick]
  );

  const handleProgressBarMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !progressBarRef.current || !duration) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = duration * percent;
      onSeek(Math.max(0, Math.min(duration, time)));
    },
    [isDragging, duration, onSeek]
  );

  const handleProgressBarMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handle progress bar hover for thumbnail preview
   */
  const handleProgressBarHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || !duration) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = duration * percent;
      setHoverTime(Math.max(0, Math.min(duration, time)));
    },
    [duration]
  );

  const handleProgressBarLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  /**
   * Handle subtitle selection
   */
  const handleSubtitleChange = useCallback(
    (subtitleId: string | null) => {
      setActiveSubtitle(subtitleId);
      onSubtitleChange?.(subtitleId);

      // Update video text tracks
      if (videoRef.current) {
        const tracks = videoRef.current.textTracks;
        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i];
          if (track.kind === 'subtitles') {
            track.mode = track.label === subtitleId || track.id === subtitleId ? 'showing' : 'hidden';
          }
        }
      }
    },
    [videoRef, onSubtitleChange]
  );

  /**
   * Set up drag event listeners
   */
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleProgressBarMouseMove);
      window.addEventListener('mouseup', handleProgressBarMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleProgressBarMouseMove);
        window.removeEventListener('mouseup', handleProgressBarMouseUp);
      };
    }
  }, [isDragging, handleProgressBarMouseMove, handleProgressBarMouseUp]);

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Progress Bar */}
      <div className="mb-2">
        <div
          ref={progressBarRef}
          className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer group hover:h-2 transition-all"
          onMouseDown={handleProgressBarMouseDown}
          onClick={handleProgressBarClick}
          onMouseMove={handleProgressBarHover}
          onMouseLeave={handleProgressBarLeave}
        >
          {/* Chapter Markers */}
          {showChapterMarkers && chapters.length > 0 && (
            <ChapterMarkers chapters={chapters} duration={duration} onChapterClick={onChapterSelect} />
          )}

          {/* Buffered Progress */}
          {videoRef.current?.buffered.length && videoRef.current.buffered.length > 0 && (
            <div
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
              style={{
                width: `${(videoRef.current.buffered.end(0) / duration) * 100}%`,
              }}
            />
          )}

          {/* Played Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Progress Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
          />

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-8 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap pointer-events-none"
              style={{
                left: `${(hoverTime / duration) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-2">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onPlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          {/* Previous Chapter */}
          {chapters.length > 0 && onPreviousChapter && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onPreviousChapter}
              aria-label="Previous Chapter"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
          )}

          {/* Next Chapter */}
          {chapters.length > 0 && onNextChapter && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onNextChapter}
              aria-label="Next Chapter"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          )}

          {/* Volume */}
          <div className="flex items-center gap-2 group">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onMuteToggle}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>

            <div className="w-0 opacity-0 group-hover:w-20 group-hover:opacity-100 transition-all overflow-hidden">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={([value]) => onVolumeChange(value / 100)}
                className="w-20"
              />
            </div>
          </div>

          {/* Time Display */}
          <div className="text-white text-sm font-medium tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Chapters Menu */}
          {chapters.length > 0 && onChapterSelect && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 text-xs"
                >
                  Chapters ({chapters.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-80 overflow-y-auto">
                <DropdownMenuLabel>Chapters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {chapters.map((chapter, index) => (
                  <DropdownMenuItem
                    key={chapter.id}
                    onClick={() => onChapterSelect(chapter.id)}
                    className={cn(
                      'cursor-pointer',
                      currentChapter?.id === chapter.id && 'bg-primary/10'
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {index + 1}. {chapter.title}
                        </span>
                        {chapter.completed && (
                          <span className="text-xs text-green-600">✓</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(chapter.startTime)}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Subtitles */}
          {subtitles.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  aria-label="Subtitles"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Subtitles</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSubtitleChange(null)}>
                  <span className={cn(!activeSubtitle && 'font-semibold')}>Off</span>
                </DropdownMenuItem>
                {subtitles.map((subtitle) => (
                  <DropdownMenuItem
                    key={subtitle.id}
                    onClick={() => handleSubtitleChange(subtitle.id)}
                  >
                    <span className={cn(activeSubtitle === subtitle.id && 'font-semibold')}>
                      {subtitle.label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Settings (Playback Speed & Quality) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
              {playbackSpeeds.map((speed) => (
                <DropdownMenuItem
                  key={speed}
                  onClick={() => onPlaybackRateChange(speed)}
                  className={cn(playbackRate === speed && 'font-semibold')}
                >
                  {speed}x {speed === 1 && '(Normal)'}
                </DropdownMenuItem>
              ))}
              {qualityLevels.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Quality</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => onQualityChange('auto')}
                    className={cn(currentQualityLevel === 'auto' && 'font-semibold')}
                  >
                    Auto
                  </DropdownMenuItem>
                  {qualityLevels.map((level) => (
                    <DropdownMenuItem
                      key={level.height}
                      onClick={() => onQualityChange(level.height)}
                      className={cn(currentQualityLevel === level.height && 'font-semibold')}
                    >
                      {getQualityLabel(level.height)}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Picture in Picture */}
          {document.pictureInPictureEnabled && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onPictureInPictureToggle}
              aria-label="Picture in Picture"
            >
              <PictureInPicture className="w-5 h-5" />
            </Button>
          )}

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onFullscreenToggle}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
