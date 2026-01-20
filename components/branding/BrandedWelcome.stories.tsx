import type { Meta, StoryObj } from '@storybook/react';
import { BrandedWelcome } from './BrandedWelcome';

/**
 * BrandedWelcome component displays a visually appealing welcome card with:
 * - Gradient text styling
 * - Optional background image
 * - Personalized greeting with user name
 * - Smooth framer-motion animations
 * - Dismissible functionality with localStorage persistence
 *
 * Perfect for onboarding new users or highlighting important actions.
 */
const meta = {
  title: 'Branding/BrandedWelcome',
  component: BrandedWelcome,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A reusable welcome card component with branded styling, animations, and dismissible behavior. Ideal for dashboard onboarding and first-time user experiences.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Main title of the welcome card',
    },
    description: {
      control: 'text',
      description: 'Description text below the title',
    },
    actionLabel: {
      control: 'text',
      description: 'Label for the primary action button',
    },
    actionHref: {
      control: 'text',
      description: 'Route or URL for the primary action',
    },
    userName: {
      control: 'text',
      description: 'Optional user name for personalization',
    },
    backgroundImage: {
      control: 'text',
      description: 'Optional background image URL',
    },
    showImage: {
      control: 'boolean',
      description: 'Whether to show the background image',
    },
    showDismiss: {
      control: 'boolean',
      description: 'Whether to show the dismiss button',
    },
    animate: {
      control: 'boolean',
      description: 'Whether to enable entrance animations',
    },
    onDismiss: {
      action: 'dismissed',
      description: 'Callback when dismiss button is clicked',
    },
  },
} satisfies Meta<typeof BrandedWelcome>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default welcome card with all features enabled
 */
export const Default: Story = {
  args: {
    title: 'Welcome to AI Native Studio',
    description: 'Get started by creating your first API key and explore our powerful AI development tools. Build faster with our comprehensive suite of APIs and services.',
    actionLabel: 'Get Your API Key',
    actionHref: '/developer-settings',
    backgroundImage: '/card.png',
    showImage: true,
    showDismiss: true,
    animate: true,
  },
};

/**
 * Welcome card with personalized greeting
 */
export const WithPersonalization: Story = {
  args: {
    title: 'Welcome to AI Native Studio',
    description: 'Get started by creating your first API key and explore our powerful AI development tools.',
    actionLabel: 'Get Started',
    actionHref: '/developer-settings',
    userName: 'Sarah',
    backgroundImage: '/card.png',
    showImage: true,
    showDismiss: true,
    animate: true,
  },
};

/**
 * Welcome card without background image
 */
export const WithoutImage: Story = {
  args: {
    title: 'Welcome to AI Native Studio',
    description: 'Start building with our AI-powered development platform today.',
    actionLabel: 'Get Started',
    actionHref: '/developer-settings',
    showImage: false,
    showDismiss: true,
    animate: true,
  },
};

/**
 * Welcome card without dismiss button
 */
export const NonDismissible: Story = {
  args: {
    title: 'Important Announcement',
    description: 'We have exciting new features coming soon. Stay tuned for updates!',
    actionLabel: 'Learn More',
    actionHref: '/blog',
    showImage: true,
    showDismiss: false,
    animate: true,
  },
};

/**
 * Welcome card without animations
 */
export const WithoutAnimations: Story = {
  args: {
    title: 'Welcome to AI Native Studio',
    description: 'Get started by creating your first API key and explore our powerful AI development tools.',
    actionLabel: 'Get Your API Key',
    actionHref: '/developer-settings',
    showImage: true,
    showDismiss: true,
    animate: false,
  },
};

/**
 * Compact welcome card for smaller spaces
 */
export const Compact: Story = {
  args: {
    title: 'Quick Start',
    description: 'Create your API key to get started.',
    actionLabel: 'Create Key',
    actionHref: '/developer-settings',
    showImage: false,
    showDismiss: true,
    animate: true,
  },
};

/**
 * New feature announcement variant
 */
export const FeatureAnnouncement: Story = {
  args: {
    title: 'New: Quantum Neural Networks',
    description: 'Experience the power of quantum computing integrated with neural networks. Train models faster and achieve breakthrough performance.',
    actionLabel: 'Explore QNN',
    actionHref: '/dashboard/qnn',
    userName: 'Alex',
    backgroundImage: '/card.png',
    showImage: true,
    showDismiss: true,
    animate: true,
  },
};

/**
 * Onboarding step variant
 */
export const OnboardingStep: Story = {
  args: {
    title: 'Complete Your Setup',
    description: 'Add your first API key to unlock all features. It only takes a minute and you can start building immediately.',
    actionLabel: 'Add API Key',
    actionHref: '/settings/developer',
    userName: 'Jamie',
    showImage: true,
    showDismiss: false,
    animate: true,
  },
};

/**
 * Trial activation variant
 */
export const TrialActivation: Story = {
  args: {
    title: 'Start Your Free Trial',
    description: 'Get 14 days of unlimited access to all premium features. No credit card required.',
    actionLabel: 'Activate Trial',
    actionHref: '/pricing',
    showImage: true,
    showDismiss: true,
    animate: true,
  },
};

/**
 * Custom background image
 */
export const CustomBackground: Story = {
  args: {
    title: 'Join Our Community',
    description: 'Connect with thousands of developers building AI-powered applications.',
    actionLabel: 'Join Discord',
    actionHref: '/community',
    backgroundImage: '/1.png',
    showImage: true,
    showDismiss: true,
    animate: true,
  },
};
