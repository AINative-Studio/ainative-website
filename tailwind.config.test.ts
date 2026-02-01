/**
 * TDD Tests for Tailwind Configuration
 * These tests validate the comprehensive design system migration
 * from the Vite source implementation
 *
 * Target: 85%+ coverage
 * Phase: RED - Tests written BEFORE implementation
 */

import type { Config } from 'tailwindcss';

// Import the config - will fail until we create it
import tailwindConfig from './tailwind.config';

describe('Tailwind Configuration - Design System Validation', () => {
  describe('Configuration Structure', () => {
    it('should export a valid Tailwind configuration object', () => {
      expect(tailwindConfig).toBeDefined();
      expect(tailwindConfig).toHaveProperty('theme');
      expect(tailwindConfig).toHaveProperty('content');
      expect(tailwindConfig).toHaveProperty('plugins');
    });

    it('should have correct TypeScript type', () => {
      // Type assertion to ensure it matches Config type
      const config: Config = tailwindConfig;
      expect(config).toBeDefined();
    });

    it('should enable dark mode with class strategy', () => {
      expect(tailwindConfig.darkMode).toEqual(['class']);
    });

    it('should have content paths configured', () => {
      expect(tailwindConfig.content).toBeDefined();
      expect(Array.isArray(tailwindConfig.content)).toBe(true);
      expect(tailwindConfig.content).toContain('./app/**/*.{ts,tsx}');
      expect(tailwindConfig.content).toContain('./components/**/*.{ts,tsx}');
    });
  });

  describe('Color System - Design Tokens', () => {
    const colors = tailwindConfig.theme?.extend?.colors as Record<string, any>;

    it('should define all dark mode palette colors', () => {
      expect(colors).toBeDefined();
      expect(colors['dark-1']).toBe('#131726');
      expect(colors['dark-2']).toBe('#22263c');
      expect(colors['dark-3']).toBe('#31395a');
    });

    it('should define brand primary color', () => {
      expect(colors['brand-primary']).toBe('#5867EF');
    });

    it('should define semantic surface colors', () => {
      expect(colors['surface-primary']).toBe('#131726');
      expect(colors['surface-secondary']).toBe('#22263c');
      expect(colors['surface-accent']).toBe('#31395a');
    });

    it('should define primary color variants', () => {
      expect(colors.primary).toBeDefined();
      expect(colors.primary.DEFAULT).toBe('#4B6FED');
      expect(colors.primary.dark).toBe('#3955B8');
    });

    it('should define secondary color variants', () => {
      expect(colors.secondary).toBeDefined();
      expect(colors.secondary.DEFAULT).toBe('#338585');
      expect(colors.secondary.dark).toBe('#1A7575');
    });

    it('should define accent colors', () => {
      expect(colors.accent).toBeDefined();
      expect(colors.accent.DEFAULT).toBeDefined();
      expect(colors.accent.secondary).toBe('#22BCDE');
    });

    it('should define neutral color palette', () => {
      expect(colors.neutral).toBeDefined();
      expect(colors.neutral.DEFAULT).toBe('#374151');
      expect(colors.neutral.muted).toBe('#6B7280');
      expect(colors.neutral.light).toBe('#F3F4F6');
    });

    it('should define shadcn/ui color variables', () => {
      expect(colors.background).toBe('hsl(var(--background))');
      expect(colors.foreground).toBe('hsl(var(--foreground))');
      expect(colors.card).toBeDefined();
      expect(colors.card.DEFAULT).toBe('hsl(var(--card))');
      expect(colors.card.foreground).toBe('hsl(var(--card-foreground))');
    });

    it('should define chart colors', () => {
      expect(colors.chart).toBeDefined();
      expect(colors.chart['1']).toBe('hsl(var(--chart-1))');
      expect(colors.chart['2']).toBe('hsl(var(--chart-2))');
      expect(colors.chart['3']).toBe('hsl(var(--chart-3))');
      expect(colors.chart['4']).toBe('hsl(var(--chart-4))');
      expect(colors.chart['5']).toBe('hsl(var(--chart-5))');
    });
  });

  describe('Typography Scale - Design System', () => {
    const fontSize = tailwindConfig.theme?.extend?.fontSize as Record<string, any>;

    it('should define title-1 with correct size and line-height', () => {
      expect(fontSize['title-1']).toBeDefined();
      expect(fontSize['title-1']).toEqual(['28px', { lineHeight: '1.2', fontWeight: '700' }]);
    });

    it('should define title-2 with correct size and line-height', () => {
      expect(fontSize['title-2']).toBeDefined();
      expect(fontSize['title-2']).toEqual(['24px', { lineHeight: '1.3', fontWeight: '600' }]);
    });

    it('should define body text scale', () => {
      expect(fontSize['body']).toBeDefined();
      expect(fontSize['body']).toEqual(['14px', { lineHeight: '1.5' }]);
    });

    it('should define button text scale', () => {
      expect(fontSize['button']).toBeDefined();
      expect(fontSize['button']).toEqual(['12px', { lineHeight: '1.25', fontWeight: '500' }]);
    });
  });

  describe('Font Family', () => {
    const fontFamily = tailwindConfig.theme?.extend?.fontFamily as Record<string, any>;

    it('should define Poppins as sans-serif font', () => {
      expect(fontFamily).toBeDefined();
      expect(fontFamily.sans).toBeDefined();
      expect(fontFamily.sans).toEqual(['Poppins', 'sans-serif']);
    });
  });

  describe('Custom Animations - Keyframes', () => {
    const keyframes = tailwindConfig.theme?.extend?.keyframes as Record<string, any>;

    it('should define accordion-down animation', () => {
      expect(keyframes['accordion-down']).toBeDefined();
      expect(keyframes['accordion-down'].from).toEqual({ height: '0' });
      expect(keyframes['accordion-down'].to).toEqual({ height: 'var(--radix-accordion-content-height)' });
    });

    it('should define accordion-up animation', () => {
      expect(keyframes['accordion-up']).toBeDefined();
      expect(keyframes['accordion-up'].from).toEqual({ height: 'var(--radix-accordion-content-height)' });
      expect(keyframes['accordion-up'].to).toEqual({ height: '0' });
    });

    it('should define fade-in animation', () => {
      expect(keyframes['fade-in']).toBeDefined();
      expect(keyframes['fade-in'].from).toEqual({ opacity: '0', transform: 'translateY(10px)' });
      expect(keyframes['fade-in'].to).toEqual({ opacity: '1', transform: 'translateY(0)' });
    });

    it('should define slide-in animation', () => {
      expect(keyframes['slide-in']).toBeDefined();
      expect(keyframes['slide-in'].from).toEqual({ opacity: '0', transform: 'translateX(-10px)' });
      expect(keyframes['slide-in'].to).toEqual({ opacity: '1', transform: 'translateX(0)' });
    });

    it('should define gradient-shift animation', () => {
      expect(keyframes['gradient-shift']).toBeDefined();
      expect(keyframes['gradient-shift']['0%, 100%']).toEqual({ backgroundPosition: '0% 50%' });
      expect(keyframes['gradient-shift']['50%']).toEqual({ backgroundPosition: '100% 50%' });
    });

    it('should define shimmer animation', () => {
      expect(keyframes['shimmer']).toBeDefined();
      expect(keyframes['shimmer']['0%']).toEqual({ transform: 'translateX(-100%)' });
      expect(keyframes['shimmer']['100%']).toEqual({ transform: 'translateX(100%)' });
    });

    it('should define pulse-glow animation', () => {
      expect(keyframes['pulse-glow']).toBeDefined();
      expect(keyframes['pulse-glow']['0%, 100%']).toBeDefined();
      expect(keyframes['pulse-glow']['50%']).toBeDefined();
    });

    it('should define float animation', () => {
      expect(keyframes['float']).toBeDefined();
      expect(keyframes['float']['0%, 100%']).toEqual({ transform: 'translateY(0px)' });
      expect(keyframes['float']['50%']).toEqual({ transform: 'translateY(-10px)' });
    });

    it('should define stagger-in animation', () => {
      expect(keyframes['stagger-in']).toBeDefined();
      expect(keyframes['stagger-in']['0%']).toEqual({ opacity: '0', transform: 'translateY(10px)' });
      expect(keyframes['stagger-in']['100%']).toEqual({ opacity: '1', transform: 'translateY(0)' });
    });

    it('should have at least 9 custom animations', () => {
      const animationCount = Object.keys(keyframes).length;
      expect(animationCount).toBeGreaterThanOrEqual(9);
    });
  });

  describe('Animation Classes', () => {
    const animation = tailwindConfig.theme?.extend?.animation as Record<string, string>;

    it('should define accordion-down animation class', () => {
      expect(animation['accordion-down']).toBe('accordion-down 0.2s ease-out');
    });

    it('should define accordion-up animation class', () => {
      expect(animation['accordion-up']).toBe('accordion-up 0.2s ease-out');
    });

    it('should define fade-in animation class', () => {
      expect(animation['fade-in']).toBe('fade-in 0.3s ease-out');
    });

    it('should define slide-in animation class', () => {
      expect(animation['slide-in']).toBe('slide-in 0.3s ease-out');
    });

    it('should define gradient-shift animation class', () => {
      expect(animation['gradient-shift']).toBe('gradient-shift 3s ease infinite');
    });

    it('should define shimmer animation class', () => {
      expect(animation['shimmer']).toBe('shimmer 2s infinite');
    });

    it('should define pulse-glow animation class', () => {
      expect(animation['pulse-glow']).toBe('pulse-glow 2s ease-in-out infinite');
    });

    it('should define float animation class', () => {
      expect(animation['float']).toBe('float 3s ease-in-out infinite');
    });

    it('should define stagger-in animation class', () => {
      expect(animation['stagger-in']).toBe('stagger-in 0.5s ease-out');
    });

    it('should have at least 9 animation classes', () => {
      const animationCount = Object.keys(animation).length;
      expect(animationCount).toBeGreaterThanOrEqual(9);
    });
  });

  describe('Design System Shadows', () => {
    const boxShadow = tailwindConfig.theme?.extend?.boxShadow as Record<string, string>;

    it('should define ds-sm shadow', () => {
      expect(boxShadow['ds-sm']).toBe('0 2px 4px rgba(19, 23, 38, 0.1), 0 1px 2px rgba(19, 23, 38, 0.06)');
    });

    it('should define ds-md shadow', () => {
      expect(boxShadow['ds-md']).toBe('0 4px 8px rgba(19, 23, 38, 0.12), 0 2px 4px rgba(19, 23, 38, 0.08)');
    });

    it('should define ds-lg shadow', () => {
      expect(boxShadow['ds-lg']).toBe('0 12px 24px rgba(19, 23, 38, 0.15), 0 4px 8px rgba(19, 23, 38, 0.1)');
    });
  });

  describe('Border Radius System', () => {
    const borderRadius = tailwindConfig.theme?.extend?.borderRadius as Record<string, string>;

    it('should define custom border radius values', () => {
      expect(borderRadius).toBeDefined();
      expect(borderRadius.lg).toBe('var(--radius)');
      expect(borderRadius.md).toBe('calc(var(--radius) - 2px)');
      expect(borderRadius.sm).toBe('calc(var(--radius) - 4px)');
    });
  });

  describe('Button Dimensions', () => {
    const height = tailwindConfig.theme?.extend?.height as Record<string, string>;
    const padding = tailwindConfig.theme?.extend?.padding as Record<string, string>;

    it('should define button height', () => {
      expect(height).toBeDefined();
      expect(height.button).toBe('40px');
    });

    it('should define button padding', () => {
      expect(padding).toBeDefined();
      expect(padding.button).toBe('10px');
    });
  });

  describe('Plugins', () => {
    it('should include tailwindcss-animate plugin', () => {
      expect(tailwindConfig.plugins).toBeDefined();
      expect(Array.isArray(tailwindConfig.plugins)).toBe(true);
      expect(tailwindConfig.plugins.length).toBeGreaterThan(0);
    });
  });

  describe('Type Safety', () => {
    it('should export proper TypeScript types', () => {
      // This test ensures the config can be typed correctly
      const typedConfig: Config = tailwindConfig;
      expect(typedConfig.theme).toBeDefined();
    });

    it('should have extend object with correct structure', () => {
      expect(tailwindConfig.theme?.extend).toBeDefined();
      expect(typeof tailwindConfig.theme?.extend).toBe('object');
    });
  });

  describe('Design System Completeness', () => {
    it('should have all required design token categories', () => {
      const extend = tailwindConfig.theme?.extend;
      expect(extend).toHaveProperty('colors');
      expect(extend).toHaveProperty('fontSize');
      expect(extend).toHaveProperty('fontFamily');
      expect(extend).toHaveProperty('boxShadow');
      expect(extend).toHaveProperty('keyframes');
      expect(extend).toHaveProperty('animation');
      expect(extend).toHaveProperty('borderRadius');
    });

    it('should maintain consistency with Vite source config', () => {
      // Verify critical values match the source exactly
      const colors = tailwindConfig.theme?.extend?.colors as Record<string, any>;
      expect(colors['brand-primary']).toBe('#5867EF');
      expect(colors.primary.DEFAULT).toBe('#4B6FED');
    });
  });
});
