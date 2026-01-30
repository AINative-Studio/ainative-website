import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AIKitTextField } from '../AIKitTextField';
import { Mail, Lock } from 'lucide-react';

describe('AIKitTextField', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<AIKitTextField />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render with a label when provided', () => {
      render(<AIKitTextField label="Username" />);
      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('should render with placeholder text', () => {
      render(<AIKitTextField placeholder="Enter your name" />);
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(<AIKitTextField helperText="This is a helper text" />);
      expect(screen.getByText('This is a helper text')).toBeInTheDocument();
    });

    it('should show required indicator when required prop is true', () => {
      render(<AIKitTextField label="Email" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('should render email input type', () => {
      render(<AIKitTextField type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input type', () => {
      render(<AIKitTextField type="password" data-testid="password-input" />);
      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render number input type', () => {
      render(<AIKitTextField type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render tel input type', () => {
      render(<AIKitTextField type="tel" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render url input type', () => {
      render(<AIKitTextField type="url" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('should render search input type', () => {
      render(<AIKitTextField type="search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      render(<AIKitTextField variant="default" data-testid="input-field" />);
      const input = screen.getByTestId('input-field');
      expect(input).toHaveClass('border', 'border-input', 'bg-transparent');
    });

    it('should apply filled variant styles', () => {
      render(<AIKitTextField variant="filled" data-testid="input-field" />);
      const input = screen.getByTestId('input-field');
      expect(input).toHaveClass('bg-[#1C2128]');
    });

    it('should apply outlined variant styles', () => {
      render(<AIKitTextField variant="outlined" data-testid="input-field" />);
      const input = screen.getByTestId('input-field');
      expect(input).toHaveClass('border-2', 'border-[#2D333B]');
    });
  });

  describe('Error State', () => {
    it('should display error message when error prop is provided', () => {
      render(<AIKitTextField error="This field is required" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('This field is required');
    });

    it('should apply error styles to input', () => {
      render(<AIKitTextField error="Error" data-testid="input-field" />);
      const input = screen.getByTestId('input-field');
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should apply error styles to label', () => {
      render(<AIKitTextField label="Email" error="Invalid email" />);
      const label = screen.getByText('Email');
      expect(label).toHaveClass('text-red-500');
    });

    it('should link error message to input via aria-describedby', () => {
      render(<AIKitTextField error="Error message" data-testid="input-field" />);
      const input = screen.getByTestId('input-field');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(screen.getByRole('alert')).toHaveAttribute('id', errorId!);
    });
  });

  describe('Disabled State', () => {
    it('should render disabled input', () => {
      render(<AIKitTextField disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should not show clear button when disabled', () => {
      render(
        <AIKitTextField
          value="test"
          onChange={() => {}}
          showClearButton
          disabled
        />
      );
      expect(screen.queryByLabelText('Clear input')).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render left icon', () => {
      render(
        <AIKitTextField
          leftIcon={<Mail data-testid="left-icon" />}
          data-testid="input-field"
        />
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      const input = screen.getByTestId('input-field');
      expect(input).toHaveClass('pl-10');
    });

    it('should render right icon', () => {
      render(
        <AIKitTextField
          rightIcon={<Lock data-testid="right-icon" />}
          data-testid="input-field"
        />
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      const input = screen.getByTestId('input-field');
      expect(input).toHaveClass('pr-10');
    });

    it('should render both left and right icons', () => {
      render(
        <AIKitTextField
          leftIcon={<Mail data-testid="left-icon" />}
          rightIcon={<Lock data-testid="right-icon" />}
        />
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Clear Button', () => {
    it('should show clear button when showClearButton is true and has value', () => {
      render(
        <AIKitTextField
          value="test"
          onChange={() => {}}
          showClearButton
          data-testid="input-with-clear"
        />
      );
      const input = screen.getByTestId('input-with-clear');
      expect(input).toBeInTheDocument();
      expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
    });

    it('should not show clear button when value is empty', () => {
      render(
        <AIKitTextField
          value=""
          onChange={() => {}}
          showClearButton
        />
      );
      expect(screen.queryByLabelText('Clear input')).not.toBeInTheDocument();
    });

    it('should call onClear when clear button is clicked', async () => {
      const onClear = jest.fn();
      render(
        <AIKitTextField
          value="test"
          onChange={() => {}}
          showClearButton
          onClear={onClear}
        />
      );

      const clearButton = screen.getByLabelText('Clear input');
      await userEvent.click(clearButton);
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('should not show clear button when right icon is provided', () => {
      const { container } = render(
        <AIKitTextField
          value="test"
          onChange={() => {}}
          showClearButton
          rightIcon={<div className="custom-icon">Icon</div>}
          data-testid="input-field"
        />
      );
      const input = screen.getByTestId('input-field');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('test');
      // Clear button should not be shown when right icon is present
      expect(screen.queryByLabelText('Clear input')).not.toBeInTheDocument();
      // Custom icon should be present
      expect(container.querySelector('.custom-icon')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle onChange event', async () => {
      const handleChange = jest.fn();
      render(<AIKitTextField onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test');
    });

    it('should handle onFocus event', async () => {
      const handleFocus = jest.fn();
      render(<AIKitTextField onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      await userEvent.click(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur event', async () => {
      const handleBlur = jest.fn();
      render(<AIKitTextField onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      await userEvent.click(input);
      await userEvent.tab();

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard input', async () => {
      render(<AIKitTextField data-testid="input-field" />);
      const input = screen.getByTestId('input-field');

      await userEvent.type(input, 'Hello World');
      expect(input).toHaveValue('Hello World');
    });

    it('should handle paste event', async () => {
      render(<AIKitTextField data-testid="input-field" />);
      const input = screen.getByTestId('input-field') as HTMLInputElement;

      await userEvent.click(input);
      await userEvent.paste('Pasted text');

      expect(input.value).toBe('Pasted text');
    });
  });

  describe('Full Width', () => {
    it('should apply full width when fullWidth is true', () => {
      const { container } = render(<AIKitTextField fullWidth data-testid="input-field" />);
      const input = screen.getByTestId('input-field');
      expect(input).toHaveClass('w-full');
      const wrapper = container.querySelector('.space-y-2');
      expect(wrapper).toHaveClass('w-full');
    });

    it('should not apply full width when fullWidth is false', () => {
      const { container } = render(<AIKitTextField fullWidth={false} data-testid="input-field" />);
      const wrapper = container.querySelector('.space-y-2');
      expect(wrapper).not.toHaveClass('w-full');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes', () => {
      render(
        <AIKitTextField
          label="Email"
          error="Invalid email"
          required
        />
      );

      const input = screen.getByLabelText(/Email/);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
      expect(input).toHaveAttribute('required');
    });

    it('should link label to input', () => {
      render(<AIKitTextField label="Username" />);
      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });

    it('should have aria-describedby for helper text', () => {
      render(
        <AIKitTextField
          helperText="Enter your username"
          data-testid="input-field"
        />
      );

      const input = screen.getByTestId('input-field');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
    });

    it('should be keyboard accessible', async () => {
      const handleChange = jest.fn();
      render(<AIKitTextField onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();

      await userEvent.keyboard('test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should support tab navigation', async () => {
      render(
        <>
          <AIKitTextField data-testid="input-1" />
          <AIKitTextField data-testid="input-2" />
        </>
      );

      const input1 = screen.getByTestId('input-1');
      const input2 = screen.getByTestId('input-2');

      input1.focus();
      expect(input1).toHaveFocus();

      await userEvent.tab();
      expect(input2).toHaveFocus();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<AIKitTextField className="custom-class" data-testid="input-field" />);
      const input = screen.getByTestId('input-field');
      expect(input).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      render(
        <AIKitTextField
          className="custom-class"
          data-testid="input-field"
        />
      );
      const input = screen.getByTestId('input-field');
      expect(input).toHaveClass('custom-class', 'rounded-md', 'px-3');
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled component', async () => {
      const ControlledComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <AIKitTextField
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-input"
          />
        );
      };

      render(<ControlledComponent />);
      const input = screen.getByTestId('controlled-input');

      await userEvent.type(input, 'controlled');
      expect(input).toHaveValue('controlled');
    });

    it('should work as uncontrolled component', async () => {
      render(<AIKitTextField defaultValue="uncontrolled" data-testid="uncontrolled-input" />);
      const input = screen.getByTestId('uncontrolled-input');

      expect(input).toHaveValue('uncontrolled');
      await userEvent.type(input, ' test');
      expect(input).toHaveValue('uncontrolled test');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<AIKitTextField ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe('INPUT');
    });

    it('should allow programmatic focus via ref', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<AIKitTextField ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Dark Theme Compatibility', () => {
    it('should have dark theme compatible classes', () => {
      render(<AIKitTextField error="Error" data-testid="input-field" />);
      const input = screen.getByTestId('input-field');
      expect(input).toHaveClass('dark:border-red-500');
    });
  });

  describe('Validation', () => {
    it('should support required validation', () => {
      render(<AIKitTextField required />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });

    it('should support pattern validation', () => {
      render(<AIKitTextField pattern="[0-9]*" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });

    it('should support minLength validation', () => {
      render(<AIKitTextField minLength={5} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minLength', '5');
    });

    it('should support maxLength validation', () => {
      render(<AIKitTextField maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value gracefully', () => {
      render(<AIKitTextField value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should handle undefined value', () => {
      render(<AIKitTextField value={undefined} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should handle both error and helperText (error takes precedence)', () => {
      render(
        <AIKitTextField
          error="Error message"
          helperText="Helper text"
        />
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('should handle very long text input', async () => {
      const longText = 'a'.repeat(500);
      render(<AIKitTextField data-testid="input-field" />);
      const input = screen.getByTestId('input-field');

      await userEvent.type(input, longText);
      expect(input).toHaveValue(longText);
    });

    it('should handle special characters', async () => {
      const specialChars = '!@#$%^&*()_+-=';
      render(<AIKitTextField data-testid="input-field" />);
      const input = screen.getByTestId('input-field');

      // Use paste instead of type for special characters
      fireEvent.change(input, { target: { value: specialChars } });
      expect(input).toHaveValue(specialChars);
    });
  });
});
