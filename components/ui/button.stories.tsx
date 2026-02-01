import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Button variant using design tokens',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button size',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as a child component (Slot)',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary button using brand-primary token
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

// Outline button with design tokens
export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses border-dark-2, hover:border-brand-primary/40, and hover:bg-dark-3 design tokens',
      },
    },
  },
};

// Secondary button using vite-secondary token
export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses bg-vite-secondary design token',
      },
    },
  },
};

// Ghost button using dark-3 token for hover
export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses hover:bg-dark-3 design token for subtle hover effect',
      },
    },
  },
};

// Link button using brand-primary token
export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses text-brand-primary design token',
      },
    },
  },
};

// Destructive button
export const Destructive: Story = {
  args: {
    children: 'Destructive Button',
    variant: 'destructive',
  },
};

// Small size
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

// Large size
export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// Icon button
export const Icon: Story = {
  args: {
    children: '🚀',
    size: 'icon',
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button variant="default">Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
      <div className="flex gap-4">
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex gap-4">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants using design tokens instead of hardcoded colors',
      },
    },
  },
};
