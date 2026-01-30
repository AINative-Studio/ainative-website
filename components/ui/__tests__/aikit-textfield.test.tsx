/**
 * AIKit TextField/Input Component - TDD Test Suite
 *
 * Test Coverage Requirements:
 * - Component rendering (text, password, email, number types)
 * - User input and validation
 * - Accessibility (labels, error messages, autocomplete)
 * - Dark theme compatibility
 * - Mobile responsiveness
 * - Error states and validation
 * - Form integration
 *
 * Coverage Target: 100% (Critical Component)
 */

import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AIKit TextField/Input Component - TDD Suite', () => {
  describe('Component Rendering', () => {
    it('should render input field with default type', () => {
      // Given: Basic input
      render(<Input placeholder="Enter text" />);

      // Then: Input should be visible
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render all input types correctly', () => {
      // Given: Different input types
      const types = ['text', 'password', 'email', 'number', 'tel', 'url', 'search'] as const;

      types.forEach((type) => {
        // When: Rendering each type
        const { unmount } = render(
          <Input type={type} placeholder={`${type} input`} data-testid={`${type}-input`} />
        );

        // Then: Should have correct type attribute
        const input = screen.getByTestId(`${type}-input`);
        expect(input).toHaveAttribute('type', type);

        unmount();
      });
    });

    it('should render with placeholder', () => {
      // Given: Input with placeholder
      render(<Input placeholder="Enter your email" />);

      // Then: Placeholder should be visible
      const input = screen.getByPlaceholderText('Enter your email');
      expect(input).toBeInTheDocument();
    });

    it('should render with default value', () => {
      // Given: Input with default value
      render(<Input defaultValue="Default text" data-testid="default-input" />);

      // Then: Should display default value
      const input = screen.getByTestId('default-input') as HTMLInputElement;
      expect(input.value).toBe('Default text');
    });

    it('should render with controlled value', () => {
      // Given: Controlled input
      const { rerender } = render(<Input value="Initial" onChange={() => {}} data-testid="controlled" />);

      // Then: Should display initial value
      let input = screen.getByTestId('controlled') as HTMLInputElement;
      expect(input.value).toBe('Initial');

      // When: Value changes
      rerender(<Input value="Updated" onChange={() => {}} data-testid="controlled" />);

      // Then: Should display updated value
      input = screen.getByTestId('controlled') as HTMLInputElement;
      expect(input.value).toBe('Updated');
    });

    it('should render with custom className', () => {
      // Given: Input with custom class
      render(<Input className="custom-input-class" data-testid="custom-input" />);

      // Then: Should have custom class
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveClass('custom-input-class');
      expect(input).toHaveClass('flex'); // Base class
    });
  });

  describe('User Input and Interaction', () => {
    it('should accept user text input', async () => {
      // Given: Empty input field
      const user = userEvent.setup();
      render(<Input placeholder="Type here" />);

      // When: User types text
      const input = screen.getByPlaceholderText('Type here');
      await user.type(input, 'Hello World');

      // Then: Input should contain typed text
      expect(input).toHaveValue('Hello World');
    });

    it('should handle onChange event', async () => {
      // Given: Input with onChange handler
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} placeholder="Change test" />);

      // When: User types
      const input = screen.getByPlaceholderText('Change test');
      await user.type(input, 'A');

      // Then: onChange should be called
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: 'A' }),
        })
      );
    });

    it('should handle onInput event', async () => {
      // Given: Input with onInput handler
      const handleInput = jest.fn();
      const user = userEvent.setup();
      render(<Input onInput={handleInput} placeholder="Input test" />);

      // When: User types
      const input = screen.getByPlaceholderText('Input test');
      await user.type(input, 'Test');

      // Then: onInput should be called for each character
      expect(handleInput).toHaveBeenCalledTimes(4); // T, e, s, t
    });

    it('should handle focus and blur events', async () => {
      // Given: Input with focus handlers
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      const user = userEvent.setup();

      render(
        <Input
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Focus test"
        />
      );

      // When: User focuses input
      const input = screen.getByPlaceholderText('Focus test');
      await user.click(input);

      // Then: Focus handler should be called
      expect(handleFocus).toHaveBeenCalled();
      expect(input).toHaveFocus();

      // When: User blurs input
      await user.tab();

      // Then: Blur handler should be called
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should handle keyboard input', async () => {
      // Given: Input field
      const user = userEvent.setup();
      render(<Input data-testid="keyboard-input" />);

      // When: User types with keyboard
      const input = screen.getByTestId('keyboard-input');
      await user.click(input);
      await user.keyboard('Testing{Enter}');

      // Then: Should contain text (Enter doesn't affect text input)
      expect(input).toHaveValue('Testing');
    });

    it('should handle paste events', async () => {
      // Given: Input field
      const user = userEvent.setup();
      render(<Input data-testid="paste-input" />);

      // When: User pastes text
      const input = screen.getByTestId('paste-input');
      await user.click(input);
      await user.paste('Pasted content');

      // Then: Should contain pasted text
      expect(input).toHaveValue('Pasted content');
    });

    it('should handle cut events', async () => {
      // Given: Input with initial value
      const user = userEvent.setup();
      render(<Input defaultValue="Cut this text" data-testid="cut-input" />);

      // When: User selects and cuts text
      const input = screen.getByTestId('cut-input') as HTMLInputElement;
      await user.click(input);
      await user.keyboard('{Control>}a{/Control}{Control>}x{/Control}');

      // Then: Input should be empty
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should clear input value', async () => {
      // Given: Input with value
      const user = userEvent.setup();
      render(<Input defaultValue="Clear me" data-testid="clear-input" />);

      // When: User clears input
      const input = screen.getByTestId('clear-input');
      await user.clear(input);

      // Then: Input should be empty
      expect(input).toHaveValue('');
    });
  });

  describe('Input Types and Validation', () => {
    it('should validate email type input', async () => {
      // Given: Email input
      const user = userEvent.setup();
      render(<Input type="email" required data-testid="email-input" />);

      // When: User enters invalid email
      const input = screen.getByTestId('email-input');
      await user.type(input, 'invalid-email');

      // Then: Input should have invalid state
      expect(input).toBeInvalid();

      // When: User enters valid email
      await user.clear(input);
      await user.type(input, 'valid@email.com');

      // Then: Input should be valid
      expect(input).toBeValid();
    });

    it('should restrict number input', async () => {
      // Given: Number input
      const user = userEvent.setup();
      render(<Input type="number" data-testid="number-input" />);

      // When: User types numbers
      const input = screen.getByTestId('number-input');
      await user.type(input, '123');

      // Then: Should accept numbers
      expect(input).toHaveValue(123);
    });

    it('should handle min/max for number input', () => {
      // Given: Number input with min/max
      render(<Input type="number" min={0} max={100} data-testid="range-input" />);

      // Then: Should have min/max attributes
      const input = screen.getByTestId('range-input');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });

    it('should handle required attribute', () => {
      // Given: Required input
      render(<Input required data-testid="required-input" />);

      // Then: Should have required attribute
      const input = screen.getByTestId('required-input');
      expect(input).toBeRequired();
    });

    it('should handle pattern validation', () => {
      // Given: Input with pattern
      render(
        <Input
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          placeholder="Phone: 123-456-7890"
          data-testid="pattern-input"
        />
      );

      // Then: Should have pattern attribute
      const input = screen.getByTestId('pattern-input');
      expect(input).toHaveAttribute('pattern', '[0-9]{3}-[0-9]{3}-[0-9]{4}');
    });

    it('should handle maxLength constraint', async () => {
      // Given: Input with maxLength
      const user = userEvent.setup();
      render(<Input maxLength={5} data-testid="maxlength-input" />);

      // When: User tries to exceed max length
      const input = screen.getByTestId('maxlength-input') as HTMLInputElement;
      await user.type(input, '123456789');

      // Then: Should only accept max characters
      expect(input.value.length).toBeLessThanOrEqual(5);
    });

    it('should mask password input', async () => {
      // Given: Password input
      const user = userEvent.setup();
      render(<Input type="password" data-testid="password-input" />);

      // When: User types password
      const input = screen.getByTestId('password-input');
      await user.type(input, 'secretPassword123');

      // Then: Should have password type (masked)
      expect(input).toHaveAttribute('type', 'password');
      expect(input).toHaveValue('secretPassword123');
    });
  });

  describe('Accessibility (WCAG 2.1 AA Compliance)', () => {
    it('should have no accessibility violations', async () => {
      // Given: Input with label
      const { container } = render(
        <div>
          <label htmlFor="test-input">Test Input</label>
          <Input id="test-input" />
        </div>
      );

      // When: Running axe tests
      const results = await axe(container);

      // Then: Should have no violations
      expect(results).toHaveNoViolations();
    });

    it('should associate with label via htmlFor', () => {
      // Given: Input with label
      render(
        <div>
          <label htmlFor="name-input">Name</label>
          <Input id="name-input" />
        </div>
      );

      // Then: Should be accessible by label
      const input = screen.getByLabelText('Name');
      expect(input).toBeInTheDocument();
    });

    it('should support aria-label for inputs without visible label', () => {
      // Given: Input with aria-label
      render(<Input aria-label="Search query" />);

      // Then: Should have accessible name
      const input = screen.getByLabelText('Search query');
      expect(input).toBeInTheDocument();
    });

    it('should support aria-describedby for help text', () => {
      // Given: Input with description
      render(
        <div>
          <Input aria-describedby="help-text" data-testid="described-input" />
          <p id="help-text">Enter your full name</p>
        </div>
      );

      // Then: Should have accessible description
      const input = screen.getByTestId('described-input');
      expect(input).toHaveAccessibleDescription('Enter your full name');
    });

    it('should indicate error state with aria-invalid', () => {
      // Given: Invalid input
      render(<Input aria-invalid="true" aria-describedby="error-msg" data-testid="error-input" />);

      // Then: Should indicate invalid state
      const input = screen.getByTestId('error-input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toBeInvalid();
    });

    it('should provide error messages with aria-errormessage', () => {
      // Given: Input with error message
      render(
        <div>
          <Input
            aria-invalid="true"
            aria-errormessage="error-message"
            data-testid="error-input"
          />
          <p id="error-message" role="alert">
            This field is required
          </p>
        </div>
      );

      // Then: Error should be associated
      const input = screen.getByTestId('error-input');
      expect(input).toHaveAttribute('aria-errormessage', 'error-message');
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('should support autocomplete for common fields', () => {
      // Given: Inputs with autocomplete
      const autocompleteTypes = ['email', 'name', 'tel', 'address-line1'];

      autocompleteTypes.forEach((type) => {
        const { unmount } = render(
          <Input autoComplete={type} data-testid={`autocomplete-${type}`} />
        );

        // Then: Should have autocomplete attribute
        const input = screen.getByTestId(`autocomplete-${type}`);
        expect(input).toHaveAttribute('autocomplete', type);

        unmount();
      });
    });

    it('should have visible focus indicator', async () => {
      // Given: Input field
      const user = userEvent.setup();
      render(<Input data-testid="focus-indicator" />);

      // When: Input receives focus
      const input = screen.getByTestId('focus-indicator');
      await user.click(input);

      // Then: Should have focus styles
      expect(input).toHaveFocus();
      expect(input).toHaveClass('focus-visible:ring-1');
    });
  });

  describe('State Management', () => {
    it('should render disabled state', () => {
      // Given: Disabled input
      render(<Input disabled placeholder="Disabled" />);

      // Then: Should be disabled
      const input = screen.getByPlaceholderText('Disabled');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:opacity-50');
    });

    it('should prevent input when disabled', async () => {
      // Given: Disabled input
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Input disabled onChange={handleChange} data-testid="disabled-input" />);

      // When: Attempting to type
      const input = screen.getByTestId('disabled-input');
      await user.type(input, 'test');

      // Then: Should not accept input
      expect(input).toHaveValue('');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should render readonly state', async () => {
      // Given: Readonly input
      const user = userEvent.setup();
      render(<Input readOnly defaultValue="Read only" data-testid="readonly-input" />);

      // When: Attempting to modify
      const input = screen.getByTestId('readonly-input');
      await user.type(input, 'new text');

      // Then: Value should not change
      expect(input).toHaveValue('Read only');
    });

    it('should render required state', () => {
      // Given: Required input
      render(<Input required data-testid="required-input" />);

      // Then: Should have required attribute
      const input = screen.getByTestId('required-input');
      expect(input).toBeRequired();
    });
  });

  describe('Dark Theme Compatibility', () => {
    it('should render correctly in dark theme', () => {
      // Given: Input in dark theme
      const { container } = render(
        <div className="dark">
          <Input placeholder="Dark theme input" />
        </div>
      );

      // Then: Should render without errors
      const input = screen.getByPlaceholderText('Dark theme input');
      expect(input).toBeInTheDocument();
      expect(container.querySelector('.dark')).toBeInTheDocument();
    });

    it('should maintain readability in dark theme', () => {
      // Given: Input with value in dark theme
      render(
        <div className="dark">
          <Input defaultValue="Dark theme text" data-testid="dark-input" />
        </div>
      );

      // Then: Text should be visible
      const input = screen.getByTestId('dark-input');
      expect(input).toHaveValue('Dark theme text');
      expect(input).toBeVisible();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render with appropriate mobile height', () => {
      // Given: Input on mobile
      render(<Input data-testid="mobile-input" />);

      // Then: Should have adequate touch target size
      const input = screen.getByTestId('mobile-input');
      expect(input).toHaveClass('h-9'); // 36px - acceptable for inputs
    });

    it('should handle mobile keyboard types', () => {
      // Given: Inputs with mobile-specific types
      const mobileTypes = [
        { type: 'email', inputMode: 'email' },
        { type: 'tel', inputMode: 'tel' },
        { type: 'number', inputMode: 'numeric' },
      ];

      mobileTypes.forEach(({ type, inputMode }) => {
        const { unmount } = render(
          <Input type={type as any} inputMode={inputMode as any} data-testid={`mobile-${type}`} />
        );

        // Then: Should have correct inputMode
        const input = screen.getByTestId(`mobile-${type}`);
        expect(input).toHaveAttribute('inputmode', inputMode);

        unmount();
      });
    });

    it('should scale appropriately on mobile viewports', () => {
      // Given: Input field
      render(<Input data-testid="viewport-input" />);

      // Then: Should have responsive width
      const input = screen.getByTestId('viewport-input');
      expect(input).toHaveClass('w-full');
    });
  });

  describe('Error States and Edge Cases', () => {
    it('should handle empty initial value', () => {
      // Given: Empty input
      render(<Input data-testid="empty-input" />);

      // Then: Should render with empty value
      const input = screen.getByTestId('empty-input');
      expect(input).toHaveValue('');
    });

    it('should handle special characters in input', async () => {
      // Given: Input field
      const user = userEvent.setup();
      render(<Input data-testid="special-chars" />);

      // When: User types special characters
      const input = screen.getByTestId('special-chars');
      await user.type(input, '!@#$%^&*()_+-={}[]|\\:";\'<>?,./');

      // Then: Should accept all characters
      expect(input).toHaveValue('!@#$%^&*()_+-={}[]|\\:";\'<>?,./');
    });

    it('should handle unicode characters', async () => {
      // Given: Input field
      const user = userEvent.setup();
      render(<Input data-testid="unicode-input" />);

      // When: User types unicode characters
      const input = screen.getByTestId('unicode-input');
      await user.type(input, '你好世界🌍');

      // Then: Should accept unicode
      expect(input).toHaveValue('你好世界🌍');
    });

    it('should handle rapid input changes', async () => {
      // Given: Input with change handler
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} data-testid="rapid-input" />);

      // When: User types rapidly
      const input = screen.getByTestId('rapid-input');
      await user.type(input, 'FastTyping', { delay: 1 });

      // Then: All changes should be captured
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('FastTyping');
    });

    it('should handle controlled input with undefined onChange', () => {
      // Given: Controlled input without onChange (React warning scenario)
      const consoleWarn = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(<Input value="test" data-testid="controlled-no-change" />);

      // Then: Should render but React warns
      const input = screen.getByTestId('controlled-no-change');
      expect(input).toHaveValue('test');

      consoleWarn.mockRestore();
    });
  });

  describe('Form Integration', () => {
    it('should submit with form', async () => {
      // Given: Input in form
      const handleSubmit = jest.fn((e) => e.preventDefault());
      const user = userEvent.setup();

      render(
        <form onSubmit={handleSubmit}>
          <Input name="username" data-testid="form-input" />
          <button type="submit">Submit</button>
        </form>
      );

      // When: User types and submits
      const input = screen.getByTestId('form-input');
      await user.type(input, 'testuser');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Then: Form should submit
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should include input value in form data', async () => {
      // Given: Form with input
      const handleSubmit = jest.fn((e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        return formData.get('email');
      });
      const user = userEvent.setup();

      render(
        <form onSubmit={handleSubmit}>
          <Input name="email" type="email" data-testid="email-input" />
          <button type="submit">Submit</button>
        </form>
      );

      // When: User enters email and submits
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Then: Form data should include email
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should reset with form reset', async () => {
      // Given: Form with input
      const user = userEvent.setup();
      render(
        <form>
          <Input defaultValue="Initial" data-testid="reset-input" />
          <button type="reset">Reset</button>
        </form>
      );

      // When: User modifies and resets
      const input = screen.getByTestId('reset-input') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'Modified');
      expect(input.value).toBe('Modified');

      await user.click(screen.getByRole('button', { name: /reset/i }));

      // Then: Should reset to initial value
      await waitFor(() => {
        expect(input.value).toBe('Initial');
      });
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to input element', () => {
      // Given: Input with ref
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} data-testid="ref-input" />);

      // Then: Ref should point to input element
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should allow imperative focus via ref', () => {
      // Given: Input with ref
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      // When: Focusing programmatically
      ref.current?.focus();

      // Then: Input should be focused
      expect(ref.current).toHaveFocus();
    });

    it('should allow value access via ref', async () => {
      // Given: Input with ref
      const ref = React.createRef<HTMLInputElement>();
      const user = userEvent.setup();
      render(<Input ref={ref} />);

      // When: User types
      await user.type(ref.current!, 'Ref value');

      // Then: Value should be accessible via ref
      expect(ref.current?.value).toBe('Ref value');
    });
  });

  describe('File Input Special Cases', () => {
    it('should handle file input type', () => {
      // Given: File input
      render(<Input type="file" accept=".pdf,.doc" data-testid="file-input" />);

      // Then: Should have file type and accept attribute
      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveAttribute('accept', '.pdf,.doc');
    });

    it('should style file input appropriately', () => {
      // Given: File input
      render(<Input type="file" data-testid="file-input" />);

      // Then: Should have file-specific styling
      const input = screen.getByTestId('file-input');
      expect(input).toHaveClass('file:border-0');
      expect(input).toHaveClass('file:bg-transparent');
    });
  });
});
