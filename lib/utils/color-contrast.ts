/**
 * Color Contrast Utilities
 *
 * Provides WCAG 2.1 contrast ratio calculations and accessibility validation.
 *
 * @see https://www.w3.org/TR/WCAG21/#contrast-minimum
 * @see https://www.w3.org/TR/WCAG21/#contrast-enhanced
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert hex color to RGB
 *
 * @param hex - Hex color string (with or without #)
 * @returns RGB object
 * @throws Error if hex format is invalid
 *
 * @example
 * hexToRgb('#4B6FED') // { r: 75, g: 111, b: 237 }
 * hexToRgb('FFFFFF')  // { r: 255, g: 255, b: 255 }
 */
export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '');

  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
}

/**
 * Convert RGB to hex color
 *
 * @param rgb - RGB object
 * @returns Hex color string with # prefix
 *
 * @example
 * rgbToHex({ r: 75, g: 111, b: 237 }) // '#4b6fed'
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Calculate relative luminance of a color
 *
 * Uses WCAG 2.1 formula for relative luminance calculation.
 *
 * @param rgb - RGB color object
 * @returns Relative luminance value (0.0 - 1.0)
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(rgb: RGB): number {
  // Convert RGB to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  // Apply gamma correction
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate luminance using WCAG formula
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 *
 * @param color1 - First color (hex format)
 * @param color2 - Second color (hex format)
 * @returns Contrast ratio (1:1 to 21:1)
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 *
 * @example
 * getContrastRatio('#FFFFFF', '#000000') // 21 (maximum contrast)
 * getContrastRatio('#4B6FED', '#FFFFFF') // ~4.8 (meets AA)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG 2.1 AA standard
 *
 * WCAG AA Requirements:
 * - Normal text: 4.5:1
 * - Large text (18pt+ or 14pt+ bold): 3:1
 *
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param textSize - Text size category
 * @returns True if meets AA standard
 *
 * @see https://www.w3.org/TR/WCAG21/#contrast-minimum
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  textSize: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = textSize === 'large' ? 3.0 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Check if color combination meets WCAG 2.1 AAA standard
 *
 * WCAG AAA Requirements:
 * - Normal text: 7:1
 * - Large text (18pt+ or 14pt+ bold): 4.5:1
 *
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param textSize - Text size category
 * @returns True if meets AAA standard
 *
 * @see https://www.w3.org/TR/WCAG21/#contrast-enhanced
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  textSize: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = textSize === 'large' ? 4.5 : 7.0;
  return ratio >= requiredRatio;
}

/**
 * Get accessibility rating for a color combination
 *
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @returns Accessibility rating object
 */
export function getAccessibilityRating(foreground: string, background: string) {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio: Math.round(ratio * 10) / 10,
    AA: {
      normal: meetsWCAGAA(foreground, background, 'normal'),
      large: meetsWCAGAA(foreground, background, 'large'),
    },
    AAA: {
      normal: meetsWCAGAAA(foreground, background, 'normal'),
      large: meetsWCAGAAA(foreground, background, 'large'),
    },
  };
}
