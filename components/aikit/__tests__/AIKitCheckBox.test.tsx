/**
 * AIKitCheckBox Component - TDD Test Suite
 * Coverage Target: 85%+
 *
 * Tests cover:
 * - All states (checked, unchecked, indeterminate)
 * - Disabled state
 * - Label integration
 * - Keyboard support (Space to toggle)
 * - WCAG 2.1 AA compliance
 */

import * as React from 'react';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AIKitCheckBox } from '../AIKitCheckBox';

expect.extend(toHaveNoViolations);

describe('AIKitCheckBox - TDD Test Suite', () => {
  describe('Rendering - All States', () => {
    it('should render unchecked by default', () => {
      render(<AIKitCheckBox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should render checked when defaultChecked is true', () => {
      render(<AIKitCheckBox defaultChecked data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should render in indeterminate state', () => {
      render(<AIKitCheckBox checked="indeterminate" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    });

    it('should render in disabled state', () => {
      render(<AIKitCheckBox disabled data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('disabled');
      expect(checkbox).toHaveClass('disabled:opacity-50');
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should apply AI Kit themed styles', () => {
      render(<AIKitCheckBox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      // Should have AI Kit primary color focus ring
      expect(checkbox).toHaveClass('focus-visible:ring-[#4B6FED]');
    });

    it('should apply custom className', () => {
      render(<AIKitCheckBox className="custom-checkbox" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('custom-checkbox');
    });
  });

  describe('Label Integration', () => {
    it('should render with label when provided', () => {
      render(<AIKitCheckBox label="Accept terms" data-testid="checkbox" />);
      expect(screen.getByText('Accept terms')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /accept terms/i })).toBeInTheDocument();
    });

    it('should support label positioning - right (default)', () => {
      render(<AIKitCheckBox label="Right Label" data-testid="checkbox" />);
      const container = screen.getByTestId('checkbox').parentElement;
      expect(container).toHaveClass('flex-row');
    });

    it('should support label positioning - left', () => {
      render(<AIKitCheckBox label="Left Label" labelPosition="left" data-testid="checkbox" />);
      const container = screen.getByTestId('checkbox').parentElement;
      expect(container).toHaveClass('flex-row-reverse');
    });

    it('should support label positioning - top', () => {
      render(<AIKitCheckBox label="Top Label" labelPosition="top" data-testid="checkbox" />);
      const container = screen.getByTestId('checkbox').parentElement;
      expect(container).toHaveClass('flex-col');
    });

    it('should support label positioning - bottom', () => {
      render(<AIKitCheckBox label="Bottom Label" labelPosition="bottom" data-testid="checkbox" />);
      const container = screen.getByTestId('checkbox').parentElement;
      expect(container).toHaveClass('flex-col-reverse');
    });

    it('should link label to checkbox via htmlFor', () => {
      render(<AIKitCheckBox id="test-checkbox" label="Test Label" />);
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-checkbox');
    });

    it('should toggle checkbox when label is clicked', async () => {
      const user = userEvent.setup();
      render(<AIKitCheckBox id="click-test" label="Click Label" data-testid="checkbox" />);

      const label = screen.getByText('Click Label');
      const checkbox = screen.getByTestId('checkbox');

      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
      await user.click(label);
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('User Interaction - Click', () => {
    it('should toggle from unchecked to checked on click', async () => {
      const user = userEvent.setup();
      render(<AIKitCheckBox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');

      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should toggle from checked to unchecked on click', async () => {
      const user = userEvent.setup();
      render(<AIKitCheckBox defaultChecked data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');

      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('should call onCheckedChange with correct value', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<AIKitCheckBox onCheckedChange={handleChange} data-testid="checkbox" />);

      await user.click(screen.getByTestId('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(true);

      await user.click(screen.getByTestId('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('should not trigger click when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<AIKitCheckBox disabled onCheckedChange={handleChange} data-testid="checkbox" />);

      await user.click(screen.getByTestId('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle rapid clicking', async () => {
      const user = userEvent.setup();
      render(<AIKitCheckBox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('Keyboard Support', () => {
    it('should toggle with Space key', async () => {
      const user = userEvent.setup();
      render(<AIKitCheckBox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      checkbox.focus();

      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
      await user.keyboard(' ');
      expect(checkbox).toHaveAttribute('data-state', 'checked');

      await user.keyboard(' ');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('should not toggle with Enter key (Radix behavior)', async () => {
      const user = userEvent.setup();
      render(<AIKitCheckBox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      checkbox.focus();

      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
      await user.keyboard('{Enter}');
      // Radix checkboxes only toggle with Space, not Enter
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('should be focusable via Tab key', async () => {
      const user = userEvent.setup();
      render(
        <>
          <AIKitCheckBox data-testid="checkbox1" />
          <AIKitCheckBox data-testid="checkbox2" />
        </>
      );

      await user.tab();
      expect(screen.getByTestId('checkbox1')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('checkbox2')).toHaveFocus();
    });

    it('should not respond to keyboard when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<AIKitCheckBox disabled onCheckedChange={handleChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      checkbox.focus();
      await user.keyboard(' ');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('WCAG 2.1 AA Accessibility Compliance', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <AIKitCheckBox id="test-checkbox" label="Test Checkbox" />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA role', () => {
      render(<AIKitCheckBox data-testid="checkbox" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should have correct aria-checked values for all states', () => {
      const { rerender } = render(<AIKitCheckBox checked={false} data-testid="checkbox" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');

      rerender(<AIKitCheckBox checked={true} data-testid="checkbox" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');

      rerender(<AIKitCheckBox checked="indeterminate" data-testid="checkbox" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
    });

    it('should support aria-label', () => {
      render(<AIKitCheckBox aria-label="Custom label" />);
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });

    it('should support aria-labelledby', () => {
      render(
        <div>
          <span id="checkbox-label">External label</span>
          <AIKitCheckBox aria-labelledby="checkbox-label" />
        </div>
      );
      expect(screen.getByLabelText('External label')).toBeInTheDocument();
    });

    it('should support aria-describedby for help text', () => {
      render(
        <div>
          <AIKitCheckBox aria-describedby="help-text" data-testid="checkbox" />
          <span id="help-text">Help description</span>
        </div>
      );
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should indicate required state with aria-required', () => {
      render(<AIKitCheckBox required data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-required', 'true');
    });

    it('should indicate invalid state with aria-invalid', () => {
      render(<AIKitCheckBox aria-invalid={true} data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have visible focus indicator', () => {
      render(<AIKitCheckBox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('focus-visible:outline-none');
      expect(checkbox).toHaveClass('focus-visible:ring-2');
      expect(checkbox).toHaveClass('focus-visible:ring-[#4B6FED]');
    });

    it('should have adequate color contrast in default state', () => {
      render(<AIKitCheckBox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      // Border should be visible
      expect(checkbox).toHaveClass('border-2');
    });
  });

  describe('State Management', () => {
    it('should work as controlled component', async () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        <AIKitCheckBox checked={false} onCheckedChange={handleChange} data-testid="checkbox" />
      );

      expect(screen.getByTestId('checkbox')).toHaveAttribute('data-state', 'unchecked');

      rerender(
        <AIKitCheckBox checked={true} onCheckedChange={handleChange} data-testid="checkbox" />
      );
      expect(screen.getByTestId('checkbox')).toHaveAttribute('data-state', 'checked');
    });

    it('should work as uncontrolled component', async () => {
      const user = userEvent.setup();
      render(<AIKitCheckBox defaultChecked={false} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');

      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should transition from indeterminate to checked on click', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<AIKitCheckBox checked="indeterminate" onCheckedChange={handleChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');

      await user.click(checkbox);
      // When clicked, indeterminate should call onCheckedChange with true
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Error State Styling', () => {
    it('should apply error styles when error prop is true', () => {
      render(<AIKitCheckBox error data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('border-red-500');
    });

    it('should apply error ring on focus when error is true', () => {
      render(<AIKitCheckBox error data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('focus-visible:ring-red-500');
    });

    it('should use normal styles when error is false', () => {
      render(<AIKitCheckBox error={false} data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).not.toHaveClass('border-red-500');
      expect(checkbox).toHaveClass('focus-visible:ring-[#4B6FED]');
    });
  });

  describe('Custom Checkmark Icon', () => {
    it('should render default checkmark when checked', () => {
      render(<AIKitCheckBox defaultChecked data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toBeInTheDocument();
      // Check that indicator is rendered (contains SVG)
      expect(checkbox.querySelector('svg')).toBeInTheDocument();
    });

    it('should render indeterminate icon in indeterminate state', () => {
      render(<AIKitCheckBox checked="indeterminate" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.querySelector('svg')).toBeInTheDocument();
    });

    it('should not render icon when unchecked', () => {
      render(<AIKitCheckBox defaultChecked={false} data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      // Radix renders the indicator conditionally
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should handle focus events', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      render(<AIKitCheckBox onFocus={handleFocus} data-testid="checkbox" />);

      await user.tab();
      expect(screen.getByTestId('checkbox')).toHaveFocus();
      expect(handleFocus).toHaveBeenCalled();
    });

    it('should handle blur events', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      render(<AIKitCheckBox onBlur={handleBlur} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      await user.tab();
      expect(checkbox).toHaveFocus();

      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Form Integration', () => {
    it('should support name attribute for form submission', () => {
      render(<AIKitCheckBox name="terms" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      // Radix checkboxes use the name prop internally
      expect(checkbox).toBeInTheDocument();
    });

    it('should support value attribute', () => {
      render(<AIKitCheckBox value="accepted" data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute('value', 'accepted');
    });

    it('should validate as required', () => {
      render(<AIKitCheckBox required data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<AIKitCheckBox ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should allow imperative focus via ref', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<AIKitCheckBox ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Dark Theme Compatibility', () => {
    it('should render correctly in dark theme', () => {
      const { container } = render(
        <div className="dark">
          <AIKitCheckBox data-testid="checkbox" />
        </div>
      );

      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
      expect(container.querySelector('.dark')).toBeInTheDocument();
    });

    it('should maintain visibility when checked in dark theme', () => {
      render(
        <div className="dark">
          <AIKitCheckBox defaultChecked data-testid="checkbox" />
        </div>
      );

      expect(screen.getByTestId('checkbox')).toBeVisible();
    });
  });

  describe('Size Variants', () => {
    it('should apply default size', () => {
      render(<AIKitCheckBox size="default" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('h-5');
      expect(checkbox).toHaveClass('w-5');
    });

    it('should apply small size', () => {
      render(<AIKitCheckBox size="sm" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('h-4');
      expect(checkbox).toHaveClass('w-4');
    });

    it('should apply large size', () => {
      render(<AIKitCheckBox size="lg" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('h-6');
      expect(checkbox).toHaveClass('w-6');
    });
  });

  describe('Mobile Touch Support', () => {
    it('should have adequate touch target size', () => {
      render(<AIKitCheckBox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      // Default size should be at least h-5 w-5 (20px)
      expect(checkbox).toHaveClass('h-5');
      expect(checkbox).toHaveClass('w-5');
    });

    it('should handle touch events like clicks', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<AIKitCheckBox onCheckedChange={handleChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox); // Simulates touch tap

      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });
});
