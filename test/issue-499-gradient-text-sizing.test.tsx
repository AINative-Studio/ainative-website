/**
 * Issue #499 - GradientText Size Scale Discrepancy
 * Test Validation Script
 *
 * This test validates that GradientText component:
 * 1. Aligns with the typography scale defined in globals.css
 * 2. Uses consistent size naming (display-1, title-1, body, etc.)
 * 3. Applies correct CSS classes for each size variant
 * 4. Maintains responsive behavior
 */

import { render, screen } from '@testing-library/react';
import { GradientText } from '@/components/ui/gradient-text';
import '@testing-library/jest-dom';

describe('Issue #499 - GradientText Typography Scale Alignment', () => {
  describe('Typography Scale Alignment Verification', () => {
    it('should support display-1 size (72px)', () => {
      render(<GradientText size="display-1">Display 1</GradientText>);
      const element = screen.getByText('Display 1');
      expect(element).toHaveClass('text-display-1');
      expect(element.className).not.toContain('text-6xl'); // Old Tailwind size
    });

    it('should support display-2 size (60px)', () => {
      render(<GradientText size="display-2">Display 2</GradientText>);
      const element = screen.getByText('Display 2');
      expect(element).toHaveClass('text-display-2');
      expect(element.className).not.toContain('text-5xl'); // Old Tailwind size
    });

    it('should support display-3 size (48px)', () => {
      render(<GradientText size="display-3">Display 3</GradientText>);
      const element = screen.getByText('Display 3');
      expect(element).toHaveClass('text-display-3');
      expect(element.className).not.toContain('text-4xl'); // Old Tailwind size
    });

    it('should support title-1 size (28px, mobile-optimized)', () => {
      render(<GradientText size="title-1">Title 1</GradientText>);
      const element = screen.getByText('Title 1');
      expect(element).toHaveClass('text-title-1');
      expect(element.className).not.toContain('text-3xl'); // Old Tailwind size
    });

    it('should support title-2 size (24px, mobile-optimized)', () => {
      render(<GradientText size="title-2">Title 2</GradientText>);
      const element = screen.getByText('Title 2');
      expect(element).toHaveClass('text-title-2');
      expect(element.className).not.toContain('text-2xl'); // Old Tailwind size
    });

    it('should support title-3 size (24px)', () => {
      render(<GradientText size="title-3">Title 3</GradientText>);
      const element = screen.getByText('Title 3');
      expect(element).toHaveClass('text-title-3');
    });

    it('should support title-4 size (20px)', () => {
      render(<GradientText size="title-4">Title 4</GradientText>);
      const element = screen.getByText('Title 4');
      expect(element).toHaveClass('text-title-4');
    });

    it('should support body-lg size (18px)', () => {
      render(<GradientText size="body-lg">Body Large</GradientText>);
      const element = screen.getByText('Body Large');
      expect(element).toHaveClass('text-body-lg');
      expect(element.className).not.toContain('text-lg'); // Old Tailwind size
    });

    it('should support body size (16px) as default', () => {
      render(<GradientText size="body">Body</GradientText>);
      const element = screen.getByText('Body');
      expect(element).toHaveClass('text-body');
      expect(element.className).not.toContain('text-base'); // Old Tailwind size
    });

    it('should support body-sm size (14px)', () => {
      render(<GradientText size="body-sm">Body Small</GradientText>);
      const element = screen.getByText('Body Small');
      expect(element).toHaveClass('text-body-sm');
      expect(element.className).not.toContain('text-sm'); // Old Tailwind size
    });

    it('should support ui size (14px)', () => {
      render(<GradientText size="ui">UI Text</GradientText>);
      const element = screen.getByText('UI Text');
      expect(element).toHaveClass('text-ui');
    });
  });

  describe('No Legacy Tailwind Sizes', () => {
    const legacySizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'];

    it('should not use legacy Tailwind size classes', () => {
      const sizes = ['display-1', 'title-1', 'body', 'ui'] as const;

      sizes.forEach((size) => {
        const { container } = render(
          <GradientText size={size}>Test {size}</GradientText>
        );
        const element = container.firstChild as HTMLElement;

        legacySizes.forEach((legacySize) => {
          expect(element.className).not.toContain(legacySize);
        });
      });
    });
  });

  describe('Size Variant Consistency', () => {
    it('should apply correct gradient to all size variants', () => {
      const sizes = ['display-1', 'title-1', 'body', 'ui'] as const;

      sizes.forEach((size) => {
        const { container } = render(
          <GradientText size={size} variant="primary">
            Test {size}
          </GradientText>
        );
        const element = container.firstChild as HTMLElement;
        expect(element.className).toContain('from-[#5867EF]');
        expect(element.className).toContain('to-[#9747FF]');
      });
    });

    it('should apply animation to all size variants', () => {
      const sizes = ['display-1', 'title-1', 'body', 'ui'] as const;

      sizes.forEach((size) => {
        const { container } = render(
          <GradientText size={size} animated>
            Test {size}
          </GradientText>
        );
        const element = container.firstChild as HTMLElement;
        expect(element.className).toContain('animate-gradient-shift');
      });
    });
  });

  describe('Default Size Behavior', () => {
    it('should use body size as default when size prop is omitted', () => {
      render(<GradientText>Default Size</GradientText>);
      const element = screen.getByText('Default Size');
      expect(element).toHaveClass('text-body');
    });

    it('should not apply any legacy size when size prop is omitted', () => {
      const { container } = render(<GradientText>Default</GradientText>);
      const element = container.firstChild as HTMLElement;

      expect(element.className).not.toContain('text-base');
      expect(element.className).not.toContain('text-lg');
      expect(element.className).not.toContain('text-xl');
    });
  });

  describe('Responsive Typography Integration', () => {
    it('should use mobile-optimized title-1 class', () => {
      render(<GradientText size="title-1">Mobile Title</GradientText>);
      const element = screen.getByText('Mobile Title');
      // text-title-1 CSS includes responsive behavior (28px → 24px on mobile)
      expect(element).toHaveClass('text-title-1');
    });

    it('should use mobile-optimized title-2 class', () => {
      render(<GradientText size="title-2">Mobile Title 2</GradientText>);
      const element = screen.getByText('Mobile Title 2');
      // text-title-2 CSS includes responsive behavior (24px → 20px on mobile)
      expect(element).toHaveClass('text-title-2');
    });

    it('should use responsive display classes', () => {
      render(<GradientText size="display-1">Hero Text</GradientText>);
      const element = screen.getByText('Hero Text');
      // text-display-1 CSS includes responsive behavior (72px → 48px on mobile)
      expect(element).toHaveClass('text-display-1');
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should maintain gradient text clipping across all sizes', () => {
      const sizes = ['display-1', 'title-1', 'body', 'ui'] as const;

      sizes.forEach((size) => {
        const { container } = render(
          <GradientText size={size}>Test {size}</GradientText>
        );
        const element = container.firstChild as HTMLElement;
        expect(element.className).toContain('bg-clip-text');
        expect(element.className).toContain('bg-gradient-to-r');
      });
    });

    it('should maintain bold font weight across all sizes', () => {
      const sizes = ['display-1', 'title-1', 'body', 'ui'] as const;

      sizes.forEach((size) => {
        const { container } = render(
          <GradientText size={size}>Test {size}</GradientText>
        );
        const element = container.firstChild as HTMLElement;
        expect(element.className).toContain('font-bold');
      });
    });
  });

  describe('Backward Compatibility Check', () => {
    it('should render existing components without breaking', () => {
      // Test that existing usages with old props still work
      // This ensures we don't break existing code
      render(<GradientText variant="rainbow" animated>Legacy Usage</GradientText>);
      const element = screen.getByText('Legacy Usage');
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass('text-body'); // Default size
    });
  });

  describe('CSS Variable Alignment', () => {
    it('should align with typography scale CSS variables', () => {
      // This test verifies that the component uses classes that match
      // the CSS variables defined in globals.css
      const sizeToVariableMap = {
        'display-1': '--font-size-display-1: 72px',
        'display-2': '--font-size-display-2: 60px',
        'display-3': '--font-size-display-3: 48px',
        'title-1': '--font-size-title-1: 28px',
        'title-2': '--font-size-title-2: 24px',
        'title-3': '--font-size-title-3: 24px',
        'title-4': '--font-size-title-4: 20px',
        'body-lg': '--font-size-body-lg: 18px',
        'body': '--font-size-body: 16px',
        'body-sm': '--font-size-body-sm: 14px',
        'ui': '--font-size-ui: 14px',
      };

      Object.keys(sizeToVariableMap).forEach((size) => {
        const { container } = render(
          <GradientText size={size as any}>Test</GradientText>
        );
        const element = container.firstChild as HTMLElement;
        expect(element).toHaveClass(`text-${size}`);
      });
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should work for hero section display text', () => {
      render(
        <GradientText
          as="h1"
          size="display-1"
          variant="rainbow"
          animated
          className="text-center"
        >
          Welcome to AI Native
        </GradientText>
      );
      const element = screen.getByRole('heading', { level: 1 });
      expect(element).toHaveClass('text-display-1');
      expect(element).toHaveClass('text-center');
      expect(element.className).toContain('animate-gradient-shift');
    });

    it('should work for section headings', () => {
      render(
        <GradientText as="h2" size="title-1" variant="primary">
          Our Products
        </GradientText>
      );
      const element = screen.getByRole('heading', { level: 2 });
      expect(element).toHaveClass('text-title-1');
      expect(element.className).toContain('from-[#5867EF]');
    });

    it('should work for card titles', () => {
      render(
        <GradientText as="h3" size="title-3" variant="accent">
          Feature Card
        </GradientText>
      );
      const element = screen.getByRole('heading', { level: 3 });
      expect(element).toHaveClass('text-title-3');
    });

    it('should work for inline gradient text', () => {
      render(
        <p>
          This is a paragraph with{' '}
          <GradientText size="body" variant="secondary">
            gradient text
          </GradientText>
          {' '}inline.
        </p>
      );
      const element = screen.getByText('gradient text');
      expect(element).toHaveClass('text-body');
      expect(element.tagName).toBe('SPAN');
    });
  });
});
