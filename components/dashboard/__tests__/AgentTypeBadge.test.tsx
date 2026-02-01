/**
 * AgentTypeBadge Component Tests (TDD - Test First)
 *
 * Coverage Requirements: 85%+
 * WCAG 2.1 AA Compliance: Required
 *
 * Test Suite Organization (BDD-Style):
 * 1. Rendering Tests - Verify component renders with correct content
 * 2. Variant Tests - Test all agent type color variants
 * 3. Accessibility Tests - WCAG 2.1 AA compliance
 * 4. Interactive Tests - Keyboard navigation and focus
 * 5. Edge Cases - Undefined, null, custom types
 */

import { render, screen } from '@/test/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import AgentTypeBadge from '../AgentTypeBadge';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('AgentTypeBadge', () => {
  describe('Rendering', () => {
    it('should render with quantum type', () => {
      render(<AgentTypeBadge type="quantum" />);
      expect(screen.getByText('Quantum')).toBeInTheDocument();
    });

    it('should render with ml type', () => {
      render(<AgentTypeBadge type="ml" />);
      expect(screen.getByText('ML')).toBeInTheDocument();
    });

    it('should render with general type', () => {
      render(<AgentTypeBadge type="general" />);
      expect(screen.getByText('General')).toBeInTheDocument();
    });

    it('should render with conversational type', () => {
      render(<AgentTypeBadge type="conversational" />);
      expect(screen.getByText('Conversational')).toBeInTheDocument();
    });

    it('should render with task-based type', () => {
      render(<AgentTypeBadge type="task-based" />);
      expect(screen.getByText('Task-Based')).toBeInTheDocument();
    });

    it('should render with workflow type', () => {
      render(<AgentTypeBadge type="workflow" />);
      expect(screen.getByText('Workflow')).toBeInTheDocument();
    });

    it('should render with custom type', () => {
      render(<AgentTypeBadge type="custom" />);
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('should render with data-testid for testing', () => {
      render(<AgentTypeBadge type="quantum" data-testid="agent-badge" />);
      expect(screen.getByTestId('agent-badge')).toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    it('should apply quantum agent color classes', () => {
      render(<AgentTypeBadge type="quantum" data-testid="quantum-badge" />);
      const badge = screen.getByTestId('quantum-badge');

      // Should have quantum-specific classes
      expect(badge).toHaveClass('bg-agent-quantum');
      expect(badge).toHaveClass('text-white');
    });

    it('should apply ML agent color classes', () => {
      render(<AgentTypeBadge type="ml" data-testid="ml-badge" />);
      const badge = screen.getByTestId('ml-badge');

      // Should have ML-specific classes
      expect(badge).toHaveClass('bg-agent-ml');
      expect(badge).toHaveClass('text-white');
    });

    it('should apply general agent color classes', () => {
      render(<AgentTypeBadge type="general" data-testid="general-badge" />);
      const badge = screen.getByTestId('general-badge');

      // Should have general-specific classes
      expect(badge).toHaveClass('bg-agent-general');
      expect(badge).toHaveClass('text-white');
    });

    it('should apply conversational agent color classes', () => {
      render(<AgentTypeBadge type="conversational" data-testid="conversational-badge" />);
      const badge = screen.getByTestId('conversational-badge');

      // Should have conversational-specific classes
      expect(badge).toHaveClass('bg-agent-conversational');
      expect(badge).toHaveClass('text-white');
    });

    it('should apply task-based agent color classes', () => {
      render(<AgentTypeBadge type="task-based" data-testid="task-badge" />);
      const badge = screen.getByTestId('task-badge');

      // Should have task-based-specific classes
      expect(badge).toHaveClass('bg-agent-task');
      expect(badge).toHaveClass('text-white');
    });

    it('should apply workflow agent color classes', () => {
      render(<AgentTypeBadge type="workflow" data-testid="workflow-badge" />);
      const badge = screen.getByTestId('workflow-badge');

      // Should have workflow-specific classes
      expect(badge).toHaveClass('bg-agent-workflow');
      expect(badge).toHaveClass('text-white');
    });

    it('should apply custom agent color classes', () => {
      render(<AgentTypeBadge type="custom" data-testid="custom-badge" />);
      const badge = screen.getByTestId('custom-badge');

      // Should have custom-specific classes
      expect(badge).toHaveClass('bg-agent-custom');
      expect(badge).toHaveClass('text-white');
    });

    it('should apply default color for unknown type', () => {
      // @ts-expect-error Testing edge case with unknown type
      render(<AgentTypeBadge type="unknown" data-testid="unknown-badge" />);
      const badge = screen.getByTestId('unknown-badge');

      // Should fall back to neutral color
      expect(badge).toHaveClass('bg-neutral');
      expect(badge).toHaveClass('text-white');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for quantum type', () => {
      render(<AgentTypeBadge type="quantum" />);
      const badge = screen.getByLabelText('Quantum agent type');
      expect(badge).toBeInTheDocument();
    });

    it('should have proper aria-label for ml type', () => {
      render(<AgentTypeBadge type="ml" />);
      const badge = screen.getByLabelText('ML agent type');
      expect(badge).toBeInTheDocument();
    });

    it('should have proper aria-label for general type', () => {
      render(<AgentTypeBadge type="general" />);
      const badge = screen.getByLabelText('General agent type');
      expect(badge).toBeInTheDocument();
    });

    it('should have proper role attribute', () => {
      render(<AgentTypeBadge type="quantum" data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('should pass axe accessibility tests for quantum variant', async () => {
      const { container } = render(<AgentTypeBadge type="quantum" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should pass axe accessibility tests for ml variant', async () => {
      const { container } = render(<AgentTypeBadge type="ml" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should pass axe accessibility tests for general variant', async () => {
      const { container } = render(<AgentTypeBadge type="general" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should pass axe accessibility tests for all variants', async () => {
      const { container } = render(
        <div>
          <AgentTypeBadge type="quantum" />
          <AgentTypeBadge type="ml" />
          <AgentTypeBadge type="general" />
          <AgentTypeBadge type="conversational" />
          <AgentTypeBadge type="task-based" />
          <AgentTypeBadge type="workflow" />
          <AgentTypeBadge type="custom" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should allow custom aria-label override', () => {
      render(<AgentTypeBadge type="quantum" aria-label="Custom quantum label" />);
      const badge = screen.getByLabelText('Custom quantum label');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard focusable when interactive', () => {
      render(<AgentTypeBadge type="quantum" interactive data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('tabIndex', '0');
    });

    it('should not be focusable when not interactive', () => {
      render(<AgentTypeBadge type="quantum" data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge).not.toHaveAttribute('tabIndex');
    });

    it('should handle click events when interactive', () => {
      const handleClick = jest.fn();
      render(<AgentTypeBadge type="quantum" interactive onClick={handleClick} data-testid="badge" />);
      const badge = screen.getByTestId('badge');

      badge.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Enter key press when interactive', () => {
      const handleClick = jest.fn();
      render(<AgentTypeBadge type="quantum" interactive onClick={handleClick} data-testid="badge" />);
      const badge = screen.getByTestId('badge');

      badge.focus();
      badge.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key press when interactive', () => {
      const handleClick = jest.fn();
      render(<AgentTypeBadge type="quantum" interactive onClick={handleClick} data-testid="badge" />);
      const badge = screen.getByTestId('badge');

      badge.focus();
      badge.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply hover styles when interactive', () => {
      render(<AgentTypeBadge type="quantum" interactive data-testid="badge" />);
      const badge = screen.getByTestId('badge');

      // Should have hover classes
      expect(badge.className).toContain('hover:');
    });
  });

  describe('Props and Customization', () => {
    it('should accept custom className', () => {
      render(<AgentTypeBadge type="quantum" className="custom-class" data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      render(<AgentTypeBadge type="quantum" className="custom-class" data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('bg-agent-quantum');
    });

    it('should accept showIcon prop and display icon', () => {
      render(<AgentTypeBadge type="quantum" showIcon data-testid="badge" />);
      const badge = screen.getByTestId('badge');

      // Icon should be present
      const icon = badge.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should not display icon when showIcon is false', () => {
      render(<AgentTypeBadge type="quantum" showIcon={false} data-testid="badge" />);
      const badge = screen.getByTestId('badge');

      // Icon should not be present
      const icon = badge.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('should accept custom size prop', () => {
      render(<AgentTypeBadge type="quantum" size="sm" data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-xs');
    });

    it('should render default size when not specified', () => {
      render(<AgentTypeBadge type="quantum" data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-sm');
    });

    it('should accept large size', () => {
      render(<AgentTypeBadge type="quantum" size="lg" data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-base');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined type gracefully', () => {
      // @ts-expect-error Testing edge case
      render(<AgentTypeBadge type={undefined} data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-neutral');
    });

    it('should handle null type gracefully', () => {
      // @ts-expect-error Testing edge case
      render(<AgentTypeBadge type={null} data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-neutral');
    });

    it('should handle empty string type', () => {
      // @ts-expect-error Testing edge case
      render(<AgentTypeBadge type="" data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-neutral');
    });

    it('should capitalize type labels correctly', () => {
      render(<AgentTypeBadge type="task-based" />);
      expect(screen.getByText('Task-Based')).toBeInTheDocument();
    });

    it('should handle uppercase ML correctly', () => {
      render(<AgentTypeBadge type="ml" />);
      expect(screen.getByText('ML')).toBeInTheDocument();
    });
  });

  describe('Color Contrast (WCAG 2.1 AA)', () => {
    it('should have sufficient contrast for quantum type', () => {
      const { container } = render(<AgentTypeBadge type="quantum" />);
      const badge = container.querySelector('[aria-label="Quantum agent type"]');

      // Verify element exists and has color classes
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-agent-quantum');
      expect(badge).toHaveClass('text-white');
    });

    it('should have sufficient contrast for ml type', () => {
      const { container } = render(<AgentTypeBadge type="ml" />);
      const badge = container.querySelector('[aria-label="ML agent type"]');

      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-agent-ml');
      expect(badge).toHaveClass('text-white');
    });

    it('should have sufficient contrast for general type', () => {
      const { container } = render(<AgentTypeBadge type="general" />);
      const badge = container.querySelector('[aria-label="General agent type"]');

      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-agent-general');
      expect(badge).toHaveClass('text-white');
    });
  });

  describe('Component Snapshot', () => {
    it('should match snapshot for quantum type', () => {
      const { container } = render(<AgentTypeBadge type="quantum" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for ml type', () => {
      const { container } = render(<AgentTypeBadge type="ml" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for general type', () => {
      const { container } = render(<AgentTypeBadge type="general" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for all sizes', () => {
      const { container } = render(
        <div>
          <AgentTypeBadge type="quantum" size="sm" />
          <AgentTypeBadge type="quantum" size="md" />
          <AgentTypeBadge type="quantum" size="lg" />
        </div>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Complete Branch Coverage', () => {
    it('should apply focus ring for quantum when interactive', () => {
      render(<AgentTypeBadge type="quantum" interactive data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('focus:ring-agent-quantum');
    });

    it('should apply focus ring for ml when interactive', () => {
      render(<AgentTypeBadge type="ml" interactive data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('focus:ring-agent-ml');
    });

    it('should apply focus ring for general when interactive', () => {
      render(<AgentTypeBadge type="general" interactive data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('focus:ring-agent-general');
    });

    it('should apply focus ring for conversational when interactive', () => {
      render(<AgentTypeBadge type="conversational" interactive data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('focus:ring-agent-conversational');
    });

    it('should apply focus ring for task-based when interactive', () => {
      render(<AgentTypeBadge type="task-based" interactive data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('focus:ring-agent-task');
    });

    it('should apply focus ring for workflow when interactive', () => {
      render(<AgentTypeBadge type="workflow" interactive data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('focus:ring-agent-workflow');
    });

    it('should apply focus ring for custom when interactive', () => {
      render(<AgentTypeBadge type="custom" interactive data-testid="badge" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('focus:ring-agent-custom');
    });

    it('should not call onClick when not interactive', () => {
      const handleClick = jest.fn();
      render(<AgentTypeBadge type="quantum" onClick={handleClick} data-testid="badge" />);
      const badge = screen.getByTestId('badge');

      badge.click();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not handle keyboard events when not interactive', () => {
      const handleClick = jest.fn();
      render(<AgentTypeBadge type="quantum" onClick={handleClick} data-testid="badge" />);
      const badge = screen.getByTestId('badge');

      badge.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should ignore non-Enter/Space keys when interactive', () => {
      const handleClick = jest.fn();
      render(<AgentTypeBadge type="quantum" interactive onClick={handleClick} data-testid="badge" />);
      const badge = screen.getByTestId('badge');

      badge.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should work without onClick handler when interactive', () => {
      render(<AgentTypeBadge type="quantum" interactive data-testid="badge" />);
      const badge = screen.getByTestId('badge');

      expect(() => {
        badge.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      }).not.toThrow();
    });
  });
});
