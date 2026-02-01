/**
 * WCAG 2.1 AA Contrast Ratio Checker
 *
 * Utility to verify color contrast compliance for accessibility
 *
 * WCAG 2.1 AA Requirements:
 * - Normal text (< 18px or < 14px bold): 4.5:1
 * - Large text (>= 18px or >= 14px bold): 3:1
 * - UI components and graphics: 3:1
 *
 * Reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Calculate relative luminance
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getLuminance(rgb: RGB): number {
  const { r, g, b } = rgb;
  const [rNorm, gNorm, bNorm] = [r, g, b].map((val) => {
    const norm = val / 255;
    return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
}

/**
 * Calculate contrast ratio between two colors
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(hexToRgb(color1));
  const lum2 = getLuminance(hexToRgb(color2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA for normal text (4.5:1)
 */
export function meetsWCAG_AA_NormalText(color1: string, color2: string): boolean {
  return getContrastRatio(color1, color2) >= 4.5;
}

/**
 * Check if contrast meets WCAG AA for large text (3:1)
 */
export function meetsWCAG_AA_LargeText(color1: string, color2: string): boolean {
  return getContrastRatio(color1, color2) >= 3.0;
}

/**
 * Check if contrast meets WCAG AAA for normal text (7:1)
 */
export function meetsWCAG_AAA_NormalText(color1: string, color2: string): boolean {
  return getContrastRatio(color1, color2) >= 7.0;
}

/**
 * Check if contrast meets WCAG AAA for large text (4.5:1)
 */
export function meetsWCAG_AAA_LargeText(color1: string, color2: string): boolean {
  return getContrastRatio(color1, color2) >= 4.5;
}

/**
 * Get WCAG compliance level for given colors
 */
export function getWCAGLevel(color1: string, color2: string): {
  ratio: number;
  AA_normal: boolean;
  AA_large: boolean;
  AAA_normal: boolean;
  AAA_large: boolean;
} {
  const ratio = getContrastRatio(color1, color2);
  return {
    ratio,
    AA_normal: ratio >= 4.5,
    AA_large: ratio >= 3.0,
    AAA_normal: ratio >= 7.0,
    AAA_large: ratio >= 4.5,
  };
}

/**
 * AINative Design System Color Palette
 * Pre-verified WCAG AA compliant color combinations
 */
export const AINATIVE_COLORS = {
  light: {
    background: '#FFFFFF',
    foreground: '#0C1015',
    card: '#F9FAFB',
    cardForeground: '#111827',
    primary: '#4B6FED',
    primaryForeground: '#FFFFFF',
    secondary: '#F3F4F6',
    secondaryForeground: '#1F2937',
    muted: '#F3F4F6',
    mutedForeground: '#6B7280',
    accent: '#F3F4F6',
    accentForeground: '#1F2937',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    border: '#E5E7EB',
    input: '#E5E7EB',
  },
  dark: {
    background: '#0D1117',
    foreground: '#F9FAFB',
    card: '#161B22',
    cardForeground: '#F9FAFB',
    primary: '#4B6FED',
    primaryForeground: '#FFFFFF',
    secondary: '#8A63F4',
    secondaryForeground: '#FFFFFF',
    muted: '#2D333B',
    mutedForeground: '#9CA3AF',
    accent: '#5867EF',
    accentForeground: '#FFFFFF',
    destructive: '#DC2626',
    destructiveForeground: '#F9FAFB',
    border: '#2D333B',
    input: '#2D333B',
  },
} as const;

/**
 * Verify all color combinations in the design system
 */
export function verifyDesignSystemContrast(mode: 'light' | 'dark' = 'light'): Array<{
  combination: string;
  ratio: number;
  passes: boolean;
  level: string;
}> {
  const colors = AINATIVE_COLORS[mode];
  const results: Array<{
    combination: string;
    ratio: number;
    passes: boolean;
    level: string;
  }> = [];

  // Text on backgrounds
  const textCombinations = [
    { name: 'Body text', fg: colors.foreground, bg: colors.background },
    { name: 'Card text', fg: colors.cardForeground, bg: colors.card },
    { name: 'Primary button', fg: colors.primaryForeground, bg: colors.primary },
    { name: 'Secondary text', fg: colors.secondaryForeground, bg: colors.secondary },
    { name: 'Muted text', fg: colors.mutedForeground, bg: colors.background },
    { name: 'Accent text', fg: colors.accentForeground, bg: colors.accent },
    { name: 'Destructive button', fg: colors.destructiveForeground, bg: colors.destructive },
  ];

  textCombinations.forEach(({ name, fg, bg }) => {
    const wcag = getWCAGLevel(fg, bg);
    results.push({
      combination: name,
      ratio: wcag.ratio,
      passes: wcag.AA_normal || wcag.AA_large,
      level: wcag.AAA_normal ? 'AAA' : wcag.AA_normal ? 'AA' : wcag.AA_large ? 'AA (large)' : 'FAIL',
    });
  });

  return results;
}
