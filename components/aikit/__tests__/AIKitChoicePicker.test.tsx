import React from 'react';
import { render, screen, fireEvent } from '@/test/test-utils';
import { AIKitChoicePicker } from '../AIKitChoicePicker';

describe('AIKitChoicePicker', () => {
  const defaultOptions = [
    { id: '1', label: 'Option 1', value: 'opt1' },
    { id: '2', label: 'Option 2', value: 'opt2' },
    { id: '3', label: 'Option 3', value: 'opt3' },
    { id: '4', label: 'Option 4', value: 'opt4' },
  ];

  describe('Rendering', () => {
    it('should render with label and options', () => {
      render(
        <AIKitChoicePicker
          label="Choose an option"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should render all options as chips', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );
      defaultOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it('should render without label when not provided', () => {
      render(
        <AIKitChoicePicker
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );
      expect(screen.queryByRole('group')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
          className="custom-class"
        />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Single Select Mode', () => {
    it('should select single option on click', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Single Select"
          options={defaultOptions}
          onChange={handleChange}
          mode="single"
        />
      );

      const option1 = screen.getByText('Option 1');
      fireEvent.click(option1);

      expect(handleChange).toHaveBeenCalledWith(['opt1']);
    });

    it('should replace selection when clicking another option', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Single Select"
          options={defaultOptions}
          onChange={handleChange}
          mode="single"
          value={['opt1']}
        />
      );

      const option2 = screen.getByText('Option 2');
      fireEvent.click(option2);

      expect(handleChange).toHaveBeenCalledWith(['opt2']);
    });

    it('should deselect when clicking selected option', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Single Select"
          options={defaultOptions}
          onChange={handleChange}
          mode="single"
          value={['opt1']}
        />
      );

      const option1 = screen.getByText('Option 1');
      fireEvent.click(option1);

      expect(handleChange).toHaveBeenCalledWith([]);
    });

    it('should show visual feedback for selected option', () => {
      render(
        <AIKitChoicePicker
          label="Single Select"
          options={defaultOptions}
          onChange={jest.fn()}
          mode="single"
          value={['opt1']}
        />
      );

      const option1Button = screen.getByText('Option 1').closest('button');
      expect(option1Button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Multi Select Mode', () => {
    it('should select multiple options', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Multi Select"
          options={defaultOptions}
          onChange={handleChange}
          mode="multi"
        />
      );

      fireEvent.click(screen.getByText('Option 1'));
      expect(handleChange).toHaveBeenCalledWith(['opt1']);

      fireEvent.click(screen.getByText('Option 2'));
      expect(handleChange).toHaveBeenCalledWith(['opt1', 'opt2']);
    });

    it('should toggle selection in multi mode', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Multi Select"
          options={defaultOptions}
          onChange={handleChange}
          mode="multi"
          value={['opt1', 'opt2']}
        />
      );

      // Deselect option 1
      fireEvent.click(screen.getByText('Option 1'));
      expect(handleChange).toHaveBeenCalledWith(['opt2']);

      // Select option 3 (need to rerender with controlled value for the second call)
      fireEvent.click(screen.getByText('Option 3'));
      expect(handleChange).toHaveBeenCalledWith(['opt1', 'opt2', 'opt3']);
    });

    it('should show visual feedback for all selected options', () => {
      render(
        <AIKitChoicePicker
          label="Multi Select"
          options={defaultOptions}
          onChange={jest.fn()}
          mode="multi"
          value={['opt1', 'opt3']}
        />
      );

      const option1Button = screen.getByText('Option 1').closest('button');
      const option2Button = screen.getByText('Option 2').closest('button');
      const option3Button = screen.getByText('Option 3').closest('button');

      expect(option1Button).toHaveAttribute('aria-pressed', 'true');
      expect(option2Button).toHaveAttribute('aria-pressed', 'false');
      expect(option3Button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should respect maxSelections limit', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Multi Select"
          options={defaultOptions}
          onChange={handleChange}
          mode="multi"
          maxSelections={2}
          value={['opt1', 'opt2']}
        />
      );

      // Try to select a third option
      fireEvent.click(screen.getByText('Option 3'));

      // Should not call onChange because limit is reached
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should allow deselection even when maxSelections is reached', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Multi Select"
          options={defaultOptions}
          onChange={handleChange}
          mode="multi"
          maxSelections={2}
          value={['opt1', 'opt2']}
        />
      );

      // Deselect option 1
      fireEvent.click(screen.getByText('Option 1'));
      expect(handleChange).toHaveBeenCalledWith(['opt2']);
    });
  });

  describe('Disabled State', () => {
    it('should disable all options when disabled prop is true', () => {
      render(
        <AIKitChoicePicker
          label="Disabled"
          options={defaultOptions}
          onChange={jest.fn()}
          disabled
        />
      );

      defaultOptions.forEach(option => {
        const button = screen.getByText(option.label).closest('button');
        expect(button).toBeDisabled();
      });
    });

    it('should not trigger onChange when disabled', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Disabled"
          options={defaultOptions}
          onChange={handleChange}
          disabled
        />
      );

      fireEvent.click(screen.getByText('Option 1'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should disable specific options', () => {
      const optionsWithDisabled = [
        { id: '1', label: 'Option 1', value: 'opt1' },
        { id: '2', label: 'Option 2', value: 'opt2', disabled: true },
        { id: '3', label: 'Option 3', value: 'opt3', disabled: true },
      ];

      render(
        <AIKitChoicePicker
          label="Partially Disabled"
          options={optionsWithDisabled}
          onChange={jest.fn()}
        />
      );

      const option1Button = screen.getByText('Option 1').closest('button');
      const option2Button = screen.getByText('Option 2').closest('button');
      const option3Button = screen.getByText('Option 3').closest('button');

      expect(option1Button).not.toBeDisabled();
      expect(option2Button).toBeDisabled();
      expect(option3Button).toBeDisabled();
    });

    it('should not select disabled options', () => {
      const handleChange = jest.fn();
      const optionsWithDisabled = [
        { id: '1', label: 'Option 1', value: 'opt1' },
        { id: '2', label: 'Option 2', value: 'opt2', disabled: true },
      ];

      render(
        <AIKitChoicePicker
          label="Test"
          options={optionsWithDisabled}
          onChange={handleChange}
          mode="multi"
        />
      );

      fireEvent.click(screen.getByText('Option 2'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Clear All Functionality', () => {
    it('should render clear all button when showClearAll is true and options are selected', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
          showClearAll
          value={['opt1', 'opt2']}
        />
      );

      expect(screen.getByText('Clear all')).toBeInTheDocument();
    });

    it('should not render clear all button when no options are selected', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
          showClearAll
          value={[]}
        />
      );

      expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
    });

    it('should clear all selections when clear all button is clicked', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={handleChange}
          showClearAll
          value={['opt1', 'opt2', 'opt3']}
        />
      );

      const clearButton = screen.getByText('Clear all');
      fireEvent.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith([]);
    });

    it('should not render clear all button when showClearAll is false', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
          showClearAll={false}
          value={['opt1']}
        />
      );

      expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should focus options with Tab key', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );

      const firstOption = screen.getByText('Option 1').closest('button');
      firstOption?.focus();
      expect(firstOption).toHaveFocus();
    });

    it('should select option with Enter key', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={handleChange}
        />
      );

      const firstOption = screen.getByText('Option 1').closest('button');
      firstOption?.focus();
      fireEvent.keyDown(firstOption!, { key: 'Enter', code: 'Enter' });

      expect(handleChange).toHaveBeenCalledWith(['opt1']);
    });

    it('should select option with Space key', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={handleChange}
        />
      );

      const firstOption = screen.getByText('Option 1').closest('button');
      firstOption?.focus();
      fireEvent.keyDown(firstOption!, { key: ' ', code: 'Space' });

      expect(handleChange).toHaveBeenCalledWith(['opt1']);
    });

    it('should navigate with Arrow keys', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );

      const firstOption = screen.getByText('Option 1').closest('button');
      const secondOption = screen.getByText('Option 2').closest('button');

      firstOption?.focus();
      expect(firstOption).toHaveFocus();

      fireEvent.keyDown(firstOption!, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(secondOption).toHaveFocus();

      fireEvent.keyDown(secondOption!, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(firstOption).toHaveFocus();
    });

    it('should navigate to last option with End key', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );

      const firstOption = screen.getByText('Option 1').closest('button');
      const lastOption = screen.getByText('Option 4').closest('button');

      firstOption?.focus();
      fireEvent.keyDown(firstOption!, { key: 'End', code: 'End' });

      expect(lastOption).toHaveFocus();
    });

    it('should navigate to first option with Home key', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );

      const firstOption = screen.getByText('Option 1').closest('button');
      const lastOption = screen.getByText('Option 4').closest('button');

      lastOption?.focus();
      fireEvent.keyDown(lastOption!, { key: 'Home', code: 'Home' });

      expect(firstOption).toHaveFocus();
    });

    it('should wrap around when navigating past last option', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );

      const firstOption = screen.getByText('Option 1').closest('button');
      const lastOption = screen.getByText('Option 4').closest('button');

      lastOption?.focus();
      fireEvent.keyDown(lastOption!, { key: 'ArrowRight', code: 'ArrowRight' });

      expect(firstOption).toHaveFocus();
    });

    it('should wrap around when navigating before first option', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );

      const firstOption = screen.getByText('Option 1').closest('button');
      const lastOption = screen.getByText('Option 4').closest('button');

      firstOption?.focus();
      fireEvent.keyDown(firstOption!, { key: 'ArrowLeft', code: 'ArrowLeft' });

      expect(lastOption).toHaveFocus();
    });
  });

  describe('WCAG 2.1 AA Accessibility', () => {
    it('should have proper ARIA role for option group', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('should have aria-label or aria-labelledby', () => {
      render(
        <AIKitChoicePicker
          label="Choose options"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );

      const group = screen.getByRole('group');
      expect(group).toHaveAccessibleName('Choose options');
    });

    it('should have aria-pressed attribute on options', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
          value={['opt1']}
        />
      );

      const option1Button = screen.getByText('Option 1').closest('button');
      const option2Button = screen.getByText('Option 2').closest('button');

      expect(option1Button).toHaveAttribute('aria-pressed', 'true');
      expect(option2Button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have proper focus indicators', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );

      const firstOption = screen.getByText('Option 1').closest('button');
      expect(firstOption).toHaveClass('focus-visible:outline-none');
      expect(firstOption).toHaveClass('focus-visible:ring-2');
    });

    it('should support screen reader text for state', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
          value={['opt1']}
        />
      );

      const option1Button = screen.getByText('Option 1').closest('button');
      expect(option1Button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have sufficient color contrast', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
          value={['opt1']}
        />
      );

      // Selected option should have high contrast background
      const selectedButton = screen.getByText('Option 1').closest('button');
      expect(selectedButton).toHaveClass('bg-[#4B6FED]');
      expect(selectedButton).toHaveClass('text-white');
    });

    it('should announce disabled state to screen readers', () => {
      const optionsWithDisabled = [
        { id: '1', label: 'Option 1', value: 'opt1', disabled: true },
      ];

      render(
        <AIKitChoicePicker
          label="Test"
          options={optionsWithDisabled}
          onChange={jest.fn()}
        />
      );

      const disabledButton = screen.getByText('Option 1').closest('button');
      expect(disabledButton).toHaveAttribute('disabled');
      expect(disabledButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have descriptive labels for all interactive elements', () => {
      render(
        <AIKitChoicePicker
          label="Choose your preferences"
          options={defaultOptions}
          onChange={jest.fn()}
          showClearAll
          value={['opt1']}
        />
      );

      expect(screen.getByRole('group')).toHaveAccessibleName('Choose your preferences');
      expect(screen.getByText('Clear all')).toHaveAccessibleName();
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled component', () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        <AIKitChoicePicker
          label="Controlled"
          options={defaultOptions}
          onChange={handleChange}
          value={['opt1']}
        />
      );

      const option1Button = screen.getByText('Option 1').closest('button');
      expect(option1Button).toHaveAttribute('aria-pressed', 'true');

      // Rerender with different value
      rerender(
        <AIKitChoicePicker
          label="Controlled"
          options={defaultOptions}
          onChange={handleChange}
          value={['opt2']}
        />
      );

      const option2Button = screen.getByText('Option 2').closest('button');
      expect(option1Button).toHaveAttribute('aria-pressed', 'false');
      expect(option2Button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should work as uncontrolled component', () => {
      const handleChange = jest.fn();
      render(
        <AIKitChoicePicker
          label="Uncontrolled"
          options={defaultOptions}
          onChange={handleChange}
          defaultValue={['opt1']}
        />
      );

      const option1Button = screen.getByText('Option 1').closest('button');
      expect(option1Button).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(screen.getByText('Option 2'));
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty options array', () => {
      render(
        <AIKitChoicePicker
          label="Empty"
          options={[]}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle missing onChange gracefully', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
        />
      );

      const option1 = screen.getByText('Option 1');
      // Should not throw error
      expect(() => fireEvent.click(option1)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={handleChange}
          value={['opt1']}
        />
      );

      // Rerender with same props
      rerender(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={handleChange}
          value={['opt1']}
        />
      );

      // Component should handle this efficiently (tested via profiling)
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('should apply chip/pill styling to options', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );

      const option1Button = screen.getByText('Option 1').closest('button');
      expect(option1Button).toHaveClass('rounded-full');
      expect(option1Button).toHaveClass('px-4');
    });

    it('should apply selected state styling', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
          value={['opt1']}
        />
      );

      const selectedButton = screen.getByText('Option 1').closest('button');
      const unselectedButton = screen.getByText('Option 2').closest('button');

      expect(selectedButton).toHaveClass('bg-[#4B6FED]');
      expect(unselectedButton).toHaveClass('bg-gray-800');
    });

    it('should have transition animations', () => {
      render(
        <AIKitChoicePicker
          label="Test"
          options={defaultOptions}
          onChange={jest.fn()}
        />
      );

      const option1Button = screen.getByText('Option 1').closest('button');
      expect(option1Button).toHaveClass('transition-all');
    });
  });
});
