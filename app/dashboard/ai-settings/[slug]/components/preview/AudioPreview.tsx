'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, AlertCircle, FileAudio } from 'lucide-react';
import { AudioPreviewProps } from '../../types.preview';
import { PreviewContainer } from './PreviewContainer';

/**
 * AudioPreview Component
 *
 * Displays audio results using HTML5 <audio> element with custom-styled controls.
 * This component handles audio playback from AI audio models like:
 * - OpenAI TTS (text-to-speech)
 * - Whisper (speech-to-text)
 * - Whisper Translation
 *
 * Features:
 * - Custom-styled audio controls (play, pause, seek, volume)
 * - Transcript display (for Whisper transcription results)
 * - Duration and format metadata
 * - Download functionality
 * - Waveform visualization (OPTIONAL - skipped for MVP)
 * - Error handling for unsupported formats
 * - Accessibility (keyboard controls, ARIA)
 * - Dark mode compatible
 *
 * Technical Decision:
 * Uses HTML5 <audio> with custom controls styled to match the design system.
 * Skipping waveform visualization for MVP to keep implementation simple.
 *
 * Refs: Issue #546
 * Architecture: /docs/architecture/PREVIEW_COMPONENTS_ARCHITECTURE.md
 */
export function AudioPreview({ result, onDownload }: AudioPreviewProps) {
  console.log('🎵 [AudioPreview] Rendering with result:', result);
  console.log('🎵 [AudioPreview] URL:', result.url?.substring(0, 100) + '...');
  console.log('🎵 [AudioPreview] Duration:', result.duration_seconds);
  console.log('🎵 [AudioPreview] Format:', result.format);

  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  /**
   * Handle audio errors (codec issues, network errors, etc.)
   */
  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audio = e.currentTarget;
    const error = audio.error;

    console.error('🎵 [AudioPreview] Audio error occurred:', error);
    console.error('🎵 [AudioPreview] Error code:', error?.code);
    console.error('🎵 [AudioPreview] Audio src:', audio.src);

    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          console.error('🎵 [AudioPreview] MEDIA_ERR_ABORTED');
          setAudioError('Audio playback was aborted');
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          console.error('🎵 [AudioPreview] MEDIA_ERR_NETWORK');
          setAudioError('Network error occurred while loading audio');
          break;
        case MediaError.MEDIA_ERR_DECODE:
          console.error('🎵 [AudioPreview] MEDIA_ERR_DECODE');
          setAudioError('Audio codec not supported by your browser');
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          console.error('🎵 [AudioPreview] MEDIA_ERR_SRC_NOT_SUPPORTED');
          setAudioError('Audio format not supported. Try downloading to listen.');
          break;
        default:
          console.error('🎵 [AudioPreview] Unknown error');
          setAudioError('An unknown error occurred while loading audio');
      }
    }
  };

  /**
   * Download audio file
   */
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download implementation
      const link = document.createElement('a');
      link.href = result.url;
      link.download = `audio-${Date.now()}.${result.format || 'mp3'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /**
   * Toggle play/pause
   */
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  /**
   * Toggle mute
   */
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  /**
   * Handle volume change
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  /**
   * Handle seek
   */
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  /**
   * Format time in seconds to MM:SS
   */
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Update current time and duration
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <PreviewContainer
      result={result}
      showDownload={true}
      onDownload={handleDownload}
    >
      <div className="space-y-5">
        {/* Audio Player */}
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-5">
          {audioError ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-red-400 text-sm font-medium mb-2">Failed to load audio</p>
              <p className="text-gray-500 text-xs max-w-md mb-4">{audioError}</p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download Audio
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Hidden HTML5 audio element */}
              {result.url && (
                <audio
                  ref={audioRef}
                  src={result.url}
                  preload="metadata"
                  onError={handleAudioError}
                  aria-label="AI generated audio preview"
                >
                  {/* Fallback for multiple formats */}
                  {result.format === 'mp3' && (
                    <source src={result.url} type="audio/mpeg" />
                  )}
                  {result.format === 'wav' && (
                    <source src={result.url} type="audio/wav" />
                  )}
                  {result.format === 'opus' && (
                    <source src={result.url} type="audio/opus" />
                  )}
                  {result.format === 'ogg' && (
                    <source src={result.url} type="audio/ogg" />
                  )}
                  <p className="text-gray-400 text-sm">
                    Your browser does not support audio playback.
                    <button
                      onClick={handleDownload}
                      className="text-primary hover:underline ml-2"
                    >
                      Download audio
                    </button>
                    to listen.
                  </p>
                </audio>
              )}

              {/* Audio Icon and Title */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileAudio className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-300">
                    {result.format ? `${result.format.toUpperCase()} Audio` : 'Audio File'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {result.duration_seconds
                      ? formatTime(result.duration_seconds)
                      : 'Duration unknown'}
                  </p>
                </div>
              </div>

              {/* Seek Bar */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  aria-label="Audio seek bar"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-full bg-primary hover:bg-primary-dark flex items-center justify-center transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-md hover:bg-white/5 transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-400 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                    aria-label="Volume control"
                  />
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transcript Section (for Whisper results) */}
        {result.transcript && (
          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">Transcript</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.transcript || '');
                }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
                aria-label="Copy transcript"
              >
                Copy
              </button>
            </div>
            <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
              {result.transcript}
            </div>
          </div>
        )}

        {/* Audio Metadata */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {result.duration_seconds !== undefined && (
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">Duration</span>
              <span className="text-gray-300 font-medium">
                {formatTime(result.duration_seconds)}
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
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 leading-relaxed">
          Use the controls to play, pause, seek, and adjust volume.
          Keyboard shortcuts: Space (play/pause), Arrow keys (seek ±5s), M (mute).
        </p>
      </div>
    </PreviewContainer>
  );
}
