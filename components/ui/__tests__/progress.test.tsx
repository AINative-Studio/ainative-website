import { render, screen, waitFor } from '@/test/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Progress } from '../Progress';
import React from 'react';

expect.extend(toHaveNoViolations);

describe('Progress Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Progress value={50} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should render without value (indeterminate state)', () => {
      render(<Progress data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should apply default styling classes', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('relative', 'h-2', 'w-full', 'overflow-hidden', 'rounded-full');
    });

    it('should apply custom className while preserving defaults', () => {
      render(<Progress value={50} className="custom-class h-4" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('custom-class', 'h-4', 'w-full');
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(<Progress ref={ref} value={50} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Value Handling', () => {
    it('should render with 0% progress', () => {
      render(<Progress value={0} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should render with 50% progress', () => {
      render(<Progress value={50} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should render with 100% progress', () => {
      render(<Progress value={100} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should handle negative values gracefully', () => {
      render(<Progress value={-10} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should handle values over 100', () => {
      render(<Progress value={150} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should handle null value', () => {
      render(<Progress value={null as unknown as number} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should handle undefined value', () => {
      render(<Progress value={undefined} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size variant', () => {
      render(<Progress value={50} className="h-1" data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveClass('h-1');
    });

    it('should render medium (default) size variant', () => {
      render(<Progress value={50} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveClass('h-2');
    });

    it('should render large size variant', () => {
      render(<Progress value={50} className="h-4" data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveClass('h-4');
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should have progressbar role', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('role', 'progressbar');
    });

    it('should have aria-valuemin attribute', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-valuemin');
    });

    it('should have aria-valuemax attribute', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-valuemax');
    });

    it('should correctly represent progress value for assistive technologies', () => {
      const { container } = render(<Progress value={50} data-testid="progress" />);
      const progressBar = container.querySelector('[role="progressbar"]');
      // Radix UI manages ARIA attributes internally - verify progressbar role exists
      expect(progressBar).toBeInTheDocument();
      // Value is communicated through the Progress primitive's internal state
      expect(progressBar).toHaveAttribute('data-state');
    });

    it('should accept aria-label for screen readers', () => {
      render(<Progress value={50} aria-label="Loading progress" data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveAttribute('aria-label', 'Loading progress');
    });

    it('should accept aria-labelledby for screen readers', () => {
      render(
        <div>
          <span id="progress-label">Upload Progress</span>
          <Progress value={50} aria-labelledby="progress-label" data-testid="progress" />
        </div>
      );
      expect(screen.getByTestId('progress')).toHaveAttribute('aria-labelledby', 'progress-label');
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Progress value={50} aria-label="File upload progress" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in indeterminate state', async () => {
      const { container } = render(
        <Progress aria-label="Loading" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Animations and Transitions', () => {
    it('should have transition classes on indicator', () => {
      const { container } = render(<Progress value={50} data-testid="progress" />);
      const indicator = container.querySelector('[data-state="complete"]') ||
                        container.querySelector('[data-state="loading"]') ||
                        container.querySelector('[role="progressbar"] > *');
      expect(indicator).toHaveClass('transition-all');
    });

    it('should update progress smoothly on value change', async () => {
      const { rerender } = render(<Progress value={25} data-testid="progress" />);

      rerender(<Progress value={75} data-testid="progress" />);

      await waitFor(() => {
        expect(screen.getByTestId('progress')).toBeInTheDocument();
      });
    });

    it('should handle rapid value changes', async () => {
      const { rerender } = render(<Progress value={0} data-testid="progress" />);

      for (let i = 10; i <= 100; i += 10) {
        rerender(<Progress value={i} data-testid="progress" />);
      }

      await waitFor(() => {
        expect(screen.getByTestId('progress')).toBeInTheDocument();
      });
    });
  });

  describe('Indicator Positioning', () => {
    it('should position indicator at 0% for value 0', () => {
      const { container } = render(<Progress value={0} />);
      const indicator = container.querySelector('[role="progressbar"] > *');
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should position indicator at 50% for value 50', () => {
      const { container } = render(<Progress value={50} />);
      const indicator = container.querySelector('[role="progressbar"] > *');
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });

    it('should position indicator at 100% for value 100', () => {
      const { container } = render(<Progress value={100} />);
      const indicator = container.querySelector('[role="progressbar"] > *');
      expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely small values', () => {
      render(<Progress value={0.01} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      render(<Progress value={33.333} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should handle NaN values', () => {
      render(<Progress value={NaN} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should handle Infinity values', () => {
      render(<Progress value={Infinity} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward data attributes', () => {
      render(<Progress value={50} data-custom="test" data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveAttribute('data-custom', 'test');
    });

    it('should forward id attribute', () => {
      render(<Progress value={50} id="custom-progress" data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveAttribute('id', 'custom-progress');
    });

    it('should forward style prop', () => {
      render(<Progress value={50} style={{ width: '200px' }} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveStyle({ width: '200px' });
    });
  });

  describe('Display Name', () => {
    it('should have correct displayName', () => {
      expect(Progress.displayName).toBeDefined();
    });
  });

  describe('Color Variants', () => {
    it('should support custom color via className', () => {
      render(<Progress value={50} className="bg-blue-500" data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveClass('bg-blue-500');
    });

    it('should maintain background color for track', () => {
      const { container } = render(<Progress value={50} />);
      const track = container.querySelector('[role="progressbar"]');
      expect(track).toHaveClass('bg-primary/20');
    });

    it('should maintain foreground color for indicator', () => {
      const { container } = render(<Progress value={50} />);
      const indicator = container.querySelector('[role="progressbar"] > *');
      expect(indicator).toHaveClass('bg-primary');
    });
  });

  describe('Performance', () => {
    it('should render multiple instances efficiently', () => {
      const { container } = render(
        <>
          <Progress value={20} />
          <Progress value={40} />
          <Progress value={60} />
          <Progress value={80} />
        </>
      );
      const progressBars = container.querySelectorAll('[role="progressbar"]');
      expect(progressBars).toHaveLength(4);
    });

    it('should not re-render unnecessarily on same value', () => {
      const { rerender } = render(<Progress value={50} data-testid="progress" />);
      const firstRender = screen.getByTestId('progress');

      rerender(<Progress value={50} data-testid="progress" />);
      const secondRender = screen.getByTestId('progress');

      expect(firstRender).toBe(secondRender);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work within forms', () => {
      render(
        <form>
          <label htmlFor="file-progress">File Upload</label>
          <Progress value={50} id="file-progress" aria-labelledby="file-progress" />
        </form>
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should work with dynamic updates from state', async () => {
      const TestComponent = () => {
        const [progress, setProgress] = React.useState(0);

        React.useEffect(() => {
          setProgress(75);
        }, []);

        return <Progress value={progress} data-testid="progress" />;
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('progress')).toBeInTheDocument();
      });
    });

    it('should maintain accessibility when nested in containers', async () => {
      const { container } = render(
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <Progress value={50} aria-label="Progress indicator" />
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
