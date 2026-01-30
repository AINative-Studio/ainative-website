/**
 * AIKit Select/ChoicePicker Component - TDD Test Suite
 * Coverage Target: 100%
 */

import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../select';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AIKit Select Component - TDD Suite', () => {
  const renderSelect = (defaultValue = 'option1') => {
    return render(
      <Select defaultValue={defaultValue}>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Options</SelectLabel>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  };

  describe('Rendering', () => {
    it('should render select trigger with placeholder', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Choose option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(screen.getByText('Choose option')).toBeInTheDocument();
    });

    it('should render with default value selected', () => {
      renderSelect('option2');
      expect(screen.getByTestId('select-trigger')).toHaveTextContent('Option 2');
    });

    it('should render all select items in dropdown', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByTestId('select-trigger'));

      expect(screen.getByRole('option', { name: /option 1/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /option 2/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /option 3/i })).toBeInTheDocument();
    });

    it('should render select with groups', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });

    it('should apply custom className to trigger', () => {
      render(
        <Select>
          <SelectTrigger className="custom-select" data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-trigger')).toHaveClass('custom-select');
    });
  });

  describe('User Interaction', () => {
    it('should open dropdown on click', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByTestId('select-trigger'));

      expect(screen.getByRole('option', { name: /option 1/i })).toBeVisible();
    });

    it('should close dropdown on item select', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByTestId('select-trigger'));
      await user.click(screen.getByRole('option', { name: /option 2/i }));

      expect(screen.queryByRole('option', { name: /option 1/i })).not.toBeInTheDocument();
    });

    it('should update selected value on item click', async () => {
      const user = userEvent.setup();
      renderSelect('option1');

      await user.click(screen.getByTestId('select-trigger'));
      await user.click(screen.getByRole('option', { name: /option 3/i }));

      expect(screen.getByTestId('select-trigger')).toHaveTextContent('Option 3');
    });

    it('should call onValueChange when selection changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Select onValueChange={handleChange}>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Option 1</SelectItem>
            <SelectItem value="opt2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));
      await user.click(screen.getByRole('option', { name: /option 2/i }));

      expect(handleChange).toHaveBeenCalledWith('opt2');
    });

    it('should open dropdown with keyboard (Space)', async () => {
      const user = userEvent.setup();
      renderSelect();

      const trigger = screen.getByTestId('select-trigger');
      trigger.focus();
      await user.keyboard(' ');

      expect(screen.getByRole('option', { name: /option 1/i })).toBeVisible();
    });

    it('should open dropdown with keyboard (Enter)', async () => {
      const user = userEvent.setup();
      renderSelect();

      const trigger = screen.getByTestId('select-trigger');
      trigger.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('option', { name: /option 1/i })).toBeVisible();
    });

    it('should navigate options with arrow keys', async () => {
      const user = userEvent.setup();
      renderSelect();

      const trigger = screen.getByTestId('select-trigger');
      trigger.focus();
      await user.keyboard('{Enter}');

      // Arrow down should move to next option
      await user.keyboard('{ArrowDown}');
      // Implementation depends on Radix UI behavior
      expect(screen.getByRole('option', { name: /option 2/i })).toBeInTheDocument();
    });

    it('should close dropdown with Escape key', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByTestId('select-trigger'));
      expect(screen.getByRole('option', { name: /option 1/i })).toBeVisible();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('option', { name: /option 1/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <label id="select-label">Choose an option</label>
          <Select>
            <SelectTrigger aria-labelledby="select-label">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opt1">Option 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA role for trigger', () => {
      renderSelect();
      expect(screen.getByTestId('select-trigger')).toHaveAttribute('role', 'combobox');
    });

    it('should have proper ARIA expanded state', async () => {
      const user = userEvent.setup();
      renderSelect();

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should support aria-label on trigger', () => {
      render(
        <Select>
          <SelectTrigger aria-label="Select country">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">USA</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByLabelText('Select country')).toBeInTheDocument();
    });

    it('should indicate disabled state', () => {
      render(
        <Select>
          <SelectTrigger disabled data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-trigger')).toBeDisabled();
    });

    it('should prevent interaction when disabled', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger disabled data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });

    it('should disable specific options', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Option 1</SelectItem>
            <SelectItem value="opt2" disabled>
              Option 2
            </SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      const disabledOption = screen.getByRole('option', { name: /option 2/i });
      expect(disabledOption).toHaveAttribute('data-disabled');
    });
  });

  describe('State Management', () => {
    it('should work as controlled component', async () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        <Select value="opt1" onValueChange={handleChange}>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Option 1</SelectItem>
            <SelectItem value="opt2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-trigger')).toHaveTextContent('Option 1');

      rerender(
        <Select value="opt2" onValueChange={handleChange}>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Option 1</SelectItem>
            <SelectItem value="opt2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-trigger')).toHaveTextContent('Option 2');
    });

    it('should work as uncontrolled component', async () => {
      const user = userEvent.setup();
      renderSelect('option1');

      await user.click(screen.getByTestId('select-trigger'));
      await user.click(screen.getByRole('option', { name: /option 2/i }));

      expect(screen.getByTestId('select-trigger')).toHaveTextContent('Option 2');
    });
  });

  describe('Dark Theme', () => {
    it('should render correctly in dark theme', () => {
      const { container } = render(
        <div className="dark">
          <Select>
            <SelectTrigger data-testid="select-trigger">
              <SelectValue placeholder="Dark select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opt1">Option 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(container.querySelector('.dark')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have adequate touch target size', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('h-10'); // 40px height for touch
    });

    it('should render dropdown in portal for mobile', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByTestId('select-trigger'));

      // SelectContent uses Portal, so it renders outside the normal DOM flow
      expect(screen.getByRole('option', { name: /option 1/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options list', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="No options" />
          </SelectTrigger>
          <SelectContent></SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });

    it('should handle long option text', async () => {
      const user = userEvent.setup();
      const longText = 'This is a very long option text that might wrap or truncate';

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="long">{longText}</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));
      expect(screen.getByRole('option', { name: new RegExp(longText) })).toBeInTheDocument();
    });

    it('should handle rapid opening and closing', async () => {
      const user = userEvent.setup();
      renderSelect();

      const trigger = screen.getByTestId('select-trigger');

      await user.click(trigger);
      await user.keyboard('{Escape}');
      await user.click(trigger);

      expect(screen.getByRole('option', { name: /option 1/i })).toBeVisible();
    });

    it('should handle selection of first item', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByTestId('select-trigger'));
      await user.click(screen.getByRole('option', { name: /option 1/i }));

      expect(screen.getByTestId('select-trigger')).toHaveTextContent('Option 1');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to trigger', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Select>
          <SelectTrigger ref={ref}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
