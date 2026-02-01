/**
 * IntelliSense Verification Component
 * Tests that all custom Tailwind classes are available and typed correctly
 */

import React from 'react';

export const IntelliSenseTest = () => {
  return (
    <div>
      {/* Color tokens - should have IntelliSense */}
      <div className="bg-dark-1 text-brand-primary">Dark 1 Background</div>
      <div className="bg-dark-2">Dark 2 Background</div>
      <div className="bg-dark-3">Dark 3 Background</div>
      <div className="bg-surface-primary">Surface Primary</div>
      <div className="bg-surface-secondary">Surface Secondary</div>
      <div className="bg-surface-accent">Surface Accent</div>

      {/* Typography - should have IntelliSense */}
      <h1 className="text-title-1">Title 1</h1>
      <h2 className="text-title-2">Title 2</h2>
      <p className="text-body">Body text</p>
      <button className="text-button">Button text</button>

      {/* Animations - should have IntelliSense */}
      <div className="animate-fade-in">Fade In</div>
      <div className="animate-slide-in">Slide In</div>
      <div className="animate-gradient-shift">Gradient Shift</div>
      <div className="animate-shimmer">Shimmer</div>
      <div className="animate-pulse-glow">Pulse Glow</div>
      <div className="animate-float">Float</div>
      <div className="animate-stagger-in">Stagger In</div>
      <div className="animate-accordion-down">Accordion Down</div>
      <div className="animate-accordion-up">Accordion Up</div>

      {/* Shadows - should have IntelliSense */}
      <div className="shadow-ds-sm">Small shadow</div>
      <div className="shadow-ds-md">Medium shadow</div>
      <div className="shadow-ds-lg">Large shadow</div>

      {/* Button dimensions - should have IntelliSense */}
      <button className="h-button p-button">Custom Button</button>

      {/* Border radius - should have IntelliSense */}
      <div className="rounded-lg">Large radius</div>
      <div className="rounded-md">Medium radius</div>
      <div className="rounded-sm">Small radius</div>
    </div>
  );
};
