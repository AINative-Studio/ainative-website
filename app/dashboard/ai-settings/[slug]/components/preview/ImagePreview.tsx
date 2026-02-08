'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ZoomIn, ZoomOut, Maximize2, RotateCcw, Loader2 } from 'lucide-react';
import { ImageResult } from '../../types.preview';
import { PreviewContainer } from './PreviewContainer';

/**
 * ImagePreview Component
 *
 * Full-featured image viewer with:
 * - Zoom controls (1x, 1.5x, 2x, 4x)
 * - Pan on drag when zoomed
 * - Loading skeleton
 * - Download functionality
 * - Dimensions and format metadata
 * - Error handling
 *
 * Uses CSS transforms for performant zoom/pan (no re-renders).
 *
 * Usage:
 * <ImagePreview result={imageResult} />
 *
 * Refs: Issue #546
 */

interface ImagePreviewProps {
  result: ImageResult;
}

const ZOOM_LEVELS = [1, 1.5, 2, 4] as const;
type ZoomLevel = typeof ZOOM_LEVELS[number];

export function ImagePreview({ result }: ImagePreviewProps) {
  const [zoom, setZoom] = useState<ZoomLevel>(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Reset pan when zoom changes
   */
  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [zoom]);

  /**
   * Handle image load success
   */
  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  /**
   * Handle image load error
   */
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  /**
   * Handle download
   */
  const handleDownload = async () => {
    try {
      const response = await fetch(result.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${Date.now()}.${result.format || 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  /**
   * Zoom to specific level
   */
  const handleZoomTo = (level: ZoomLevel) => {
    setZoom(level);
  };

  /**
   * Reset zoom and pan
   */
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  /**
   * Start dragging (only when zoomed)
   */
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
      e.preventDefault();
    }
  };

  /**
   * Handle drag movement
   */
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging && zoom > 1) {
      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };

      // Constrain pan to image boundaries
      const container = containerRef.current;
      const image = imageRef.current;

      if (container && image) {
        const containerRect = container.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();

        const maxPanX = Math.max(0, (imageRect.width - containerRect.width) / 2);
        const maxPanY = Math.max(0, (imageRect.height - containerRect.height) / 2);

        newPan.x = Math.max(-maxPanX, Math.min(maxPanX, newPan.x));
        newPan.y = Math.max(-maxPanY, Math.min(maxPanY, newPan.y));
      }

      setPan(newPan);
    }
  };

  /**
   * Stop dragging
   */
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /**
   * Handle mouse leave (stop dragging)
   */
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  return (
    <PreviewContainer
      result={result}
      showDownload
      onDownload={handleDownload}
      customActions={
        <div className="flex items-center gap-1">
          {/* Zoom Level Buttons */}
          {ZOOM_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => handleZoomTo(level)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                zoom === level
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              aria-label={`Zoom to ${level}x`}
            >
              {level}x
            </button>
          ))}

          {/* Reset Button */}
          {(zoom > 1 || pan.x !== 0 || pan.y !== 0) && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors group"
              aria-label="Reset zoom and pan"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          )}
        </div>
      }
    >
      {/* Image Metadata */}
      {(result.width || result.height || result.format) && (
        <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
          {result.width && result.height && (
            <span>
              Dimensions: {result.width} x {result.height}px
            </span>
          )}
          {result.format && (
            <span className="uppercase">Format: {result.format}</span>
          )}
        </div>
      )}

      {/* Image Container */}
      <div
        ref={containerRef}
        className={`relative w-full bg-white/[0.02] rounded-lg overflow-hidden ${
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        style={{ minHeight: '400px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Loading Skeleton */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white/[0.02]"
            >
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-sm text-gray-400">Loading image...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <ZoomOut className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-sm text-red-400">Failed to load image</p>
              <p className="text-xs text-gray-500">The image URL may be invalid or expired</p>
            </div>
          </div>
        )}

        {/* Image */}
        <motion.div
          className="flex items-center justify-center w-full h-full min-h-[400px]"
          animate={{
            scale: zoom,
            x: pan.x,
            y: pan.y,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          <img
            ref={imageRef}
            src={result.url}
            alt={result.alt_text || 'Generated image'}
            className="max-w-full max-h-[600px] object-contain select-none"
            onLoad={handleImageLoad}
            onError={handleImageError}
            draggable={false}
            style={{
              display: isLoading ? 'none' : 'block',
            }}
          />
        </motion.div>

        {/* Zoom Hint */}
        {zoom > 1 && !isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white"
          >
            Drag to pan
          </motion.div>
        )}
      </div>

      {/* Alt Text / Caption */}
      {result.alt_text && (
        <div className="mt-4 p-3 bg-white/[0.02] border border-white/10 rounded-lg">
          <p className="text-sm text-gray-300 italic">{result.alt_text}</p>
        </div>
      )}
    </PreviewContainer>
  );
}
