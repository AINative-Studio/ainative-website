import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AIKitChoicePicker } from './AIKitChoicePicker';

const meta = {
  title: 'AIKit/ChoicePicker',
  component: AIKitChoicePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'multi'],
      description: 'Selection mode',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all options',
    },
    showClearAll: {
      control: 'boolean',
      description: 'Show clear all button',
    },
    maxSelections: {
      control: 'number',
      description: 'Maximum selections (multi mode only)',
    },
    label: {
      control: 'text',
      description: 'Label for the choice picker',
    },
  },
} satisfies Meta<typeof AIKitChoicePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default options for stories
const defaultOptions = [
  { id: '1', label: 'React', value: 'react' },
  { id: '2', label: 'Vue', value: 'vue' },
  { id: '3', label: 'Angular', value: 'angular' },
  { id: '4', label: 'Svelte', value: 'svelte' },
];

const categoryOptions = [
  { id: '1', label: 'Technology', value: 'tech' },
  { id: '2', label: 'Design', value: 'design' },
  { id: '3', label: 'Business', value: 'business' },
  { id: '4', label: 'Marketing', value: 'marketing' },
  { id: '5', label: 'Sales', value: 'sales' },
  { id: '6', label: 'Support', value: 'support' },
];

// Default state - multi-select
export const Default: Story = {
  args: {
    label: 'Choose your frameworks',
    options: defaultOptions,
    mode: 'multi',
  },
};

// Single select mode
export const SingleSelect: Story = {
  args: {
    label: 'Choose your primary framework',
    options: defaultOptions,
    mode: 'single',
    defaultValue: ['react'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Single selection mode - clicking an option deselects the previous selection',
      },
    },
  },
};

// Multi select mode
export const MultiSelect: Story = {
  args: {
    label: 'Choose all that apply',
    options: defaultOptions,
    mode: 'multi',
    defaultValue: ['react', 'vue'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi selection mode - allows selecting multiple options',
      },
    },
  },
};

// With clear all button
export const WithClearAll: Story = {
  args: {
    label: 'Choose categories',
    options: categoryOptions,
    mode: 'multi',
    showClearAll: true,
    defaultValue: ['tech', 'design', 'business'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a "Clear all" button when selections are made',
      },
    },
  },
};

// With max selections limit
export const MaxSelectionsLimit: Story = {
  args: {
    label: 'Choose up to 3 options',
    options: categoryOptions,
    mode: 'multi',
    maxSelections: 3,
    showClearAll: true,
    defaultValue: ['tech', 'design'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Limits the number of selections - prevents selecting more than maxSelections',
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    label: 'Disabled picker',
    options: defaultOptions,
    disabled: true,
    defaultValue: ['react', 'vue'],
  },
  parameters: {
    docs: {
      description: {
        story: 'All options are disabled and cannot be selected',
      },
    },
  },
};

// Partially disabled options
export const PartiallyDisabled: Story = {
  args: {
    label: 'Choose available frameworks',
    options: [
      { id: '1', label: 'React', value: 'react' },
      { id: '2', label: 'Vue (Coming Soon)', value: 'vue', disabled: true },
      { id: '3', label: 'Angular', value: 'angular' },
      { id: '4', label: 'Svelte (Beta)', value: 'svelte', disabled: true },
    ],
    mode: 'multi',
  },
  parameters: {
    docs: {
      description: {
        story: 'Some options are disabled individually while others remain selectable',
      },
    },
  },
};

// Without label
export const WithoutLabel: Story = {
  args: {
    options: defaultOptions,
    mode: 'multi',
    'aria-label': 'Framework selection',
  },
  parameters: {
    docs: {
      description: {
        story: 'Choice picker without visible label (uses aria-label for accessibility)',
      },
    },
  },
};

// Large option set
export const LargeOptionSet: Story = {
  args: {
    label: 'Choose programming languages',
    options: [
      { id: '1', label: 'JavaScript', value: 'js' },
      { id: '2', label: 'TypeScript', value: 'ts' },
      { id: '3', label: 'Python', value: 'python' },
      { id: '4', label: 'Java', value: 'java' },
      { id: '5', label: 'C++', value: 'cpp' },
      { id: '6', label: 'Go', value: 'go' },
      { id: '7', label: 'Rust', value: 'rust' },
      { id: '8', label: 'Swift', value: 'swift' },
      { id: '9', label: 'Kotlin', value: 'kotlin' },
      { id: '10', label: 'Ruby', value: 'ruby' },
    ],
    mode: 'multi',
    showClearAll: true,
    defaultValue: ['js', 'ts', 'python'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates layout with many options - wraps naturally',
      },
    },
  },
};

// Interactive controlled example
export const InteractiveControlled: Story = {
  render: function InteractiveControlledRender() {
    const [selected, setSelected] = React.useState<string[]>(['react']);

    return (
      <div className="space-y-6 p-6 bg-gray-900 rounded-lg min-w-[500px]">
        <AIKitChoicePicker
          label="Choose your frameworks"
          options={defaultOptions}
          value={selected}
          onChange={setSelected}
          mode="multi"
          showClearAll
        />
        <div className="text-sm text-gray-400">
          Selected: <span className="text-white font-mono">{selected.length > 0 ? selected.join(', ') : 'none'}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelected([])}
            className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
          >
            Clear
          </button>
          <button
            onClick={() => setSelected(['react'])}
            className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
          >
            Select React
          </button>
          <button
            onClick={() => setSelected(['react', 'vue', 'angular'])}
            className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
          >
            Select All
          </button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled component with external state management',
      },
    },
  },
};

// Form integration example
export const FormExample: Story = {
  render: function FormExampleRender() {
    const [formData, setFormData] = React.useState({
      frameworks: ['react'],
      categories: ['tech'],
      experience: ['intermediate'],
    });

    return (
      <form className="space-y-6 p-6 bg-gray-900 rounded-lg max-w-2xl">
        <h3 className="text-white font-semibold text-lg mb-4">Developer Survey</h3>

        <AIKitChoicePicker
          label="Which frameworks do you use?"
          options={defaultOptions}
          value={formData.frameworks}
          onChange={(values) => setFormData({ ...formData, frameworks: values })}
          mode="multi"
          showClearAll
        />

        <AIKitChoicePicker
          label="What are your areas of expertise?"
          options={categoryOptions}
          value={formData.categories}
          onChange={(values) => setFormData({ ...formData, categories: values })}
          mode="multi"
          maxSelections={3}
          showClearAll
        />

        <AIKitChoicePicker
          label="Experience level"
          options={[
            { id: '1', label: 'Beginner', value: 'beginner' },
            { id: '2', label: 'Intermediate', value: 'intermediate' },
            { id: '3', label: 'Advanced', value: 'advanced' },
            { id: '4', label: 'Expert', value: 'expert' },
          ]}
          value={formData.experience}
          onChange={(values) => setFormData({ ...formData, experience: values })}
          mode="single"
        />

        <div className="pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            <pre className="text-xs">{JSON.stringify(formData, null, 2)}</pre>
          </div>
        </div>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple choice pickers in a form context with different configurations',
      },
    },
  },
};

// Accessibility demonstration
export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6 p-6 bg-gray-900 rounded-lg max-w-2xl">
      <div className="space-y-4">
        <h3 className="text-white font-semibold">WCAG 2.1 AA Compliant</h3>

        <div>
          <h4 className="text-gray-300 font-medium mb-2">Keyboard Navigation</h4>
          <AIKitChoicePicker
            label="Try keyboard navigation"
            options={defaultOptions}
            mode="multi"
            defaultValue={['react']}
          />
          <ul className="text-gray-400 text-xs mt-2 ml-4 space-y-1">
            <li>• Tab: Move to next option</li>
            <li>• Arrow Left/Right: Navigate between options</li>
            <li>• Home/End: Jump to first/last option</li>
            <li>• Enter/Space: Toggle selection</li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-300 font-medium mb-2">Screen Reader Support</h4>
          <AIKitChoicePicker
            label="Accessible choice picker"
            options={defaultOptions}
            mode="multi"
            defaultValue={['vue']}
          />
          <p className="text-gray-400 text-xs mt-2 ml-4">
            Proper ARIA attributes (role, aria-pressed, aria-label, aria-labelledby)
          </p>
        </div>

        <div>
          <h4 className="text-gray-300 font-medium mb-2">Focus Indicators</h4>
          <AIKitChoicePicker
            label="Visible focus rings"
            options={defaultOptions}
            mode="single"
          />
          <p className="text-gray-400 text-xs mt-2 ml-4">
            AI Kit themed focus ring (#4B6FED) with proper contrast
          </p>
        </div>

        <div>
          <h4 className="text-gray-300 font-medium mb-2">Color Contrast</h4>
          <AIKitChoicePicker
            label="High contrast colors"
            options={defaultOptions}
            mode="multi"
            defaultValue={['angular', 'svelte']}
          />
          <p className="text-gray-400 text-xs mt-2 ml-4">
            Meets WCAG AA contrast requirements for all states
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates comprehensive accessibility features including keyboard navigation, screen reader support, and WCAG 2.1 AA compliance',
      },
    },
  },
};

// All states showcase
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-8 p-6 bg-gray-900 rounded-lg max-w-2xl">
      <div className="space-y-3">
        <h3 className="text-white font-semibold mb-2">Single Select Mode</h3>
        <AIKitChoicePicker
          label="Unselected"
          options={defaultOptions}
          mode="single"
        />
        <AIKitChoicePicker
          label="Selected"
          options={defaultOptions}
          mode="single"
          defaultValue={['react']}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-semibold mb-2">Multi Select Mode</h3>
        <AIKitChoicePicker
          label="Multiple selections"
          options={defaultOptions}
          mode="multi"
          defaultValue={['react', 'vue', 'svelte']}
          showClearAll
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-semibold mb-2">Disabled States</h3>
        <AIKitChoicePicker
          label="All disabled"
          options={defaultOptions}
          disabled
          defaultValue={['angular']}
        />
        <AIKitChoicePicker
          label="Partially disabled"
          options={[
            { id: '1', label: 'React', value: 'react' },
            { id: '2', label: 'Vue (Disabled)', value: 'vue', disabled: true },
            { id: '3', label: 'Angular', value: 'angular' },
          ]}
          mode="multi"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-semibold mb-2">With Limits</h3>
        <AIKitChoicePicker
          label="Max 2 selections"
          options={defaultOptions}
          mode="multi"
          maxSelections={2}
          defaultValue={['react', 'vue']}
          showClearAll
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All choice picker states and configurations in one view',
      },
    },
  },
};

// Responsive design showcase
export const ResponsiveLayout: Story = {
  render: () => (
    <div className="space-y-6 p-6 bg-gray-900 rounded-lg">
      <h3 className="text-white font-semibold mb-4">Responsive Wrapping</h3>
      <div className="max-w-xs">
        <AIKitChoicePicker
          label="Narrow container (wraps naturally)"
          options={[
            { id: '1', label: 'JavaScript', value: 'js' },
            { id: '2', label: 'TypeScript', value: 'ts' },
            { id: '3', label: 'Python', value: 'python' },
            { id: '4', label: 'Java', value: 'java' },
            { id: '5', label: 'C++', value: 'cpp' },
            { id: '6', label: 'Go', value: 'go' },
            { id: '7', label: 'Rust', value: 'rust' },
          ]}
          mode="multi"
          defaultValue={['js', 'ts', 'python']}
          showClearAll
        />
      </div>
      <div className="max-w-2xl">
        <AIKitChoicePicker
          label="Wide container (more items per row)"
          options={[
            { id: '1', label: 'JavaScript', value: 'js' },
            { id: '2', label: 'TypeScript', value: 'ts' },
            { id: '3', label: 'Python', value: 'python' },
            { id: '4', label: 'Java', value: 'java' },
            { id: '5', label: 'C++', value: 'cpp' },
            { id: '6', label: 'Go', value: 'go' },
            { id: '7', label: 'Rust', value: 'rust' },
          ]}
          mode="multi"
          defaultValue={['go', 'rust']}
          showClearAll
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates responsive wrapping behavior in different container widths',
      },
    },
  },
};
