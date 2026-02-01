/**
 * GradientText Component Tests
 * Issue #499 - Typography Scale Alignment
 *
 * Tests verify:
 * 1. Size variants align with typography scale (display, title, body)
 * 2. Responsive scaling behavior
 * 3. Font-weight consistency across sizes
 * 4. Gradient application at all sizes
 * 5. Animation variants
 * 6. Accessibility attributes
 */

import { render, screen } from '@testing-library/react';
import { GradientText, GradientBorder } from '../gradient-text';
import '@testing-library/jest-dom';

describe('GradientText', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<GradientText>Hello World</GradientText>);
      const element = screen.getByText('Hello World');
      expect(element).toBeInTheDocument();
      expect(element.tagName).toBe('SPAN');
    });

    it('should render as specified semantic element', () => {
      render(<GradientText as="h1">Heading</GradientText>);
      const element = screen.getByText('Heading');
      expect(element.tagName).toBe('H1');
    });

    it('should render with children content', () => {
      render(
        <GradientText>
          <span>Nested</span> Content
        </GradientText>
      );
      expect(screen.getByText(/Nested/)).toBeInTheDocument();
    });
  });

  describe('Size Variants - Typography Scale Alignment', () => {
    it('should apply display-1 size variant (72px)', () => {
      render(<GradientText size="display-1">Display 1</GradientText>);
      const element = screen.getByText('Display 1');
      expect(element).toHaveClass('text-display-1');
    });

    it('should apply display-2 size variant (60px)', () => {
      render(<GradientText size="display-2">Display 2</GradientText>);
      const element = screen.getByText('Display 2');
      expect(element).toHaveClass('text-display-2');
    });

    it('should apply display-3 size variant (48px)', () => {
      render(<GradientText size="display-3">Display 3</GradientText>);
      const element = screen.getByText('Display 3');
      expect(element).toHaveClass('text-display-3');
    });

    it('should apply title-1 size variant (28px)', () => {
      render(<GradientText size="title-1">Title 1</GradientText>);
      const element = screen.getByText('Title 1');
      expect(element).toHaveClass('text-title-1');
    });

    it('should apply title-2 size variant (24px)', () => {
      render(<GradientText size="title-2">Title 2</GradientText>);
      const element = screen.getByText('Title 2');
      expect(element).toHaveClass('text-title-2');
    });

    it('should apply title-3 size variant', () => {
      render(<GradientText size="title-3">Title 3</GradientText>);
      const element = screen.getByText('Title 3');
      expect(element).toHaveClass('text-title-3');
    });

    it('should apply title-4 size variant', () => {
      render(<GradientText size="title-4">Title 4</GradientText>);
      const element = screen.getByText('Title 4');
      expect(element).toHaveClass('text-title-4');
    });

    it('should apply body-lg size variant', () => {
      render(<GradientText size="body-lg">Body Large</GradientText>);
      const element = screen.getByText('Body Large');
      expect(element).toHaveClass('text-body-lg');
    });

    it('should apply body size variant (default)', () => {
      render(<GradientText size="body">Body</GradientText>);
      const element = screen.getByText('Body');
      expect(element).toHaveClass('text-body');
    });

    it('should apply body-sm size variant', () => {
      render(<GradientText size="body-sm">Body Small</GradientText>);
      const element = screen.getByText('Body Small');
      expect(element).toHaveClass('text-body-sm');
    });

    it('should apply ui size variant', () => {
      render(<GradientText size="ui">UI Text</GradientText>);
      const element = screen.getByText('UI Text');
      expect(element).toHaveClass('text-ui');
    });

    it('should use default size when size prop is omitted', () => {
      render(<GradientText>Default Size</GradientText>);
      const element = screen.getByText('Default Size');
      expect(element).toHaveClass('text-body');
    });
  });

  describe('Gradient Variants', () => {
    it('should apply primary gradient variant (default)', () => {
      render(<GradientText>Primary</GradientText>);
      const element = screen.getByText('Primary');
      expect(element.className).toContain('from-[#5867EF]');
      expect(element.className).toContain('to-[#9747FF]');
    });

    it('should apply secondary gradient variant', () => {
      render(<GradientText variant="secondary">Secondary</GradientText>);
      const element = screen.getByText('Secondary');
      expect(element.className).toContain('from-[#338585]');
      expect(element.className).toContain('to-[#22BCDE]');
    });

    it('should apply accent gradient variant', () => {
      render(<GradientText variant="accent">Accent</GradientText>);
      const element = screen.getByText('Accent');
      expect(element.className).toContain('from-[#FCAE39]');
      expect(element.className).toContain('to-[#FF6B6B]');
    });

    it('should apply rainbow gradient variant', () => {
      render(<GradientText variant="rainbow">Rainbow</GradientText>);
      const element = screen.getByText('Rainbow');
      expect(element.className).toContain('from-[#5867EF]');
      expect(element.className).toContain('via-[#9747FF]');
      expect(element.className).toContain('to-[#22BCDE]');
    });

    it('should apply sunset gradient variant', () => {
      render(<GradientText variant="sunset">Sunset</GradientText>);
      const element = screen.getByText('Sunset');
      expect(element.className).toContain('from-[#FF6B6B]');
      expect(element.className).toContain('via-[#FCAE39]');
      expect(element.className).toContain('to-[#FF8E53]');
    });

    it('should apply ocean gradient variant', () => {
      render(<GradientText variant="ocean">Ocean</GradientText>);
      const element = screen.getByText('Ocean');
      expect(element.className).toContain('from-[#22BCDE]');
      expect(element.className).toContain('via-[#338585]');
      expect(element.className).toContain('to-[#1A7575]');
    });
  });

  describe('Animation', () => {
    it('should not animate by default', () => {
      render(<GradientText>Static</GradientText>);
      const element = screen.getByText('Static');
      expect(element.className).not.toContain('animate-gradient-shift');
    });

    it('should apply animation when animated prop is true', () => {
      render(<GradientText animated>Animated</GradientText>);
      const element = screen.getByText('Animated');
      expect(element.className).toContain('animate-gradient-shift');
    });

    it('should apply background size for animation', () => {
      render(<GradientText animated>Animated</GradientText>);
      const element = screen.getByText('Animated');
      expect(element.className).toContain('bg-[length:200%_auto]');
    });
  });

  describe('Font Weight Consistency', () => {
    it('should apply bold font-weight by default', () => {
      render(<GradientText>Bold Text</GradientText>);
      const element = screen.getByText('Bold Text');
      expect(element.className).toContain('font-bold');
    });

    it('should maintain bold weight across all size variants', () => {
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

  describe('Gradient Application', () => {
    it('should apply background-clip text for gradient effect', () => {
      render(<GradientText>Clipped</GradientText>);
      const element = screen.getByText('Clipped');
      // bg-clip-text makes text transparent with gradient
      expect(element.className).toContain('bg-clip-text');
      expect(element.className).toContain('bg-gradient-to-r');
    });

    it('should apply gradient direction', () => {
      render(<GradientText>Directional</GradientText>);
      const element = screen.getByText('Directional');
      expect(element.className).toContain('bg-gradient-to-r');
    });

    it('should apply gradient colors', () => {
      render(<GradientText variant="primary">Gradient</GradientText>);
      const element = screen.getByText('Gradient');
      expect(element.className).toContain('from-[#5867EF]');
      expect(element.className).toContain('to-[#9747FF]');
    });
  });

  describe('Custom className', () => {
    it('should merge custom className with default styles', () => {
      render(<GradientText className="custom-class">Custom</GradientText>);
      const element = screen.getByText('Custom');
      expect(element.className).toContain('custom-class');
      expect(element.className).toContain('bg-clip-text');
    });

    it('should allow overriding default styles', () => {
      render(<GradientText className="text-left">Aligned</GradientText>);
      const element = screen.getByText('Aligned');
      expect(element.className).toContain('text-left');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with proper semantic elements', () => {
      render(<GradientText as="h1">Accessible Heading</GradientText>);
      const element = screen.getByRole('heading', { level: 1 });
      expect(element).toBeInTheDocument();
    });

    it('should support aria attributes', () => {
      render(
        <GradientText aria-label="Custom Label">Text</GradientText>
      );
      const element = screen.getByLabelText('Custom Label');
      expect(element).toBeInTheDocument();
    });

    it('should support data attributes', () => {
      render(<GradientText data-testid="gradient-text">Test</GradientText>);
      const element = screen.getByTestId('gradient-text');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Forwarded Ref', () => {
    it('should forward ref to the underlying element', () => {
      const ref = { current: null as HTMLElement | null };
      render(<GradientText ref={ref}>Ref Test</GradientText>);
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.textContent).toBe('Ref Test');
    });
  });

  describe('Responsive Scaling', () => {
    it('should apply responsive display classes', () => {
      render(<GradientText size="display-1">Responsive</GradientText>);
      const element = screen.getByText('Responsive');
      // text-display-1 includes responsive scaling via CSS
      expect(element).toHaveClass('text-display-1');
    });

    it('should apply responsive title classes', () => {
      render(<GradientText size="title-1">Mobile Optimized</GradientText>);
      const element = screen.getByText('Mobile Optimized');
      // text-title-1 is mobile-optimized (28px → 24px on mobile)
      expect(element).toHaveClass('text-title-1');
    });
  });

  describe('Combination Tests', () => {
    it('should combine size, variant, and animation', () => {
      render(
        <GradientText size="title-1" variant="rainbow" animated>
          Combined
        </GradientText>
      );
      const element = screen.getByText('Combined');
      expect(element).toHaveClass('text-title-1');
      expect(element.className).toContain('from-[#5867EF]');
      expect(element.className).toContain('animate-gradient-shift');
    });

    it('should combine semantic element with all props', () => {
      render(
        <GradientText
          as="h2"
          size="title-2"
          variant="accent"
          className="mb-4"
        >
          Full Featured
        </GradientText>
      );
      const element = screen.getByText('Full Featured');
      expect(element.tagName).toBe('H2');
      expect(element).toHaveClass('text-title-2');
      expect(element).toHaveClass('mb-4');
      expect(element.className).toContain('from-[#FCAE39]');
    });
  });
});

describe('GradientBorder', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<GradientBorder>Content</GradientBorder>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should wrap children in gradient border', () => {
      const { container } = render(
        <GradientBorder>Wrapped Content</GradientBorder>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('bg-gradient-to-r');
      expect(wrapper.className).toContain('rounded-lg');
    });
  });

  describe('Gradient Variants', () => {
    it('should apply primary gradient variant (default)', () => {
      const { container } = render(<GradientBorder>Primary</GradientBorder>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('from-[#5867EF]');
      expect(wrapper.className).toContain('to-[#9747FF]');
    });

    it('should apply secondary gradient variant', () => {
      const { container } = render(
        <GradientBorder variant="secondary">Secondary</GradientBorder>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('from-[#338585]');
      expect(wrapper.className).toContain('to-[#22BCDE]');
    });

    it('should apply rainbow gradient variant', () => {
      const { container } = render(
        <GradientBorder variant="rainbow">Rainbow</GradientBorder>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('from-[#5867EF]');
      expect(wrapper.className).toContain('via-[#9747FF]');
      expect(wrapper.className).toContain('to-[#22BCDE]');
    });
  });

  describe('Border Width', () => {
    it('should apply default border width (1px)', () => {
      const { container } = render(<GradientBorder>Default</GradientBorder>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('p-[1px]');
    });

    it('should apply 2px border width', () => {
      const { container } = render(
        <GradientBorder borderWidth="2">Thick</GradientBorder>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('p-[2px]');
    });

    it('should apply 3px border width', () => {
      const { container } = render(
        <GradientBorder borderWidth="3">Thicker</GradientBorder>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('p-[3px]');
    });
  });

  describe('Custom className', () => {
    it('should merge custom className', () => {
      const { container } = render(
        <GradientBorder className="shadow-lg">Custom</GradientBorder>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('shadow-lg');
      expect(wrapper.className).toContain('bg-gradient-to-r');
    });
  });

  describe('Forwarded Ref', () => {
    it('should forward ref to the wrapper div', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<GradientBorder ref={ref}>Ref Test</GradientBorder>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
