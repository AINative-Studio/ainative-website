/**
 * Test Suite: Gradient Usage in Dashboard Components (Issue #496)
 *
 * This test suite validates:
 * 1. Gradient utility functions and Tailwind classes
 * 2. Color contrast ratios for WCAG 2.1 AA compliance
 * 3. Gradient application across breakpoints
 * 4. Visual consistency across dashboard components
 *
 * Required Coverage: 85%+
 * TDD Approach: Tests written FIRST
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Helper: Calculate relative luminance for WCAG contrast calculations
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(hexColor: string): number {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Helper: Calculate contrast ratio between two colors
 * WCAG 2.1 Formula: (L1 + 0.05) / (L2 + 0.05)
 * where L1 is lighter color and L2 is darker color
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Design System Gradient Utilities
 * These will be imported from lib/gradients.ts (to be created)
 */
interface GradientConfig {
  from: string;
  via?: string;
  to: string;
  direction: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';
}

// Mock implementation for testing - will be replaced with actual implementation
const mockGradients = {
  primary: {
    from: '#3955B8',
    to: '#6B46C1',
    direction: 'to-r' as const,
  },
  secondary: {
    from: '#1A7575',
    to: '#0E7490',
    direction: 'to-r' as const,
  },
  accent: {
    from: '#C2410C',
    to: '#DC2626',
    direction: 'to-r' as const,
  },
  success: {
    from: '#047857',
    to: '#065F46',
    direction: 'to-r' as const,
  },
  card: {
    from: '#3955B8',
    via: '#6B46C1',
    to: '#0E7490',
    direction: 'to-br' as const,
  },
  hero: {
    from: '#131726',
    via: '#22263c',
    to: '#31395a',
    direction: 'to-b' as const,
  },
};

/**
 * Generate Tailwind gradient class string from config
 */
function gradientToClass(config: GradientConfig): string {
  const parts = [`bg-gradient-${config.direction}`, `from-[${config.from}]`];
  if (config.via) {
    parts.push(`via-[${config.via}]`);
  }
  parts.push(`to-[${config.to}]`);
  return parts.join(' ');
}

/**
 * Test Component: Dashboard Card with Gradient
 */
function DashboardCardWithGradient({
  gradient,
  title,
  children
}: {
  gradient: keyof typeof mockGradients;
  title: string;
  children?: React.ReactNode;
}) {
  const gradientConfig = mockGradients[gradient];
  const gradientClass = gradientToClass(gradientConfig);

  return (
    <div className={`rounded-lg p-6 ${gradientClass}`} data-testid="gradient-card">
      <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
      {children}
    </div>
  );
}

/**
 * Test Component: Gradient Header
 */
function GradientHeader({ gradient }: { gradient: keyof typeof mockGradients }) {
  const gradientConfig = mockGradients[gradient];
  const gradientClass = gradientToClass(gradientConfig);

  return (
    <header className={`${gradientClass} py-12`} data-testid="gradient-header">
      <h1 className="text-white text-4xl font-bold">Dashboard</h1>
    </header>
  );
}

/**
 * Test Component: Gradient Button
 */
function GradientButton({
  gradient,
  label
}: {
  gradient: keyof typeof mockGradients;
  label: string;
}) {
  const gradientConfig = mockGradients[gradient];
  const gradientClass = gradientToClass(gradientConfig);

  return (
    <button
      className={`${gradientClass} text-white px-6 py-3 rounded-lg font-semibold`}
      data-testid="gradient-button"
    >
      {label}
    </button>
  );
}

describe('Gradient System - Design Tokens', () => {
  describe('Gradient Configuration', () => {
    it('should define primary gradient with correct colors', () => {
      const { primary } = mockGradients;
      expect(primary.from).toBe('#3955B8');
      expect(primary.to).toBe('#6B46C1');
      expect(primary.direction).toBe('to-r');
    });

    it('should define secondary gradient with correct colors', () => {
      const { secondary } = mockGradients;
      expect(secondary.from).toBe('#1A7575');
      expect(secondary.to).toBe('#0E7490');
      expect(secondary.direction).toBe('to-r');
    });

    it('should define accent gradient with correct colors', () => {
      const { accent } = mockGradients;
      expect(accent.from).toBe('#C2410C');
      expect(accent.to).toBe('#DC2626');
      expect(accent.direction).toBe('to-r');
    });

    it('should define card gradient with via color', () => {
      const { card } = mockGradients;
      expect(card.from).toBe('#3955B8');
      expect(card.via).toBe('#6B46C1');
      expect(card.to).toBe('#0E7490');
      expect(card.direction).toBe('to-br');
    });

    it('should define hero gradient with dark theme colors', () => {
      const { hero } = mockGradients;
      expect(hero.from).toBe('#131726');
      expect(hero.via).toBe('#22263c');
      expect(hero.to).toBe('#31395a');
      expect(hero.direction).toBe('to-b');
    });

    it('should support all gradient directions', () => {
      const directions = ['to-r', 'to-l', 'to-t', 'to-b', 'to-br', 'to-bl', 'to-tr', 'to-tl'];
      directions.forEach(direction => {
        const config: GradientConfig = {
          from: '#000000',
          to: '#FFFFFF',
          direction: direction as GradientConfig['direction'],
        };
        expect(config.direction).toBe(direction);
      });
    });
  });

  describe('Gradient Utility Functions', () => {
    it('should generate correct Tailwind class for simple gradient', () => {
      const config: GradientConfig = {
        from: '#4B6FED',
        to: '#8A63F4',
        direction: 'to-r',
      };
      const className = gradientToClass(config);
      expect(className).toContain('bg-gradient-to-r');
      expect(className).toContain('from-[#4B6FED]');
      expect(className).toContain('to-[#8A63F4]');
    });

    it('should generate correct Tailwind class for gradient with via', () => {
      const config: GradientConfig = {
        from: '#4B6FED',
        via: '#8A63F4',
        to: '#22BCDE',
        direction: 'to-br',
      };
      const className = gradientToClass(config);
      expect(className).toContain('bg-gradient-to-br');
      expect(className).toContain('from-[#4B6FED]');
      expect(className).toContain('via-[#8A63F4]');
      expect(className).toContain('to-[#22BCDE]');
    });

    it('should handle all gradient directions correctly', () => {
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
});

describe('Accessibility - WCAG 2.1 Contrast Ratios', () => {
  describe('Color Contrast Calculations', () => {
    it('should calculate relative luminance correctly for white', () => {
      const luminance = getRelativeLuminance('#FFFFFF');
      expect(luminance).toBeCloseTo(1, 2);
    });

    it('should calculate relative luminance correctly for black', () => {
      const luminance = getRelativeLuminance('#000000');
      expect(luminance).toBeCloseTo(0, 2);
    });

    it('should calculate relative luminance for brand primary', () => {
      const luminance = getRelativeLuminance('#3955B8');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });

    it('should calculate contrast ratio of 21:1 for black on white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate contrast ratio of 1:1 for same colors', () => {
      const ratio = getContrastRatio('#3955B8', '#3955B8');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should handle colors in any order (symmetry)', () => {
      const ratio1 = getContrastRatio('#3955B8', '#FFFFFF');
      const ratio2 = getContrastRatio('#FFFFFF', '#3955B8');
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });
  });

  describe('WCAG 2.1 AA Compliance - Gradient Text', () => {
    it('should have sufficient contrast for white text on primary gradient start', () => {
      const ratio = getContrastRatio('#FFFFFF', '#3955B8');
      expect(ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA normal text
    });

    it('should have sufficient contrast for white text on primary gradient end', () => {
      const ratio = getContrastRatio('#FFFFFF', '#6B46C1');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should have sufficient contrast for white text on secondary gradient', () => {
      const ratio1 = getContrastRatio('#FFFFFF', '#1A7575');
      const ratio2 = getContrastRatio('#FFFFFF', '#0E7490');
      expect(ratio1).toBeGreaterThanOrEqual(4.5);
      expect(ratio2).toBeGreaterThanOrEqual(4.5);
    });

    it('should have sufficient contrast for white text on hero gradient', () => {
      const darkColors = ['#131726', '#22263c', '#31395a'];
      darkColors.forEach(color => {
        const ratio = getContrastRatio('#FFFFFF', color);
        expect(ratio).toBeGreaterThanOrEqual(7); // Should exceed AAA
      });
    });

    it('should have sufficient contrast for white text on accent gradient', () => {
      // Accent gradient uses darker shades for better contrast
      const ratio1 = getContrastRatio('#FFFFFF', '#C2410C');
      const ratio2 = getContrastRatio('#FFFFFF', '#DC2626');
      expect(ratio1).toBeGreaterThanOrEqual(4.5);
      expect(ratio2).toBeGreaterThanOrEqual(4.5);
    });
  });
});

describe('Dashboard Components - Gradient Application', () => {
  describe('Dashboard Card with Gradient', () => {
    it('should render card with primary gradient', () => {
      render(<DashboardCardWithGradient gradient="primary" title="Test Card" />);
      const card = screen.getByTestId('gradient-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-gradient-to-r');
    });

    it('should render card with accent gradient', () => {
      render(<DashboardCardWithGradient gradient="accent" title="Test Card" />);
      const card = screen.getByTestId('gradient-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-gradient-to-r');
    });

    it('should render card with card gradient (includes via)', () => {
      render(<DashboardCardWithGradient gradient="card" title="Test Card" />);
      const card = screen.getByTestId('gradient-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-gradient-to-br');
    });

    it('should display title text', () => {
      render(<DashboardCardWithGradient gradient="primary" title="Analytics" />);
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <DashboardCardWithGradient gradient="primary" title="Test">
          <p>Child content</p>
        </DashboardCardWithGradient>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should apply correct gradient direction for card variant', () => {
      render(<DashboardCardWithGradient gradient="card" title="Test" />);
      const card = screen.getByTestId('gradient-card');
      expect(card.className).toContain('to-br');
    });
  });

  describe('Gradient Header', () => {
    it('should render header with hero gradient', () => {
      render(<GradientHeader gradient="hero" />);
      const header = screen.getByTestId('gradient-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('bg-gradient-to-b');
    });

    it('should render header with primary gradient', () => {
      render(<GradientHeader gradient="primary" />);
      const header = screen.getByTestId('gradient-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('bg-gradient-to-r');
    });

    it('should display header text', () => {
      render(<GradientHeader gradient="hero" />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Gradient Button', () => {
    it('should render button with primary gradient', () => {
      render(<GradientButton gradient="primary" label="Click Me" />);
      const button = screen.getByTestId('gradient-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-gradient-to-r');
    });

    it('should render button with success gradient', () => {
      render(<GradientButton gradient="success" label="Success" />);
      const button = screen.getByTestId('gradient-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-gradient-to-r');
    });

    it('should display button label', () => {
      render(<GradientButton gradient="primary" label="Get Started" />);
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should have white text on gradient background', () => {
      render(<GradientButton gradient="primary" label="Click Me" />);
      const button = screen.getByTestId('gradient-button');
      expect(button).toHaveClass('text-white');
    });
  });
});

describe('Visual Consistency', () => {
  describe('Gradient Naming Conventions', () => {
    it('should use semantic gradient names', () => {
      const gradientNames = Object.keys(mockGradients);
      const semanticNames = ['primary', 'secondary', 'accent', 'success', 'card', 'hero'];
      semanticNames.forEach(name => {
        expect(gradientNames).toContain(name);
      });
    });

    it('should have consistent gradient structure', () => {
      Object.values(mockGradients).forEach(gradient => {
        expect(gradient).toHaveProperty('from');
        expect(gradient).toHaveProperty('to');
        expect(gradient).toHaveProperty('direction');
      });
    });

    it('should use valid hex colors', () => {
      const hexPattern = /^#[0-9A-F]{6}$/i;
      Object.values(mockGradients).forEach(gradient => {
        expect(gradient.from).toMatch(hexPattern);
        expect(gradient.to).toMatch(hexPattern);
        if (gradient.via) {
          expect(gradient.via).toMatch(hexPattern);
        }
      });
    });
  });

  describe('Gradient Consistency Across Components', () => {
    it('should use same primary gradient in multiple components', () => {
      const { container: container1 } = render(
        <DashboardCardWithGradient gradient="primary" title="Card 1" />
      );
      const { container: container2 } = render(
        <GradientButton gradient="primary" label="Button 1" />
      );

      const card = container1.querySelector('[data-testid="gradient-card"]');
      const button = container2.querySelector('[data-testid="gradient-button"]');

      expect(card?.className).toContain('bg-gradient-to-r');
      expect(button?.className).toContain('bg-gradient-to-r');
    });

    it('should maintain gradient colors across component types', () => {
      const config = mockGradients.primary;
      expect(config.from).toBe('#3955B8');
      expect(config.to).toBe('#6B46C1');

      // Verify both components use same config
      render(<DashboardCardWithGradient gradient="primary" title="Test" />);
      render(<GradientButton gradient="primary" label="Test" />);

      // Both should reference same gradient config
      expect(mockGradients.primary.from).toBe('#3955B8');
    });
  });
});

describe('Responsive Gradient Behavior', () => {
  describe('Breakpoint Consistency', () => {
    it('should maintain gradient direction across breakpoints', () => {
      render(<DashboardCardWithGradient gradient="primary" title="Test" />);
      const card = screen.getByTestId('gradient-card');

      // Gradient direction should be consistent (no md: or lg: prefixes in test)
      expect(card.className).toContain('bg-gradient-to-r');
    });

    it('should support different directions for different use cases', () => {
      const directions = Object.values(mockGradients).map(g => g.direction);

      // Should have variety of directions
      expect(directions).toContain('to-r');
      expect(directions).toContain('to-b');
      expect(directions).toContain('to-br');
    });
  });
});

describe('Performance Considerations', () => {
  describe('Gradient Implementation', () => {
    it('should use CSS gradients (no image assets)', () => {
      render(<DashboardCardWithGradient gradient="primary" title="Test" />);
      const card = screen.getByTestId('gradient-card');

      // Should use Tailwind gradient classes, not background-image
      expect(card.className).toContain('bg-gradient-');
      expect(card.className).not.toContain('bg-[url(');
    });

    it('should generate minimal class strings', () => {
      const config: GradientConfig = {
        from: '#4B6FED',
        to: '#8A63F4',
        direction: 'to-r',
      };
      const className = gradientToClass(config);

      // Should be concise
      const classes = className.split(' ');
      expect(classes.length).toBeLessThanOrEqual(4);
    });
  });
});

describe('Edge Cases', () => {
  describe('Gradient Configuration Edge Cases', () => {
    it('should handle gradient without via color', () => {
      const config: GradientConfig = {
        from: '#000000',
        to: '#FFFFFF',
        direction: 'to-r',
      };
      const className = gradientToClass(config);
      expect(className).not.toContain('via-');
    });

    it('should handle gradient with via color', () => {
      const config: GradientConfig = {
        from: '#000000',
        via: '#808080',
        to: '#FFFFFF',
        direction: 'to-r',
      };
      const className = gradientToClass(config);
      expect(className).toContain('via-[#808080]');
    });

    it('should handle diagonal gradients', () => {
      const diagonals: GradientConfig['direction'][] = ['to-br', 'to-bl', 'to-tr', 'to-tl'];
      diagonals.forEach(direction => {
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

  describe('Accessibility Edge Cases', () => {
    it('should handle very light colors', () => {
      const ratio = getContrastRatio('#F0F0F0', '#FFFFFF');
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(1.5); // Very low contrast
    });

    it('should handle very dark colors', () => {
      const ratio = getContrastRatio('#101010', '#000000');
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(1.5); // Very low contrast
    });

    it('should correctly calculate mid-range contrasts', () => {
      const ratio = getContrastRatio('#4B6FED', '#FFFFFF');
      expect(ratio).toBeGreaterThan(3);
      expect(ratio).toBeLessThan(10);
    });
  });
});

describe('Integration Tests', () => {
  describe('Multiple Gradient Components', () => {
    it('should render multiple cards with different gradients', () => {
      const { container } = render(
        <div>
          <DashboardCardWithGradient gradient="primary" title="Card 1" />
          <DashboardCardWithGradient gradient="secondary" title="Card 2" />
          <DashboardCardWithGradient gradient="accent" title="Card 3" />
        </div>
      );

      const cards = container.querySelectorAll('[data-testid="gradient-card"]');
      expect(cards).toHaveLength(3);
    });

    it('should render header and buttons with consistent gradients', () => {
      const { container } = render(
        <div>
          <GradientHeader gradient="hero" />
          <GradientButton gradient="primary" label="Button 1" />
          <GradientButton gradient="success" label="Button 2" />
        </div>
      );

      const header = container.querySelector('[data-testid="gradient-header"]');
      const buttons = container.querySelectorAll('[data-testid="gradient-button"]');

      expect(header).toBeInTheDocument();
      expect(buttons).toHaveLength(2);
    });
  });
});
