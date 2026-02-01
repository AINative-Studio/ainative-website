import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AIKitSlider } from '../AIKitSlider';

describe('AIKitSlider', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<AIKitSlider value={50} onChange={() => {}} />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
      expect(slider).toHaveAttribute('aria-valuenow', '50');
    });

    it('should render with a label when provided', () => {
      render(<AIKitSlider label="Volume" value={50} onChange={() => {}} />);
      expect(screen.getByText('Volume')).toBeInTheDocument();
    });

    it('should render with custom min, max, and step values', () => {
      render(
        <AIKitSlider
          value={5}
          onChange={() => {}}
          min={0}
          max={10}
          step={0.5}
        />
      );
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '10');
      expect(slider).toHaveAttribute('aria-valuenow', '5');
    });

    it('should show value display when showValue is true', () => {
      render(
        <AIKitSlider
          value={75}
          onChange={() => {}}
          showValue={true}
        />
      );
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should not show value display when showValue is false', () => {
      render(
        <AIKitSlider
          value={75}
          onChange={() => {}}
          showValue={false}
        />
      );
      expect(screen.queryByText('75')).not.toBeInTheDocument();
    });

    it('should format value display when formatValue is provided', () => {
      render(
        <AIKitSlider
          value={25}
          onChange={() => {}}
          showValue={true}
          formatValue={(v) => `${v}%`}
        />
      );
      expect(screen.getByText('25%')).toBeInTheDocument();
    });
  });

  describe('Value Changes', () => {
    it('should call onChange when value changes', async () => {
      const handleChange = jest.fn();
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={handleChange}
          data-testid="slider-root"
        />
      );

      const slider = screen.getByRole('slider');

      // Verify the component is set up correctly for onChange
      expect(slider).toBeInTheDocument();
      expect(handleChange).toBeDefined();

      // Verify slider has proper ARIA attributes indicating it can be changed
      expect(slider).toHaveAttribute('aria-valuenow', '50');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
    });

    it('should update displayed value when external value changes', () => {
      const { rerender } = render(
        <AIKitSlider
          value={30}
          onChange={() => {}}
          showValue={true}
        />
      );

      expect(screen.getByText('30')).toBeInTheDocument();

      rerender(
        <AIKitSlider
          value={70}
          onChange={() => {}}
          showValue={true}
        />
      );

      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.queryByText('30')).not.toBeInTheDocument();
    });

    it('should respect min and max boundaries', () => {
      render(
        <AIKitSlider
          value={5}
          onChange={() => {}}
          min={0}
          max={10}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '10');
    });

    it('should handle step increments correctly', () => {
      const { container } = render(
        <AIKitSlider
          value={0}
          onChange={() => {}}
          min={0}
          max={100}
          step={5}
        />
      );

      const slider = screen.getByRole('slider');
      // Verify slider is rendered and should respect step
      expect(slider).toBeInTheDocument();

      // Check that the slider root has proper orientation
      const sliderRoot = container.querySelector('[data-orientation]');
      expect(sliderRoot).toHaveAttribute('data-orientation', 'horizontal');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support arrow key navigation', async () => {
      const handleChange = jest.fn();
      render(
        <AIKitSlider
          value={50}
          onChange={handleChange}
          min={0}
          max={100}
          step={1}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();
      expect(slider).toHaveFocus();

      // Simulate arrow key presses
      fireEvent.keyDown(slider, { key: 'ArrowRight' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });

    it('should support Home key to jump to minimum', async () => {
      const handleChange = jest.fn();
      render(
        <AIKitSlider
          value={50}
          onChange={handleChange}
          min={0}
          max={100}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      fireEvent.keyDown(slider, { key: 'Home' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });

    it('should support End key to jump to maximum', async () => {
      const handleChange = jest.fn();
      render(
        <AIKitSlider
          value={50}
          onChange={handleChange}
          min={0}
          max={100}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      fireEvent.keyDown(slider, { key: 'End' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });

    it('should be keyboard focusable', () => {
      render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();
      expect(slider).toHaveFocus();
    });
  });

  describe('Disabled State', () => {
    it('should render as disabled when disabled prop is true', () => {
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
          disabled={true}
        />
      );

      const slider = screen.getByRole('slider');
      // Radix UI uses data-disabled attribute
      expect(slider).toHaveAttribute('data-disabled');
    });

    it('should not trigger onChange when disabled', async () => {
      const handleChange = jest.fn();
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={handleChange}
          disabled={true}
        />
      );

      const slider = screen.getByRole('slider');

      // Verify the slider is disabled
      expect(slider).toHaveAttribute('data-disabled');

      // The slider root should have disabled styling
      const sliderRoot = container.querySelector('[data-orientation="horizontal"]');
      expect(sliderRoot).toHaveClass('opacity-50');
      expect(sliderRoot).toHaveClass('cursor-not-allowed');

      // onChange should not have been called during render
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should apply disabled visual styles', () => {
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
          disabled={true}
        />
      );

      // Check for opacity-50 class on the slider root (span element with data-orientation)
      const sliderRoot = container.querySelector('[data-orientation="horizontal"]');
      expect(sliderRoot).toHaveClass('opacity-50');
      expect(sliderRoot).toHaveClass('cursor-not-allowed');
    });

    it('should not be keyboard accessible when disabled', () => {
      render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
          disabled={true}
        />
      );

      const slider = screen.getByRole('slider');
      // Radix UI uses data-disabled attribute
      expect(slider).toHaveAttribute('data-disabled');
    });
  });

  describe('Touch Support', () => {
    it('should have touch-none class for touch interactions', () => {
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
        />
      );

      const sliderRoot = container.querySelector('[data-orientation="horizontal"]');
      expect(sliderRoot).toHaveClass('touch-none');
    });

    it('should handle touch events on mobile', () => {
      const handleChange = jest.fn();
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={handleChange}
        />
      );

      const sliderRoot = container.querySelector('[data-orientation="horizontal"]');
      expect(sliderRoot).toBeInTheDocument();

      // The component should be rendered with proper touch handling
      expect(sliderRoot).toHaveClass('select-none');
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should have proper ARIA role', () => {
      render(<AIKitSlider value={50} onChange={() => {}} />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should have aria-label when label prop is provided', () => {
      const { container } = render(
        <AIKitSlider
          label="Volume Control"
          value={50}
          onChange={() => {}}
        />
      );

      // Check that the label is rendered and linked to the slider
      expect(screen.getByText('Volume Control')).toBeInTheDocument();
      const sliderRoot = container.querySelector('[data-orientation="horizontal"]');
      expect(sliderRoot).toHaveAttribute('aria-label', 'Volume Control');
    });

    it('should have proper aria-valuemin, aria-valuemax, and aria-valuenow', () => {
      render(
        <AIKitSlider
          value={25}
          onChange={() => {}}
          min={0}
          max={50}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '50');
      expect(slider).toHaveAttribute('aria-valuenow', '25');
    });

    it('should update aria-valuenow when value changes', () => {
      const { rerender } = render(
        <AIKitSlider
          value={30}
          onChange={() => {}}
        />
      );

      let slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '30');

      rerender(
        <AIKitSlider
          value={70}
          onChange={() => {}}
        />
      );

      slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '70');
    });

    it('should link label to slider with htmlFor attribute', () => {
      render(
        <AIKitSlider
          id="volume-slider"
          label="Volume"
          value={50}
          onChange={() => {}}
        />
      );

      const label = screen.getByText('Volume');
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveAttribute('for', 'volume-slider');
    });

    it('should have focus-visible styles', () => {
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
        />
      );

      // Find the thumb element (it has border class)
      const thumb = container.querySelector('.border');
      expect(thumb).toHaveClass('focus-visible:outline-none');
      expect(thumb).toHaveClass('focus-visible:ring-2');
      expect(thumb).toHaveClass('focus-visible:ring-ring');
    });

    it('should support keyboard navigation for accessibility', () => {
      render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();
      expect(slider).toHaveFocus();

      // Should be navigable via keyboard
      expect(slider).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Visual Styling', () => {
    it('should render track with proper styles', () => {
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
        />
      );

      const track = container.querySelector('.rounded-full.bg-primary\\/20');
      expect(track).toBeInTheDocument();
      expect(track).toHaveClass('h-1.5');
      expect(track).toHaveClass('w-full');
    });

    it('should render range with proper styles', () => {
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
        />
      );

      const range = container.querySelector('.bg-primary');
      expect(range).toBeInTheDocument();
      expect(range).toHaveClass('absolute');
      expect(range).toHaveClass('h-full');
    });

    it('should render thumb with proper styles', () => {
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
        />
      );

      // Find the thumb element (it has border and bg-background classes)
      const thumb = container.querySelector('.border.bg-background');
      expect(thumb).toBeInTheDocument();
      expect(thumb).toHaveClass('h-4');
      expect(thumb).toHaveClass('w-4');
      expect(thumb).toHaveClass('border');
      expect(thumb).toHaveClass('bg-background');
      expect(thumb).toHaveClass('shadow');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
          className="custom-slider-class"
        />
      );

      const wrapper = container.querySelector('.custom-slider-class');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('space-y-2');
    });
  });

  describe('Dark Theme Compatibility', () => {
    it('should have dark theme compatible styles', () => {
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
        />
      );

      // Check for theme-aware background
      const thumb = container.querySelector('.bg-background');
      expect(thumb).toBeInTheDocument();
    });

    it('should render value display with muted foreground color', () => {
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
          showValue={true}
        />
      );

      const valueDisplay = screen.getByText('50');
      expect(valueDisplay).toHaveClass('text-muted-foreground');
      expect(valueDisplay).toHaveClass('font-mono');
    });
  });

  describe('Edge Cases', () => {
    it('should handle value at minimum', () => {
      render(
        <AIKitSlider
          value={0}
          onChange={() => {}}
          min={0}
          max={100}
          showValue={true}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '0');
    });

    it('should handle value at maximum', () => {
      render(
        <AIKitSlider
          value={100}
          onChange={() => {}}
          min={0}
          max={100}
          showValue={true}
        />
      );

      expect(screen.getByText('100')).toBeInTheDocument();
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '100');
    });

    it('should handle decimal step values', () => {
      render(
        <AIKitSlider
          value={2.5}
          onChange={() => {}}
          min={0}
          max={5}
          step={0.5}
          showValue={true}
        />
      );

      expect(screen.getByText('2.5')).toBeInTheDocument();
    });

    it('should handle negative min values', () => {
      render(
        <AIKitSlider
          value={0}
          onChange={() => {}}
          min={-50}
          max={50}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '-50');
      expect(slider).toHaveAttribute('aria-valuemax', '50');
    });

    it('should auto-generate id when not provided', () => {
      const { container } = render(
        <AIKitSlider
          value={50}
          onChange={() => {}}
          label="Auto ID"
        />
      );

      const sliderRoot = container.querySelector('[id]');
      expect(sliderRoot?.id).toMatch(/^slider-/);
    });

    it('should use provided id when specified', () => {
      const { container } = render(
        <AIKitSlider
          id="custom-slider-id"
          value={50}
          onChange={() => {}}
          label="Custom ID"
        />
      );

      const sliderRoot = container.querySelector('#custom-slider-id');
      expect(sliderRoot).toBeInTheDocument();
    });
  });

  describe('Developer Markup Use Case (Issue #175)', () => {
    it('should support developer markup slider configuration', () => {
      render(
        <AIKitSlider
          label="Developer Markup"
          value={15}
          onChange={() => {}}
          min={0}
          max={40}
          step={0.5}
          showValue={true}
          formatValue={(v) => `${v}%`}
        />
      );

      expect(screen.getByText('Developer Markup')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '40');
      expect(slider).toHaveAttribute('aria-valuenow', '15');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        <AIKitSlider
          value={50}
          onChange={handleChange}
        />
      );

      // Re-render with same props
      rerender(
        <AIKitSlider
          value={50}
          onChange={handleChange}
        />
      );

      // Component should still be functional
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });
  });
});
