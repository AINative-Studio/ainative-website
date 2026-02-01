import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { AIKitCheckBox } from './AIKitCheckBox';

const meta = {
  title: 'AIKit/CheckBox',
  component: AIKitCheckBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Checkbox size variant',
    },
    error: {
      control: 'boolean',
      description: 'Error state styling',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    checked: {
      control: 'select',
      options: [true, false, 'indeterminate'],
      description: 'Checked state (controlled)',
    },
    label: {
      control: 'text',
      description: 'Label text',
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
      description: 'Position of the label',
    },
  },
} satisfies Meta<typeof AIKitCheckBox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default unchecked state
export const Default: Story = {
  args: {
    defaultChecked: false,
  },
};

// Checked state with AI Kit gradient
export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses AI Kit gradient from #4B6FED to #8A63F4 when checked',
      },
    },
  },
};

// Indeterminate state
export const Indeterminate: Story = {
  args: {
    checked: 'indeterminate',
  },
  parameters: {
    docs: {
      description: {
        story: 'Useful for "select all" checkboxes with partial selection',
      },
    },
  },
};

// Disabled states
export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled checkbox',
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
    label: 'Disabled checked',
  },
};

// With Label - Right (default)
export const WithLabelRight: Story = {
  args: {
    label: 'Accept terms and conditions',
    labelPosition: 'right',
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox with label on the right (default position)',
      },
    },
  },
};

// With Label - Left
export const WithLabelLeft: Story = {
  args: {
    label: 'Remember me',
    labelPosition: 'left',
  },
  parameters: {
    docs: {
      description: {
        story: 'Label positioned to the left of the checkbox',
      },
    },
  },
};

// With Label - Top
export const WithLabelTop: Story = {
  args: {
    label: 'Enable notifications',
    labelPosition: 'top',
  },
  parameters: {
    docs: {
      description: {
        story: 'Label positioned above the checkbox',
      },
    },
  },
};

// With Label - Bottom
export const WithLabelBottom: Story = {
  args: {
    label: 'Subscribe to newsletter',
    labelPosition: 'bottom',
  },
  parameters: {
    docs: {
      description: {
        story: 'Label positioned below the checkbox',
      },
    },
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small checkbox',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Large checkbox',
  },
};

// Error state
export const ErrorState: Story = {
  args: {
    error: true,
    label: 'You must accept the terms',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state with red border and focus ring',
      },
    },
  },
};

// Form integration example
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 p-6 bg-gray-900 rounded-lg">
      <div className="space-y-3">
        <h3 className="text-white font-semibold mb-4">Preferences</h3>
        <AIKitCheckBox
          id="email-notifications"
          label="Email notifications"
          defaultChecked
        />
        <AIKitCheckBox
          id="push-notifications"
          label="Push notifications"
          defaultChecked={false}
        />
        <AIKitCheckBox
          id="sms-notifications"
          label="SMS notifications (Premium)"
          disabled
        />
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Checkboxes in a form context with proper labels and IDs',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-gray-900 rounded-lg">
      <div className="flex items-center gap-4">
        <AIKitCheckBox size="sm" label="Small" defaultChecked />
        <AIKitCheckBox size="default" label="Default" defaultChecked />
        <AIKitCheckBox size="lg" label="Large" defaultChecked />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All size variants side by side',
      },
    },
  },
};

// All states showcase
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-gray-900 rounded-lg">
      <div className="space-y-3">
        <h3 className="text-white font-semibold mb-2">States</h3>
        <AIKitCheckBox label="Unchecked" defaultChecked={false} />
        <AIKitCheckBox label="Checked" defaultChecked={true} />
        <AIKitCheckBox label="Indeterminate" checked="indeterminate" />
        <AIKitCheckBox label="Disabled" disabled />
        <AIKitCheckBox label="Disabled Checked" disabled defaultChecked />
        <AIKitCheckBox label="Error State" error />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All checkbox states in one view using AI Kit themed colors',
      },
    },
  },
};

// Accessibility features
export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6 p-6 bg-gray-900 rounded-lg max-w-md">
      <div className="space-y-4">
        <h3 className="text-white font-semibold">WCAG 2.1 AA Compliant</h3>

        <div>
          <AIKitCheckBox
            id="keyboard-nav"
            label="Tab to focus, Space to toggle"
            defaultChecked
          />
          <p className="text-gray-400 text-xs mt-1 ml-7">
            Full keyboard navigation support
          </p>
        </div>

        <div>
          <AIKitCheckBox
            id="screen-reader"
            label="Screen reader compatible"
            aria-describedby="sr-desc"
          />
          <p id="sr-desc" className="text-gray-400 text-xs mt-1 ml-7">
            Proper ARIA attributes and roles
          </p>
        </div>

        <div>
          <AIKitCheckBox
            id="focus-visible"
            label="Visible focus indicators"
          />
          <p className="text-gray-400 text-xs mt-1 ml-7">
            AI Kit themed focus ring (#4B6FED)
          </p>
        </div>

        <div>
          <AIKitCheckBox
            id="contrast"
            label="High contrast colors"
            defaultChecked
          />
          <p className="text-gray-400 text-xs mt-1 ml-7">
            Meets WCAG AA contrast requirements
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features including keyboard navigation, screen reader support, and WCAG 2.1 AA compliance',
      },
    },
  },
};

// Interactive example with state
function InteractiveControlledExample() {
  const [checked, setChecked] = React.useState<boolean | 'indeterminate'>(false);

  return (
    <div className="space-y-4 p-6 bg-gray-900 rounded-lg">
      <AIKitCheckBox
        checked={checked}
        onCheckedChange={setChecked}
        label="Controlled checkbox"
      />
      <div className="text-sm text-gray-400">
        Current state: <span className="text-white font-mono">{String(checked)}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setChecked(false)}
          className="px-3 py-1 bg-gray-700 text-white rounded text-sm"
        >
          Uncheck
        </button>
        <button
          onClick={() => setChecked(true)}
          className="px-3 py-1 bg-gray-700 text-white rounded text-sm"
        >
          Check
        </button>
        <button
          onClick={() => setChecked('indeterminate')}
          className="px-3 py-1 bg-gray-700 text-white rounded text-sm"
        >
          Indeterminate
        </button>
      </div>
    </div>
  );
}

export const InteractiveControlled: Story = {
  render: () => <InteractiveControlledExample />,
  parameters: {
    docs: {
      description: {
        story: 'Controlled checkbox with external state management',
      },
    },
  },
};
