/**
 * Unsplash Image Component
 * Enhanced image component with automatic attribution and error handling
 */

'use client';

import React, { useState } from 'react';
import { UnsplashAttribution } from './UnsplashAttribution';
import { unsplashService } from '@/services/unsplashService';
import type { UnsplashImage as UnsplashImageType } from '@/services/types/unsplash.types';

export interface UnsplashImageProps {
  /** Content ID for image selection */
  id: number;
  /** Image width */
  width: number;
  /** Image height */
  height: number;
  /** Alt text for accessibility */
  alt: string;
  /** Show attribution */
  showAttribution?: boolean;
  /** Attribution variant */
  attributionVariant?: 'inline' | 'overlay' | 'footer';
  /** Image loading strategy */
  loading?: 'lazy' | 'eager';
  /** Additional CSS classes */
  className?: string;
  /** Wrapper classes */
  wrapperClassName?: string;
  /** Quality (1-100) */
  quality?: number;
  /** Error callback */
  onError?: () => void;
  /** Load callback */
  onLoad?: () => void;
}

/**
 * Unsplash Image Component with attribution
 */
export const UnsplashImage: React.FC<UnsplashImageProps> = ({
  id,
  width,
  height,
  alt,
  showAttribution = false,
  attributionVariant = 'overlay',
  loading = 'lazy',
  className = '',
  wrapperClassName = '',
  quality,
  onError,
  onLoad,
}) => {
  const [imageData, setImageData] = useState<UnsplashImageType | null>(null);
  const [hasError, setHasError] = useState(false);

  // Get image URL synchronously for immediate render
  const imageUrl = unsplashService.getImageUrlSync(id, width, height, quality);

  // Load full image data for attribution (async)
  React.useEffect(() => {
    if (showAttribution) {
      unsplashService
        .getImage({ id, width, height, quality })
        .then(setImageData)
        .catch(err => {
          console.error('[UnsplashImage] Failed to load image data:', err);
        });
    }
  }, [id, width, height, quality, showAttribution]);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleLoad = () => {
    onLoad?.();
  };

  return (
    <div className={`relative ${wrapperClassName}`}>
      <img
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        className={`${className} ${hasError ? 'opacity-50' : ''}`}
      />
      {showAttribution && imageData && (
        <UnsplashAttribution
          photoId={imageData.photoId}
          photographer={imageData.photographer}
          photographerUrl={imageData.photographerUrl}
          photoUrl={imageData.photoUrl}
          variant={attributionVariant}
        />
      )}
    </div>
  );
};

export default UnsplashImage;
