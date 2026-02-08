/**
 * Thumbnail Generator Utility
 * Generates SVG data URL placeholders for AI model thumbnails
 * Reference: docs/ai-models/THUMBNAIL_STRATEGY.md
 */

import { ModelCategory } from '../model-aggregator';

/**
 * Provider brand colors for gradient placeholders
 */
export const PROVIDER_COLORS: Record<string, { primary: string; secondary: string }> = {
  OpenAI: {
    primary: '#10A37F',
    secondary: '#1A7F64',
  },
  Anthropic: {
    primary: '#D97757',
    secondary: '#C4613D',
  },
  Alibaba: {
    primary: '#FF6A00',
    secondary: '#FF8C00',
  },
  Qwen: {
    primary: '#722ED1',
    secondary: '#531DAB',
  },
  Seedance: {
    primary: '#52C41A',
    secondary: '#389E0D',
  },
  Sora: {
    primary: '#1890FF',
    secondary: '#096DD9',
  },
  CogVideo: {
    primary: '#FA541C',
    secondary: '#D4380D',
  },
  BAAI: {
    primary: '#13C2C2',
    secondary: '#08979C',
  },
  Generic: {
    primary: '#8C8C8C',
    secondary: '#595959',
  },
  'Generic T2V': {
    primary: '#8C8C8C',
    secondary: '#595959',
  },
};

/**
 * Category gradient colors (fallback when provider is unknown)
 */
export const CATEGORY_COLORS: Record<ModelCategory, { primary: string; secondary: string }> = {
  All: {
    primary: '#8C8C8C',
    secondary: '#595959',
  },
  Coding: {
    primary: '#667EEA',
    secondary: '#764BA2',
  },
  Image: {
    primary: '#F093FB',
    secondary: '#F5576C',
  },
  Video: {
    primary: '#4FACFE',
    secondary: '#00F2FE',
  },
  Audio: {
    primary: '#43E97B',
    secondary: '#38F9D7',
  },
  Embedding: {
    primary: '#FA709A',
    secondary: '#FEE140',
  },
};

/**
 * Generate provider initials from provider name
 */
function getProviderInitials(provider: string): string {
  if (!provider) return '?';

  // Special cases
  const specialCases: Record<string, string> = {
    OpenAI: 'OAI',
    Anthropic: 'ANT',
    BAAI: 'BAAI',
    CogVideo: 'COG',
    'Generic T2V': 'T2V',
  };

  if (specialCases[provider]) {
    return specialCases[provider];
  }

  // Default: Take first 2-3 letters
  return provider.slice(0, Math.min(3, provider.length)).toUpperCase();
}

/**
 * Generate SVG data URL for provider-branded placeholder
 */
function generateProviderPlaceholder(
  provider: string,
  initials?: string
): string {
  const colors = PROVIDER_COLORS[provider] || PROVIDER_COLORS.Generic;
  const displayInitials = initials || getProviderInitials(provider);

  const svg = `
    <svg width="640" height="360" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${provider}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#grad-${provider})"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="72"
        font-weight="bold"
        fill="white"
        fill-opacity="0.3"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${displayInitials}
      </text>
    </svg>
  `.trim();

  // Convert SVG to base64 data URL
  const base64 = typeof window !== 'undefined'
    ? btoa(svg)
    : Buffer.from(svg).toString('base64');

  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate SVG data URL for category-based placeholder
 */
function generateCategoryPlaceholder(category: ModelCategory): string {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.All;
  const categoryIcon = getCategoryIcon(category);

  const svg = `
    <svg width="640" height="360" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${category}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#grad-${category})"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="60"
        font-weight="bold"
        fill="white"
        fill-opacity="0.3"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${categoryIcon}
      </text>
    </svg>
  `.trim();

  // Convert SVG to base64 data URL
  const base64 = typeof window !== 'undefined'
    ? btoa(svg)
    : Buffer.from(svg).toString('base64');

  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Get icon/text for category placeholder
 */
function getCategoryIcon(category: ModelCategory): string {
  const icons: Record<ModelCategory, string> = {
    All: 'AI',
    Coding: '</>', // Code brackets
    Image: '🎨',
    Video: '🎬',
    Audio: '🎵',
    Embedding: '🔢',
  };

  return icons[category] || 'AI';
}

/**
 * Main function: Get thumbnail URL with three-tier fallback
 * 1. Use model's thumbnail_url if available
 * 2. Generate provider-branded placeholder
 * 3. Generate category-based placeholder
 */
export function getThumbnailUrl(params: {
  thumbnailUrl?: string;
  provider?: string;
  category?: ModelCategory;
  initials?: string;
}): string {
  const { thumbnailUrl, provider, category, initials } = params;

  // Tier 1: Use provided thumbnail URL
  if (thumbnailUrl && thumbnailUrl.trim() !== '') {
    return thumbnailUrl;
  }

  // Tier 2: Generate provider-branded placeholder
  if (provider && provider.trim() !== '') {
    return generateProviderPlaceholder(provider, initials);
  }

  // Tier 3: Generate category-based placeholder
  if (category) {
    return generateCategoryPlaceholder(category);
  }

  // Final fallback: Generic placeholder
  return generateProviderPlaceholder('Generic');
}

/**
 * Generate provider-specific placeholder (for direct use)
 */
export function generateProviderThumbnail(
  provider: string,
  initials?: string
): string {
  return generateProviderPlaceholder(provider, initials);
}

/**
 * Generate category-specific placeholder (for direct use)
 */
export function generateCategoryThumbnail(category: ModelCategory): string {
  return generateCategoryPlaceholder(category);
}

/**
 * Check if URL is a data URL (placeholder)
 */
export function isPlaceholderThumbnail(url: string): boolean {
  return url.startsWith('data:image/svg+xml');
}

/**
 * Get thumbnail type for analytics
 */
export function getThumbnailType(url: string): 'real' | 'provider-placeholder' | 'category-placeholder' {
  if (!url || url.trim() === '') return 'category-placeholder';
  if (isPlaceholderThumbnail(url)) {
    // Check if it contains provider initials (provider placeholder) or category icon
    return url.includes('font-size="72"') ? 'provider-placeholder' : 'category-placeholder';
  }
  return 'real';
}
