/**
 * Animation Showcase Demo Page
 *
 * Server component that renders the AnimationShowcase client component.
 * Demonstrates all 9+ custom animations from the AINative design system.
 *
 * Route: /demo/animations
 */

import type { Metadata } from 'next';
import AnimationShowcase from '@/components/showcase/AnimationShowcase';

export const metadata: Metadata = {
  title: 'Animation Showcase',
  description: 'Explore all custom animations from the AINative design system, including entrance effects, continuous animations, and interaction patterns.',
  openGraph: {
    title: 'Animation Showcase | AI Native Studio',
    description: 'Comprehensive showcase of 9+ custom animations with interactive examples and implementation guides.',
  },
};

export default function AnimationShowcasePage() {
  return <AnimationShowcase />;
}
