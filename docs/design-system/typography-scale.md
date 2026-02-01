# Typography Scale - AINative Design System

## Overview

The AINative typography scale provides a comprehensive, mobile-optimized system for consistent text styling across the application. This system is integrated with Tailwind CSS v4 and follows WCAG accessibility guidelines.

## Typography Scale Configuration

### Location

Typography configuration is defined in:
- **CSS Variables**: `/app/globals.css` (lines 759-789) in `@theme inline` block
- **CSS Classes**: `/app/globals.css` (lines 395-547)
- **Tests**: `/__tests__/config/typography-scale.test.ts`

## Available Typography Scales

### 1. Display Headings (Hero Sections)

Used for large hero sections and major page titles.

| Class | Font Size | Line Height | Font Weight | Use Case |
|-------|-----------|-------------|-------------|----------|
| `.text-display-1` | 72px (48px mobile) | 1.1 | 800 | Primary hero heading |
| `.text-display-2` | 60px (40px mobile) | 1.1 | 800 | Secondary hero heading |
| `.text-display-3` | 48px (36px mobile) | 1.2 | 700 | Tertiary hero heading |

**CSS Variable**: `--font-size-display-{1,2,3}`

**Example**:
```tsx
<h1 className="text-display-1 text-gradient-primary">
  AI Native Studio
</h1>
```

---

### 2. Title Headings (Section Headings)

**Mobile-optimized** for improved readability on smaller screens.

| Class | Font Size | Line Height | Font Weight | Use Case |
|-------|-----------|-------------|-------------|----------|
| `.text-title-1` | 28px (24px mobile) | 1.2 | 700 | Main section heading |
| `.text-title-2` | 24px (20px mobile) | 1.3 | 700 | Subsection heading |
| `.text-title-3` | 24px (18px mobile) | 1.3 | 600 | Card/component heading |
| `.text-title-4` | 20px | 1.4 | 600 | Small heading |

**CSS Variables**: `--font-size-title-{1,2,3,4}`

**Example**:
```tsx
<h2 className="text-title-1 mb-4">
  Features
</h2>

<h3 className="text-title-2">
  Quantum Computing Integration
</h3>
```

---

### 3. Body Text

Used for paragraphs, descriptions, and content.

| Class | Font Size | Line Height | Font Weight | Use Case |
|-------|-----------|-------------|-------------|----------|
| `.text-body-lg` | 18px | 1.6 | 400 | Large body text |
| `.text-body` | 16px | 1.5 | 400 | Default body text |
| `.text-body-sm` | 14px | 1.5 | 400 | Small body text |

**CSS Variables**: `--font-size-body-{lg,sm}`, `--font-size-body`

**Example**:
```tsx
<p className="text-body mb-6">
  Transform your workflow with AI-powered development tools.
</p>

<p className="text-body-sm text-muted-foreground">
  Learn more about our platform
</p>
```

---

### 4. UI Text

Used for interface elements, labels, and navigation.

| Class | Font Size | Line Height | Font Weight | Use Case |
|-------|-----------|-------------|-------------|----------|
| `.text-ui-lg` | 16px | 1.5 | 500 | Large UI labels |
| `.text-ui` | 14px | 1.5 | 500 | Default UI text |
| `.text-ui-sm` | 12px | 1.4 | 500 | Small UI labels |
| `.text-ui-xs` | 11px | 1.4 | 500 | Extra small labels |

**CSS Variables**: `--font-size-ui-{lg,sm,xs}`, `--font-size-ui`

**Example**:
```tsx
<label className="text-ui font-medium">
  Email Address
</label>

<span className="text-ui-sm text-muted-foreground">
  Optional
</span>
```

---

### 5. Button Text

Optimized for button readability and click targets.

| Class | Font Size | Line Height | Font Weight | Use Case |
|-------|-----------|-------------|-------------|----------|
| `.text-button-lg` | 16px | 1.5 | 600 | Large buttons |
| `.text-button` | 14px | 1.5 | 600 | Default buttons |
| `.text-button-sm` | 12px | 1.4 | 600 | Small buttons |

**CSS Variables**: `--font-size-button-{lg,sm}`, `--font-size-button`

**Example**:
```tsx
<button className="text-button-lg px-6 py-3 bg-primary text-white">
  Get Started
</button>

<button className="text-button-sm px-4 py-2 bg-secondary">
  Cancel
</button>
```

---

### 6. Caption Text

Used for image captions, footnotes, and metadata.

| Class | Font Size | Line Height | Font Weight | Use Case |
|-------|-----------|-------------|-------------|----------|
| `.text-caption` | 12px | 1.4 | 400 | Default captions |
| `.text-caption-sm` | 11px | 1.4 | 400 | Small captions |

**CSS Variables**: `--font-size-caption-{sm}`, `--font-size-caption`

**Example**:
```tsx
<figcaption className="text-caption text-muted-foreground mt-2">
  Figure 1: System Architecture
</figcaption>
```

---

## Responsive Behavior

Typography automatically adjusts for mobile devices (max-width: 768px):

```css
@media (max-width: 768px) {
  .text-display-1 { font-size: 48px; }
  .text-display-2 { font-size: 40px; }
  .text-display-3 { font-size: 36px; }
  .text-title-1 { font-size: 24px; }
  .text-title-2 { font-size: 20px; }
  .text-title-3 { font-size: 18px; }
}
```

### Mobile-First Design

The base `title-1` and `title-2` sizes are already mobile-optimized:
- `title-1`: 28px (reduced from traditional 36px)
- `title-2`: 24px (reduced from traditional 30px)

This ensures optimal readability on all devices without excessive size differences.

---

## Accessibility Compliance

### WCAG 2.1 Guidelines

- **Line Height**: Body text uses 1.5 minimum (WCAG AA)
- **Contrast**: All text must meet 4.5:1 contrast ratio minimum
- **Scalability**: Uses px units (Tailwind converts to rem for user scaling)
- **Hierarchy**: Clear visual hierarchy with distinct size differences

### Best Practices

1. **Use semantic HTML**: Pair typography classes with appropriate HTML tags
   ```tsx
   <h1 className="text-display-1">Main Title</h1>
   <h2 className="text-title-1">Section</h2>
   <p className="text-body">Content</p>
   ```

2. **Maintain hierarchy**: Don't skip heading levels
   ```tsx
   {/* Good */}
   <h1 className="text-display-1">Title</h1>
   <h2 className="text-title-1">Subtitle</h2>

   {/* Bad */}
   <h1 className="text-display-1">Title</h1>
   <h3 className="text-title-3">Subtitle</h3>
   ```

3. **Screen reader friendly**: Add `sr-only` text when needed
   ```tsx
   <h2 className="text-title-2">
     <span className="sr-only">Section: </span>
     Features
   </h2>
   ```

---

## Integration with Tailwind v4

### Using CSS Variables

You can reference typography variables in custom CSS:

```css
.custom-heading {
  font-size: var(--font-size-title-1);
  line-height: 1.2;
  font-weight: 700;
}
```

### Combining with Tailwind Utilities

```tsx
<h2 className="text-title-1 font-bold text-primary mb-6">
  Quantum Computing
</h2>

<p className="text-body text-muted-foreground leading-relaxed">
  Advanced computing capabilities
</p>
```

---

## Common Patterns

### Hero Section

```tsx
<section className="full-width-section-lg bg-gradient-vite">
  <div className="container-custom">
    <h1 className="text-display-1 text-gradient-primary mb-4">
      AI Native Studio
    </h1>
    <p className="text-body-lg text-muted-foreground max-w-2xl">
      Build the future with AI-powered development tools
    </p>
  </div>
</section>
```

### Feature Card

```tsx
<article className="card-vite p-6">
  <h3 className="text-title-2 mb-3">
    Quantum Integration
  </h3>
  <p className="text-body-sm text-muted-foreground mb-4">
    Harness quantum computing power for complex calculations
  </p>
  <button className="text-button-sm px-4 py-2 bg-primary text-white">
    Learn More
  </button>
</article>
```

### Form with Labels

```tsx
<form>
  <div className="mb-4">
    <label className="text-ui font-medium mb-2 block">
      Email Address
    </label>
    <input type="email" className="text-body-sm px-4 py-2" />
    <span className="text-caption text-muted-foreground mt-1 block">
      We'll never share your email
    </span>
  </div>
</form>
```

---

## Testing

Comprehensive tests ensure typography scale consistency:

**Test File**: `__tests__/config/typography-scale.test.ts`

**Coverage**: 36 tests covering:
- Font size values
- Line height compliance
- Font weight specifications
- Responsive behavior
- Tailwind v4 integration
- Accessibility compliance
- Design system alignment

**Run Tests**:
```bash
npm test -- __tests__/config/typography-scale.test.ts
```

---

## Migration Guide

### From Default Tailwind Classes

**Before**:
```tsx
<h1 className="text-4xl font-bold">Title</h1>
<p className="text-base">Content</p>
```

**After**:
```tsx
<h1 className="text-title-1">Title</h1>
<p className="text-body">Content</p>
```

### Benefits

1. **Consistency**: Matches design system exactly
2. **Responsive**: Automatically adjusts for mobile
3. **Semantic**: Clear purpose from class names
4. **Maintainable**: Single source of truth for typography
5. **Accessible**: WCAG-compliant by default

---

## Design Tokens Reference

All typography tokens available in `@theme inline` block:

```css
/* Display Headings */
--font-size-display-1: 72px;
--font-size-display-2: 60px;
--font-size-display-3: 48px;

/* Title Headings (Mobile-optimized) */
--font-size-title-1: 28px;
--font-size-title-2: 24px;
--font-size-title-3: 24px;
--font-size-title-4: 20px;

/* Body Text */
--font-size-body-lg: 18px;
--font-size-body: 16px;
--font-size-body-sm: 14px;

/* UI Text */
--font-size-ui-lg: 16px;
--font-size-ui: 14px;
--font-size-ui-sm: 12px;
--font-size-ui-xs: 11px;

/* Button Text */
--font-size-button-lg: 16px;
--font-size-button: 14px;
--font-size-button-sm: 12px;

/* Caption Text */
--font-size-caption: 12px;
--font-size-caption-sm: 11px;
```

---

## Performance Considerations

1. **CSS Variables**: Efficiently update typography across entire app
2. **No JavaScript**: Pure CSS solution, no runtime overhead
3. **Tailwind v4**: Optimized PostCSS compilation
4. **Minimal Duplication**: Single definition, multiple uses

---

## Additional Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Typography Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)
- [AINative Design System](../design-system/)
- [Color System Documentation](./color-system.md)

---

## Changelog

### 2026-01-31 - Issue #489
- Added mobile-optimized typography scale
- Implemented comprehensive test suite (36 tests)
- Updated `title-1` from 36px to 28px (mobile-optimized)
- Updated `title-2` from 30px to 24px (mobile-optimized)
- Added detailed documentation
- Achieved 100% test coverage for typography configuration
