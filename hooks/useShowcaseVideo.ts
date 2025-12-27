import { useState, useEffect, useRef, useCallback } from 'react';

export interface VideoAnnotation {
  id: string;
  timestamp: number; // in seconds
  duration: number; // how long to show the annotation
  title: string;
  description: string;
  type: 'feature' | 'tech' | 'code' | 'highlight';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  codeSnippet?: string;
  language?: string;
}

export interface VideoQuality {
  label: string;
  url: string;
  resolution: string;
}

export interface UseShowcaseVideoProps {
  videoUrl: string;
  qualities?: VideoQuality[];
  annotations?: VideoAnnotation[];
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export interface UseShowcaseVideoReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentQuality: VideoQuality | null;
  activeAnnotations: VideoAnnotation[];
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  changeQuality: (quality: VideoQuality) => void;
  skipToAnnotation: (annotationId: string) => void;
}

export function useShowcaseVideo({
  videoUrl: _videoUrl,
  qualities = [],
  annotations = [],
  autoPlay = false,
  muted = false,
  loop = false,
}: UseShowcaseVideoProps): UseShowcaseVideoReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [currentQuality, setCurrentQuality] = useState<VideoQuality | null>(
    qualities.length > 0 ? qualities[0] : null
  );
  const [activeAnnotations, setActiveAnnotations] = useState<VideoAnnotation[]>([]);

  // Initialize video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
    video.loop = loop;

    if (autoPlay) {
      video.play().catch(error => {
        console.error('Auto-play failed:', error);
      });
    }
  }, [autoPlay, muted, loop]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsPaused(true);
    };

    const handleVolumeChange = () => {
      setVolumeState(video.volume);
      setIsMuted(video.muted);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Update active annotations based on current time
  useEffect(() => {
    const active = annotations.filter(annotation => {
      const endTime = annotation.timestamp + annotation.duration;
      return currentTime >= annotation.timestamp && currentTime < endTime;
    });
    setActiveAnnotations(active);
  }, [currentTime, annotations]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      // Only handle shortcuts if video is in view
      const video = videoRef.current;
      const rect = video.getBoundingClientRect();
      const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (!isInView) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(duration, currentTime + 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  // These callbacks are stable - no need to include in deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, duration, volume]);

  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Play failed:', error);
      });
    }
  }, []);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(error => {
          console.error('Fullscreen failed:', error);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (videoRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, vol));
      videoRef.current.volume = clampedVolume;
    }
  }, []);

  const changeQuality = useCallback((quality: VideoQuality) => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;

      setCurrentQuality(quality);
      videoRef.current.src = quality.url;
      videoRef.current.currentTime = currentTime;

      if (wasPlaying) {
        videoRef.current.play().catch(error => {
          console.error('Play after quality change failed:', error);
        });
      }
    }
  }, []);

  const skipToAnnotation = useCallback((annotationId: string) => {
    const annotation = annotations.find(a => a.id === annotationId);
    if (annotation) {
      seek(annotation.timestamp);
    }
  }, [annotations, seek]);

  return {
    videoRef,
    isPlaying,
    isPaused,
    isLoading,
    isMuted,
    isFullscreen,
    currentTime,
    duration,
    volume,
    currentQuality,
    activeAnnotations,
    play,
    pause,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    seek,
    setVolume,
    changeQuality,
    skipToAnnotation,
  };
}
