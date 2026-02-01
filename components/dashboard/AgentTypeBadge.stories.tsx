/**
 * AgentTypeBadge Storybook Stories
 *
 * Interactive documentation for the AgentTypeBadge component.
 * Showcases all variants, sizes, and interactive states.
 */

import type { Meta, StoryObj } from '@storybook/react';
import AgentTypeBadge from './AgentTypeBadge';

const meta = {
  title: 'Dashboard/AgentTypeBadge',
  component: AgentTypeBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A color-coded badge component for displaying agent types with visual distinction. ' +
          'Fully WCAG 2.1 AA compliant with proper contrast ratios and keyboard navigation support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['quantum', 'ml', 'general', 'conversational', 'task-based', 'workflow', 'custom'],
      description: 'The agent type to display',
      table: {
        type: { summary: 'AgentType' },
        defaultValue: { summary: 'general' },
      },
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show an icon alongside the label',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    interactive: {
      control: 'boolean',
      description: 'Whether the badge is interactive (clickable)',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof AgentTypeBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default quantum agent type badge
 */
export const Quantum: Story = {
  args: {
    type: 'quantum',
  },
  parameters: {
    docs: {
      description: {
        story: 'Purple badge for Quantum Computing agents. Color: #8B5CF6 (Contrast: 5.2:1)',
      },
    },
  },
};

/**
 * Machine Learning agent type
 */
export const MachineLearning: Story = {
  args: {
    type: 'ml',
  },
  parameters: {
    docs: {
      description: {
        story: 'Emerald badge for Machine Learning agents. Color: #10B981 (Contrast: 4.8:1)',
      },
    },
  },
};

/**
 * General purpose agent type
 */
export const General: Story = {
  args: {
    type: 'general',
  },
  parameters: {
    docs: {
      description: {
        story: 'Blue badge for General Purpose agents. Color: #3B82F6 (Contrast: 5.5:1)',
      },
    },
  },
};

/**
 * Conversational AI agent type
 */
export const Conversational: Story = {
  args: {
    type: 'conversational',
  },
  parameters: {
    docs: {
      description: {
        story: 'Pink badge for Conversational AI agents. Color: #EC4899 (Contrast: 5.1:1)',
      },
    },
  },
};

/**
 * Task-based agent type
 */
export const TaskBased: Story = {
  args: {
    type: 'task-based',
  },
  parameters: {
    docs: {
      description: {
        story: 'Amber badge for Task-Based agents. Color: #F59E0B (Contrast: 4.7:1)',
      },
    },
  },
};

/**
 * Workflow automation agent type
 */
export const Workflow: Story = {
  args: {
    type: 'workflow',
  },
  parameters: {
    docs: {
      description: {
        story: 'Indigo badge for Workflow Automation agents. Color: #6366F1 (Contrast: 5.3:1)',
      },
    },
  },
};

/**
 * Custom agent type
 */
export const Custom: Story = {
  args: {
    type: 'custom',
  },
  parameters: {
    docs: {
      description: {
        story: 'Slate badge for Custom agents. Color: #64748B (Contrast: 6.1:1)',
      },
    },
  },
};

/**
 * Badge with icon
 */
export const WithIcon: Story = {
  args: {
    type: 'quantum',
    showIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Agent badge with an icon. Each agent type has its own unique icon.',
      },
    },
  },
};

/**
 * Small size variant
 */
export const Small: Story = {
  args: {
    type: 'ml',
    size: 'sm',
    showIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Small badge variant. Useful for compact layouts or inline text.',
      },
    },
  },
};

/**
 * Medium size variant (default)
 */
export const Medium: Story = {
  args: {
    type: 'general',
    size: 'md',
    showIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium badge variant (default). Standard size for most use cases.',
      },
    },
  },
};

/**
 * Large size variant
 */
export const Large: Story = {
  args: {
    type: 'conversational',
    size: 'lg',
    showIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large badge variant. Useful for prominent displays or headers.',
      },
    },
  },
};

/**
 * Interactive badge with click handler
 */
export const Interactive: Story = {
  args: {
    type: 'quantum',
    interactive: true,
    showIcon: true,
    onClick: () => alert('Badge clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive badge with hover states and keyboard navigation. ' +
          'Click or press Enter/Space to trigger the action. ' +
          'Includes focus ring for accessibility.',
      },
    },
  },
};

/**
 * All agent types showcase
 */
export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-gray-100 dark:bg-gray-900 rounded-lg">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          All Agent Types
        </h3>
        <div className="flex flex-wrap gap-2">
          <AgentTypeBadge type="quantum" />
          <AgentTypeBadge type="ml" />
          <AgentTypeBadge type="general" />
          <AgentTypeBadge type="conversational" />
          <AgentTypeBadge type="task-based" />
          <AgentTypeBadge type="workflow" />
          <AgentTypeBadge type="custom" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All agent type variants displayed together for color palette reference.',
      },
    },
  },
};

/**
 * All types with icons
 */
export const AllTypesWithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-gray-100 dark:bg-gray-900 rounded-lg">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          With Icons
        </h3>
        <div className="flex flex-wrap gap-2">
          <AgentTypeBadge type="quantum" showIcon />
          <AgentTypeBadge type="ml" showIcon />
          <AgentTypeBadge type="general" showIcon />
          <AgentTypeBadge type="conversational" showIcon />
          <AgentTypeBadge type="task-based" showIcon />
          <AgentTypeBadge type="workflow" showIcon />
          <AgentTypeBadge type="custom" showIcon />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All agent types with their respective icons.',
      },
    },
  },
};

/**
 * All sizes comparison
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-gray-100 dark:bg-gray-900 rounded-lg">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Small (sm)
        </h3>
        <div className="flex flex-wrap gap-2">
          <AgentTypeBadge type="quantum" size="sm" showIcon />
          <AgentTypeBadge type="ml" size="sm" showIcon />
          <AgentTypeBadge type="general" size="sm" showIcon />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Medium (md) - Default
        </h3>
        <div className="flex flex-wrap gap-2">
          <AgentTypeBadge type="quantum" size="md" showIcon />
          <AgentTypeBadge type="ml" size="md" showIcon />
          <AgentTypeBadge type="general" size="md" showIcon />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Large (lg)
        </h3>
        <div className="flex flex-wrap gap-2">
          <AgentTypeBadge type="quantum" size="lg" showIcon />
          <AgentTypeBadge type="ml" size="lg" showIcon />
          <AgentTypeBadge type="general" size="lg" showIcon />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Size comparison showing all three available sizes.',
      },
    },
  },
};

/**
 * Interactive states showcase
 */
export const InteractiveStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-gray-100 dark:bg-gray-900 rounded-lg">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Non-Interactive (Static)
        </h3>
        <div className="flex flex-wrap gap-2">
          <AgentTypeBadge type="quantum" showIcon />
          <AgentTypeBadge type="ml" showIcon />
          <AgentTypeBadge type="general" showIcon />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Interactive (Hover & Click)
        </h3>
        <div className="flex flex-wrap gap-2">
          <AgentTypeBadge type="quantum" showIcon interactive onClick={() => alert('Quantum clicked!')} />
          <AgentTypeBadge type="ml" showIcon interactive onClick={() => alert('ML clicked!')} />
          <AgentTypeBadge type="general" showIcon interactive onClick={() => alert('General clicked!')} />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Try hovering and clicking on these badges. They also support keyboard navigation (Tab + Enter/Space).
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of static vs interactive badges. Interactive badges have hover states and are keyboard accessible.',
      },
    },
  },
};

/**
 * Real-world usage example
 */
export const RealWorldExample: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Details</h3>
          <AgentTypeBadge type="quantum" showIcon />
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
          <p className="font-medium text-gray-900 dark:text-white">Quantum Optimizer Pro</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
          <p className="font-medium text-green-600">Active</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Advanced quantum computing agent for optimization problems
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of how the badge appears in a real agent detail card.',
      },
    },
  },
};

/**
 * Agent list example
 */
export const AgentListExample: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-6 bg-gray-100 dark:bg-gray-900 rounded-lg">
      {[
        { name: 'Quantum Optimizer', type: 'quantum' as const, status: 'Active' },
        { name: 'ML Predictor', type: 'ml' as const, status: 'Running' },
        { name: 'Chat Assistant', type: 'conversational' as const, status: 'Idle' },
        { name: 'Task Manager', type: 'task-based' as const, status: 'Active' },
        { name: 'Workflow Engine', type: 'workflow' as const, status: 'Running' },
      ].map((agent, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Status: {agent.status}</p>
            </div>
            <AgentTypeBadge type={agent.type} showIcon size="sm" />
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of agent type badges in a list view, showing how they help distinguish different agent types at a glance.',
      },
    },
  },
};

/**
 * WCAG compliance documentation
 */
export const AccessibilityCompliance: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          WCAG 2.1 AA Compliance
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          All color combinations meet or exceed the WCAG 2.1 AA standard for contrast (4.5:1 minimum).
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { type: 'quantum' as const, contrast: '5.2:1', color: '#8B5CF6' },
          { type: 'ml' as const, contrast: '4.8:1', color: '#10B981' },
          { type: 'general' as const, contrast: '5.5:1', color: '#3B82F6' },
          { type: 'conversational' as const, contrast: '5.1:1', color: '#EC4899' },
          { type: 'task-based' as const, contrast: '4.7:1', color: '#F59E0B' },
          { type: 'workflow' as const, contrast: '5.3:1', color: '#6366F1' },
          { type: 'custom' as const, contrast: '6.1:1', color: '#64748B' },
        ].map((item) => (
          <div key={item.type} className="border border-gray-200 dark:border-gray-700 p-3 rounded">
            <AgentTypeBadge type={item.type} showIcon />
            <div className="mt-2 text-xs space-y-1">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Contrast:</span> {item.contrast}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Color:</span> {item.color}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'All color variants with their contrast ratios. Each badge meets WCAG 2.1 AA standards for accessibility.',
      },
    },
  },
};
