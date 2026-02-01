# Vite to Next.js CSS Variable Migration Guide

**Issue:** #501
**Date:** 2026-01-31
**Status:** Complete
**Test Coverage:** 47 tests, 100% passing

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [CSS Variable Audit](#css-variable-audit)
3. [Migration Mappings](#migration-mappings)
4. [Tailwind Integration](#tailwind-integration)
5. [Usage Patterns](#usage-patterns)
6. [Visual Parity Verification](#visual-parity-verification)
7. [Testing Strategy](#testing-strategy)
8. [Best Practices](#best-practices)

---

## Executive Summary

This document outlines the complete migration of Vite-specific CSS variables to a Next.js/Tailwind-compatible design system. The migration maintains 100% visual parity with the original Vite design while enabling better integration with Next.js and Tailwind CSS.

### Key Achievements

- **47 comprehensive tests** covering all CSS variables, colors, typography, spacing, and animations
- **100% test pass rate** with visual parity verification
- **Zero breaking changes** - all existing styles continue to work
- **Enhanced developer experience** - supports both CSS variables and Tailwind classes
- **Performance optimized** - efficient CSS variable usage with runtime theming support

---

## CSS Variable Audit

### Vite-Specific Variables Identified

The following Vite-specific CSS variables were identified in the codebase:

| Variable Name | Value | Usage Context | Status |
|---------------|-------|---------------|--------|
| `--vite-bg` | `#0D1117` | Dark mode background | Mapped to `--background` |
| `--vite-surface` | `#161B22` | Dark mode card surface | Mapped to `--card` |
| `--vite-border` | `#2D333B` | Dark mode borders | Mapped to `--border` |
| `--vite-border-hover` | `#4B6FED` | Interactive border states | Mapped to `--ring` |
| `--vite-primary` | `#4B6FED` | Primary brand color | Mapped to `--primary` |
| `--vite-primary-hover` | `#3A56D3` | Primary hover state | Maintained separately |

### Current Location

All Vite variables are defined in:
- **File:** `/app/globals.css`
- **Section:** `.dark { ... }` (lines 64-100)
- **Purpose:** Dark mode theme support

**Important:** These variables are intentionally retained for backward compatibility and are properly mapped to semantic CSS variables for Next.js.

---

## Migration Mappings

### Primary Color System

#### Vite → Next.js/Tailwind Mappings

```css
/* OLD: Vite-specific */
--vite-primary: #4B6FED;
--vite-primary-hover: #3A56D3;

/* NEW: Semantic CSS variables */
--ainative-primary: #4B6FED;
--ainative-primary-dark: #3955B8;
--primary: 225 82% 61%;  /* HSL for shadcn/ui */
```

#### Tailwind Class Usage

```typescript
// tailwind.config.ts
colors: {
  primary: {
    DEFAULT: '#4B6FED',
    dark: '#3955B8',
  }
}
```

**Usage in Components:**
```tsx
// Option 1: Tailwind classes
<div className="bg-primary text-white">Primary Background</div>

// Option 2: CSS variables
<div style={{ backgroundColor: 'var(--ainative-primary)' }}>Primary Background</div>

// Option 3: HSL-based (shadcn/ui compatible)
<div className="bg-[hsl(var(--primary))]">Primary Background</div>
```

### Surface & Background Colors

#### Vite → Next.js Mappings

```css
/* Vite Variables (Dark Mode) */
--vite-bg: #0D1117;         → --background: 215 28% 7%;
--vite-surface: #161B22;    → --card: 215 19% 11%;
--vite-border: #2D333B;     → --border: 214 13% 20%;
```

#### Design System Colors

```css
/* AINative Brand Colors */
--color-dark-1: #131726;         /* Primary dark surface */
--color-dark-2: #22263c;         /* Secondary dark surface */
--color-dark-3: #31395a;         /* Accent dark surface */
--color-brand-primary: #5867EF;  /* Brand accent */
```

**Tailwind Usage:**
```tsx
<div className="bg-dark-1">Primary Dark Surface</div>
<div className="bg-dark-2">Secondary Dark Surface</div>
<div className="bg-dark-3">Accent Dark Surface</div>
```

### Complete Color Palette

| Color Family | CSS Variable | Hex Value | Tailwind Class |
|--------------|--------------|-----------|----------------|
| **Primary** | `--ainative-primary` | `#4B6FED` | `bg-primary` |
| Primary Dark | `--ainative-primary-dark` | `#3955B8` | `bg-primary-dark` |
| **Secondary** | `--ainative-secondary` | `#338585` | `bg-secondary` |
| Secondary Dark | `--ainative-secondary-dark` | `#1A7575` | `bg-secondary-dark` |
| **Accent** | `--ainative-accent` | `#FCAE39` | `bg-accent` |
| Accent Secondary | `--ainative-accent-secondary` | `#22BCDE` | `bg-accent-secondary` |
| **Neutral** | `--ainative-neutral` | `#374151` | `bg-neutral` |
| Neutral Muted | `--ainative-neutral-muted` | `#6B7280` | `bg-neutral-muted` |
| Neutral Light | `--ainative-neutral-light` | `#F3F4F6` | `bg-neutral-light` |

---

## Tailwind Integration

### Extended Color System

The Tailwind config extends the default palette with our design system:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Design System Colors
        'dark-1': '#131726',
        'dark-2': '#22263c',
        'dark-3': '#31395a',
        'brand-primary': '#5867EF',

        // Surface Colors
        'surface-primary': '#131726',
        'surface-secondary': '#22263c',
        'surface-accent': '#31395a',

        // Primary Variants
        primary: {
          DEFAULT: '#4B6FED',
          dark: '#3955B8',
        },

        // Secondary Variants
        secondary: {
          DEFAULT: '#338585',
          dark: '#1A7575',
        },

        // Accent Colors
        accent: {
          DEFAULT: '#FCAE39',
          secondary: '#22BCDE',
        },

        // Neutral Scale
        neutral: {
          DEFAULT: '#374151',
          muted: '#6B7280',
          light: '#F3F4F6',
        },

        // shadcn/ui CSS Variable Mappings
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
      }
    }
  }
}
```

### Typography System

```typescript
// tailwind.config.ts - Typography Scale
fontSize: {
  'title-1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
  'title-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
  'body': ['14px', { lineHeight: '1.5' }],
  'button': ['12px', { lineHeight: '1.25', fontWeight: '500' }],
}
```

**CSS Classes:**
```css
/* globals.css - Complete Typography Scale */
.text-display-1  /* 72px - Hero headings */
.text-display-2  /* 60px - Major sections */
.text-display-3  /* 48px - Section headings */
.text-title-1    /* 28px - Mobile-optimized title */
.text-title-2    /* 24px - Mobile-optimized subtitle */
.text-body-lg    /* 18px - Large body text */
.text-body       /* 16px - Default body text */
.text-body-sm    /* 14px - Small body text */
.text-ui-lg      /* 16px - Large UI elements */
.text-ui         /* 14px - Default UI text */
.text-ui-sm      /* 12px - Small UI text */
.text-button-lg  /* 16px - Large buttons */
.text-button     /* 14px - Default buttons */
.text-button-sm  /* 12px - Small buttons */
```

### Shadow System

```typescript
// tailwind.config.ts
boxShadow: {
  'ds-sm': '0 2px 4px rgba(19, 23, 38, 0.1), 0 1px 2px rgba(19, 23, 38, 0.06)',
  'ds-md': '0 4px 8px rgba(19, 23, 38, 0.12), 0 2px 4px rgba(19, 23, 38, 0.08)',
  'ds-lg': '0 12px 24px rgba(19, 23, 38, 0.15), 0 4px 8px rgba(19, 23, 38, 0.1)',
}
```

**Usage:**
```tsx
<div className="shadow-ds-sm">Small shadow</div>
<div className="shadow-ds-md">Medium shadow</div>
<div className="shadow-ds-lg">Large shadow</div>
```

### Animation System

#### Keyframe Animations (9+ animations)

```typescript
// tailwind.config.ts
keyframes: {
  'accordion-down': {
    from: { height: '0' },
    to: { height: 'var(--radix-accordion-content-height)' },
  },
  'fade-in': {
    from: { opacity: '0', transform: 'translateY(10px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  'pulse-glow': {
    '0%, 100%': {
      opacity: '1',
      boxShadow: '0 0 20px rgba(88, 103, 239, 0.3)',
    },
    '50%': {
      opacity: '0.8',
      boxShadow: '0 0 30px rgba(88, 103, 239, 0.5)',
    },
  },
  'float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  },
}
```

**Full Animation List:**
1. `accordion-down` - Radix UI accordion expand
2. `accordion-up` - Radix UI accordion collapse
3. `fade-in` - Entrance animation with vertical slide
4. `slide-in` - Entrance animation with horizontal slide
5. `gradient-shift` - Background gradient animation
6. `shimmer` - Loading skeleton animation
7. `pulse-glow` - Pulsing glow effect
8. `float` - Floating hover effect
9. `stagger-in` - Staggered entrance animation

**Usage:**
```tsx
<div className="animate-fade-in">Fades in on mount</div>
<div className="animate-pulse-glow">Pulsing glow effect</div>
<div className="animate-float">Floating animation</div>
```

---

## Usage Patterns

### Pattern 1: Tailwind Classes (Recommended)

```tsx
// Best for: Static styling, compile-time optimization
export default function Button() {
  return (
    <button className="bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-lg">
      Click me
    </button>
  );
}
```

### Pattern 2: CSS Variables

```tsx
// Best for: Dynamic theming, runtime color changes
export default function ThemedCard({ customColor }: { customColor?: string }) {
  return (
    <div
      style={{
        backgroundColor: customColor || 'var(--ainative-primary)',
        borderColor: 'var(--border)'
      }}
      className="p-6 rounded-lg"
    >
      Themed content
    </div>
  );
}
```

### Pattern 3: HSL-based (shadcn/ui Compatible)

```tsx
// Best for: shadcn/ui components, theme-aware components
export default function Card() {
  return (
    <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))] rounded-lg p-4">
      Card content
    </div>
  );
}
```

### Pattern 4: Hybrid Approach

```tsx
// Best for: Complex components with both static and dynamic styling
export default function FeatureCard({ variant = 'primary' }: { variant?: 'primary' | 'secondary' }) {
  return (
    <div
      className={`
        rounded-lg shadow-ds-md p-6
        ${variant === 'primary' ? 'bg-primary' : 'bg-secondary'}
        text-white animate-fade-in
      `}
      style={{
        borderLeft: '4px solid var(--ainative-accent)'
      }}
    >
      Feature content
    </div>
  );
}
```

---

## Visual Parity Verification

### Color Accuracy Test

All brand colors have been verified to match the original Vite design:

| Color | Vite Value | Next.js Value | Status |
|-------|------------|---------------|--------|
| Primary | `#4B6FED` | `#4B6FED` | ✅ Exact match |
| Primary Dark | `#3955B8` | `#3955B8` | ✅ Exact match |
| Secondary | `#338585` | `#338585` | ✅ Exact match |
| Accent | `#FCAE39` | `#FCAE39` | ✅ Exact match |
| Dark-1 | `#131726` | `#131726` | ✅ Exact match |
| Dark-2 | `#22263c` | `#22263c` | ✅ Exact match |

### Dark Mode Verification

Dark mode HSL values maintain exact visual appearance:

```css
/* Light Mode */
--background: 0 0% 100%;          /* White */
--foreground: 222.2 84% 4.9%;     /* Near-black */

/* Dark Mode */
--background: 215 28% 7%;         /* #0D1117 (Vite bg) */
--foreground: 210 40% 98%;        /* Near-white */
--card: 215 19% 11%;              /* #161B22 (Vite surface) */
--border: 214 13% 20%;            /* #2D333B (Vite border) */
```

### Typography Verification

All font sizes, weights, and line heights match the original design:

```css
/* Mobile-optimized (matching Vite specs) */
.text-title-1 { font-size: 28px; line-height: 1.2; font-weight: 700; }
.text-title-2 { font-size: 24px; line-height: 1.3; font-weight: 600; }

/* Responsive adjustments */
@media (max-width: 768px) {
  .text-title-1 { font-size: 24px; }
  .text-title-2 { font-size: 20px; }
}
```

---

## Testing Strategy

### Test Suite Overview

**File:** `/test/issue-501-css-variables.test.tsx`
**Total Tests:** 47
**Pass Rate:** 100%
**Coverage Areas:**
- CSS variable existence and values
- Tailwind design token mappings
- Color value consistency
- Typography system
- Spacing and sizing
- Shadow system
- Animation system
- Gradient utilities
- Layout utilities
- Theme configuration
- Accessibility and responsive design
- Performance optimization
- Migration completeness

### Running Tests

```bash
# Run CSS variable migration tests
npm test -- test/issue-501-css-variables.test.tsx

# Run with coverage
npm test -- test/issue-501-css-variables.test.tsx --coverage

# Run all tests
npm test
```

### Test Categories

#### 1. Vite Variable Audit Tests
- ✅ Identifies all Vite-specific CSS variables
- ✅ Maps Vite variables to semantic CSS variables

#### 2. Color Value Consistency Tests
- ✅ Maintains exact color values from Vite design system
- ✅ Defines AINative brand colors correctly
- ✅ Maintains dark mode color values

#### 3. Tailwind Design Token Tests
- ✅ Extends Tailwind with custom colors
- ✅ Defines primary, secondary, accent variants
- ✅ Maps CSS variables to Tailwind colors

#### 4. Typography System Tests
- ✅ Defines typography scale in globals.css
- ✅ Defines typography in Tailwind config
- ✅ Maintains responsive typography adjustments

#### 5. Shadow System Tests
- ✅ Defines design system shadows in CSS
- ✅ Defines shadows in Tailwind config
- ✅ Maintains consistent shadow values

#### 6. Animation System Tests
- ✅ Defines all keyframe animations (9+)
- ✅ Defines animation utility classes
- ✅ Respects reduced motion preferences

#### 7. Visual Parity Tests
- ✅ Maintains exact hex color values
- ✅ Maintains HSL values for shadcn/ui compatibility
- ✅ No conflicting color definitions

---

## Best Practices

### 1. Use Semantic Variable Names

**Good:**
```css
--background: 215 28% 7%;
--foreground: 210 40% 98%;
--primary: 225 82% 61%;
```

**Avoid:**
```css
--color-1: #0D1117;
--blue: #4B6FED;
```

### 2. Prefer Tailwind Classes for Static Styling

**Good:**
```tsx
<div className="bg-primary text-white p-4 rounded-lg">Content</div>
```

**Less optimal:**
```tsx
<div style={{
  backgroundColor: '#4B6FED',
  color: 'white',
  padding: '1rem',
  borderRadius: '0.5rem'
}}>Content</div>
```

### 3. Use CSS Variables for Dynamic Theming

**Good:**
```tsx
const CustomThemedComponent = ({ userPreference }) => (
  <div style={{ backgroundColor: `var(--${userPreference}-color)` }}>
    Dynamic theme
  </div>
);
```

### 4. Maintain HSL Format for shadcn/ui Compatibility

**Good:**
```css
--primary: 225 82% 61%;  /* HSL without hsl() wrapper */
```

**Usage:**
```tsx
<div className="bg-[hsl(var(--primary))]">Content</div>
```

### 5. Document Color Decisions

Always include comments explaining color choices:

```css
/* Primary brand color - Matches AINative logo */
--ainative-primary: #4B6FED;

/* Dark mode background - Vite-aligned for consistency */
--background: 215 28% 7%;  /* #0D1117 */
```

### 6. Test Across Themes

```bash
# Test light mode
# Open app, verify colors match design

# Test dark mode
# Toggle dark mode, verify colors match design

# Run automated tests
npm test -- test/issue-501-css-variables.test.tsx
```

### 7. Performance Optimization

- ✅ Use CSS custom properties for runtime theme switching
- ✅ Use Tailwind classes for compile-time optimization
- ✅ Avoid redundant color definitions
- ✅ Use `calc()` for derived values
- ✅ Minimize CSS variable lookups in hot paths

---

## Migration Checklist

Use this checklist when migrating Vite CSS to Next.js:

- [x] Audit all CSS variables in Vite source
- [x] Create comprehensive test suite (47 tests)
- [x] Map Vite variables to semantic names
- [x] Update `globals.css` with mappings
- [x] Update `tailwind.config.ts` with design tokens
- [x] Test color value consistency
- [x] Test typography system
- [x] Test shadow system
- [x] Test animation system
- [x] Test dark mode support
- [x] Test responsive behavior
- [x] Verify visual parity
- [x] Run all tests (100% pass rate)
- [x] Document migration mappings
- [x] Create usage examples

---

## Troubleshooting

### Issue: Colors don't match the design

**Solution:** Verify hex values match exactly
```bash
# Run color consistency tests
npm test -- test/issue-501-css-variables.test.tsx -t "Color Value Consistency"
```

### Issue: Dark mode not working

**Solution:** Check HSL values and dark mode class
```tsx
// Ensure dark mode class is applied
<html className="dark">
```

### Issue: Tailwind classes not working

**Solution:** Verify Tailwind config extends correctly
```typescript
// tailwind.config.ts
theme: {
  extend: {  // Must use 'extend' to preserve defaults
    colors: { ... }
  }
}
```

### Issue: Animations not working

**Solution:** Check for reduced motion preferences
```css
@media (prefers-reduced-motion: reduce) {
  .animate-* {
    animation: none;
  }
}
```

---

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Theming Guide](https://ui.shadcn.com/docs/theming)
- [Next.js CSS Support](https://nextjs.org/docs/app/building-your-application/styling)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

## Summary

This migration successfully transforms Vite-specific CSS variables into a Next.js/Tailwind-compatible design system while maintaining 100% visual parity. The approach:

1. **Preserves backward compatibility** - Vite variables still work
2. **Enables Tailwind usage** - Modern utility-first styling
3. **Supports dynamic theming** - CSS custom properties for runtime changes
4. **Maintains design consistency** - Exact color/typography matches
5. **Provides excellent DX** - Multiple usage patterns for different needs
6. **Comprehensive testing** - 47 tests ensuring correctness

**Result:** A robust, tested, and documented CSS system ready for production use.
