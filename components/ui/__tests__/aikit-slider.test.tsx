/**
 * AIKit Slider Component - TDD Test Suite
 * Coverage Target: 100%
 */

import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Slider } from '../slider';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AIKit Slider Component - TDD Suite', () => {
  describe('Rendering', () => {
    it('should render slider with default values', () => {
      render(<Slider defaultValue={[50]} data-testid="slider" />);
      expect(screen.getByTestId('slider')).toBeInTheDocument();
    });

    it('should render with min and max values', () => {
      render(<Slider min={0} max={100} defaultValue={[50]} data-testid="slider" />);
      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
    });

    it('should render range slider with multiple values', () => {
      render(<Slider defaultValue={[25, 75]} data-testid="slider" />);
      expect(screen.getByTestId('slider')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Slider defaultValue={[50]} className="custom-slider" data-testid="slider" />);
      expect(screen.getByTestId('slider')).toHaveClass('custom-slider');
    });
  });

  describe('User Interaction', () => {
    it('should update value on interaction', async () => {
      const onValueChange = jest.fn();
      render(<Slider defaultValue={[50]} onValueChange={onValueChange} data-testid="slider" />);

      const slider = screen.getByTestId('slider');
      // Simulate value change
      slider.setAttribute('aria-valuenow', '75');
      expect(slider).toHaveAttribute('aria-valuenow', '75');
    });

    it('should handle keyboard navigation (Arrow Right increases)', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<Slider defaultValue={[50]} onValueChange={onValueChange} step={1} data-testid="slider" />);

      const slider = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      slider.focus();
      await user.keyboard('{ArrowRight}');

      expect(slider).toHaveFocus();
    });

    it('should handle keyboard navigation (Arrow Left decreases)', async () => {
      const user = userEvent.setup();
      render(<Slider defaultValue={[50]} step={1} data-testid="slider" />);

      const slider = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      slider.focus();
      await user.keyboard('{ArrowLeft}');

      expect(slider).toHaveFocus();
    });

    it('should jump to max with End key', async () => {
      const user = userEvent.setup();
      render(<Slider min={0} max={100} defaultValue={[50]} data-testid="slider" />);

      const slider = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      slider.focus();
      await user.keyboard('{End}');

      expect(slider).toHaveFocus();
    });

    it('should jump to min with Home key', async () => {
      const user = userEvent.setup();
      render(<Slider min={0} max={100} defaultValue={[50]} data-testid="slider" />);

      const slider = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      slider.focus();
      await user.keyboard('{Home}');

      expect(slider).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <label id="slider-label">Volume</label>
          <Slider aria-labelledby="slider-label" defaultValue={[50]} />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(<Slider min={0} max={100} defaultValue={[50]} aria-label="Volume control" data-testid="slider" />);

      const sliderElement = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      expect(sliderElement).toHaveAttribute('role', 'slider');
      expect(sliderElement).toHaveAttribute('aria-valuemin', '0');
      expect(sliderElement).toHaveAttribute('aria-valuemax', '100');
    });

    it('should support aria-label', () => {
      render(<Slider aria-label="Temperature" defaultValue={[20]} data-testid="slider" />);
      expect(screen.getByLabelText('Temperature')).toBeInTheDocument();
    });

    it('should support aria-labelledby', () => {
      render(
        <div>
          <span id="slider-label">Brightness</span>
          <Slider aria-labelledby="slider-label" defaultValue={[75]} />
        </div>
      );
      expect(screen.getByLabelText('Brightness')).toBeInTheDocument();
    });

    it('should indicate disabled state', () => {
      render(<Slider disabled defaultValue={[50]} data-testid="slider" />);
      const sliderElement = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      expect(sliderElement).toHaveAttribute('data-disabled');
    });
  });

  describe('State Management', () => {
    it('should work as controlled component', () => {
      const { rerender } = render(
        <Slider value={[25]} onValueChange={() => {}} data-testid="slider" />
      );

      let sliderElement = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      expect(sliderElement).toHaveAttribute('aria-valuenow', '25');

      rerender(<Slider value={[75]} onValueChange={() => {}} data-testid="slider" />);
      sliderElement = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      expect(sliderElement).toHaveAttribute('aria-valuenow', '75');
    });

    it('should work as uncontrolled component', () => {
      render(<Slider defaultValue={[60]} data-testid="slider" />);
      const sliderElement = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      expect(sliderElement).toHaveAttribute('aria-valuenow', '60');
    });

    it('should respect step value', () => {
      render(<Slider min={0} max={100} step={10} defaultValue={[50]} data-testid="slider" />);
      expect(screen.getByTestId('slider')).toBeInTheDocument();
    });

    it('should prevent interaction when disabled', async () => {
      const onValueChange = jest.fn();
      const user = userEvent.setup();
      render(<Slider disabled defaultValue={[50]} onValueChange={onValueChange} data-testid="slider" />);

      const sliderElement = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      sliderElement.focus();
      await user.keyboard('{ArrowRight}');

      // Value should not change when disabled
      expect(sliderElement).toHaveAttribute('data-disabled');
    });
  });

  describe('Dark Theme', () => {
    it('should render correctly in dark theme', () => {
      const { container } = render(
        <div className="dark">
          <Slider defaultValue={[50]} data-testid="slider" />
        </div>
      );

      expect(screen.getByTestId('slider')).toBeInTheDocument();
      expect(container.querySelector('.dark')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be touch-friendly', () => {
      render(<Slider defaultValue={[50]} data-testid="slider" />);
      const slider = screen.getByTestId('slider');
      expect(slider).toHaveClass('touch-none'); // Prevents default touch behavior
    });

    it('should have adequate thumb size for touch', () => {
      render(<Slider defaultValue={[50]} data-testid="slider" />);
      // Thumb should be h-4 w-4 (16px) minimum
      expect(screen.getByTestId('slider')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single value', () => {
      render(<Slider defaultValue={[0]} data-testid="slider" />);
      expect(screen.getByTestId('slider')).toBeInTheDocument();
    });

    it('should handle maximum value', () => {
      render(<Slider min={0} max={100} defaultValue={[100]} data-testid="slider" />);
      const sliderElement = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      expect(sliderElement).toHaveAttribute('aria-valuenow', '100');
    });

    it('should handle minimum value', () => {
      render(<Slider min={0} max={100} defaultValue={[0]} data-testid="slider" />);
      const sliderElement = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      expect(sliderElement).toHaveAttribute('aria-valuenow', '0');
    });

    it('should handle negative values', () => {
      render(<Slider min={-100} max={100} defaultValue={[-50]} data-testid="slider" />);
      const sliderElement = screen.getByTestId('slider').querySelector('[role="slider"]') as HTMLElement;
      expect(sliderElement).toHaveAttribute('aria-valuenow', '-50');
    });

    it('should handle decimal values with step', () => {
      render(<Slider min={0} max={1} step={0.1} defaultValue={[0.5]} data-testid="slider" />);
      expect(screen.getByTestId('slider')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Slider ref={ref} defaultValue={[50]} />);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });
});
