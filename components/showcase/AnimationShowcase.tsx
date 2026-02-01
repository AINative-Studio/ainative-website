/**
 * Animation Showcase Component
 *
 * Demonstrates all 9 custom animations from the AINative design system.
 * Includes interactive examples and code snippets for documentation.
 *
 * Animations:
 * 1. accordion-down/up - Radix UI accordion animations
 * 2. fade-in - Entrance animation with vertical slide
 * 3. slide-in - Entrance animation with horizontal slide
 * 4. gradient-shift - Background gradient animation
 * 5. shimmer - Loading skeleton animation
 * 6. pulse-glow - Pulsing glow effect
 * 7. float - Floating hover effect
 * 8. stagger-in - Staggered entrance animation
 *
 * @see /Users/aideveloper/ainative-website-nextjs-staging/app/globals.css
 * @see /Users/aideveloper/ainative-website-nextjs-staging/tailwind.config.ts
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnimationExample {
  name: string;
  className: string;
  description: string;
  duration: string;
  timing: string;
  usage: string;
  example: string;
  category: 'entrance' | 'continuous' | 'interaction' | 'utility';
}

const animations: AnimationExample[] = [
  {
    name: 'Accordion Down',
    className: 'animate-accordion-down',
    description: 'Radix UI accordion expand animation with smooth height transition',
    duration: '0.2s',
    timing: 'ease-out',
    usage: 'Expanding accordion panels, collapsible sections',
    example: '<Accordion.Content className="animate-accordion-down">Content</Accordion.Content>',
    category: 'utility',
  },
  {
    name: 'Accordion Up',
    className: 'animate-accordion-up',
    description: 'Radix UI accordion collapse animation with smooth height transition',
    duration: '0.2s',
    timing: 'ease-out',
    usage: 'Collapsing accordion panels, closing dropdowns',
    example: '<Accordion.Content className="animate-accordion-up">Content</Accordion.Content>',
    category: 'utility',
  },
  {
    name: 'Fade In',
    className: 'animate-fade-in',
    description: 'Entrance animation with opacity and vertical slide',
    duration: '0.3s',
    timing: 'ease-out',
    usage: 'Card entrances, modal appearances, content reveals',
    example: '<div className="animate-fade-in">Card content</div>',
    category: 'entrance',
  },
  {
    name: 'Slide In',
    className: 'animate-slide-in',
    description: 'Entrance animation with opacity and horizontal slide from left',
    duration: '0.3s',
    timing: 'ease-out',
    usage: 'Sidebar reveals, notification slides, panel entries',
    example: '<aside className="animate-slide-in">Navigation</aside>',
    category: 'entrance',
  },
  {
    name: 'Slide In Right',
    className: 'animate-slide-in-right',
    description: 'Entrance animation with horizontal slide from right',
    duration: '0.5s',
    timing: 'ease-out',
    usage: 'Right-side panels, contextual menus',
    example: '<div className="animate-slide-in-right">Panel</div>',
    category: 'entrance',
  },
  {
    name: 'Slide In Left',
    className: 'animate-slide-in-left',
    description: 'Entrance animation with horizontal slide from left',
    duration: '0.5s',
    timing: 'ease-out',
    usage: 'Left-side navigation, drawer menus',
    example: '<nav className="animate-slide-in-left">Menu</nav>',
    category: 'entrance',
  },
  {
    name: 'Scale In',
    className: 'animate-scale-in',
    description: 'Entrance animation with scale transformation',
    duration: '0.3s',
    timing: 'ease-out',
    usage: 'Modal dialogs, popover appearances, zoom effects',
    example: '<Dialog className="animate-scale-in">Dialog content</Dialog>',
    category: 'entrance',
  },
  {
    name: 'Gradient Shift',
    className: 'animate-gradient-shift',
    description: 'Continuous background gradient position animation',
    duration: '3s',
    timing: 'ease infinite',
    usage: 'Hero backgrounds, feature cards, premium badges',
    example: '<div className="animate-gradient-shift bg-gradient-to-r">Hero</div>',
    category: 'continuous',
  },
  {
    name: 'Shimmer',
    className: 'animate-shimmer',
    description: 'Loading skeleton effect with sliding highlight',
    duration: '2s',
    timing: 'infinite',
    usage: 'Loading states, skeleton screens, data placeholders',
    example: '<div className="animate-shimmer bg-gray-200">Loading...</div>',
    category: 'continuous',
  },
  {
    name: 'Pulse Glow',
    className: 'animate-pulse-glow',
    description: 'Pulsing glow effect with box-shadow animation',
    duration: '2s',
    timing: 'ease-in-out infinite',
    usage: 'Call-to-action buttons, featured elements, notifications',
    example: '<button className="animate-pulse-glow">Get Started</button>',
    category: 'interaction',
  },
  {
    name: 'Float',
    className: 'animate-float',
    description: 'Floating hover effect with vertical oscillation',
    duration: '3s',
    timing: 'ease-in-out infinite',
    usage: 'Hero images, feature icons, decorative elements',
    example: '<img className="animate-float" src="/icon.svg" alt="" />',
    category: 'continuous',
  },
  {
    name: 'Stagger In',
    className: 'animate-stagger-in',
    description: 'Entrance animation for sequential reveals',
    duration: '0.5s',
    timing: 'ease-out',
    usage: 'List items, feature grids, step indicators',
    example: '<li className="animate-stagger-in" style={{animationDelay: \'0.1s\'}}>Item</li>',
    category: 'entrance',
  },
];

export default function AnimationShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});

  const categories = ['all', 'entrance', 'continuous', 'interaction', 'utility'];

  const filteredAnimations = selectedCategory === 'all'
    ? animations
    : animations.filter((anim) => anim.category === selectedCategory);

  const toggleAnimation = (className: string) => {
    setIsPlaying((prev) => ({ ...prev, [className]: false }));
    setTimeout(() => {
      setIsPlaying((prev) => ({ ...prev, [className]: true }));
    }, 10);
  };

  return (
    <div className="container-custom py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-display-2 font-bold mb-4">Animation Showcase</h1>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Explore all 9+ custom animations from the AINative design system.
            Click the "Replay" button to see each animation in action.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-ui font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-white shadow-ds-md'
                  : 'bg-card hover:bg-muted'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Accessibility Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">♿</span>
            <div>
              <h3 className="font-semibold text-ui mb-1">Accessibility</h3>
              <p className="text-ui-sm text-muted-foreground">
                All animations respect <code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">prefers-reduced-motion</code> settings.
                Users who prefer reduced motion will see instant state changes instead of animations.
              </p>
            </div>
          </div>
        </div>

        {/* Animation Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredAnimations.map((anim) => (
            <motion.div
              key={anim.className}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-lg p-6 shadow-ds-sm hover:shadow-ds-md transition-shadow"
            >
              {/* Animation Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-title-4 font-semibold mb-1">{anim.name}</h3>
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-ui-xs rounded">
                    {anim.category}
                  </span>
                </div>
                <button
                  onClick={() => toggleAnimation(anim.className)}
                  className="px-3 py-1.5 bg-primary text-white text-ui-sm rounded-md hover:bg-primary-dark transition-colors"
                  aria-label={`Replay ${anim.name} animation`}
                >
                  Replay
                </button>
              </div>

              {/* Animation Preview */}
              <div className="relative bg-muted rounded-lg p-8 mb-4 flex items-center justify-center min-h-[120px] overflow-hidden">
                {anim.className === 'animate-gradient-shift' ? (
                  <div
                    key={isPlaying[anim.className] ? 'playing' : 'stopped'}
                    className={`w-full h-24 rounded-lg bg-gradient-to-r from-primary via-secondary to-accent bg-[length:200%_100%] ${
                      isPlaying[anim.className] !== false ? anim.className : ''
                    }`}
                  />
                ) : anim.className === 'animate-shimmer' ? (
                  <div className="relative w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div
                      key={isPlaying[anim.className] ? 'playing' : 'stopped'}
                      className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent ${
                        isPlaying[anim.className] !== false ? anim.className : ''
                      }`}
                    />
                  </div>
                ) : anim.className === 'animate-pulse-glow' ? (
                  <div
                    key={isPlaying[anim.className] ? 'playing' : 'stopped'}
                    className={`w-32 h-12 bg-primary rounded-lg flex items-center justify-center text-white text-ui ${
                      isPlaying[anim.className] !== false ? anim.className : ''
                    }`}
                  >
                    Button
                  </div>
                ) : (
                  <div
                    key={isPlaying[anim.className] ? 'playing' : 'stopped'}
                    className={`w-32 h-12 bg-primary rounded-lg flex items-center justify-center text-white text-ui ${
                      isPlaying[anim.className] !== false ? anim.className : ''
                    }`}
                  >
                    Element
                  </div>
                )}
              </div>

              {/* Animation Details */}
              <div className="space-y-3">
                <p className="text-ui-sm text-muted-foreground">{anim.description}</p>

                <div className="grid grid-cols-2 gap-2 text-ui-xs">
                  <div>
                    <span className="font-semibold">Duration:</span> {anim.duration}
                  </div>
                  <div>
                    <span className="font-semibold">Timing:</span> {anim.timing}
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-ui-sm mb-1">Use Cases:</div>
                  <p className="text-ui-xs text-muted-foreground">{anim.usage}</p>
                </div>

                {/* Code Example */}
                <div className="bg-dark-1 text-white rounded-md p-3 overflow-x-auto">
                  <code className="text-ui-xs font-mono whitespace-pre">
                    {anim.example}
                  </code>
                </div>

                {/* CSS Class */}
                <div className="flex items-center gap-2">
                  <span className="text-ui-xs font-semibold">Class:</span>
                  <code className="bg-muted px-2 py-1 rounded text-ui-xs font-mono">
                    {anim.className}
                  </code>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Usage Documentation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-card border border-border rounded-lg p-8"
        >
          <h2 className="text-title-2 font-semibold mb-4">Implementation Guide</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-title-4 font-semibold mb-2">Basic Usage</h3>
              <p className="text-ui-sm text-muted-foreground mb-3">
                Apply animation classes directly to your components:
              </p>
              <div className="bg-dark-1 text-white rounded-md p-4">
                <code className="text-ui-sm font-mono whitespace-pre">
{`<div className="animate-fade-in">
  <h1>Welcome to AINative</h1>
</div>`}
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-title-4 font-semibold mb-2">Staggered Animations</h3>
              <p className="text-ui-sm text-muted-foreground mb-3">
                Create sequential reveals using animation delays:
              </p>
              <div className="bg-dark-1 text-white rounded-md p-4">
                <code className="text-ui-sm font-mono whitespace-pre">
{`<ul>
  <li className="animate-stagger-in" style={{animationDelay: '0s'}}>Item 1</li>
  <li className="animate-stagger-in" style={{animationDelay: '0.1s'}}>Item 2</li>
  <li className="animate-stagger-in" style={{animationDelay: '0.2s'}}>Item 3</li>
</ul>`}
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-title-4 font-semibold mb-2">Accessibility Compliance</h3>
              <p className="text-ui-sm text-muted-foreground mb-3">
                All animations automatically respect user motion preferences through CSS media queries:
              </p>
              <div className="bg-dark-1 text-white rounded-md p-4">
                <code className="text-ui-sm font-mono whitespace-pre">
{`@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-in,
  /* ... all animations ... */ {
    animation: none;
    opacity: 1;
    transform: none;
  }
}`}
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-title-4 font-semibold mb-2">Performance Tips</h3>
              <ul className="list-disc list-inside space-y-2 text-ui-sm text-muted-foreground">
                <li>Use <code className="bg-muted px-1 py-0.5 rounded">will-change</code> sparingly for complex animations</li>
                <li>Prefer <code className="bg-muted px-1 py-0.5 rounded">transform</code> and <code className="bg-muted px-1 py-0.5 rounded">opacity</code> for best performance</li>
                <li>Avoid animating layout properties like <code className="bg-muted px-1 py-0.5 rounded">width</code> or <code className="bg-muted px-1 py-0.5 rounded">height</code></li>
                <li>Use <code className="bg-muted px-1 py-0.5 rounded">animate-stagger-in</code> with delays instead of complex JavaScript timing</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
