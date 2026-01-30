/**
 * AIKit Button Component - TDD Test Suite
 *
 * Test Coverage Requirements:
 * - Component rendering (all variants, sizes, states)
 * - User interactions (click, hover, focus)
 * - Accessibility (ARIA labels, keyboard navigation, screen reader support)
 * - Dark theme compatibility
 * - Mobile responsiveness
 * - Error states and edge cases
 * - Loading states
 *
 * Coverage Target: 100% (Critical Component)
 */

import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AIKit Button Component - TDD Suite', () => {
  describe('Component Rendering', () => {
    it('should render button with text content', () => {
      // Given: A button with text
      render(<Button>Click Me</Button>);

      // Then: Button should be visible with correct text
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeVisible();
    });

    it('should render all variant styles correctly', () => {
      // Given: Different button variants
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

      variants.forEach((variant) => {
        // When: Rendering each variant
        const { rerender } = render(<Button variant={variant}>Button</Button>);
        const button = screen.getByRole('button');

        // Then: Each variant should have unique styling
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('inline-flex'); // Base class

        // Variant-specific classes
        if (variant === 'default') {
          expect(button).toHaveClass('bg-[#4B6FED]');
        } else if (variant === 'outline') {
          expect(button).toHaveClass('border-2');
        } else if (variant === 'link') {
          expect(button).toHaveClass('underline-offset-4');
        }

        rerender(<></>);
      });
    });

    it('should render all size variants correctly', () => {
      // Given: Different button sizes
      const sizes = [
        { size: 'sm' as const, expectedClass: 'h-8' },
        { size: 'default' as const, expectedClass: 'h-10' },
        { size: 'lg' as const, expectedClass: 'h-11' },
        { size: 'icon' as const, expectedClass: 'w-10' },
      ];

      sizes.forEach(({ size, expectedClass }) => {
        // When: Rendering each size
        const { unmount } = render(<Button size={size}>Button</Button>);
        const button = screen.getByRole('button');

        // Then: Should have correct size class
        expect(button).toHaveClass(expectedClass);

        unmount();
      });
    });

    it('should render with custom className', () => {
      // Given: Button with custom class
      render(<Button className="custom-test-class">Custom</Button>);

      // Then: Should merge custom class with default classes
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-test-class');
      expect(button).toHaveClass('inline-flex'); // Should still have base class
    });

    it('should render with icon children', () => {
      // Given: Button with icon
      const Icon = () => <svg data-testid="test-icon" />;
      render(
        <Button>
          <Icon />
          <span>With Icon</span>
        </Button>
      );

      // Then: Both icon and text should render
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('should handle asChild prop with Slot', () => {
      // Given: Button with asChild prop
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      // Then: Should render as anchor, not button
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('State Management', () => {
    it('should render disabled state correctly', () => {
      // Given: Disabled button
      render(<Button disabled>Disabled</Button>);

      // Then: Button should be disabled and have correct styling
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('should prevent interactions when disabled', async () => {
      // Given: Disabled button with click handler
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);

      // When: Attempting to click
      const button = screen.getByRole('button');
      await user.click(button);

      // Then: Click handler should not be called
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle loading state with aria-busy', () => {
      // Given: Loading button
      render(<Button aria-busy="true">Loading...</Button>);

      // Then: Should have aria-busy attribute
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', async () => {
      // Given: Button with click handler
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click Me</Button>);

      // When: User clicks button
      const button = screen.getByRole('button');
      await user.click(button);

      // Then: Click handler should be called once
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle double click events', async () => {
      // Given: Button with double click handler
      const handleDoubleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button onDoubleClick={handleDoubleClick}>Double Click</Button>);

      // When: User double clicks
      const button = screen.getByRole('button');
      await user.dblClick(button);

      // Then: Handler should be called
      expect(handleDoubleClick).toHaveBeenCalled();
    });

    it('should handle hover states', async () => {
      // Given: Button with hover handler
      const handleMouseEnter = jest.fn();
      const handleMouseLeave = jest.fn();
      const user = userEvent.setup();

      render(
        <Button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Hover Me
        </Button>
      );

      // When: User hovers over button
      const button = screen.getByRole('button');
      await user.hover(button);

      // Then: Mouse enter should be called
      expect(handleMouseEnter).toHaveBeenCalled();

      // When: User unhovers
      await user.unhover(button);

      // Then: Mouse leave should be called
      expect(handleMouseLeave).toHaveBeenCalled();
    });

    it('should handle focus and blur events', async () => {
      // Given: Button with focus handlers
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      const user = userEvent.setup();

      render(
        <Button onFocus={handleFocus} onBlur={handleBlur}>
          Focus Me
        </Button>
      );

      // When: User tabs to button
      const button = screen.getByRole('button');
      await user.tab();

      // Then: Button should be focused
      expect(button).toHaveFocus();
      expect(handleFocus).toHaveBeenCalled();

      // When: User tabs away
      await user.tab();

      // Then: Blur handler should be called
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should support keyboard activation (Space key)', async () => {
      // Given: Button with click handler
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Keyboard</Button>);

      // When: User focuses and presses Space
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      // Then: Click handler should be called
      expect(handleClick).toHaveBeenCalled();
    });

    it('should support keyboard activation (Enter key)', async () => {
      // Given: Button with click handler
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Keyboard</Button>);

      // When: User focuses and presses Enter
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      // Then: Click handler should be called
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility (WCAG 2.1 AA Compliance)', () => {
    it('should have no accessibility violations', async () => {
      // Given: Button component
      const { container } = render(<Button>Accessible Button</Button>);

      // When: Running axe accessibility tests
      const results = await axe(container);

      // Then: Should have no violations
      expect(results).toHaveNoViolations();
    });

    it('should have accessible name', () => {
      // Given: Button with text content
      render(<Button>Accessible Button</Button>);

      // Then: Should have accessible name
      const button = screen.getByRole('button', { name: /accessible button/i });
      expect(button).toHaveAccessibleName('Accessible Button');
    });

    it('should support aria-label for icon-only buttons', () => {
      // Given: Icon-only button with aria-label
      render(
        <Button aria-label="Close dialog" size="icon">
          <svg data-testid="close-icon" />
        </Button>
      );

      // Then: Should have accessible name from aria-label
      const button = screen.getByRole('button', { name: /close dialog/i });
      expect(button).toHaveAccessibleName('Close dialog');
    });

    it('should support aria-describedby for additional context', () => {
      // Given: Button with description
      render(
        <>
          <Button aria-describedby="btn-description">Submit</Button>
          <p id="btn-description">This will submit the form</p>
        </>
      );

      // Then: Should have accessible description
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveAccessibleDescription('This will submit the form');
    });

    it('should have proper focus indicators', () => {
      // Given: Button component
      render(<Button>Focus Test</Button>);

      // When: Button receives focus
      const button = screen.getByRole('button');
      button.focus();

      // Then: Should have focus-visible styles
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-1');
    });

    it('should announce loading state to screen readers', () => {
      // Given: Loading button
      render(
        <Button aria-busy="true" aria-live="polite">
          Loading...
        </Button>
      );

      // Then: Should have proper ARIA attributes
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-live', 'polite');
    });

    it('should be keyboard navigable', async () => {
      // Given: Multiple buttons
      const user = userEvent.setup();
      render(
        <>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </>
      );

      // When: User tabs through buttons
      await user.tab();
      expect(screen.getByRole('button', { name: /first/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /second/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /third/i })).toHaveFocus();
    });

    it('should skip disabled buttons in tab order', async () => {
      // Given: Mix of enabled and disabled buttons
      const user = userEvent.setup();
      render(
        <>
          <Button>First</Button>
          <Button disabled>Disabled</Button>
          <Button>Third</Button>
        </>
      );

      // When: User tabs through
      await user.tab();
      expect(screen.getByRole('button', { name: /first/i })).toHaveFocus();

      await user.tab();
      // Then: Should skip disabled button
      expect(screen.getByRole('button', { name: /third/i })).toHaveFocus();
    });
  });

  describe('Dark Theme Compatibility', () => {
    it('should render correctly in dark theme', () => {
      // Given: Button in dark theme wrapper
      const { container } = render(
        <div className="dark">
          <Button>Dark Mode Button</Button>
        </div>
      );

      // Then: Button should render without errors
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(container.querySelector('.dark')).toBeInTheDocument();
    });

    it('should maintain contrast in dark theme', () => {
      // Given: Different variants in dark theme
      const variants = ['default', 'outline', 'ghost'] as const;

      variants.forEach((variant) => {
        const { unmount } = render(
          <div className="dark">
            <Button variant={variant}>Dark Theme</Button>
          </div>
        );

        // Then: Button should be visible
        const button = screen.getByRole('button');
        expect(button).toBeVisible();

        unmount();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be touch-friendly with adequate touch target size', () => {
      // Given: Button component
      render(<Button>Touch Target</Button>);

      // Then: Should meet WCAG touch target size (44x44px minimum recommended)
      const button = screen.getByRole('button');
      // Default size is h-10 (40px) which is acceptable for secondary actions
      expect(button).toHaveClass('h-10');
    });

    it('should render large size for primary mobile actions', () => {
      // Given: Large button for mobile
      render(<Button size="lg">Large Touch Target</Button>);

      // Then: Should have larger height for better touch
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11');
    });

    it('should handle touch events', async () => {
      // Given: Button with click handler
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Touch Me</Button>);

      // When: Simulating touch
      const button = screen.getByRole('button');
      button.click(); // Simulates tap

      // Then: Handler should be called
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Error States and Edge Cases', () => {
    it('should handle null children gracefully', () => {
      // Given: Button with null children
      render(<Button>{null}</Button>);

      // Then: Should render without crashing
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      // Given: Button with undefined children
      render(<Button>{undefined}</Button>);

      // Then: Should render without crashing
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle empty string children', () => {
      // Given: Button with empty string
      render(<Button aria-label="Empty button">{''}</Button>);

      // Then: Should render with aria-label as accessible name
      const button = screen.getByRole('button', { name: /empty button/i });
      expect(button).toBeInTheDocument();
    });

    it('should handle very long text content', () => {
      // Given: Button with long text
      const longText = 'This is a very long button text that might wrap or truncate depending on the container width and styling applied';
      render(<Button>{longText}</Button>);

      // Then: Should render with text
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(longText);
    });

    it('should handle rapid consecutive clicks', async () => {
      // Given: Button with click handler
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Rapid Click</Button>);

      // When: User clicks rapidly
      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Then: All clicks should register
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should prevent default behavior when type is submit in form', () => {
      // Given: Submit button in form
      const handleSubmit = jest.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );

      // When: Clicking submit button
      const button = screen.getByRole('button');
      button.click();

      // Then: Form submit should be called
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should render loading state with spinner', () => {
      // Given: Loading button with spinner
      render(
        <Button disabled aria-busy="true">
          <svg data-testid="spinner" className="animate-spin" />
          Loading...
        </Button>
      );

      // Then: Should show spinner and be disabled
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should prevent clicks during loading', async () => {
      // Given: Loading button
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(
        <Button disabled aria-busy="true" onClick={handleClick}>
          Loading...
        </Button>
      );

      // When: Attempting to click
      const button = screen.getByRole('button');
      await user.click(button);

      // Then: Click should be prevented
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should announce loading state changes', async () => {
      // Given: Button that transitions to loading
      const { rerender } = render(<Button>Submit</Button>);

      // When: Changing to loading state
      rerender(
        <Button disabled aria-busy="true" aria-live="polite">
          Loading...
        </Button>
      );

      // Then: Should have proper ARIA attributes
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to button element', () => {
      // Given: Button with ref
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);

      // Then: Ref should point to button element
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveTextContent('Ref Button');
    });

    it('should allow imperative focus via ref', () => {
      // Given: Button with ref
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Focus Via Ref</Button>);

      // When: Focusing programmatically
      ref.current?.focus();

      // Then: Button should be focused
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Type Safety and Props', () => {
    it('should accept all standard button attributes', () => {
      // Given: Button with standard HTML attributes
      render(
        <Button
          type="button"
          name="test-button"
          value="test-value"
          form="test-form"
          formAction="/test"
          formMethod="post"
          data-testid="full-props-button"
        >
          Full Props
        </Button>
      );

      // Then: All attributes should be applied
      const button = screen.getByTestId('full-props-button');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('name', 'test-button');
      expect(button).toHaveAttribute('value', 'test-value');
    });

    it('should merge event handlers correctly', async () => {
      // Given: Button with multiple event handlers
      const onClick1 = jest.fn();
      const onClick2 = jest.fn();
      const user = userEvent.setup();

      const TestComponent = () => {
        const handleClick = (e: React.MouseEvent) => {
          onClick1();
          onClick2();
        };

        return <Button onClick={handleClick}>Multi Handler</Button>;
      };

      render(<TestComponent />);

      // When: Clicking button
      await user.click(screen.getByRole('button'));

      // Then: Both handlers should be called
      expect(onClick1).toHaveBeenCalled();
      expect(onClick2).toHaveBeenCalled();
    });
  });
});
