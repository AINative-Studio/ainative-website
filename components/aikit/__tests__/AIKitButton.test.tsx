import { render, screen } from '@/test/test-utils';
import { AIKitButton } from '../AIKitButton';

describe('AIKitButton', () => {
  describe('Rendering', () => {
    it('should render with default variant and size', () => {
      render(<AIKitButton>Click me</AIKitButton>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-gradient-to-r');
      expect(button).toHaveClass('from-[#4B6FED]');
    });

    it('should render with children', () => {
      render(<AIKitButton>Test Button</AIKitButton>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('should render as a child component when asChild is true', () => {
      render(
        <AIKitButton asChild>
          <a href="/test">Link Button</a>
        </AIKitButton>
      );
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      render(<AIKitButton variant="default">Default</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-[#4B6FED]');
      expect(button).toHaveClass('to-[#8A63F4]');
    });

    it('should apply outline variant styles', () => {
      render(<AIKitButton variant="outline">Outline</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-[#4B6FED]/40');
      expect(button).toHaveClass('bg-transparent');
    });

    it('should apply secondary variant styles', () => {
      render(<AIKitButton variant="secondary">Secondary</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-[#8A63F4]');
      expect(button).toHaveClass('to-[#A78BFA]');
    });

    it('should apply ghost variant styles', () => {
      render(<AIKitButton variant="ghost">Ghost</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-[#4B6FED]/10');
    });

    it('should apply link variant styles', () => {
      render(<AIKitButton variant="link">Link</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-[#4B6FED]');
      expect(button).toHaveClass('underline-offset-4');
    });

    it('should apply destructive variant styles', () => {
      render(<AIKitButton variant="destructive">Delete</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-red-600');
      expect(button).toHaveClass('to-red-700');
    });

    it('should apply success variant styles', () => {
      render(<AIKitButton variant="success">Success</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-green-600');
      expect(button).toHaveClass('to-green-700');
    });

    it('should apply warning variant styles', () => {
      render(<AIKitButton variant="warning">Warning</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-yellow-600');
      expect(button).toHaveClass('to-yellow-700');
    });
  });

  describe('Sizes', () => {
    it('should apply default size styles', () => {
      render(<AIKitButton size="default">Default Size</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('px-4');
    });

    it('should apply small size styles', () => {
      render(<AIKitButton size="sm">Small</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('text-xs');
    });

    it('should apply large size styles', () => {
      render(<AIKitButton size="lg">Large</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12');
      expect(button).toHaveClass('px-8');
      expect(button).toHaveClass('text-base');
    });

    it('should apply icon size styles', () => {
      render(<AIKitButton size="icon" aria-label="Icon button">X</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('w-10');
    });
  });

  describe('Interaction', () => {
    it('should handle click events', () => {
      const handleClick = jest.fn();
      render(<AIKitButton onClick={handleClick}>Click me</AIKitButton>);
      const button = screen.getByRole('button');
      button.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', () => {
      const handleClick = jest.fn();
      render(
        <AIKitButton onClick={handleClick} disabled>
          Disabled
        </AIKitButton>
      );
      const button = screen.getByRole('button');
      button.click();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should apply disabled styles when disabled', () => {
      render(<AIKitButton disabled>Disabled</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:pointer-events-none');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct role', () => {
      render(<AIKitButton>Button</AIKitButton>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<AIKitButton aria-label="Custom label">X</AIKitButton>);
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });

    it('should support aria-disabled', () => {
      render(<AIKitButton aria-disabled="true">Disabled</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have focus-visible styles', () => {
      render(<AIKitButton>Focusable</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-[#4B6FED]');
    });
  });

  describe('Custom className', () => {
    it('should merge custom className with default styles', () => {
      render(<AIKitButton className="custom-class">Custom</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('inline-flex');
    });
  });

  describe('Dark theme compatibility', () => {
    it('should use dark-compatible colors', () => {
      render(<AIKitButton>Dark Theme</AIKitButton>);
      const button = screen.getByRole('button');
      // Primary colors should be visible on dark backgrounds
      expect(button).toHaveClass('text-white');
    });

    it('should have proper contrast in outline variant', () => {
      render(<AIKitButton variant="outline">Outline Dark</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-white');
      expect(button).toHaveClass('border-[#4B6FED]/40');
    });

    it('should have proper contrast in ghost variant', () => {
      render(<AIKitButton variant="ghost">Ghost Dark</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-gray-300');
    });
  });

  describe('Animation and transitions', () => {
    it('should have transition classes', () => {
      render(<AIKitButton>Animated</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all');
      expect(button).toHaveClass('duration-300');
    });

    it('should have transform on hover for default variant', () => {
      render(<AIKitButton variant="default">Hover me</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:-translate-y-0.5');
    });
  });

  describe('Forward ref', () => {
    it('should forward ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<AIKitButton ref={ref}>Ref Button</AIKitButton>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Ref Button');
    });
  });

  describe('HTML attributes', () => {
    it('should support type attribute', () => {
      render(<AIKitButton type="submit">Submit</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should support name attribute', () => {
      render(<AIKitButton name="test-button">Named</AIKitButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('name', 'test-button');
    });

    it('should support data attributes', () => {
      render(<AIKitButton data-testid="custom-test-id">Data</AIKitButton>);
      const button = screen.getByTestId('custom-test-id');
      expect(button).toBeInTheDocument();
    });
  });
});
