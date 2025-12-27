/**
 * VideoPlayer Component
 * HLS video player with adaptive streaming and full controls
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import {
  formatTime,
  keyboardShortcuts,
  playbackSpeeds,
  getQualityLabel,
} from '@/lib/videoPlayerConfig';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  PictureInPicture,
  Loader2,
} from 'lucide-react';
import '@/styles/video-player.css';

export interface VideoPlayerProps {
  videoId?: string;
  src?: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onError?: (error: Error) => void;
}

export function VideoPlayer({
  videoId,
  src,
  poster,
  autoplay = false,
  controls = true,
  muted = false,
  className = '',
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onError,
}: VideoPlayerProps) {
  const { videoRef, state, controls: playerControls } = useVideoPlayer({
    src,
    videoId,
    autoplay,
    muted,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onError,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = React.useState(true);
  const [showSettings, setShowSettings] = React.useState(false);
  const [volumeSliderVisible, setVolumeSliderVisible] = React.useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  /**
   * Keyboard shortcuts handler
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case keyboardShortcuts.PLAY_PAUSE:
          e.preventDefault();
          playerControls.togglePlay();
          break;
        case keyboardShortcuts.SEEK_FORWARD:
          e.preventDefault();
          playerControls.seek(Math.min(state.currentTime + 5, state.duration));
          break;
        case keyboardShortcuts.SEEK_BACKWARD:
          e.preventDefault();
          playerControls.seek(Math.max(state.currentTime - 5, 0));
          break;
        case keyboardShortcuts.VOLUME_UP:
          e.preventDefault();
          playerControls.setVolume(Math.min(state.volume + 0.1, 1));
          break;
        case keyboardShortcuts.VOLUME_DOWN:
          e.preventDefault();
          playerControls.setVolume(Math.max(state.volume - 0.1, 0));
          break;
        case keyboardShortcuts.MUTE:
          e.preventDefault();
          playerControls.toggleMute();
          break;
        case keyboardShortcuts.FULLSCREEN:
          e.preventDefault();
          playerControls.toggleFullscreen();
          break;
        case keyboardShortcuts.PICTURE_IN_PICTURE:
          e.preventDefault();
          playerControls.togglePiP();
          break;
        case keyboardShortcuts.JUMP_0:
        case keyboardShortcuts.JUMP_1:
        case keyboardShortcuts.JUMP_2:
        case keyboardShortcuts.JUMP_3:
        case keyboardShortcuts.JUMP_4:
        case keyboardShortcuts.JUMP_5:
        case keyboardShortcuts.JUMP_6:
        case keyboardShortcuts.JUMP_7:
        case keyboardShortcuts.JUMP_8:
        case keyboardShortcuts.JUMP_9:
          e.preventDefault();
          const percent = parseInt(e.key) / 10;
          playerControls.seek(state.duration * percent);
          break;
      }
    },
    [playerControls, state.currentTime, state.duration, state.volume]
  );

  /**
   * Hide controls after inactivity
   */
  const handleMouseMove = useCallback(() => {
    setShowControls(true);

    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    if (state.isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [state.isPlaying]);

  /**
   * Handle seek bar click
   */
  const handleSeekBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const seekBar = e.currentTarget;
      const rect = seekBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      playerControls.seek(state.duration * percent);
    },
    [playerControls, state.duration]
  );

  /**
   * Handle volume slider change
   */
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      playerControls.setVolume(parseFloat(e.target.value));
    },
    [playerControls]
  );

  /**
   * Set up keyboard shortcuts
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /**
   * Clean up hide controls timeout
   */
  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  if (state.error) {
    return (
      <div className="video-player-error">
        <p>{state.error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`video-player ${className} ${state.isFullscreen ? 'fullscreen' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="video-player__video"
        poster={poster}
        playsInline
        onClick={playerControls.togglePlay}
      />

      {/* Loading Spinner */}
      {state.isBuffering && (
        <div className="video-player__loading">
          <Loader2 className="animate-spin" size={48} />
        </div>
      )}

      {/* Controls */}
      {controls && (
        <div className={`video-player__controls ${showControls ? 'visible' : ''}`}>
          {/* Progress Bar */}
          <div className="video-player__progress-container" onClick={handleSeekBarClick}>
            <div className="video-player__progress-buffer" style={{ width: `${state.buffered}%` }} />
            <div
              className="video-player__progress-bar"
              style={{ width: `${(state.currentTime / state.duration) * 100}%` }}
            />
            <div
              className="video-player__progress-handle"
              style={{ left: `${(state.currentTime / state.duration) * 100}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="video-player__controls-bar">
            {/* Left Controls */}
            <div className="video-player__controls-left">
              {/* Play/Pause */}
              <button
                className="video-player__btn"
                onClick={playerControls.togglePlay}
                aria-label={state.isPlaying ? 'Pause' : 'Play'}
              >
                {state.isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              {/* Volume */}
              <div
                className="video-player__volume"
                onMouseEnter={() => setVolumeSliderVisible(true)}
                onMouseLeave={() => setVolumeSliderVisible(false)}
              >
                <button
                  className="video-player__btn"
                  onClick={playerControls.toggleMute}
                  aria-label={state.isMuted ? 'Unmute' : 'Mute'}
                >
                  {state.isMuted || state.volume === 0 ? (
                    <VolumeX size={20} />
                  ) : (
                    <Volume2 size={20} />
                  )}
                </button>
                {volumeSliderVisible && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={state.volume}
                    onChange={handleVolumeChange}
                    className="video-player__volume-slider"
                    aria-label="Volume"
                  />
                )}
              </div>

              {/* Time Display */}
              <div className="video-player__time">
                <span>{formatTime(state.currentTime)}</span>
                <span> / </span>
                <span>{formatTime(state.duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="video-player__controls-right">
              {/* Playback Speed */}
              <div className="video-player__speed">
                <select
                  value={state.playbackRate}
                  onChange={(e) => playerControls.setPlaybackRate(parseFloat(e.target.value))}
                  className="video-player__select"
                  aria-label="Playback speed"
                >
                  {playbackSpeeds.map((speed) => (
                    <option key={speed} value={speed}>
                      {speed}x
                    </option>
                  ))}
                </select>
              </div>

              {/* Quality */}
              {state.qualities.length > 0 && (
                <div className="video-player__quality">
                  <select
                    value={state.quality}
                    onChange={(e) => {
                      const value = e.target.value;
                      playerControls.setQuality(value === 'auto' ? 'auto' : parseInt(value));
                    }}
                    className="video-player__select"
                    aria-label="Video quality"
                  >
                    <option value="auto">Auto</option>
                    {state.qualities.map((q) => (
                      <option key={q.height} value={q.height}>
                        {getQualityLabel(q.height)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Settings */}
              <button
                className="video-player__btn"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>

              {/* Picture in Picture */}
              {document.pictureInPictureEnabled && (
                <button
                  className="video-player__btn"
                  onClick={playerControls.togglePiP}
                  aria-label="Picture in Picture"
                >
                  <PictureInPicture size={20} />
                </button>
              )}

              {/* Fullscreen */}
              <button
                className="video-player__btn"
                onClick={playerControls.toggleFullscreen}
                aria-label={state.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {state.isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="video-player__settings">
          <h3>Settings</h3>
          <div className="video-player__settings-item">
            <label>Playback Speed</label>
            <select
              value={state.playbackRate}
              onChange={(e) => playerControls.setPlaybackRate(parseFloat(e.target.value))}
            >
              {playbackSpeeds.map((speed) => (
                <option key={speed} value={speed}>
                  {speed}x
                </option>
              ))}
            </select>
          </div>
          <div className="video-player__settings-item">
            <label>Quality</label>
            <select
              value={state.quality}
              onChange={(e) => {
                const value = e.target.value;
                playerControls.setQuality(value === 'auto' ? 'auto' : parseInt(value));
              }}
            >
              <option value="auto">Auto</option>
              {state.qualities.map((q) => (
                <option key={q.height} value={q.height}>
                  {getQualityLabel(q.height)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="video-player__shortcuts-hint">
        <small>
          Press <kbd>Space</kbd> to play/pause, <kbd>F</kbd> for fullscreen, <kbd>M</kbd> to mute
        </small>
      </div>
    </div>
  );
}

export default VideoPlayer;
