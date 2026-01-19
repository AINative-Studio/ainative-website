# Teal Accent Color - Issue #372

This document describes the teal accent color implementation in the AINative Studio design system.

## Color Definition

**Teal Accent**: `#22BCDE`

This bright teal color is part of the AINative brand color palette and is used for secondary accent elements throughout the application.

## Tailwind Utilities

The teal accent color is available through the following Tailwind utility classes:

### Background

```tsx
<div className="bg-ainative-teal">...</div>
<div className="bg-accent-secondary">...</div>
```

### Text

```tsx
<h1 className="text-ainative-teal">...</h1>
<p className="text-accent-secondary">...</p>
```

### Border

```tsx
<div className="border-ainative-teal">...</div>
<div className="border-accent-secondary">...</div>
```

### Hover States

```tsx
<button className="hover:bg-ainative-teal hover:text-white">...</button>
<a className="hover:text-accent-secondary">...</a>
```

## Usage Guidelines

### When to Use Teal Accent

1. **Call-to-Action Buttons**: Secondary CTAs that need to stand out but not compete with the primary action
2. **Links**: Interactive text links that need visual emphasis
3. **Badges and Tags**: Status indicators, feature labels, or category tags
4. **Icons**: Accent icons that draw attention to features or actions
5. **Highlights**: Drawing attention to specific UI elements or data points

### Color Combinations

The teal accent works well with:

- **Dark backgrounds**: Excellent contrast on `#0D1117` and `#161B22`
- **White/Light backgrounds**: Provides vibrant accent on light surfaces
- **With Primary Blue**: Complements `#4B6FED` without clashing
- **With Purple Accent**: Creates dynamic gradient effects with `#8A63F4`

### Example Usage

```tsx
// Secondary CTA Button
<button className="bg-accent-secondary text-white hover:bg-opacity-90 px-6 py-3 rounded-lg">
  Learn More
</button>

// Link with Teal Accent
<a href="#" className="text-accent-secondary hover:underline">
  View Documentation
</a>

// Badge
<span className="bg-ainative-teal text-white px-3 py-1 rounded-full text-sm">
  New Feature
</span>

// Border Accent
<div className="border-2 border-ainative-teal rounded-lg p-4">
  <p>Highlighted content</p>
</div>
```

## CSS Variables

The teal color is also available as CSS custom properties:

```css
/* Direct teal color */
color: var(--color-ainative-teal);

/* Through accent-secondary alias */
background-color: var(--color-accent-secondary);
```

## Accessibility

The teal color `#22BCDE` provides:

- **WCAG AA compliance** when used on dark backgrounds
- **High contrast ratio** on `#0D1117` (dark mode background)
- **Clear visibility** for interactive elements

Always ensure sufficient contrast when using the teal accent color, especially for text elements.

## Related Colors

- **Primary Blue**: `#4B6FED` (`--color-ainative-primary`)
- **Orange Accent**: `#FCAE39` (`--color-ainative-accent`)
- **Purple Accent**: `#8A63F4` (dark mode secondary)

## Implementation

The teal accent is defined in `app/globals.css`:

```css
/* In :root */
--ainative-accent-secondary: #22BCDE;

/* In @theme inline */
--color-ainative-teal: #22BCDE;
--color-accent-secondary: #22BCDE;
```

This creates the following Tailwind utilities:
- `bg-ainative-teal`, `bg-accent-secondary`
- `text-ainative-teal`, `text-accent-secondary`
- `border-ainative-teal`, `border-accent-secondary`
- Plus all hover, focus, and other variants

## Testing

To verify the teal accent is working:

1. Start the dev server: `npm run dev`
2. Use the browser inspector to check computed styles
3. Test the utility classes in a component:

```tsx
export default function TealTest() {
  return (
    <div className="p-8 space-y-4">
      <div className="bg-ainative-teal text-white p-4 rounded">
        Background Test
      </div>
      <p className="text-accent-secondary text-2xl font-bold">
        Text Color Test
      </p>
      <div className="border-4 border-ainative-teal p-4 rounded">
        Border Test
      </div>
    </div>
  );
}
```

## References

- Issue: #372
- Color Specification: `#22BCDE`
- Implementation Branch: feature/372-teal-accent
