/**
 * GradientText Storybook Stories
 * Issue #499 - Typography Scale Alignment
 *
 * Demonstrates all size variants, gradient options, and animations
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GradientText, GradientBorder } from './gradient-text';

const meta: Meta<typeof GradientText> = {
  title: 'UI/GradientText',
  component: GradientText,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
GradientText component with typography scale alignment.

**Issue #499 Fix:**
- Aligned with AINative typography scale (display, title, body, ui)
- Removed legacy Tailwind sizes (text-sm, text-xl, etc.)
- Added responsive scaling for mobile devices
- Maintained consistent font-weight across all sizes

**Typography Scale:**
- Display sizes: display-1 (72px), display-2 (60px), display-3 (48px)
- Title sizes: title-1 (28px), title-2 (24px), title-3 (24px), title-4 (20px)
- Body sizes: body-lg (18px), body (16px), body-sm (14px)
- UI sizes: ui (14px)

All sizes are responsive and automatically scale down on mobile devices.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: [
        'display-1',
        'display-2',
        'display-3',
        'title-1',
        'title-2',
        'title-3',
        'title-4',
        'body-lg',
        'body',
        'body-sm',
        'ui',
      ],
      description: 'Size variant aligned with typography scale',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'rainbow', 'sunset', 'ocean'],
      description: 'Gradient color variant',
    },
    animated: {
      control: 'boolean',
      description: 'Enable gradient animation',
    },
    as: {
      control: 'select',
      options: ['span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'],
      description: 'HTML element to render as',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GradientText>;

// Default Story
export const Default: Story = {
  args: {
    children: 'Gradient Text',
    size: 'body',
    variant: 'primary',
    animated: false,
  },
};

// Display Sizes
export const DisplaySizes: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="text-caption text-muted-foreground mb-2">display-1 (72px → 48px mobile)</p>
        <GradientText size="display-1" variant="primary">
          The Future of AI Development
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">display-2 (60px → 40px mobile)</p>
        <GradientText size="display-2" variant="secondary">
          Quantum-Powered Solutions
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">display-3 (48px → 36px mobile)</p>
        <GradientText size="display-3" variant="accent">
          Build Smarter Applications
        </GradientText>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Display sizes for hero sections and major page titles. Automatically responsive.',
      },
    },
  },
};

// Title Sizes
export const TitleSizes: Story = {
  render: () => (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-caption text-muted-foreground mb-2">title-1 (28px → 24px mobile)</p>
        <GradientText size="title-1" variant="primary">
          Main Section Heading
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">title-2 (24px → 20px mobile)</p>
        <GradientText size="title-2" variant="secondary">
          Subsection Heading
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">title-3 (24px → 18px mobile)</p>
        <GradientText size="title-3" variant="accent">
          Card Component Heading
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">title-4 (20px)</p>
        <GradientText size="title-4" variant="rainbow">
          Small Heading
        </GradientText>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Title sizes for section headings and page titles. Mobile-optimized for better readability.',
      },
    },
  },
};

// Body Sizes
export const BodySizes: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <div>
        <p className="text-caption text-muted-foreground mb-2">body-lg (18px)</p>
        <GradientText size="body-lg" variant="primary">
          Large body text provides excellent readability for important content sections.
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">body (16px) - Default</p>
        <GradientText size="body" variant="secondary">
          This is the default body text size used throughout the application.
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">body-sm (14px)</p>
        <GradientText size="body-sm" variant="accent">
          Small body text is used for supporting information and metadata.
        </GradientText>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Body text sizes for content and paragraphs.',
      },
    },
  },
};

// UI Size
export const UISize: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-caption text-muted-foreground mb-2">ui (14px)</p>
        <GradientText size="ui" variant="primary">
          UI Label Text
        </GradientText>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'UI size for interface elements and labels.',
      },
    },
  },
};

// Gradient Variants
export const GradientVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-caption text-muted-foreground mb-2">Primary (Blue → Purple)</p>
        <GradientText size="title-1" variant="primary">
          Primary Gradient
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">Secondary (Teal → Cyan)</p>
        <GradientText size="title-1" variant="secondary">
          Secondary Gradient
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">Accent (Orange → Red)</p>
        <GradientText size="title-1" variant="accent">
          Accent Gradient
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">Rainbow (Blue → Purple → Cyan)</p>
        <GradientText size="title-1" variant="rainbow">
          Rainbow Gradient
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">Sunset (Red → Orange → Coral)</p>
        <GradientText size="title-1" variant="sunset">
          Sunset Gradient
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">Ocean (Cyan → Teal → Dark Teal)</p>
        <GradientText size="title-1" variant="ocean">
          Ocean Gradient
        </GradientText>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available gradient color variants.',
      },
    },
  },
};

// Animated Gradients
export const AnimatedGradients: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-caption text-muted-foreground mb-2">Animated Primary</p>
        <GradientText size="title-1" variant="primary" animated>
          Animated Primary
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">Animated Rainbow</p>
        <GradientText size="title-1" variant="rainbow" animated>
          Animated Rainbow
        </GradientText>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">Animated Sunset</p>
        <GradientText size="title-1" variant="sunset" animated>
          Animated Sunset
        </GradientText>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Gradients with smooth shifting animation.',
      },
    },
  },
};

// Semantic Elements
export const SemanticElements: Story = {
  render: () => (
    <div className="space-y-4">
      <GradientText as="h1" size="display-1" variant="primary">
        H1 Heading
      </GradientText>
      <GradientText as="h2" size="title-1" variant="secondary">
        H2 Heading
      </GradientText>
      <GradientText as="h3" size="title-2" variant="accent">
        H3 Heading
      </GradientText>
      <GradientText as="p" size="body" variant="rainbow">
        Paragraph Text
      </GradientText>
      <GradientText as="span" size="body-sm" variant="sunset">
        Inline Span
      </GradientText>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'GradientText can render as any semantic HTML element.',
      },
    },
  },
};

// Hero Section Example
export const HeroSection: Story = {
  render: () => (
    <div className="text-center space-y-4 max-w-4xl">
      <GradientText
        as="h1"
        size="display-1"
        variant="rainbow"
        animated
        className="leading-tight"
      >
        Welcome to AI Native Studio
      </GradientText>
      <GradientText as="p" size="body-lg" variant="secondary">
        Build quantum-powered AI applications with unprecedented speed
      </GradientText>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example usage in a hero section.',
      },
    },
  },
};

// Feature Card Example
export const FeatureCard: Story = {
  render: () => (
    <div className="card-vite p-6 max-w-md">
      <GradientText as="h3" size="title-2" variant="primary" className="mb-3">
        Quantum Neural Networks
      </GradientText>
      <p className="text-body-sm text-muted-foreground mb-4">
        Harness the power of quantum computing for advanced AI models with{' '}
        <GradientText size="body-sm" variant="accent">
          QNN technology
        </GradientText>
        .
      </p>
      <button className="text-button px-4 py-2 bg-primary text-white rounded-lg">
        Learn More
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example usage in a feature card with inline gradient text.',
      },
    },
  },
};

// Gradient Border Component
export const GradientBorderExample: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-caption text-muted-foreground mb-2">Primary Border (1px)</p>
        <GradientBorder variant="primary" borderWidth="1">
          <div className="p-6">
            <GradientText size="title-3" variant="primary">
              Content with Gradient Border
            </GradientText>
            <p className="text-body-sm text-muted-foreground mt-2">
              This card has a 1px gradient border.
            </p>
          </div>
        </GradientBorder>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">Rainbow Border (2px)</p>
        <GradientBorder variant="rainbow" borderWidth="2">
          <div className="p-6">
            <GradientText size="title-3" variant="rainbow">
              Rainbow Border Card
            </GradientText>
            <p className="text-body-sm text-muted-foreground mt-2">
              This card has a 2px rainbow gradient border.
            </p>
          </div>
        </GradientBorder>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2">Secondary Border (3px)</p>
        <GradientBorder variant="secondary" borderWidth="3">
          <div className="p-6">
            <GradientText size="title-3" variant="secondary">
              Thick Border Card
            </GradientText>
            <p className="text-body-sm text-muted-foreground mt-2">
              This card has a 3px gradient border.
            </p>
          </div>
        </GradientBorder>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'GradientBorder component with different variants and border widths.',
      },
    },
  },
};

// All Sizes Comparison
export const AllSizesComparison: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <section>
        <h3 className="text-title-3 mb-4 border-b pb-2">Display Sizes</h3>
        <div className="space-y-4">
          <GradientText size="display-1" variant="primary">Display 1 (72px)</GradientText>
          <GradientText size="display-2" variant="primary">Display 2 (60px)</GradientText>
          <GradientText size="display-3" variant="primary">Display 3 (48px)</GradientText>
        </div>
      </section>
      <section>
        <h3 className="text-title-3 mb-4 border-b pb-2">Title Sizes</h3>
        <div className="space-y-3">
          <GradientText size="title-1" variant="secondary">Title 1 (28px)</GradientText>
          <GradientText size="title-2" variant="secondary">Title 2 (24px)</GradientText>
          <GradientText size="title-3" variant="secondary">Title 3 (24px)</GradientText>
          <GradientText size="title-4" variant="secondary">Title 4 (20px)</GradientText>
        </div>
      </section>
      <section>
        <h3 className="text-title-3 mb-4 border-b pb-2">Body & UI Sizes</h3>
        <div className="space-y-2">
          <GradientText size="body-lg" variant="accent">Body Large (18px)</GradientText>
          <GradientText size="body" variant="accent">Body (16px)</GradientText>
          <GradientText size="body-sm" variant="accent">Body Small (14px)</GradientText>
          <GradientText size="ui" variant="accent">UI (14px)</GradientText>
        </div>
      </section>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Side-by-side comparison of all available size variants.',
      },
    },
  },
};

// Responsive Behavior Demo
export const ResponsiveBehavior: Story = {
  render: () => (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-muted p-6 rounded-lg">
        <p className="text-body-sm text-muted-foreground mb-4">
          Resize your browser window to see automatic scaling on mobile devices (max-width: 768px)
        </p>
        <div className="space-y-4">
          <GradientText size="display-1" variant="rainbow" animated>
            Responsive Display Heading
          </GradientText>
          <GradientText size="title-1" variant="primary">
            Mobile-Optimized Title (28px → 24px on mobile)
          </GradientText>
          <GradientText size="body" variant="secondary">
            Body text maintains consistent readability across all screen sizes
          </GradientText>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates responsive behavior across different screen sizes.',
      },
    },
  },
};
