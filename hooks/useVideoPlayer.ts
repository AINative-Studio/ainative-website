/**
 * useVideoPlayer Hook
 * Manages video player state, HLS initialization, and playback controls
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  defaultHlsConfig,
  storageKeys,
  getStoredPreference,
  storePreference,
  analyticsEvents,
} from '@/lib/videoPlayerConfig';

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  playbackRate: number;
  buffered: number;
  quality: number | 'auto';
  qualities: Array<{ height: number; bitrate: number }>;
  isBuffering: boolean;
  error: string | null;
  captionsEnabled: boolean;
}

interface UseVideoPlayerOptions {
  src?: string;
  videoId?: string;
  autoplay?: boolean;
  muted?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onError?: (error: Error) => void;
  onQualityChange?: (quality: number | 'auto') => void;
}

export function useVideoPlayer(options: UseVideoPlayerOptions) {
  const {
    src,
    videoId,
    autoplay = false,
    muted = false,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onError,
    onQualityChange,
  } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressSaveInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: getStoredPreference(storageKeys.VOLUME, 1),
    isMuted: muted,
    isFullscreen: false,
    isPiP: false,
    playbackRate: getStoredPreference(storageKeys.PLAYBACK_RATE, 1),
    buffered: 0,
    quality: getStoredPreference(storageKeys.QUALITY, 'auto'),
    qualities: [],
    isBuffering: false,
    error: null,
    captionsEnabled: getStoredPreference(storageKeys.CAPTIONS, false),
  });

  /**
   * Initialize HLS player
   */
  const initializeHls = useCallback(() => {
    if (!src || !videoRef.current) return;

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls(defaultHlsConfig);

      hls.loadSource(src);
      hls.attachMedia(videoRef.current);

      // HLS Events
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((level) => ({
          height: level.height,
          bitrate: level.bitrate,
        }));

        setState((prev) => ({ ...prev, qualities: levels }));

        // Apply stored quality preference
        const storedQuality = getStoredPreference<number | 'auto'>(storageKeys.QUALITY, 'auto');
        if (storedQuality !== 'auto') {
          const levelIndex = hls.levels.findIndex((level) => level.height === storedQuality);
          if (levelIndex !== -1) {
            hls.currentLevel = levelIndex;
          }
        }

        // Autoplay if requested
        if (autoplay) {
          videoRef.current?.play().catch((err) => {
            console.warn('Autoplay failed:', err);
          });
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const newQuality = hls.levels[data.level]?.height || 'auto';
        setState((prev) => ({ ...prev, quality: newQuality }));
        onQualityChange?.(newQuality);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, cannot recover');
              setState((prev) => ({
                ...prev,
                error: 'Failed to load video. Please try again.',
              }));
              onError?.(new Error(data.details));
              break;
          }
        }
      });

      hls.on(Hls.Events.BUFFER_APPENDING, () => {
        setState((prev) => ({ ...prev, isBuffering: true }));
      });

      hls.on(Hls.Events.BUFFER_APPENDED, () => {
        setState((prev) => ({ ...prev, isBuffering: false }));
      });

      hlsRef.current = hls;
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = src;
    } else {
      setState((prev) => ({
        ...prev,
        error: 'HLS not supported in this browser',
      }));
    }
  }, [src, autoplay, onError, onQualityChange]);

  /**
   * Play video
   */
  const play = useCallback(() => {
    videoRef.current
      ?.play()
      .then(() => {
        setState((prev) => ({ ...prev, isPlaying: true }));
        onPlay?.();
        trackEvent(analyticsEvents.PLAY, { videoId, currentTime: state.currentTime });
      })
      .catch((err) => {
        console.error('Play failed:', err);
      });
  }, [onPlay, videoId, state.currentTime]);

  /**
   * Pause video
   */
  const pause = useCallback(() => {
    videoRef.current?.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));
    onPause?.();
    trackEvent(analyticsEvents.PAUSE, { videoId, currentTime: state.currentTime });
  }, [onPause, videoId, state.currentTime]);

  /**
   * Toggle play/pause
   */
  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  /**
   * Seek to time
   */
  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setState((prev) => ({ ...prev, currentTime: time }));
      trackEvent(analyticsEvents.SEEK, { videoId, time });
    }
  }, [videoId]);

  /**
   * Set volume
   */
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (videoRef.current) {
      videoRef.current.volume = clampedVolume;
      setState((prev) => ({ ...prev, volume: clampedVolume, isMuted: clampedVolume === 0 }));
      storePreference(storageKeys.VOLUME, clampedVolume);
      trackEvent(analyticsEvents.VOLUME_CHANGE, { videoId, volume: clampedVolume });
    }
  }, [videoId]);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      setState((prev) => ({ ...prev, isMuted: newMuted }));
      trackEvent(analyticsEvents.VOLUME_CHANGE, { videoId, muted: newMuted });
    }
  }, [state.isMuted, videoId]);

  /**
   * Set playback speed
   */
  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setState((prev) => ({ ...prev, playbackRate: rate }));
      storePreference(storageKeys.PLAYBACK_RATE, rate);
      trackEvent(analyticsEvents.SPEED_CHANGE, { videoId, rate });
    }
  }, [videoId]);

  /**
   * Set quality
   */
  const setQuality = useCallback((quality: number | 'auto') => {
    if (!hlsRef.current) return;

    if (quality === 'auto') {
      hlsRef.current.currentLevel = -1;
    } else {
      const levelIndex = hlsRef.current.levels.findIndex((level) => level.height === quality);
      if (levelIndex !== -1) {
        hlsRef.current.currentLevel = levelIndex;
      }
    }

    setState((prev) => ({ ...prev, quality }));
    storePreference(storageKeys.QUALITY, quality);
    trackEvent(analyticsEvents.QUALITY_CHANGE, { videoId, quality });
  }, [videoId]);

  /**
   * Toggle fullscreen
   */
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen().catch((err) => {
        console.error('Fullscreen failed:', err);
      });
      trackEvent(analyticsEvents.FULLSCREEN_ENTER, { videoId });
    } else {
      document.exitFullscreen();
      trackEvent(analyticsEvents.FULLSCREEN_EXIT, { videoId });
    }
  }, [videoId]);

  /**
   * Toggle picture-in-picture
   */
  const togglePiP = useCallback(() => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
      trackEvent(analyticsEvents.PIP_EXIT, { videoId });
    } else {
      videoRef.current?.requestPictureInPicture().catch((err) => {
        console.error('PiP failed:', err);
      });
      trackEvent(analyticsEvents.PIP_ENTER, { videoId });
    }
  }, [videoId]);

  /**
   * Save playback progress
   */
  const saveProgress = useCallback(() => {
    if (!videoId || !videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;

    // Don't save if near the end
    if (duration - currentTime < 10) {
      localStorage.removeItem(`video_progress_${videoId}`);
      return;
    }

    localStorage.setItem(
      `video_progress_${videoId}`,
      JSON.stringify({
        currentTime,
        duration,
        timestamp: Date.now(),
      })
    );
  }, [videoId]);

  /**
   * Resume from saved progress
   */
  const resumeProgress = useCallback(() => {
    if (!videoId || !videoRef.current) return;

    try {
      const saved = localStorage.getItem(`video_progress_${videoId}`);
      if (!saved) return;

      const { currentTime, timestamp } = JSON.parse(saved);

      // Only resume if saved within 7 days
      const daysOld = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      if (daysOld < 7 && currentTime > 10) {
        seek(currentTime);
      }
    } catch (error) {
      console.error('Failed to resume progress:', error);
    }
  }, [videoId, seek]);

  /**
   * Track analytics event
   */
  const trackEvent = useCallback((eventName: string, data: Record<string, unknown>) => {
    // Send to backend analytics
    if (typeof window !== 'undefined' && videoId) {
      fetch('/api/v1/analytics/video-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          videoId,
          ...data,
          timestamp: Date.now(),
        }),
      }).catch((err) => {
        console.warn('Analytics tracking failed:', err);
      });
    }
  }, [videoId]);

  /**
   * Initialize player on mount
   */
  useEffect(() => {
    initializeHls();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (progressSaveInterval.current) {
        clearInterval(progressSaveInterval.current);
      }
    };
  }, [initializeHls]);

  /**
   * Set up video event listeners
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const buffered = video.buffered.length > 0 ? (video.buffered.end(0) / video.duration) * 100 : 0;
      setState((prev) => ({
        ...prev,
        currentTime: video.currentTime,
        buffered,
      }));
      onTimeUpdate?.(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setState((prev) => ({ ...prev, duration: video.duration }));
      resumeProgress();
    };

    const handleEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
      onEnded?.();
      trackEvent(analyticsEvents.ENDED, { videoId, duration: video.duration });
      if (videoId) {
        localStorage.removeItem(`video_progress_${videoId}`);
      }
    };

    const handleWaiting = () => {
      setState((prev) => ({ ...prev, isBuffering: true }));
      trackEvent(analyticsEvents.BUFFER_START, { videoId, currentTime: video.currentTime });
    };

    const handleCanPlay = () => {
      setState((prev) => ({ ...prev, isBuffering: false }));
      trackEvent(analyticsEvents.BUFFER_END, { videoId, currentTime: video.currentTime });
    };

    const handleFullscreenChange = () => {
      setState((prev) => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };

    const handlePiPChange = () => {
      setState((prev) => ({ ...prev, isPiP: !!document.pictureInPictureElement }));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('enterpictureinpicture', handlePiPChange);
    document.addEventListener('leavepictureinpicture', handlePiPChange);

    // Save progress every 5 seconds
    progressSaveInterval.current = setInterval(saveProgress, 5000);

    // Apply initial settings
    video.volume = state.volume;
    video.muted = state.isMuted;
    video.playbackRate = state.playbackRate;

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('enterpictureinpicture', handlePiPChange);
      document.removeEventListener('leavepictureinpicture', handlePiPChange);
      if (progressSaveInterval.current) {
        clearInterval(progressSaveInterval.current);
      }
    };
  }, [state.volume, state.isMuted, state.playbackRate, onTimeUpdate, onEnded, resumeProgress, saveProgress, trackEvent, videoId]);

  return {
    videoRef,
    state,
    controls: {
      play,
      pause,
      togglePlay,
      seek,
      setVolume,
      toggleMute,
      setPlaybackRate,
      setQuality,
      toggleFullscreen,
      togglePiP,
    },
  };
}
