# Animation Classes Documentation

## Overview
This document describes the animation utility classes available in the AINative Studio Next.js project, migrated from the Vite SPA.

## Available Animations

### Slide Animations

#### `animate-slide-in-right`
Slides content in from the right with fade-in effect.

**Properties:**
- Duration: 0.5s
- Easing: ease-out
- Transform: translateX(20px) → translateX(0)
- Opacity: 0 → 1

**Usage:**
```tsx
<div className="animate-slide-in-right">
  Content slides in from the right
</div>
```

#### `animate-slide-in-left`
Slides content in from the left with fade-in effect.

**Properties:**
- Duration: 0.5s
- Easing: ease-out
- Transform: translateX(-20px) → translateX(0)
- Opacity: 0 → 1

**Usage:**
```tsx
<div className="animate-slide-in-left">
  Content slides in from the left
</div>
```

### Scale Animation

#### `animate-scale-in`
Scales content up smoothly with fade-in effect.

**Properties:**
- Duration: 0.3s
- Easing: ease-out
- Transform: scale(0.95) → scale(1)
- Opacity: 0 → 1

**Usage:**
```tsx
<div className="animate-scale-in">
  Content scales up smoothly
</div>
```

## Accessibility

All animations respect the user's motion preferences via `prefers-reduced-motion` media query. When a user has reduced motion enabled in their system settings:

- All animations are disabled
- Content appears instantly with full opacity
- No transform effects are applied

This ensures the site is accessible to users with vestibular disorders or motion sensitivity.

## Implementation Details

### CSS Location
All animation keyframes and utility classes are defined in `/app/globals.css`.

### Keyframe Definitions
```css
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Accessibility Implementation
```css
@media (prefers-reduced-motion: reduce) {
  .animate-slide-in-right,
  .animate-slide-in-left,
  .animate-scale-in {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

## Best Practices

1. **Performance**: Use animations sparingly on critical rendering paths
2. **Staggering**: For multiple animated elements, consider using `animation-delay` to create staggered effects
3. **Mobile**: Test animations on mobile devices to ensure smooth performance
4. **Combinations**: These animations can be combined with other Tailwind utilities for more complex effects

## Examples

### Staggered Card Animation
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="animate-slide-in-left" style={{ animationDelay: '0s' }}>
    Card 1
  </div>
  <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
    Card 2
  </div>
  <div className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
    Card 3
  </div>
</div>
```

### Hero Section with Scale-in
```tsx
<section className="hero">
  <h1 className="animate-scale-in">
    Welcome to AINative Studio
  </h1>
  <p className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
    Build powerful AI applications
  </p>
</section>
```

## Browser Compatibility

These animations are compatible with all modern browsers:
- Chrome/Edge 79+
- Firefox 72+
- Safari 13.1+
- Mobile browsers (iOS Safari 13.4+, Chrome Android)

The `prefers-reduced-motion` media query is supported in:
- Chrome 74+
- Firefox 63+
- Safari 10.1+

## Testing

A test page is available at `/test/animation-test.html` for verifying animation behavior in different browsers and with different motion preference settings.

To test reduced motion:
1. **macOS**: System Preferences → Accessibility → Display → Reduce motion
2. **Windows**: Settings → Ease of Access → Display → Show animations
3. **Linux**: Depends on desktop environment (e.g., GNOME Settings → Universal Access → Reduce Animation)

## Related Animations

Other animations available in the design system:
- `animate-fade-in` - Simple fade-in animation
- `animate-slide-in` - Original slide-in from left
- `animate-stagger-in` - Vertical stagger animation
- `animate-float` - Floating/hovering effect
- `animate-pulse-glow` - Pulsing glow effect
- `animate-shimmer` - Shimmer loading effect

## Issue Reference

This implementation addresses Issue #376: Add missing Vite animation classes for slide-in-right, slide-in-left, and scale-in animations.
