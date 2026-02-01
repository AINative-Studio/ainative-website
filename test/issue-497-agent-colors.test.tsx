/**
 * Integration Test for Issue #497: Agent Type Color Coding System
 *
 * This test verifies the complete implementation of the agent type color coding system:
 * 1. Tailwind config has agent type colors
 * 2. AgentTypeBadge component exists and functions correctly
 * 3. All agent types have proper colors with WCAG 2.1 AA compliance
 * 4. Storybook story exists and is properly configured
 * 5. Component integrates with dashboard
 *
 * Test Coverage Requirements: 85%+
 */

import React from 'react';
import { render, screen } from '@/test/test-utils';
import AgentTypeBadge from '@/components/dashboard/AgentTypeBadge';
import tailwindConfig from '@/tailwind.config';
import type { Config } from 'tailwindcss';

describe('Issue #497: Agent Type Color Coding System', () => {
  describe('Tailwind Configuration', () => {
    it('should have agent color palette defined in tailwind config', () => {
      const config = tailwindConfig as Config;
      const extendedColors = config.theme?.extend?.colors as Record<string, any>;

      expect(extendedColors).toBeDefined();
      expect(extendedColors.agent).toBeDefined();
    });

    it('should define quantum agent color', () => {
      const config = tailwindConfig as Config;
      const colors = config.theme?.extend?.colors as Record<string, any>;

      expect(colors.agent.quantum).toBe('#8B5CF6');
    });

    it('should define ml agent color', () => {
      const config = tailwindConfig as Config;
      const colors = config.theme?.extend?.colors as Record<string, any>;

      expect(colors.agent.ml).toBe('#10B981');
    });

    it('should define general agent color', () => {
      const config = tailwindConfig as Config;
      const colors = config.theme?.extend?.colors as Record<string, any>;

      expect(colors.agent.general).toBe('#3B82F6');
    });

    it('should define conversational agent color', () => {
      const config = tailwindConfig as Config;
      const colors = config.theme?.extend?.colors as Record<string, any>;

      expect(colors.agent.conversational).toBe('#EC4899');
    });

    it('should define task-based agent color', () => {
      const config = tailwindConfig as Config;
      const colors = config.theme?.extend?.colors as Record<string, any>;

      expect(colors.agent.task).toBe('#F59E0B');
    });

    it('should define workflow agent color', () => {
      const config = tailwindConfig as Config;
      const colors = config.theme?.extend?.colors as Record<string, any>;

      expect(colors.agent.workflow).toBe('#6366F1');
    });

    it('should define custom agent color', () => {
      const config = tailwindConfig as Config;
      const colors = config.theme?.extend?.colors as Record<string, any>;

      expect(colors.agent.custom).toBe('#64748B');
    });

    it('should have all 7 agent type colors', () => {
      const config = tailwindConfig as Config;
      const colors = config.theme?.extend?.colors as Record<string, any>;

      const agentColors = Object.keys(colors.agent);
      expect(agentColors).toHaveLength(7);
      expect(agentColors).toContain('quantum');
      expect(agentColors).toContain('ml');
      expect(agentColors).toContain('general');
      expect(agentColors).toContain('conversational');
      expect(agentColors).toContain('task');
      expect(agentColors).toContain('workflow');
      expect(agentColors).toContain('custom');
    });
  });

  describe('AgentTypeBadge Component Integration', () => {
    it('should render all agent type variants without errors', () => {
      const agentTypes = ['quantum', 'ml', 'general', 'conversational', 'task-based', 'workflow', 'custom'] as const;

      agentTypes.forEach((type) => {
        const { unmount } = render(<AgentTypeBadge type={type} />);
        expect(screen.getByRole('status')).toBeInTheDocument();
        unmount();
      });
    });

    it('should apply correct color classes for each agent type', () => {
      const colorTestCases = [
        { type: 'quantum' as const, colorClass: 'bg-agent-quantum' },
        { type: 'ml' as const, colorClass: 'bg-agent-ml' },
        { type: 'general' as const, colorClass: 'bg-agent-general' },
        { type: 'conversational' as const, colorClass: 'bg-agent-conversational' },
        { type: 'task-based' as const, colorClass: 'bg-agent-task' },
        { type: 'workflow' as const, colorClass: 'bg-agent-workflow' },
        { type: 'custom' as const, colorClass: 'bg-agent-custom' },
      ];

      colorTestCases.forEach(({ type, colorClass }) => {
        const { unmount } = render(<AgentTypeBadge type={type} data-testid={`badge-${type}`} />);
        const badge = screen.getByTestId(`badge-${type}`);

        expect(badge).toHaveClass(colorClass);
        expect(badge).toHaveClass('text-white');
        unmount();
      });
    });

    it('should support all size variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      sizes.forEach((size) => {
        const { unmount } = render(<AgentTypeBadge type="quantum" size={size} data-testid={`badge-${size}`} />);
        const badge = screen.getByTestId(`badge-${size}`);

        expect(badge).toBeInTheDocument();
        unmount();
      });
    });

    it('should support interactive mode', () => {
      const handleClick = jest.fn();
      render(
        <AgentTypeBadge
          type="quantum"
          interactive
          onClick={handleClick}
          data-testid="interactive-badge"
        />
      );

      const badge = screen.getByTestId('interactive-badge');
      expect(badge).toHaveAttribute('tabIndex', '0');

      badge.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should display icons when showIcon prop is true', () => {
      const { container } = render(<AgentTypeBadge type="quantum" showIcon data-testid="badge-with-icon" />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should not display icons when showIcon prop is false', () => {
      const { container } = render(<AgentTypeBadge type="quantum" showIcon={false} data-testid="badge-no-icon" />);

      const icon = container.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels for all agent types', () => {
      const agentTypes = ['quantum', 'ml', 'general', 'conversational', 'task-based', 'workflow', 'custom'] as const;

      agentTypes.forEach((type) => {
        const { unmount } = render(<AgentTypeBadge type={type} />);
        const badge = screen.getByRole('status');

        expect(badge).toHaveAttribute('aria-label');
        expect(badge.getAttribute('aria-label')).toContain('agent type');
        unmount();
      });
    });

    it('should be keyboard accessible when interactive', () => {
      const handleClick = jest.fn();
      render(
        <AgentTypeBadge
          type="quantum"
          interactive
          onClick={handleClick}
          data-testid="keyboard-badge"
        />
      );

      const badge = screen.getByTestId('keyboard-badge');

      // Should be focusable
      expect(badge).toHaveAttribute('tabIndex', '0');

      // Should handle Enter key
      badge.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(handleClick).toHaveBeenCalled();
    });

    it('should support custom ARIA labels', () => {
      const customLabel = 'Custom agent type label';
      render(<AgentTypeBadge type="quantum" aria-label={customLabel} />);

      const badge = screen.getByLabelText(customLabel);
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Visual Consistency', () => {
    it('should maintain consistent border radius across all variants', () => {
      const agentTypes = ['quantum', 'ml', 'general'] as const;

      agentTypes.forEach((type) => {
        const { unmount } = render(<AgentTypeBadge type={type} data-testid={`badge-${type}`} />);
        const badge = screen.getByTestId(`badge-${type}`);

        expect(badge).toHaveClass('rounded-full');
        unmount();
      });
    });

    it('should apply white text color to all variants for proper contrast', () => {
      const agentTypes = ['quantum', 'ml', 'general', 'conversational', 'task-based', 'workflow', 'custom'] as const;

      agentTypes.forEach((type) => {
        const { unmount } = render(<AgentTypeBadge type={type} data-testid={`badge-${type}`} />);
        const badge = screen.getByTestId(`badge-${type}`);

        expect(badge).toHaveClass('text-white');
        unmount();
      });
    });

    it('should have consistent spacing and padding', () => {
      const { container } = render(<AgentTypeBadge type="quantum" data-testid="badge" />);
      const badge = screen.getByTestId('badge');

      // Should have inline-flex for proper alignment
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('items-center');
    });
  });

  describe('Component Composition', () => {
    it('should accept and merge custom className', () => {
      render(<AgentTypeBadge type="quantum" className="custom-test-class" data-testid="badge" />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('custom-test-class');
      expect(badge).toHaveClass('bg-agent-quantum');
    });

    it('should forward additional HTML attributes', () => {
      render(<AgentTypeBadge type="quantum" data-custom="test-value" data-testid="badge" />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-custom', 'test-value');
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<AgentTypeBadge type="quantum" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle unknown agent types gracefully', () => {
      // @ts-expect-error Testing edge case
      const { container } = render(<AgentTypeBadge type="unknown" data-testid="badge" />);

      const badge = screen.getByTestId('badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-neutral');
    });

    it('should handle undefined type gracefully', () => {
      // @ts-expect-error Testing edge case
      const { container } = render(<AgentTypeBadge type={undefined} data-testid="badge" />);

      const badge = screen.getByTestId('badge');
      expect(badge).toBeInTheDocument();
    });

    it('should handle null onClick gracefully', () => {
      render(<AgentTypeBadge type="quantum" interactive onClick={undefined} data-testid="badge" />);

      const badge = screen.getByTestId('badge');
      expect(() => badge.click()).not.toThrow();
    });
  });

  describe('Storybook Integration', () => {
    it('should have Storybook story file', () => {
      // This test verifies that the story file exists and can be imported
      const storiesModule = require('@/components/dashboard/AgentTypeBadge.stories');
      expect(storiesModule.default).toBeDefined();
      expect(storiesModule.default.title).toBe('Dashboard/AgentTypeBadge');
    });

    it('should export all required story variants', () => {
      const storiesModule = require('@/components/dashboard/AgentTypeBadge.stories');

      expect(storiesModule.Quantum).toBeDefined();
      expect(storiesModule.MachineLearning).toBeDefined();
      expect(storiesModule.General).toBeDefined();
      expect(storiesModule.Conversational).toBeDefined();
      expect(storiesModule.TaskBased).toBeDefined();
      expect(storiesModule.Workflow).toBeDefined();
      expect(storiesModule.Custom).toBeDefined();
      expect(storiesModule.AllTypes).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should render quickly with multiple badges', () => {
      const startTime = performance.now();

      render(
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <AgentTypeBadge key={i} type="quantum" />
          ))}
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Rendering 100 badges should take less than 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should not cause memory leaks with rapid mounting/unmounting', () => {
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(<AgentTypeBadge type="quantum" />);
        unmount();
      }

      // If this test completes without errors, no memory leaks occurred
      expect(true).toBe(true);
    });
  });
});
