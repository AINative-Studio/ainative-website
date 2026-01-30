import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ButtonDemo,
  TextFieldDemo,
  SliderDemo,
  CheckBoxDemo,
  ChoicePickerDemo,
  DividerDemo,
} from '../ComponentDemo';

describe('ButtonDemo', () => {
  it('should render all button variants', () => {
    // Given/When
    render(<ButtonDemo />);

    // Then
    expect(screen.getByText(/primary/i)).toBeInTheDocument();
    expect(screen.getByText(/secondary/i)).toBeInTheDocument();
    expect(screen.getByText(/outline/i)).toBeInTheDocument();
  });

  it('should show button states', () => {
    // Given/When
    render(<ButtonDemo />);

    // Then
    expect(screen.getByText(/default/i)).toBeInTheDocument();
    expect(screen.getByText(/disabled/i)).toBeInTheDocument();
  });

  it('should handle button clicks', async () => {
    // Given
    const user = userEvent.setup();
    render(<ButtonDemo />);

    // When
    const button = screen.getAllByRole('button')[0];
    await user.click(button);

    // Then
    expect(button).toBeEnabled();
  });

  it('should have disabled button that cannot be clicked', async () => {
    // Given
    const user = userEvent.setup();
    render(<ButtonDemo />);

    // When
    const disabledButton = screen.getByRole('button', { name: /disabled/i });

    // Then
    expect(disabledButton).toBeDisabled();
  });

  it('should display code example', () => {
    // Given/When
    render(<ButtonDemo />);

    // Then
    expect(screen.getByRole('region', { name: /code example for AIKitButton/i })).toBeInTheDocument();
  });
});

describe('TextFieldDemo', () => {
  it('should render text input field', () => {
    // Given/When
    render(<TextFieldDemo />);

    // Then
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should accept text input', async () => {
    // Given
    const user = userEvent.setup();
    render(<TextFieldDemo />);

    // When
    const textField = screen.getByRole('textbox');
    await user.type(textField, 'Hello AI Kit');

    // Then
    expect(textField).toHaveValue('Hello AI Kit');
  });

  it('should display placeholder text', () => {
    // Given/When
    render(<TextFieldDemo />);

    // Then
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it('should show character count', () => {
    // Given/When
    render(<TextFieldDemo />);

    // Then
    expect(screen.getByText(/characters/i)).toBeInTheDocument();
  });

  it('should display code example', () => {
    // Given/When
    render(<TextFieldDemo />);

    // Then
    expect(screen.getByRole('region', { name: /code example for AIKitTextField/i })).toBeInTheDocument();
  });

  it('should support different input types', () => {
    // Given/When
    render(<TextFieldDemo />);

    // Then
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });
});

describe('SliderDemo', () => {
  it('should render slider component', () => {
    // Given/When
    render(<SliderDemo />);

    // Then
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThan(0);
  });

  it('should display current value', () => {
    // Given/When
    render(<SliderDemo />);

    // Then
    expect(screen.getByText(/value/i)).toBeInTheDocument();
  });

  it('should have min and max attributes', () => {
    // Given/When
    render(<SliderDemo />);

    // Then
    const sliders = screen.getAllByRole('slider');
    expect(sliders[0]).toHaveAttribute('aria-valuemin');
    expect(sliders[0]).toHaveAttribute('aria-valuemax');
  });

  it('should update value on interaction', async () => {
    // Given
    const user = userEvent.setup();
    render(<SliderDemo />);

    // When
    const sliders = screen.getAllByRole('slider');
    await user.click(sliders[0]);

    // Then
    expect(sliders[0]).toHaveAttribute('aria-valuenow');
  });

  it('should display code example', () => {
    // Given/When
    render(<SliderDemo />);

    // Then
    expect(screen.getByRole('region', { name: /code example for AIKitSlider/i })).toBeInTheDocument();
  });

  it('should show range labels', () => {
    // Given/When
    render(<SliderDemo />);

    // Then
    expect(screen.getByText(/min/i)).toBeInTheDocument();
    expect(screen.getByText(/max/i)).toBeInTheDocument();
  });
});

describe('CheckBoxDemo', () => {
  it('should render checkbox component', () => {
    // Given/When
    render(<CheckBoxDemo />);

    // Then
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should toggle checkbox state', async () => {
    // Given
    const user = userEvent.setup();
    render(<CheckBoxDemo />);

    // When
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Then
    expect(checkbox).toBeChecked();
  });

  it('should display checkbox label', () => {
    // Given/When
    render(<CheckBoxDemo />);

    // Then
    expect(screen.getByText(/accept terms/i)).toBeInTheDocument();
  });

  it('should support multiple checkboxes', () => {
    // Given/When
    render(<CheckBoxDemo />);

    // Then
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('should display code example', () => {
    // Given/When
    render(<CheckBoxDemo />);

    // Then
    expect(screen.getByRole('region', { name: /code example for AIKitCheckBox/i })).toBeInTheDocument();
  });

  it('should show checked state visually', async () => {
    // Given
    const user = userEvent.setup();
    render(<CheckBoxDemo />);

    // When
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Then
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });
});

describe('ChoicePickerDemo', () => {
  it('should render choice picker component', () => {
    // Given/When
    render(<ChoicePickerDemo />);

    // Then
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('should display multiple choices', () => {
    // Given/When
    render(<ChoicePickerDemo />);

    // Then
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBeGreaterThan(1);
  });

  it('should select choice on click', async () => {
    // Given
    const user = userEvent.setup();
    render(<ChoicePickerDemo />);

    // When
    const radio = screen.getAllByRole('radio')[0];
    await user.click(radio);

    // Then
    expect(radio).toBeChecked();
  });

  it('should allow only one selection at a time', async () => {
    // Given
    const user = userEvent.setup();
    render(<ChoicePickerDemo />);

    // When
    const radios = screen.getAllByRole('radio');
    await user.click(radios[0]);
    await user.click(radios[1]);

    // Then
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
  });

  it('should display code example', () => {
    // Given/When
    render(<ChoicePickerDemo />);

    // Then
    expect(screen.getByRole('region', { name: /code example for AIKitChoicePicker/i })).toBeInTheDocument();
  });

  it('should have accessible labels for each choice', () => {
    // Given/When
    render(<ChoicePickerDemo />);

    // Then
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toHaveAccessibleName();
    });
  });
});

describe('DividerDemo', () => {
  it('should render divider component', () => {
    // Given/When
    const { container } = render(<DividerDemo />);

    // Then
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/horizontal divider/i)).toBeInTheDocument();
  });

  it('should display horizontal divider', () => {
    // Given/When
    render(<DividerDemo />);

    // Then
    expect(screen.getByText(/horizontal divider/i)).toBeInTheDocument();
    expect(screen.getByText(/content above/i)).toBeInTheDocument();
    expect(screen.getByText(/content below/i)).toBeInTheDocument();
  });

  it('should display vertical divider', () => {
    // Given/When
    render(<DividerDemo />);

    // Then
    expect(screen.getByText(/vertical divider/i)).toBeInTheDocument();
    expect(screen.getByText(/left content/i)).toBeInTheDocument();
    expect(screen.getByText(/right content/i)).toBeInTheDocument();
  });

  it('should display code example', () => {
    // Given/When
    render(<DividerDemo />);

    // Then
    expect(screen.getByRole('region', { name: /code example for AIKitDivider/i })).toBeInTheDocument();
  });

  it('should support different divider styles', () => {
    // Given/When
    const { container } = render(<DividerDemo />);

    // Then
    expect(screen.getByText(/with custom color/i)).toBeInTheDocument();
    expect(container.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
  });
});
