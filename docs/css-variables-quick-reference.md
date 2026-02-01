# CSS Variables Quick Reference - Issue #501

Quick reference guide for using CSS variables and Tailwind design tokens in the AINative Next.js project.

---

## Quick Usage Patterns

### 1. Tailwind Classes (Most Common)
```tsx
// Primary colors
<div className="bg-primary text-white">Primary</div>
<div className="bg-primary-dark">Primary Dark</div>

// Secondary colors
<div className="bg-secondary">Secondary</div>
<div className="bg-secondary-dark">Secondary Dark</div>

// Accent colors
<div className="bg-accent">Accent</div>
<div className="bg-accent-secondary">Accent Secondary</div>

// Dark mode surfaces
<div className="bg-dark-1">Dark Surface 1</div>
<div className="bg-dark-2">Dark Surface 2</div>
<div className="bg-dark-3">Dark Surface 3</div>
```

### 2. CSS Variables (Dynamic Theming)
```tsx
// Brand colors
style={{ backgroundColor: 'var(--ainative-primary)' }}
style={{ borderColor: 'var(--ainative-accent)' }}

// Semantic colors
style={{ backgroundColor: 'var(--background)' }}
style={{ color: 'var(--foreground)' }}
```

### 3. HSL-based (shadcn/ui)
```tsx
// Theme-aware components
<div className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
  Auto-adapts to light/dark mode
</div>
```

---

## Color Palette

### Brand Colors

| Variable | Hex | Tailwind Class |
|----------|-----|----------------|
| Primary | `#4B6FED` | `bg-primary` |
| Primary Dark | `#3955B8` | `bg-primary-dark` |
| Secondary | `#338585` | `bg-secondary` |
| Secondary Dark | `#1A7575` | `bg-secondary-dark` |
| Accent | `#FCAE39` | `bg-accent` |
| Accent Secondary | `#22BCDE` | `bg-accent-secondary` |

### Dark Mode Surfaces

| Variable | Hex | Tailwind Class |
|----------|-----|----------------|
| Dark-1 | `#131726` | `bg-dark-1` |
| Dark-2 | `#22263c` | `bg-dark-2` |
| Dark-3 | `#31395a` | `bg-dark-3` |
| Brand Primary | `#5867EF` | `bg-brand-primary` |

### Neutral Scale

| Variable | Hex | Tailwind Class |
|----------|-----|----------------|
| Neutral | `#374151` | `bg-neutral` |
| Neutral Muted | `#6B7280` | `bg-neutral-muted` |
| Neutral Light | `#F3F4F6` | `bg-neutral-light` |

---

## Typography

### CSS Classes

```tsx
// Display headings (hero sections)
<h1 className="text-display-1">72px hero heading</h1>
<h2 className="text-display-2">60px major section</h2>
<h3 className="text-display-3">48px section heading</h3>

// Title headings (mobile-optimized)
<h2 className="text-title-1">28px title</h2>
<h3 className="text-title-2">24px subtitle</h3>

// Body text
<p className="text-body-lg">18px large body</p>
<p className="text-body">16px default body</p>
<p className="text-body-sm">14px small body</p>

// UI text
<span className="text-ui-lg">16px large UI</span>
<span className="text-ui">14px default UI</span>
<span className="text-ui-sm">12px small UI</span>

// Button text
<button className="text-button-lg">16px large button</button>
<button className="text-button">14px default button</button>
<button className="text-button-sm">12px small button</button>
```

---

## Shadows

```tsx
// Design system shadows
<div className="shadow-ds-sm">Small shadow</div>
<div className="shadow-ds-md">Medium shadow</div>
<div className="shadow-ds-lg">Large shadow</div>

// Glow effects
<div className="glow-primary">Primary glow</div>
<div className="glow-primary-hover">Glow on hover</div>
<div className="shadow-glow-primary">Strong glow</div>
```

---

## Animations

```tsx
// Entrance animations
<div className="animate-fade-in">Fades in with slide up</div>
<div className="animate-slide-in">Slides in from left</div>
<div className="animate-slide-in-right">Slides in from right</div>
<div className="animate-scale-in">Scales in</div>

// Continuous animations
<div className="animate-pulse-glow">Pulsing glow effect</div>
<div className="animate-float">Floating animation</div>
<div className="animate-gradient-shift">Animated gradient</div>
<div className="animate-shimmer">Shimmer loading effect</div>

// Accordion animations (Radix UI)
<div className="animate-accordion-down">Accordion expand</div>
<div className="animate-accordion-up">Accordion collapse</div>
```

---

## Gradients

```tsx
// Background gradients
<div className="bg-gradient-vite">Vite-style gradient</div>
<div className="bg-gradient-primary">Primary gradient</div>
<div className="bg-gradient-accent">Accent gradient</div>

// Text gradients
<h1 className="text-gradient-primary">Primary gradient text</h1>
<h2 className="text-gradient">Brand gradient text</h2>
```

---

## Layout

```tsx
// Container with max-width
<div className="container-custom">
  Max-width: 1280px with responsive padding
</div>

// Full-width sections with vertical padding
<section className="full-width-section-sm">Small padding</section>
<section className="full-width-section-md">Medium padding</section>
<section className="full-width-section-lg">Large padding</section>
<section className="full-width-section-xl">Extra large padding</section>
```

---

## Dark Mode

All colors automatically adapt to dark mode when `.dark` class is on `<html>`:

```tsx
// Light mode: white background, dark text
// Dark mode: #0D1117 background, light text
<div className="bg-background text-foreground">
  Auto-adapts to theme
</div>

// Primary color works in both modes
<button className="bg-primary text-white">
  Same in light and dark
</button>
```

---

## Common Patterns

### Primary Button
```tsx
<button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg shadow-ds-md transition-colors">
  Click me
</button>
```

### Card
```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-6 shadow-ds-sm">
  Card content
</div>
```

### Hero Section
```tsx
<section className="full-width-section-xl bg-gradient-vite">
  <div className="container-custom">
    <h1 className="text-display-1 text-gradient-primary animate-fade-in">
      Hero Heading
    </h1>
  </div>
</section>
```

### Feature Card
```tsx
<div className="bg-dark-1 border border-dark-3 rounded-lg p-6 shadow-ds-md hover:shadow-ds-lg transition-shadow animate-fade-in">
  <h3 className="text-title-2 text-primary mb-4">Feature Title</h3>
  <p className="text-body text-muted-foreground">Feature description</p>
</div>
```

---

## CSS Variable Reference

### Most Used Variables

```css
/* Brand colors */
--ainative-primary: #4B6FED
--ainative-secondary: #338585
--ainative-accent: #FCAE39

/* Semantic colors */
--background: /* Adapts to light/dark */
--foreground: /* Adapts to light/dark */
--border: /* Adapts to light/dark */
--primary: /* HSL format for shadcn/ui */

/* Typography */
--font-sans: 'Poppins', system-ui, sans-serif
--font-size-title-1: 28px
--font-size-body: 16px

/* Spacing */
--radius: 0.5rem
--height-button: 40px
```

---

## Testing

Run CSS variable tests:
```bash
npm test -- test/issue-501-css-variables.test.tsx
```

---

## Documentation

- **Migration Guide:** `/docs/vite-to-nextjs-css-migration.md`
- **Audit Report:** `/docs/css-variable-audit-report.md`
- **Summary:** `/docs/issue-501-summary.md`

---

## Support

For questions or issues with CSS variables:
1. Check the migration guide for detailed explanations
2. Run tests to verify your usage
3. Refer to this quick reference for common patterns

---

**Last Updated:** 2026-01-31
**Issue:** #501
**Status:** Complete
