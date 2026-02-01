/**
 * Test Suite: CSS Variable Migration (Issue #501)
 *
 * Purpose: Verify Vite-specific CSS variables are properly migrated to Next.js/Tailwind
 *
 * Test Coverage:
 * 1. CSS variable existence and values
 * 2. Tailwind design token mappings
 * 3. Color value consistency
 * 4. Spacing and sizing values
 * 5. Responsive behavior
 * 6. Dark mode support
 *
 * @see https://github.com/ainative/ainative-website-nextjs-staging/issues/501
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('CSS Variable Migration - Issue #501', () => {
  let globalsCssContent: string;
  let tailwindConfigContent: string;

  beforeAll(() => {
    // Read files for testing
    const globalsCssPath = path.join(process.cwd(), 'app/globals.css');
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');

    globalsCssContent = fs.readFileSync(globalsCssPath, 'utf-8');
    tailwindConfigContent = fs.readFileSync(tailwindConfigPath, 'utf-8');
  });

  describe('Vite Variable Audit', () => {
    it('should identify all Vite-specific CSS variables', () => {
      const viteVariables = [
        '--vite-bg',
        '--vite-surface',
        '--vite-border',
        '--vite-border-hover',
        '--vite-primary',
        '--vite-primary-hover',
      ];

      viteVariables.forEach((varName) => {
        expect(globalsCssContent).toContain(varName);
      });
    });

    it('should map Vite variables to semantic CSS variables', () => {
      // Vite variables should have Next.js equivalents
      const mappings = {
        '--vite-bg': '--background',
        '--vite-surface': '--card',
        '--vite-border': '--border',
        '--vite-primary': '--primary',
      };

      Object.entries(mappings).forEach(([vite, nextjs]) => {
        expect(globalsCssContent).toContain(vite);
        expect(globalsCssContent).toContain(nextjs);
      });
    });
  });

  describe('Color Value Consistency', () => {
    it('should maintain exact color values from Vite design system', () => {
      const expectedColors = {
        '#0D1117': 'Vite background color',
        '#161B22': 'Vite surface color',
        '#2D333B': 'Vite border color',
        '#4B6FED': 'Primary brand color',
        '#3A56D3': 'Primary hover color',
      };

      Object.entries(expectedColors).forEach(([color, description]) => {
        expect(globalsCssContent).toContain(color);
      });
    });

    it('should define AINative brand colors correctly', () => {
      const brandColors = [
        { name: '--ainative-primary', value: '#4B6FED' },
        { name: '--ainative-primary-dark', value: '#3955B8' },
        { name: '--ainative-secondary', value: '#338585' },
        { name: '--ainative-secondary-dark', value: '#1A7575' },
        { name: '--ainative-accent', value: '#FCAE39' },
        { name: '--ainative-accent-secondary', value: '#22BCDE' },
      ];

      brandColors.forEach(({ name, value }) => {
        const regex = new RegExp(`${name}:\\s*${value.replace('#', '\\#')}`);
        expect(globalsCssContent).toMatch(regex);
      });
    });

    it('should maintain dark mode color values', () => {
      // Dark mode should have specific HSL values
      const darkModeSection = globalsCssContent.match(/\.dark\s*\{[^}]+\}/s);
      expect(darkModeSection).toBeTruthy();

      // Check for key dark mode colors
      expect(globalsCssContent).toContain('--background: 215 28% 7%');
      expect(globalsCssContent).toContain('--card: 215 19% 11%');
      expect(globalsCssContent).toContain('--primary: 225 82% 61%');
    });
  });

  describe('Tailwind Design Token Mappings', () => {
    it('should extend Tailwind with custom colors', () => {
      expect(tailwindConfigContent).toContain("'dark-1': '#131726'");
      expect(tailwindConfigContent).toContain("'dark-2': '#22263c'");
      expect(tailwindConfigContent).toContain("'dark-3': '#31395a'");
      expect(tailwindConfigContent).toContain("'brand-primary': '#5867EF'");
    });

    it('should define primary color variants', () => {
      expect(tailwindConfigContent).toContain("DEFAULT: '#4B6FED'");
      expect(tailwindConfigContent).toContain("dark: '#3955B8'");
    });

    it('should define secondary color variants', () => {
      expect(tailwindConfigContent).toContain("DEFAULT: '#338585'");
      expect(tailwindConfigContent).toContain("dark: '#1A7575'");
    });

    it('should define accent color variants', () => {
      expect(tailwindConfigContent).toContain("DEFAULT: '#FCAE39'");
      expect(tailwindConfigContent).toContain("secondary: '#22BCDE'");
    });

    it('should map CSS variables to Tailwind colors', () => {
      expect(tailwindConfigContent).toContain("background: 'hsl(var(--background))'");
      expect(tailwindConfigContent).toContain("foreground: 'hsl(var(--foreground))'");
      expect(tailwindConfigContent).toContain("border: 'hsl(var(--border))'");
    });
  });

  describe('Typography System', () => {
    it('should define typography scale in globals.css', () => {
      const typographyClasses = [
        'text-display-1',
        'text-display-2',
        'text-display-3',
        'text-title-1',
        'text-title-2',
        'text-body',
        'text-body-lg',
        'text-body-sm',
      ];

      typographyClasses.forEach((className) => {
        expect(globalsCssContent).toContain(`.${className}`);
      });
    });

    it('should define typography in Tailwind config', () => {
      expect(tailwindConfigContent).toContain("'title-1':");
      expect(tailwindConfigContent).toContain("'title-2':");
      expect(tailwindConfigContent).toContain("'body':");
      expect(tailwindConfigContent).toContain("'button':");
    });

    it('should maintain responsive typography adjustments', () => {
      const mobileQuery = globalsCssContent.match(/@media \(max-width: 768px\)[^}]*\{[^}]+\}/gs);
      expect(mobileQuery).toBeTruthy();
      expect(mobileQuery!.length).toBeGreaterThan(0);
    });
  });

  describe('Spacing and Sizing System', () => {
    it('should define button dimensions', () => {
      expect(globalsCssContent).toContain('--height-button: 40px');
      expect(globalsCssContent).toContain('--padding-button: 10px');
    });

    it('should map button dimensions to Tailwind', () => {
      expect(tailwindConfigContent).toContain("'button': '40px'");
      expect(tailwindConfigContent).toContain("'button': '10px'");
    });

    it('should define border radius system', () => {
      expect(globalsCssContent).toContain('--radius: 0.5rem');
      expect(tailwindConfigContent).toContain("lg: 'var(--radius)'");
      expect(tailwindConfigContent).toContain("md: 'calc(var(--radius) - 2px)'");
      expect(tailwindConfigContent).toContain("sm: 'calc(var(--radius) - 4px)'");
    });
  });

  describe('Shadow System', () => {
    it('should define design system shadows in CSS', () => {
      const shadowClasses = [
        'shadow-ds-sm',
        'shadow-ds-md',
        'shadow-ds-lg',
      ];

      shadowClasses.forEach((className) => {
        expect(globalsCssContent).toContain(`.${className}`);
      });
    });

    it('should define shadows in Tailwind config', () => {
      expect(tailwindConfigContent).toContain("'ds-sm':");
      expect(tailwindConfigContent).toContain("'ds-md':");
      expect(tailwindConfigContent).toContain("'ds-lg':");
    });

    it('should maintain consistent shadow values', () => {
      // Verify shadow rgba values are consistent
      expect(tailwindConfigContent).toContain('rgba(19, 23, 38, 0.1)');
      expect(tailwindConfigContent).toContain('rgba(19, 23, 38, 0.12)');
      expect(tailwindConfigContent).toContain('rgba(19, 23, 38, 0.15)');
    });
  });

  describe('Animation System', () => {
    it('should define all keyframe animations', () => {
      const animations = [
        'accordion-down',
        'accordion-up',
        'fade-in',
        'slide-in',
        'gradient-shift',
        'shimmer',
        'pulse-glow',
        'float',
        'stagger-in',
      ];

      animations.forEach((animation) => {
        expect(globalsCssContent).toContain(`@keyframes ${animation}`);
      });
    });

    it('should define animation utility classes', () => {
      const animationClasses = [
        'animate-fade-in',
        'animate-slide-in',
        'animate-pulse-glow',
        'animate-float',
        'animate-gradient-shift',
      ];

      animationClasses.forEach((className) => {
        expect(globalsCssContent).toContain(`.${className}`);
      });
    });

    it('should define animations in Tailwind config', () => {
      expect(tailwindConfigContent).toContain("'accordion-down':");
      expect(tailwindConfigContent).toContain("'fade-in':");
      expect(tailwindConfigContent).toContain("'slide-in':");
      expect(tailwindConfigContent).toContain("'pulse-glow':");
    });

    it('should respect reduced motion preferences', () => {
      expect(globalsCssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(globalsCssContent).toContain('animation: none');
    });
  });

  describe('Gradient System', () => {
    it('should define gradient utility classes', () => {
      const gradients = [
        'bg-gradient-vite',
        'bg-gradient-primary',
        'bg-gradient-accent',
        'text-gradient-primary',
        'text-gradient',
      ];

      gradients.forEach((className) => {
        expect(globalsCssContent).toContain(`.${className}`);
      });
    });

    it('should maintain gradient color stops', () => {
      expect(globalsCssContent).toContain('linear-gradient(135deg, #4B6FED 0%, #8A63F4 100%)');
      expect(globalsCssContent).toContain('linear-gradient(90deg, #4B6FED 0%, #22BCDE 100%)');
    });
  });

  describe('Layout Utilities', () => {
    it('should define container utilities', () => {
      expect(globalsCssContent).toContain('.container-custom');
      expect(globalsCssContent).toContain('max-width: 1280px');
    });

    it('should define full-width section utilities', () => {
      const sections = [
        'full-width-section',
        'full-width-section-sm',
        'full-width-section-md',
        'full-width-section-lg',
        'full-width-section-xl',
      ];

      sections.forEach((className) => {
        expect(globalsCssContent).toContain(`.${className}`);
      });
    });

    it('should have responsive padding for sections', () => {
      const hasResponsivePadding = globalsCssContent.includes('@media (min-width: 768px)') &&
                                   globalsCssContent.includes('@media (min-width: 1024px)');
      expect(hasResponsivePadding).toBe(true);
    });
  });

  describe('Theme Configuration (@theme inline)', () => {
    it('should define color variables in @theme block', () => {
      expect(globalsCssContent).toContain('@theme inline');
      expect(globalsCssContent).toContain('--color-background:');
      expect(globalsCssContent).toContain('--color-primary:');
      expect(globalsCssContent).toContain('--color-border:');
    });

    it('should map AINative brand colors in @theme', () => {
      expect(globalsCssContent).toContain('--color-ainative-primary:');
      expect(globalsCssContent).toContain('--color-ainative-secondary:');
      expect(globalsCssContent).toContain('--color-ainative-accent:');
    });

    it('should define Vite design system colors in @theme', () => {
      expect(globalsCssContent).toContain('--color-vite-bg:');
      expect(globalsCssContent).toContain('--color-vite-surface:');
      expect(globalsCssContent).toContain('--color-vite-primary:');
    });

    it('should define font families in @theme', () => {
      expect(globalsCssContent).toContain('--font-sans:');
      expect(globalsCssContent).toContain('Poppins');
    });

    it('should define typography scale in @theme', () => {
      expect(globalsCssContent).toContain('--font-size-display-1:');
      expect(globalsCssContent).toContain('--font-size-title-1:');
      expect(globalsCssContent).toContain('--font-size-body:');
    });
  });

  describe('Visual Parity Verification', () => {
    it('should maintain exact hex color values', () => {
      // Critical brand colors must match exactly
      const criticalColors = [
        '#4B6FED', // Primary
        '#338585', // Secondary
        '#FCAE39', // Accent
        '#131726', // Dark-1
        '#22263c', // Dark-2
      ];

      criticalColors.forEach((color) => {
        expect(globalsCssContent.toLowerCase()).toContain(color.toLowerCase());
      });
    });

    it('should maintain HSL values for shadcn/ui compatibility', () => {
      // Check for proper HSL format
      const hslPattern = /--\w+:\s*\d+\s+\d+%\s+\d+%/;
      expect(globalsCssContent).toMatch(hslPattern);
    });

    it('should not have conflicting color definitions', () => {
      // Primary should be defined consistently
      const primaryMatches = globalsCssContent.match(/--primary:\s*[^;]+/g);
      expect(primaryMatches).toBeTruthy();

      // Should have both light and dark mode definitions
      expect(primaryMatches!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Accessibility and Responsive Design', () => {
    it('should use semantic CSS variable names', () => {
      const semanticVars = [
        '--background',
        '--foreground',
        '--border',
        '--input',
        '--ring',
        '--muted',
        '--accent',
      ];

      semanticVars.forEach((varName) => {
        expect(globalsCssContent).toContain(varName);
      });
    });

    it('should have mobile-first responsive breakpoints', () => {
      expect(globalsCssContent).toContain('@media (min-width: 640px)');
      expect(globalsCssContent).toContain('@media (min-width: 768px)');
      expect(globalsCssContent).toContain('@media (min-width: 1024px)');
    });

    it('should include focus ring styles', () => {
      expect(globalsCssContent).toContain('--ring:');
    });
  });

  describe('Performance Optimization', () => {
    it('should use CSS custom properties for dynamic theming', () => {
      // CSS variables allow runtime theme switching without rebuilds
      const varPattern = /var\(--[a-z-]+\)/;
      expect(globalsCssContent).toMatch(varPattern);
    });

    it('should avoid redundant color definitions', () => {
      // Check that we're not duplicating the same color value excessively
      const primaryColorCount = (globalsCssContent.match(/#4B6FED/gi) || []).length;
      // Should appear multiple times (light mode, dark mode, comments) but not excessively
      expect(primaryColorCount).toBeLessThan(15);
    });

    it('should use calc() for derived values', () => {
      expect(globalsCssContent).toContain('calc(var(--radius) - 2px)');
      expect(globalsCssContent).toContain('calc(var(--radius) - 4px)');
    });
  });

  describe('Migration Completeness', () => {
    it('should document Vite variable usage in dark mode only', () => {
      // Vite variables should only appear in dark mode section
      const beforeDarkMode = globalsCssContent.substring(0, globalsCssContent.indexOf('.dark'));
      const darkModeSection = globalsCssContent.substring(globalsCssContent.indexOf('.dark'));

      // Should not have vite variables in light mode
      expect(beforeDarkMode).not.toContain('--vite-bg: #');
      // Should have vite variables in dark mode
      expect(darkModeSection).toContain('--vite-bg:');
    });

    it('should have Tailwind v4 @theme configuration', () => {
      expect(globalsCssContent).toContain('@theme inline');
      expect(globalsCssContent).toContain('--color-');
      expect(globalsCssContent).toContain('--font-');
      expect(globalsCssContent).toContain('--shadow-');
    });

    it('should integrate with Tailwind config properly', () => {
      expect(tailwindConfigContent).toContain("darkMode: ['class']");
      expect(tailwindConfigContent).toContain('extend:');
      expect(tailwindConfigContent).toContain('colors:');
      expect(tailwindConfigContent).toContain('keyframes:');
    });
  });
});

/**
 * Integration Tests
 */
describe('CSS Variable Integration', () => {
  it('should have consistent color mappings between files', () => {
    // Read both files
    const globalsCssPath = path.join(process.cwd(), 'app/globals.css');
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');

    const globalsCss = fs.readFileSync(globalsCssPath, 'utf-8');
    const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf-8');

    // Both should define primary color
    expect(globalsCss).toContain('#4B6FED');
    expect(tailwindConfig).toContain('#4B6FED');

    // Both should define dark-1
    expect(globalsCss).toContain('#131726');
    expect(tailwindConfig).toContain('#131726');
  });

  it('should support both CSS variable and Tailwind class usage', () => {
    // This enables flexible usage: var(--primary) or bg-primary
    const globalsCssPath = path.join(process.cwd(), 'app/globals.css');
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');

    const globalsCss = fs.readFileSync(globalsCssPath, 'utf-8');
    const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf-8');

    // CSS variables
    expect(globalsCss).toContain('--ainative-primary:');

    // Tailwind mapping
    expect(tailwindConfig).toContain("primary:");
  });
});
