/**
 * Attribution data for Unsplash photos
 * While Unsplash license doesn't require attribution, it's good practice
 */

import type { UnsplashPhotoMetadata } from './types/unsplash.types';

/**
 * Photo metadata including attribution information
 */
export const PHOTO_METADATA: Record<string, UnsplashPhotoMetadata> = {
  '1497366216548-37526070297c': {
    id: '1497366216548-37526070297c',
    description: 'Modern office workspace with laptop',
    photographer: 'Unsplash Community',
    photographerUsername: 'unsplash',
  },
  '1498050108023-c5249f4df085': {
    id: '1498050108023-c5249f4df085',
    description: 'Developer coding on laptop',
    photographer: 'Unsplash Community',
    photographerUsername: 'unsplash',
  },
  '1522071820081-009f0129c71c': {
    id: '1522071820081-009f0129c71c',
    description: 'Team collaboration and brainstorming',
    photographer: 'Unsplash Community',
    photographerUsername: 'unsplash',
  },
  '1484480974693-6ca0a78fb36b': {
    id: '1484480974693-6ca0a78fb36b',
    description: 'Professional workspace with laptop and coffee',
    photographer: 'Unsplash Community',
    photographerUsername: 'unsplash',
  },
  '1497366412874-3415097a27e7': {
    id: '1497366412874-3415097a27e7',
    description: 'Startup office environment',
    photographer: 'Unsplash Community',
    photographerUsername: 'unsplash',
  },
  '1460925895917-afdab827c52f': {
    id: '1460925895917-afdab827c52f',
    description: 'Data visualization and analytics',
    photographer: 'Unsplash Community',
    photographerUsername: 'unsplash',
  },
  '1504384308090-c894fdcc538d': {
    id: '1504384308090-c894fdcc538d',
    description: 'Modern workspace setup',
    photographer: 'Unsplash Community',
    photographerUsername: 'unsplash',
  },
  '1519389950473-47ba0277781c': {
    id: '1519389950473-47ba0277781c',
    description: 'Technology and innovation',
    photographer: 'Unsplash Community',
    photographerUsername: 'unsplash',
  },
  '1517245386807-bb43f82c33c4': {
    id: '1517245386807-bb43f82c33c4',
    description: 'Business meeting and discussion',
    photographer: 'Unsplash Community',
    photographerUsername: 'unsplash',
  },
};

/**
 * Get attribution information for a photo
 */
export function getPhotoAttribution(photoId: string): UnsplashPhotoMetadata | null {
  return PHOTO_METADATA[photoId] || null;
}

/**
 * Get photographer profile URL
 */
export function getPhotographerUrl(username: string): string {
  return `https://unsplash.com/@${username}?utm_source=ainative&utm_medium=referral`;
}

/**
 * Get photo URL on Unsplash
 */
export function getPhotoUrl(photoId: string): string {
  return `https://unsplash.com/photos/${photoId}?utm_source=ainative&utm_medium=referral`;
}

/**
 * Generate attribution text
 */
export function getAttributionText(photoId: string): string | null {
  const metadata = getPhotoAttribution(photoId);
  if (!metadata || !metadata.photographer) {
    return null;
  }

  return `Photo by ${metadata.photographer} on Unsplash`;
}

/**
 * Generate attribution HTML
 */
export function getAttributionHTML(photoId: string): string | null {
  const metadata = getPhotoAttribution(photoId);
  if (!metadata || !metadata.photographer || !metadata.photographerUsername) {
    return null;
  }

  const photographerUrl = getPhotographerUrl(metadata.photographerUsername);
  const photoUrl = getPhotoUrl(photoId);

  return `<a href="${photographerUrl}" target="_blank" rel="noopener noreferrer">${metadata.photographer}</a> on <a href="${photoUrl}" target="_blank" rel="noopener noreferrer">Unsplash</a>`;
}
