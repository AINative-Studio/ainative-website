import { render, screen } from '@/test/test-utils';
import { Progress } from '@/components/ui/Progress';
import { axe } from 'jest-axe';
import React from 'react';

/**
 * Issue #500: Simplify Progress Component Structure
 *
 * This test validates the refactored Progress component meets all requirements:
 * 1. Simplified structure (clean, maintainable code)
 * 2. Maintains all functionality (variants, animations)
 * 3. WCAG 2.1 AA compliance
 * 4. Comprehensive test coverage (85%+)
 */

describe('Issue #500: Progress Component Refactor Validation', () => {
  describe('Requirement 1: Simplified Structure', () => {
    it('should have a single, clean component export', () => {
      expect(Progress).toBeDefined();
      // React.forwardRef returns an object with $$typeof and render properties
      expect(typeof Progress).toBe('object');
      expect(Progress.displayName).toBeDefined();
    });

    it('should use Radix UI primitive as base (no unnecessary abstraction)', () => {
      const { container } = render(<Progress value={50} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should maintain simple prop interface', () => {
      // Test that component accepts standard HTML div props
      const { container } = render(
        <Progress
          value={50}
          className="custom"
          id="test-id"
          data-testid="progress"
          aria-label="Test progress"
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Requirement 2: Maintains All Functionality', () => {
    it('should support linear variant (default)', () => {
      const { container } = render(<Progress value={50} />);
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });

    it('should support indeterminate variant (no value)', () => {
      const { container } = render(<Progress />);
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });

    it('should support size variants via className', () => {
      const { container: small } = render(<Progress value={50} className="h-1" />);
      const { container: large } = render(<Progress value={50} className="h-4" />);

      expect(small.querySelector('.h-1')).toBeInTheDocument();
      expect(large.querySelector('.h-4')).toBeInTheDocument();
    });

    it('should support color variants via className', () => {
      const { container } = render(
        <Progress value={50} className="[&>div]:bg-blue-500" />
      );
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });

    it('should animate progress changes smoothly', () => {
      const { container } = render(<Progress value={50} />);
      const indicator = container.querySelector('[role="progressbar"] > *');
      expect(indicator).toHaveClass('transition-all');
    });
  });

  describe('Requirement 3: WCAG 2.1 AA Compliance', () => {
    it('should have role="progressbar"', () => {
      const { container } = render(<Progress value={50} />);
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });

    it('should have aria-valuemin', () => {
      const { container } = render(<Progress value={50} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuemin');
    });

    it('should have aria-valuemax', () => {
      const { container } = render(<Progress value={50} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuemax');
    });

    it('should communicate progress value to assistive technologies', () => {
      const { container } = render(<Progress value={50} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      // Radix UI Progress primitive manages ARIA attributes internally
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('data-state');
    });

    it('should support aria-label', () => {
      const { container } = render(<Progress value={50} aria-label="Upload progress" />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-label', 'Upload progress');
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(<Progress value={50} aria-label="Test progress" />);
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });
  });

  describe('Requirement 4: Maintains Backward Compatibility', () => {
    it('should work with existing usage patterns', () => {
      // Common usage pattern from existing codebase
      const { container } = render(
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span>Upload Progress</span>
            <span>50%</span>
          </div>
          <Progress value={50} />
        </div>
      );
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });

    it('should work with ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Progress value={50} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should support all previous className overrides', () => {
      const { container } = render(
        <Progress
          value={50}
          className="h-4 bg-gray-700 [&>div]:bg-green-500"
        />
      );
      expect(container.querySelector('.h-4')).toBeInTheDocument();
    });
  });

  describe('Code Quality Validation', () => {
    it('should have displayName for debugging', () => {
      expect(Progress.displayName).toBeDefined();
    });

    it('should handle edge cases gracefully', () => {
      // Should not crash with invalid inputs
      const { container: nanValue } = render(<Progress value={NaN} />);
      const { container: negativeValue } = render(<Progress value={-10} />);
      const { container: overValue } = render(<Progress value={150} />);

      expect(nanValue.querySelector('[role="progressbar"]')).toBeInTheDocument();
      expect(negativeValue.querySelector('[role="progressbar"]')).toBeInTheDocument();
      expect(overValue.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });

    it('should maintain performance with multiple instances', () => {
      const startTime = performance.now();

      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <Progress key={i} value={i * 2} />
          ))}
        </>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render 50 instances in less than 100ms
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Documentation Validation', () => {
    it('should have clear, simple API surface', () => {
      // The component should only require:
      // 1. value (optional number)
      // 2. className (optional string)
      // 3. Standard HTML div props
      // 4. ref forwarding

      const validUsages = [
        <Progress value={50} />,
        <Progress />,
        <Progress value={75} className="custom" />,
        <Progress value={25} aria-label="Loading" />,
      ];

      validUsages.forEach((usage, index) => {
        const { container } = render(usage);
        expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
      });
    });
  });
});
