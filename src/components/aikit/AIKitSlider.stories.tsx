import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AIKitSlider } from './AIKitSlider';

const meta = {
  title: 'AIKit/Slider',
  component: AIKitSlider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current slider value',
    },
    min: {
      control: 'number',
      description: 'Minimum value',
    },
    max: {
      control: 'number',
      description: 'Maximum value',
    },
    step: {
      control: 'number',
      description: 'Step increment',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    showValue: {
      control: 'boolean',
      description: 'Show value display',
    },
    label: {
      control: 'text',
      description: 'Label text',
    },
  },
} satisfies Meta<typeof AIKitSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default slider
export const Default: Story = {
  args: {
    value: 50,
    onChange: (value) => console.log('Value changed:', value),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default slider with value display and range 0-100',
      },
    },
  },
};

// With label
export const WithLabel: Story = {
  args: {
    label: 'Volume',
    value: 75,
    onChange: (value) => console.log('Volume:', value),
    showValue: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider with label and value display',
      },
    },
  },
};

// Without value display
export const WithoutValueDisplay: Story = {
  args: {
    label: 'Brightness',
    value: 60,
    onChange: (value) => console.log('Brightness:', value),
    showValue: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider without value display',
      },
    },
  },
};

// Custom range
export const CustomRange: Story = {
  args: {
    label: 'Temperature',
    value: 5,
    min: -10,
    max: 10,
    step: 0.5,
    onChange: (value) => console.log('Temperature:', value),
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider with custom min (-10), max (10), and step (0.5)',
      },
    },
  },
};

// Formatted value (Developer Markup use case)
export const DeveloperMarkup: Story = {
  args: {
    label: 'Developer Markup',
    value: 15,
    min: 0,
    max: 40,
    step: 0.5,
    showValue: true,
    formatValue: (v) => `${v}%`,
    onChange: (value) => console.log('Markup:', value),
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider for developer markup percentage with custom formatting (Issue #175)',
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    label: 'Disabled Slider',
    value: 50,
    disabled: true,
    onChange: (value) => console.log('Value:', value),
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled slider with reduced opacity',
      },
    },
  },
};

// Fine-grained control
export const FineGrained: Story = {
  args: {
    label: 'Precision Control',
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
    formatValue: (v) => v.toFixed(2),
    onChange: (value) => console.log('Precision:', value),
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider with very fine-grained step control (0.01)',
      },
    },
  },
};

// Multiple sliders
export const MultipleSliders: Story = {
  render: () => {
    const [volume, setVolume] = React.useState(75);
    const [brightness, setBrightness] = React.useState(50);
    const [contrast, setContrast] = React.useState(60);

    return (
      <div className="space-y-6 p-6 bg-gray-900 rounded-lg w-80">
        <h3 className="text-white font-semibold mb-4">Display Settings</h3>
        <AIKitSlider
          label="Volume"
          value={volume}
          onChange={setVolume}
          showValue={true}
        />
        <AIKitSlider
          label="Brightness"
          value={brightness}
          onChange={setBrightness}
          showValue={true}
        />
        <AIKitSlider
          label="Contrast"
          value={contrast}
          onChange={setContrast}
          showValue={true}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple sliders in a settings panel',
      },
    },
  },
};

// Interactive controlled slider
export const InteractiveControlled: Story = {
  render: () => {
    const [value, setValue] = React.useState(50);

    return (
      <div className="space-y-4 p-6 bg-gray-900 rounded-lg w-80">
        <AIKitSlider
          label="Controlled Slider"
          value={value}
          onChange={setValue}
          showValue={true}
        />
        <div className="text-sm text-gray-400">
          Current value: <span className="text-white font-mono">{value}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setValue(0)}
            className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
          >
            Min
          </button>
          <button
            onClick={() => setValue(50)}
            className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
          >
            Reset
          </button>
          <button
            onClick={() => setValue(100)}
            className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
          >
            Max
          </button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled slider with external state management and buttons',
      },
    },
  },
};

// Pricing tier selector
export const PricingTier: Story = {
  render: () => {
    const [credits, setCredits] = React.useState(1000);

    const calculatePrice = (credits: number) => {
      const basePrice = 0.01; // $0.01 per credit
      const discount = credits >= 10000 ? 0.2 : credits >= 5000 ? 0.1 : 0;
      return (credits * basePrice * (1 - discount)).toFixed(2);
    };

    return (
      <div className="space-y-4 p-6 bg-gray-900 rounded-lg w-96">
        <h3 className="text-white font-semibold mb-4">Select Credit Amount</h3>
        <AIKitSlider
          label="Credits"
          value={credits}
          min={100}
          max={20000}
          step={100}
          onChange={setCredits}
          formatValue={(v) => v.toLocaleString()}
          showValue={true}
        />
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <div className="text-gray-400 text-sm">Total Price</div>
          <div className="text-2xl text-white font-bold">${calculatePrice(credits)}</div>
          {credits >= 5000 && (
            <div className="text-green-400 text-xs mt-1">
              {credits >= 10000 ? '20% volume discount applied!' : '10% volume discount applied!'}
            </div>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider for selecting credit amounts with dynamic pricing calculation',
      },
    },
  },
};

// Accessibility demo
export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6 p-6 bg-gray-900 rounded-lg max-w-md">
      <div className="space-y-4">
        <h3 className="text-white font-semibold">WCAG 2.1 AA Compliant</h3>

        <div>
          <AIKitSlider
            id="keyboard-nav"
            label="Keyboard Navigation"
            value={50}
            onChange={(v) => console.log('Keyboard nav:', v)}
          />
          <p className="text-gray-400 text-xs mt-2">
            Use Arrow keys, Home, End to control
          </p>
        </div>

        <div>
          <AIKitSlider
            id="screen-reader"
            label="Screen Reader Support"
            value={75}
            onChange={(v) => console.log('Screen reader:', v)}
          />
          <p className="text-gray-400 text-xs mt-2">
            Proper ARIA labels and value announcements
          </p>
        </div>

        <div>
          <AIKitSlider
            id="focus-visible"
            label="Visible Focus Indicators"
            value={30}
            onChange={(v) => console.log('Focus:', v)}
          />
          <p className="text-gray-400 text-xs mt-2">
            Clear focus ring for keyboard users
          </p>
        </div>

        <div>
          <AIKitSlider
            id="touch-support"
            label="Touch Gestures"
            value={60}
            onChange={(v) => console.log('Touch:', v)}
          />
          <p className="text-gray-400 text-xs mt-2">
            Full touch support for mobile devices
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features including keyboard navigation, screen reader support, touch gestures, and WCAG 2.1 AA compliance',
      },
    },
  },
};

// All states showcase
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-gray-900 rounded-lg w-80">
      <div className="space-y-6">
        <h3 className="text-white font-semibold mb-2">Slider States</h3>

        <div>
          <div className="text-gray-400 text-xs mb-2">Default (0-100)</div>
          <AIKitSlider value={50} onChange={() => {}} />
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-2">With Label</div>
          <AIKitSlider label="Volume" value={75} onChange={() => {}} />
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-2">With Formatted Value</div>
          <AIKitSlider
            label="Discount"
            value={25}
            formatValue={(v) => `${v}%`}
            onChange={() => {}}
          />
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-2">Disabled</div>
          <AIKitSlider label="Locked" value={50} disabled onChange={() => {}} />
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-2">At Minimum</div>
          <AIKitSlider label="Min Value" value={0} onChange={() => {}} />
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-2">At Maximum</div>
          <AIKitSlider label="Max Value" value={100} onChange={() => {}} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All slider states and configurations in one view',
      },
    },
  },
};
