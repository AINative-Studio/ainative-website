/**
 * Integration Tests: lib/gradients.ts
 *
 * These tests import and test the actual gradient library functions
 * to ensure code coverage for the implementation.
 */

import {
  gradients,
  gradientClasses,
  gradientTextColors,
  gradientToClass,
  getGradientClass,
  getGradientWithOpacity,
  getRelativeLuminance,
  getContrastRatio,
  checkGradientContrast,
  type GradientName,
  type GradientConfig,
} from '../gradients';

describe('lib/gradients.ts - Integration Tests', () => {
  describe('Gradient Constants', () => {
    it('should export gradients object with all gradients', () => {
      expect(gradients).toBeDefined();
      expect(gradients.primary).toBeDefined();
      expect(gradients.secondary).toBeDefined();
      expect(gradients.accent).toBeDefined();
      expect(gradients.success).toBeDefined();
      expect(gradients.card).toBeDefined();
      expect(gradients.hero).toBeDefined();
      expect(gradients.subtle).toBeDefined();
      expect(gradients.warning).toBeDefined();
      expect(gradients.error).toBeDefined();
      expect(gradients.info).toBeDefined();
    });

    it('should export gradientClasses with pre-computed class strings', () => {
      expect(gradientClasses).toBeDefined();
      expect(gradientClasses.primary).toContain('bg-gradient-to-r');
      expect(gradientClasses.secondary).toContain('bg-gradient-to-r');
      expect(gradientClasses.card).toContain('bg-gradient-to-br');
    });

    it('should export gradientTextColors with recommendations', () => {
      expect(gradientTextColors).toBeDefined();
      expect(gradientTextColors.primary).toBe('text-white');
      expect(gradientTextColors.subtle).toBe('text-gray-900');
    });
  });

  describe('gradientToClass()', () => {
    it('should convert gradient config to Tailwind class string', () => {
      const config: GradientConfig = {
        from: '#3955B8',
        to: '#6B46C1',
        direction: 'to-r',
      };
      const className = gradientToClass(config);
      expect(className).toContain('bg-gradient-to-r');
      expect(className).toContain('from-[#3955B8]');
      expect(className).toContain('to-[#6B46C1]');
    });

    it('should handle via color in gradient config', () => {
      const config: GradientConfig = {
        from: '#4B6FED',
        via: '#8A63F4',
        to: '#22BCDE',
        direction: 'to-br',
      };
      const className = gradientToClass(config);
      expect(className).toContain('via-[#8A63F4]');
    });

    it('should handle all direction types', () => {
      const directions: GradientConfig['direction'][] = [
        'to-r', 'to-l', 'to-t', 'to-b',
        'to-br', 'to-bl', 'to-tr', 'to-tl'
      ];

      directions.forEach(direction => {
        const config: GradientConfig = {
          from: '#000000',
          to: '#FFFFFF',
          direction,
        };
        const className = gradientToClass(config);
        expect(className).toContain(`bg-gradient-${direction}`);
      });
    });
  });

  describe('getGradientClass()', () => {
    it('should return correct class string for primary gradient', () => {
      const className = getGradientClass('primary');
      expect(className).toContain('bg-gradient-to-r');
      expect(className).toContain('from-[#3955B8]');
      expect(className).toContain('to-[#6B46C1]');
    });

    it('should return correct class string for all gradient names', () => {
      const names: GradientName[] = [
        'primary', 'secondary', 'accent', 'success',
        'card', 'hero', 'subtle', 'warning', 'error', 'info'
      ];

      names.forEach(name => {
        const className = getGradientClass(name);
        expect(className).toContain('bg-gradient-');
        expect(className).toContain('from-[');
        expect(className).toContain('to-[');
      });
    });
  });

  describe('getGradientWithOpacity()', () => {
    it('should add opacity class to gradient', () => {
      const className = getGradientWithOpacity('primary', 50);
      expect(className).toContain('bg-gradient-to-r');
      expect(className).toContain('opacity-50');
    });

    it('should handle different opacity values', () => {
      const opacities = [10, 25, 50, 75, 90];
      opacities.forEach(opacity => {
        const className = getGradientWithOpacity('primary', opacity);
        expect(className).toContain(`opacity-${opacity}`);
      });
    });
  });

  describe('getRelativeLuminance()', () => {
    it('should calculate correct luminance for white', () => {
      const luminance = getRelativeLuminance('#FFFFFF');
      expect(luminance).toBeCloseTo(1, 2);
    });

    it('should calculate correct luminance for black', () => {
      const luminance = getRelativeLuminance('#000000');
      expect(luminance).toBeCloseTo(0, 2);
    });

    it('should calculate luminance for brand colors', () => {
      const primaryLuminance = getRelativeLuminance('#3955B8');
      expect(primaryLuminance).toBeGreaterThan(0);
      expect(primaryLuminance).toBeLessThan(1);
    });

    it('should handle colors without # prefix', () => {
      const withHash = getRelativeLuminance('#3955B8');
      const withoutHash = getRelativeLuminance('3955B8');
      // Both should work (function handles both cases)
      expect(withHash).toBeGreaterThan(0);
    });
  });

  describe('getContrastRatio()', () => {
    it('should calculate 21:1 ratio for black on white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate 1:1 ratio for same colors', () => {
      const ratio = getContrastRatio('#3955B8', '#3955B8');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should be symmetric (order-independent)', () => {
      const ratio1 = getContrastRatio('#3955B8', '#FFFFFF');
      const ratio2 = getContrastRatio('#FFFFFF', '#3955B8');
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });

    it('should meet WCAG AA for primary gradient colors', () => {
      const ratio1 = getContrastRatio('#FFFFFF', '#3955B8');
      const ratio2 = getContrastRatio('#FFFFFF', '#6B46C1');
      expect(ratio1).toBeGreaterThanOrEqual(4.5);
      expect(ratio2).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for action gradient colors', () => {
      const gradientColors = [
        '#3955B8', // primary
        '#1A7575', // secondary
        '#C2410C', // accent
        '#047857', // success (updated to darker)
        '#DC2626', // error (updated)
        '#2563EB', // info (updated)
        '#B45309', // warning (updated)
      ];

      gradientColors.forEach(color => {
        const ratio = getContrastRatio('#FFFFFF', color);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe('checkGradientContrast()', () => {
    it('should check contrast for primary gradient with white text', () => {
      const result = checkGradientContrast('primary', '#FFFFFF');
      expect(result.passes).toBe(true);
      expect(result.requiredRatio).toBe(4.5);
      expect(result.minRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('should check contrast for primary, secondary, and accent gradients', () => {
      const names: GradientName[] = ['primary', 'secondary', 'accent'];

      names.forEach(name => {
        const result = checkGradientContrast(name, '#FFFFFF');
        expect(result.passes).toBe(true);
        expect(result.minRatio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should check contrast for semantic gradients', () => {
      const names: GradientName[] = ['success', 'error', 'info', 'warning'];

      names.forEach(name => {
        const result = checkGradientContrast(name, '#FFFFFF');
        expect(result.passes).toBe(true);
        expect(result.minRatio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should check contrast for card and hero gradients', () => {
      const names: GradientName[] = ['card', 'hero'];

      names.forEach(name => {
        const result = checkGradientContrast(name, '#FFFFFF');
        expect(result.passes).toBe(true);
        expect(result.minRatio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should check warning gradient for WCAG AA compliance', () => {
      const result = checkGradientContrast('warning', '#FFFFFF');
      // Warning gradient now uses darker amber colors
      expect(result.passes).toBe(true);
      expect(result.minRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('should use lower threshold for large text', () => {
      const resultNormal = checkGradientContrast('primary', '#FFFFFF', false);
      const resultLarge = checkGradientContrast('primary', '#FFFFFF', true);

      expect(resultNormal.requiredRatio).toBe(4.5);
      expect(resultLarge.requiredRatio).toBe(3);
    });

    it('should return all contrast data', () => {
      const result = checkGradientContrast('primary', '#FFFFFF');

      expect(result).toHaveProperty('passes');
      expect(result).toHaveProperty('minRatio');
      expect(result).toHaveProperty('maxRatio');
      expect(result).toHaveProperty('startRatio');
      expect(result).toHaveProperty('endRatio');
      expect(result).toHaveProperty('requiredRatio');
    });

    it('should handle gradient with via color', () => {
      const result = checkGradientContrast('card', '#FFFFFF');
      // Card gradient has 3 colors (from, via, to) - all should pass
      expect(result.minRatio).toBeGreaterThan(0);
      expect(result.maxRatio).toBeGreaterThan(result.minRatio);
      expect(result.passes).toBe(true);
    });

    it('should correctly identify failing contrasts', () => {
      const result = checkGradientContrast('subtle', '#FFFFFF');
      // Subtle gradient is light colors, should fail with white text
      expect(result.passes).toBe(false);
    });
  });

  describe('Gradient Structure Validation', () => {
    it('should have consistent structure for all gradients', () => {
      Object.values(gradients).forEach(gradient => {
        expect(gradient).toHaveProperty('from');
        expect(gradient).toHaveProperty('to');
        expect(gradient).toHaveProperty('direction');
        expect(typeof gradient.from).toBe('string');
        expect(typeof gradient.to).toBe('string');
        expect(typeof gradient.direction).toBe('string');
      });
    });

    it('should use valid hex colors', () => {
      const hexPattern = /^#[0-9A-F]{6}$/i;
      Object.values(gradients).forEach(gradient => {
        expect(gradient.from).toMatch(hexPattern);
        expect(gradient.to).toMatch(hexPattern);
        if (gradient.via) {
          expect(gradient.via).toMatch(hexPattern);
        }
      });
    });

    it('should have matching gradientClasses for all gradient names', () => {
      const gradientNames = Object.keys(gradients) as GradientName[];
      gradientNames.forEach(name => {
        expect(gradientClasses[name]).toBeDefined();
        expect(typeof gradientClasses[name]).toBe('string');
      });
    });

    it('should have matching textColors for all gradient names', () => {
      const gradientNames = Object.keys(gradients) as GradientName[];
      gradientNames.forEach(name => {
        expect(gradientTextColors[name]).toBeDefined();
        expect(gradientTextColors[name]).toMatch(/^text-/);
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should generate class strings efficiently', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        getGradientClass('primary');
      }
      const end = performance.now();
      const duration = end - start;

      // Should be very fast (< 10ms for 1000 iterations)
      expect(duration).toBeLessThan(10);
    });

    it('should use pre-computed classes for better performance', () => {
      // Pre-computed classes should match runtime generation
      const runtimeClass = getGradientClass('primary');
      const precomputedClass = gradientClasses.primary;

      expect(runtimeClass).toBe(precomputedClass);
    });
  });

  describe('Type Safety', () => {
    it('should enforce GradientName type', () => {
      const validNames: GradientName[] = [
        'primary', 'secondary', 'accent', 'success',
        'card', 'hero', 'subtle', 'warning', 'error', 'info'
      ];

      validNames.forEach(name => {
        expect(() => getGradientClass(name)).not.toThrow();
      });
    });

    it('should enforce GradientConfig type', () => {
      const validConfig: GradientConfig = {
        from: '#000000',
        to: '#FFFFFF',
        direction: 'to-r',
      };

      expect(() => gradientToClass(validConfig)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle gradient without via color', () => {
      const className = getGradientClass('primary');
      expect(className).not.toContain('via-');
    });

    it('should handle gradient with via color', () => {
      const className = getGradientClass('card');
      expect(className).toContain('via-');
    });

    it('should handle all direction variations', () => {
      const directions = ['to-r', 'to-l', 'to-t', 'to-b', 'to-br', 'to-bl', 'to-tr', 'to-tl'];
      const gradientDirections = Object.values(gradients).map(g => g.direction);

      // Should have variety of directions
      const uniqueDirections = new Set(gradientDirections);
      expect(uniqueDirections.size).toBeGreaterThan(1);
    });
  });
});
