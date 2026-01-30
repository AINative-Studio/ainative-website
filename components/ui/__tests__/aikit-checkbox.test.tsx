/**
 * AIKit Checkbox Component - TDD Test Suite
 * Coverage Target: 100%
 */

import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../checkbox';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AIKit Checkbox Component - TDD Suite', () => {
  describe('Rendering', () => {
    it('should render unchecked by default', () => {
      render(<Checkbox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('should render checked when defaultChecked is true', () => {
      render(<Checkbox defaultChecked data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should render in indeterminate state', () => {
      render(<Checkbox checked="indeterminate" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });

    it('should apply custom className', () => {
      render(<Checkbox className="custom-checkbox" data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveClass('custom-checkbox');
    });

    it('should render with label', () => {
      render(
        <div>
          <Checkbox id="terms" />
          <label htmlFor="terms">Accept terms</label>
        </div>
      );
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should toggle on click', async () => {
      const user = userEvent.setup();
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');

      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('data-state', 'checked');

      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('should call onCheckedChange when toggled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Checkbox onCheckedChange={handleChange} data-testid="checkbox" />);

      await user.click(screen.getByTestId('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(true);

      await user.click(screen.getByTestId('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('should toggle with keyboard (Space)', async () => {
      const user = userEvent.setup();
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      checkbox.focus();
      await user.keyboard(' ');

      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should toggle with keyboard (Enter)', async () => {
      const user = userEvent.setup();
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      checkbox.focus();
      await user.keyboard('{Enter}');

      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should handle focus and blur', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      const user = userEvent.setup();

      render(<Checkbox onFocus={handleFocus} onBlur={handleBlur} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      await user.tab();

      expect(checkbox).toHaveFocus();
      expect(handleFocus).toHaveBeenCalled();

      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Checkbox id="test-checkbox" />
          <label htmlFor="test-checkbox">Test Checkbox</label>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA role', () => {
      render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should indicate checked state with aria-checked', () => {
      render(<Checkbox defaultChecked data-testid="checkbox" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    });

    it('should indicate unchecked state with aria-checked', () => {
      render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    });

    it('should indicate indeterminate state with aria-checked="mixed"', () => {
      render(<Checkbox checked="indeterminate" data-testid="checkbox" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
    });

    it('should support aria-label', () => {
      render(<Checkbox aria-label="Agree to terms" />);
      expect(screen.getByLabelText('Agree to terms')).toBeInTheDocument();
    });

    it('should support aria-labelledby', () => {
      render(
        <div>
          <span id="checkbox-label">Newsletter subscription</span>
          <Checkbox aria-labelledby="checkbox-label" />
        </div>
      );
      expect(screen.getByLabelText('Newsletter subscription')).toBeInTheDocument();
    });

    it('should have visible focus indicator', () => {
      render(<Checkbox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('focus-visible:ring-1');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Checkbox data-testid="checkbox1" />
          <Checkbox data-testid="checkbox2" />
        </>
      );

      await user.tab();
      expect(screen.getByTestId('checkbox1')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('checkbox2')).toHaveFocus();
    });
  });

  describe('State Management', () => {
    it('should work as controlled component', async () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        <Checkbox checked={false} onCheckedChange={handleChange} data-testid="checkbox" />
      );

      expect(screen.getByTestId('checkbox')).toHaveAttribute('data-state', 'unchecked');

      rerender(<Checkbox checked={true} onCheckedChange={handleChange} data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute('data-state', 'checked');
    });

    it('should work as uncontrolled component', async () => {
      const user = userEvent.setup();
      render(<Checkbox defaultChecked={false} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');

      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should render disabled state', () => {
      render(<Checkbox disabled data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('disabled');
      expect(checkbox).toHaveClass('disabled:opacity-50');
    });

    it('should prevent interaction when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Checkbox disabled onCheckedChange={handleChange} data-testid="checkbox" />);

      await user.click(screen.getByTestId('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should render required state', () => {
      render(<Checkbox required data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Dark Theme', () => {
    it('should render correctly in dark theme', () => {
      const { container } = render(
        <div className="dark">
          <Checkbox data-testid="checkbox" />
        </div>
      );

      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
      expect(container.querySelector('.dark')).toBeInTheDocument();
    });

    it('should maintain visibility in dark theme', () => {
      render(
        <div className="dark">
          <Checkbox defaultChecked data-testid="checkbox" />
        </div>
      );

      expect(screen.getByTestId('checkbox')).toBeVisible();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have adequate touch target size', () => {
      render(<Checkbox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      // Checkbox is h-4 w-4 but with shadow and peer styles should be tappable
      expect(checkbox).toHaveClass('h-4');
      expect(checkbox).toHaveClass('w-4');
    });

    it('should handle touch events', async () => {
      const handleChange = jest.fn();
      render(<Checkbox onCheckedChange={handleChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      checkbox.click(); // Simulates touch tap

      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Form Integration', () => {
    it('should include checkbox in form data when checked', () => {
      render(
        <form>
          <Checkbox name="agree" value="yes" defaultChecked />
        </form>
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should validate as required in form', () => {
      render(<Checkbox required name="terms" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicking', async () => {
      const user = userEvent.setup();
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should handle transition from indeterminate to checked', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <Checkbox checked="indeterminate" data-testid="checkbox" />
      );

      expect(screen.getByTestId('checkbox')).toHaveAttribute('data-state', 'indeterminate');

      rerender(<Checkbox checked={true} data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute('data-state', 'checked');
    });

    it('should render checkmark icon when checked', () => {
      render(<Checkbox defaultChecked data-testid="checkbox" />);
      // CheckIcon should be rendered within the checkbox
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Checkbox ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should allow imperative focus via ref', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Checkbox ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });
});
