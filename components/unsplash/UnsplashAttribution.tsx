/**
 * Unsplash Attribution Component
 * Displays photographer credit for Unsplash images
 */

'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

export interface UnsplashAttributionProps {
  /** Photo ID from Unsplash */
  photoId: string;
  /** Photographer name */
  photographer?: string;
  /** URL to photographer's Unsplash profile */
  photographerUrl?: string;
  /** URL to the photo on Unsplash */
  photoUrl?: string;
  /** Display style */
  variant?: 'inline' | 'overlay' | 'footer';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Unsplash Attribution Component
 */
export const UnsplashAttribution: React.FC<UnsplashAttributionProps> = ({
  photographer = 'Unsplash',
  photographerUrl,
  photoUrl,
  variant = 'inline',
  className = '',
}) => {
  const baseClasses = 'text-xs text-gray-400 flex items-center gap-1';

  const variantClasses = {
    inline: 'py-1',
    overlay: 'absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded backdrop-blur-sm',
    footer: 'border-t border-gray-800 pt-2 mt-2',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <div className={combinedClasses}>
      <span>Photo by</span>
      {photographerUrl ? (
        <a
          href={photographerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4B6FED] hover:text-[#3D5FCE] underline inline-flex items-center gap-1 transition-colors"
        >
          {photographer}
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-gray-300">{photographer}</span>
      )}
      <span>on</span>
      {photoUrl ? (
        <a
          href={photoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4B6FED] hover:text-[#3D5FCE] underline inline-flex items-center gap-1 transition-colors"
        >
          Unsplash
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-gray-300">Unsplash</span>
      )}
    </div>
  );
};

export default UnsplashAttribution;
