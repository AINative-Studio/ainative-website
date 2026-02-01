/**
 * Storybook Documentation: AnimationShowcase
 *
 * Interactive documentation for all 9+ custom animations in the design system.
 *
 * Stories:
 * - Default: Full showcase with all animations
 * - Individual Animation: Single animation demonstrations
 * - Category Filtered: Animations grouped by category
 * - Accessibility: Reduced motion examples
 */

import type { Meta, StoryObj } from '@storybook/react';
import AnimationShowcase from './AnimationShowcase';

const meta: Meta<typeof AnimationShowcase> = {
  title: 'Design System/Animation Showcase',
  component: AnimationShowcase,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Animation Showcase

Comprehensive demonstration of all custom animations in the AINative design system.

## Features
- 9+ custom animations
- Interactive replay controls
- Category filtering
- Accessibility compliance
- Code examples

## Animation Categories

### Entrance Animations
- **fade-in**: Entrance with opacity and vertical slide
- **slide-in**: Horizontal slide from left
- **slide-in-right**: Horizontal slide from right
- **slide-in-left**: Horizontal slide from left (explicit direction)
- **scale-in**: Scale transformation entrance
- **stagger-in**: Sequential reveal with delay

### Continuous Animations
- **gradient-shift**: Background gradient position shift
- **shimmer**: Loading skeleton highlight effect
- **float**: Vertical oscillation for floating effect

### Interaction Animations
- **pulse-glow**: Pulsing glow effect for emphasis

### Utility Animations
- **accordion-down**: Radix UI accordion expand
- **accordion-up**: Radix UI accordion collapse

## Accessibility

All animations respect \`prefers-reduced-motion\` media queries:

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  .animate-* {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
\`\`\`

## Usage Examples

### Basic Usage
\`\`\`tsx
<div className="animate-fade-in">
  Content appears with fade effect
</div>
\`\`\`

### Staggered Reveals
\`\`\`tsx
<ul>
  <li className="animate-stagger-in" style={{animationDelay: '0s'}}>First</li>
  <li className="animate-stagger-in" style={{animationDelay: '0.1s'}}>Second</li>
  <li className="animate-stagger-in" style={{animationDelay: '0.2s'}}>Third</li>
</ul>
\`\`\`

### Loading States
\`\`\`tsx
<div className="relative bg-gray-200 rounded overflow-hidden">
  <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent" />
</div>
\`\`\`

## Performance Considerations

- Animations use GPU-accelerated \`transform\` and \`opacity\`
- Infinite animations are optimized with \`will-change\` (applied automatically)
- All animations are pure CSS (no JavaScript overhead)
- Respects user's motion preferences for accessibility
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AnimationShowcase>;

/**
 * Full Animation Showcase
 *
 * Complete showcase with all animations, category filters, and interactive controls.
 */
export const Default: Story = {};

/**
 * Individual Animation Examples
 *
 * Isolated examples of each animation type for focused testing and documentation.
 */
export const IndividualAnimations: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-title-2 font-semibold mb-6">Individual Animation Examples</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Fade In */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-title-4 font-semibold mb-4">Fade In</h3>
          <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
            <div className="animate-fade-in bg-primary text-white px-4 py-2 rounded">
              Fading In
            </div>
          </div>
          <code className="block mt-3 text-ui-xs bg-dark-1 text-white p-2 rounded">
            animate-fade-in
          </code>
        </div>

        {/* Slide In */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-title-4 font-semibold mb-4">Slide In</h3>
          <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
            <div className="animate-slide-in bg-primary text-white px-4 py-2 rounded">
              Sliding In
            </div>
          </div>
          <code className="block mt-3 text-ui-xs bg-dark-1 text-white p-2 rounded">
            animate-slide-in
          </code>
        </div>

        {/* Pulse Glow */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-title-4 font-semibold mb-4">Pulse Glow</h3>
          <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
            <div className="animate-pulse-glow bg-primary text-white px-4 py-2 rounded">
              Pulsing
            </div>
          </div>
          <code className="block mt-3 text-ui-xs bg-dark-1 text-white p-2 rounded">
            animate-pulse-glow
          </code>
        </div>

        {/* Float */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-title-4 font-semibold mb-4">Float</h3>
          <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
            <div className="animate-float bg-primary text-white px-4 py-2 rounded">
              Floating
            </div>
          </div>
          <code className="block mt-3 text-ui-xs bg-dark-1 text-white p-2 rounded">
            animate-float
          </code>
        </div>

        {/* Gradient Shift */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-title-4 font-semibold mb-4">Gradient Shift</h3>
          <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
            <div className="animate-gradient-shift bg-gradient-to-r from-primary via-secondary to-accent bg-[length:200%_100%] text-white px-4 py-2 rounded">
              Shifting
            </div>
          </div>
          <code className="block mt-3 text-ui-xs bg-dark-1 text-white p-2 rounded">
            animate-gradient-shift
          </code>
        </div>

        {/* Shimmer */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-title-4 font-semibold mb-4">Shimmer</h3>
          <div className="relative bg-gray-200 rounded-lg h-16 overflow-hidden">
            <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </div>
          <code className="block mt-3 text-ui-xs bg-dark-1 text-white p-2 rounded">
            animate-shimmer
          </code>
        </div>
      </div>
    </div>
  ),
};

/**
 * Staggered Entrance Animations
 *
 * Demonstrates how to create sequential reveals using animation delays.
 */
export const StaggeredEntrances: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-title-2 font-semibold mb-6">Staggered Entrance Animations</h2>

      <div className="bg-card border border-border rounded-lg p-8">
        <h3 className="text-title-3 font-semibold mb-4">Feature List</h3>
        <ul className="space-y-4">
          {['Advanced AI Algorithms', 'Real-time Processing', 'Scalable Infrastructure', 'Enterprise Security'].map(
            (feature, index) => (
              <li
                key={feature}
                className="animate-stagger-in flex items-center gap-3 bg-muted px-4 py-3 rounded-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-ui-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-ui">{feature}</span>
              </li>
            )
          )}
        </ul>

        <div className="mt-6 bg-dark-1 text-white rounded-md p-4">
          <code className="text-ui-xs font-mono whitespace-pre">
{`<li
  className="animate-stagger-in"
  style={{ animationDelay: '0.1s' }}
>
  Feature
</li>`}
          </code>
        </div>
      </div>
    </div>
  ),
};

/**
 * Loading States with Shimmer
 *
 * Demonstrates shimmer effect for skeleton loading states.
 */
export const LoadingStates: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-title-2 font-semibold mb-6">Loading States</h2>

      <div className="bg-card border border-border rounded-lg p-8 space-y-4">
        <h3 className="text-title-3 font-semibold mb-4">Content Loading Skeleton</h3>

        {/* Avatar + Text Skeleton */}
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 overflow-hidden">
              <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
            <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 overflow-hidden">
              <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* Card Skeleton */}
        <div className="relative h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </div>
    </div>
  ),
};

/**
 * Accessibility - Reduced Motion
 *
 * Demonstrates how animations respect user motion preferences.
 */
export const ReducedMotion: Story = {
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates how animations respect the \`prefers-reduced-motion\` setting.
When a user has reduced motion enabled in their OS settings, all animations are
automatically disabled and replaced with instant state changes.

To test:
1. Enable "Reduce motion" in your OS accessibility settings
2. Reload this story
3. Observe that animations no longer play

The CSS media query handles this automatically:

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-in,
  /* ... all animations ... */ {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
\`\`\`
        `,
      },
    },
  },
  render: () => (
    <div className="p-8">
      <h2 className="text-title-2 font-semibold mb-6">Accessibility: Reduced Motion</h2>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">♿</span>
          <div>
            <h3 className="font-semibold text-ui mb-2">Testing Reduced Motion</h3>
            <p className="text-ui-sm text-muted-foreground mb-3">
              Enable "Reduce motion" in your OS accessibility settings to see animations disabled:
            </p>
            <ul className="list-disc list-inside space-y-1 text-ui-sm text-muted-foreground">
              <li><strong>macOS:</strong> System Preferences → Accessibility → Display → Reduce motion</li>
              <li><strong>Windows:</strong> Settings → Ease of Access → Display → Show animations</li>
              <li><strong>iOS:</strong> Settings → Accessibility → Motion → Reduce Motion</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-title-4 font-semibold mb-4">With Animations</h3>
            <div className="space-y-3">
              <div className="animate-fade-in bg-primary text-white px-4 py-2 rounded">Fade In</div>
              <div className="animate-slide-in bg-secondary text-white px-4 py-2 rounded">Slide In</div>
              <div className="animate-scale-in bg-accent text-white px-4 py-2 rounded">Scale In</div>
            </div>
          </div>

          <div>
            <h3 className="text-title-4 font-semibold mb-4">With Reduced Motion</h3>
            <p className="text-ui-sm text-muted-foreground mb-3">
              Elements appear instantly without animation transitions.
              All content is immediately visible and accessible.
            </p>
            <div className="space-y-3">
              <div className="bg-primary text-white px-4 py-2 rounded opacity-100">No Animation</div>
              <div className="bg-secondary text-white px-4 py-2 rounded opacity-100">No Animation</div>
              <div className="bg-accent text-white px-4 py-2 rounded opacity-100">No Animation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Performance Best Practices
 *
 * Demonstrates optimal animation usage patterns for performance.
 */
export const PerformanceTips: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-title-2 font-semibold mb-6">Performance Best Practices</h2>

      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="font-semibold text-ui mb-2 text-green-800 dark:text-green-300">✓ Good Practices</h3>
          <ul className="list-disc list-inside space-y-2 text-ui-sm text-muted-foreground">
            <li>Use <code className="bg-green-100 dark:bg-green-900/40 px-1 py-0.5 rounded">transform</code> and <code className="bg-green-100 dark:bg-green-900/40 px-1 py-0.5 rounded">opacity</code> for 60fps animations</li>
            <li>Leverage GPU acceleration with <code className="bg-green-100 dark:bg-green-900/40 px-1 py-0.5 rounded">transform: translateZ(0)</code></li>
            <li>Use CSS animations instead of JavaScript for simple effects</li>
            <li>Limit simultaneous complex animations to 3-5 elements</li>
            <li>Apply animations only when elements are visible (Intersection Observer)</li>
          </ul>

          <div className="mt-4 bg-dark-1 text-white rounded-md p-4">
            <code className="text-ui-xs font-mono whitespace-pre">
{`/* Performant Animation */
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
  /* Uses transform and opacity */
}`}
            </code>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="font-semibold text-ui mb-2 text-red-800 dark:text-red-300">✗ Avoid These Patterns</h3>
          <ul className="list-disc list-inside space-y-2 text-ui-sm text-muted-foreground">
            <li>Animating <code className="bg-red-100 dark:bg-red-900/40 px-1 py-0.5 rounded">width</code>, <code className="bg-red-100 dark:bg-red-900/40 px-1 py-0.5 rounded">height</code>, or <code className="bg-red-100 dark:bg-red-900/40 px-1 py-0.5 rounded">top/left</code> (causes layout recalculation)</li>
            <li>Using <code className="bg-red-100 dark:bg-red-900/40 px-1 py-0.5 rounded">will-change</code> on too many elements</li>
            <li>Infinite animations on many elements simultaneously</li>
            <li>Complex box-shadow animations (use pseudo-elements instead)</li>
            <li>JavaScript-based animations for simple effects</li>
          </ul>

          <div className="mt-4 bg-dark-1 text-white rounded-md p-4">
            <code className="text-ui-xs font-mono whitespace-pre">
{`/* Avoid - Causes Layout Thrashing */
@keyframes bad-animation {
  from { width: 100px; }
  to { width: 200px; }
}`}
            </code>
          </div>
        </div>
      </div>
    </div>
  ),
};
