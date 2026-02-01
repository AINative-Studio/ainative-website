/**
 * Typography Showcase Component
 * Demonstrates all typography scales from the AINative Design System
 * Issue #489 - Typography Scale Implementation
 */

'use client';

import React from 'react';

export function TypographyShowcase() {
  return (
    <div className="container-custom py-12 space-y-12">
      {/* Display Headings */}
      <section>
        <h2 className="text-title-1 mb-6 border-b pb-2">Display Headings</h2>
        <div className="space-y-4">
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-display-1</p>
            <h1 className="text-display-1">The Future of AI Development</h1>
          </div>
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-display-2</p>
            <h1 className="text-display-2">Quantum-Powered Solutions</h1>
          </div>
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-display-3</p>
            <h1 className="text-display-3">Build Smarter Applications</h1>
          </div>
        </div>
      </section>

      {/* Title Headings */}
      <section>
        <h2 className="text-title-1 mb-6 border-b pb-2">Title Headings (Mobile-Optimized)</h2>
        <div className="space-y-4">
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-title-1 (28px)</p>
            <h2 className="text-title-1">Main Section Heading</h2>
          </div>
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-title-2 (24px)</p>
            <h3 className="text-title-2">Subsection Heading</h3>
          </div>
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-title-3</p>
            <h4 className="text-title-3">Card Component Heading</h4>
          </div>
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-title-4</p>
            <h5 className="text-title-4">Small Heading</h5>
          </div>
        </div>
      </section>

      {/* Body Text */}
      <section>
        <h2 className="text-title-1 mb-6 border-b pb-2">Body Text</h2>
        <div className="space-y-4 max-w-3xl">
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-body-lg</p>
            <p className="text-body-lg">
              Large body text provides excellent readability for important content sections.
              It's perfect for introductions and key messages that need emphasis without using headings.
            </p>
          </div>
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-body (default)</p>
            <p className="text-body">
              This is the default body text size used throughout the application. It balances
              readability with efficient use of space, making it ideal for paragraphs, descriptions,
              and general content.
            </p>
          </div>
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-body-sm (14px)</p>
            <p className="text-body-sm">
              Small body text is used for supporting information, metadata, and secondary content
              that doesn't need to compete with primary information for attention.
            </p>
          </div>
        </div>
      </section>

      {/* UI Text */}
      <section>
        <h2 className="text-title-1 mb-6 border-b pb-2">UI Text</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-caption text-muted-foreground w-32">.text-ui-lg</span>
            <span className="text-ui-lg">Large UI Label</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-caption text-muted-foreground w-32">.text-ui</span>
            <span className="text-ui">Default UI Label</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-caption text-muted-foreground w-32">.text-ui-sm</span>
            <span className="text-ui-sm">Small UI Label</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-caption text-muted-foreground w-32">.text-ui-xs</span>
            <span className="text-ui-xs">Extra Small UI Label</span>
          </div>
        </div>
      </section>

      {/* Button Text */}
      <section>
        <h2 className="text-title-1 mb-6 border-b pb-2">Button Text</h2>
        <div className="flex flex-wrap gap-4">
          <button className="text-button-lg px-6 py-3 bg-primary text-white rounded-lg">
            Large Button
          </button>
          <button className="text-button px-5 py-2.5 bg-secondary text-white rounded-lg">
            Default Button
          </button>
          <button className="text-button-sm px-4 py-2 bg-accent text-white rounded-lg">
            Small Button (12px)
          </button>
        </div>
      </section>

      {/* Caption Text */}
      <section>
        <h2 className="text-title-1 mb-6 border-b pb-2">Caption Text</h2>
        <div className="space-y-4">
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-caption</p>
            <p className="text-caption">
              This is default caption text used for image descriptions and metadata
            </p>
          </div>
          <div>
            <p className="text-caption text-muted-foreground mb-2">.text-caption-sm</p>
            <p className="text-caption-sm">
              Extra small caption text for very detailed metadata or footnotes
            </p>
          </div>
        </div>
      </section>

      {/* Responsive Behavior Demo */}
      <section>
        <h2 className="text-title-1 mb-6 border-b pb-2">Responsive Behavior</h2>
        <div className="bg-muted p-6 rounded-lg space-y-4">
          <p className="text-body-sm text-muted-foreground mb-4">
            Resize your browser window to see typography automatically adjust for mobile devices (max-width: 768px)
          </p>
          <h1 className="text-display-1 text-gradient-primary">
            Responsive Display Heading
          </h1>
          <h2 className="text-title-1">
            Mobile-Optimized Title (28px → 24px on mobile)
          </h2>
          <p className="text-body">
            Body text maintains consistent readability across all screen sizes
          </p>
        </div>
      </section>

      {/* Accessibility Features */}
      <section>
        <h2 className="text-title-1 mb-6 border-b pb-2">Accessibility Features</h2>
        <div className="space-y-4 max-w-3xl">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-title-3 mb-2">WCAG 2.1 Compliant</h3>
            <ul className="text-body-sm space-y-2 list-disc list-inside">
              <li>Minimum line-height of 1.5 for body text</li>
              <li>Clear visual hierarchy with distinct size differences</li>
              <li>Scalable units for user zoom support</li>
              <li>High contrast ratios for readability</li>
            </ul>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-title-3 mb-2">Mobile-First Design</h3>
            <p className="text-body-sm">
              Title headings are pre-optimized for mobile (title-1: 28px, title-2: 24px)
              ensuring excellent readability on smaller screens without excessive size reduction.
            </p>
          </div>
        </div>
      </section>

      {/* Common Patterns */}
      <section>
        <h2 className="text-title-1 mb-6 border-b pb-2">Common Patterns</h2>

        {/* Feature Card Example */}
        <div className="grid md:grid-cols-2 gap-6">
          <article className="card-vite p-6">
            <h3 className="text-title-2 mb-3">Feature Card</h3>
            <p className="text-body-sm text-muted-foreground mb-4">
              Demonstrating proper typography hierarchy in a card component
            </p>
            <button className="text-button-sm px-4 py-2 bg-primary text-white rounded-lg">
              Learn More
            </button>
          </article>

          <article className="card-vite p-6">
            <h3 className="text-title-3 mb-2">Statistics Panel</h3>
            <div className="text-display-2 text-primary mb-1">1,234</div>
            <p className="text-ui-sm text-muted-foreground">Active Users</p>
          </article>
        </div>
      </section>

      {/* CSS Variables Reference */}
      <section>
        <h2 className="text-title-1 mb-6 border-b pb-2">CSS Variables Reference</h2>
        <div className="bg-card p-6 rounded-lg overflow-x-auto">
          <pre className="text-ui-sm font-mono">
{`/* Typography Scale CSS Variables */
--font-size-title-1: 28px;  /* Mobile-optimized */
--font-size-title-2: 24px;  /* Mobile-optimized */
--font-size-body-sm: 14px;
--font-size-button-sm: 12px;

/* Usage in custom CSS */
.custom-heading {
  font-size: var(--font-size-title-1);
  line-height: 1.2;
  font-weight: 700;
}`}
          </pre>
        </div>
      </section>
    </div>
  );
}

export default TypographyShowcase;
