import { render, screen } from '@/test/test-utils';
import { Button } from '../button';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  describe('Design Token Compliance', () => {
    it('outline variant uses design tokens instead of hardcoded colors', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');

      // Should use border-dark-2 token (not hardcoded #2D3748)
      expect(button.className).toContain('border-dark-2');
      // Should NOT contain hardcoded border color
      expect(button.className).not.toMatch(/border-\[#[0-9A-Fa-f]{6}\]/);
    });

    it('outline variant hover state uses design tokens', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');

      // Should use hover:bg-dark-3 token (not hardcoded #4B6FED/5)
      expect(button.className).toMatch(/hover:bg-dark-3/);
      // Should NOT contain hardcoded hover background
      expect(button.className).not.toMatch(/hover:bg-\[#[0-9A-Fa-f]{6}\]/);
    });

    it('outline variant text uses design tokens', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');

      // Should use text-brand-primary or text-foreground token
      const hasValidTextColor = button.className.includes('text-brand-primary') ||
                                button.className.includes('text-foreground') ||
                                button.className.includes('text-white');
      expect(hasValidTextColor).toBe(true);
      // Should NOT contain hardcoded text color for main text
      expect(button.className).not.toMatch(/^text-\[#[0-9A-Fa-f]{6}\]$/);
    });

    it('ghost variant uses design tokens for hover state', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');

      // Should use hover:bg-dark-3 or similar token (not hardcoded #4B6FED/10)
      expect(button.className).toMatch(/hover:bg-/);
      // Should NOT contain hardcoded hover background
      expect(button.className).not.toMatch(/hover:bg-\[#[0-9A-Fa-f]{6}\]/);
    });

    it('default variant uses design tokens', () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole('button');

      // Should use brand-primary or similar token (not hardcoded #4B6FED)
      const hasValidBgColor = button.className.includes('bg-brand-primary') ||
                              button.className.includes('bg-primary') ||
                              button.className.includes('bg-vite-primary');
      expect(hasValidBgColor).toBe(true);
    });

    it('secondary variant uses design tokens', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');

      // Should use vite-secondary or similar token (not hardcoded #8A63F4)
      const hasValidBgColor = button.className.includes('bg-vite-secondary') ||
                              button.className.includes('bg-secondary');
      expect(hasValidBgColor).toBe(true);
    });

    it('link variant uses design tokens', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');

      // Should use text-brand-primary or similar token (not hardcoded #4B6FED)
      const hasValidTextColor = button.className.includes('text-brand-primary') ||
                                button.className.includes('text-primary');
      expect(hasValidTextColor).toBe(true);
    });
  });

  describe('Variant Rendering', () => {
    it('renders with different variants', () => {
      const { rerender } = render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-destructive');

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('border-2');

      rerender(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/bg-/);

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('bg-primary');

      rerender(<Button variant="link">Link</Button>);
      expect(screen.getByRole('button')).toHaveClass('underline-offset-4');
    });
  });

  describe('Size Rendering', () => {
    it('renders with different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-8');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-11');

      rerender(<Button size="icon">Icon</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-10');
      expect(screen.getByRole('button')).toHaveClass('w-10');
    });
  });

  describe('Props and Ref Handling', () => {
    it('passes additional props to the button element', () => {
      render(<Button disabled data-testid="test-button">Disabled</Button>);
      const button = screen.getByTestId('test-button');
      expect(button).toBeDisabled();
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Accessibility', () => {
    it('maintains accessible button role', () => {
      render(<Button>Accessible Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports disabled state correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none');
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('supports focus-visible state with ring', () => {
      render(<Button>Focus Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-1');
    });
  });
});
