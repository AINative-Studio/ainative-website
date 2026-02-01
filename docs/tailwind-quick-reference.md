# Tailwind Quick Reference - AINative Studio

## Custom Design Tokens

### Colors

```jsx
// Dark Mode Palette
<div className="bg-dark-1">Darkest</div>
<div className="bg-dark-2">Medium</div>
<div className="bg-dark-3">Lightest</div>

// Brand & Surfaces
<div className="text-brand-primary">Brand Color</div>
<div className="bg-surface-primary">Surface 1</div>
<div className="bg-surface-secondary">Surface 2</div>
<div className="bg-surface-accent">Surface 3</div>
```

### Typography

```jsx
<h1 className="text-title-1">28px, bold, line-height 1.2</h1>
<h2 className="text-title-2">24px, semibold, line-height 1.3</h2>
<p className="text-body">14px, regular, line-height 1.5</p>
<button className="text-button">12px, medium, line-height 1.25</button>
```

### Animations

```jsx
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-in">Slides in</div>
<div className="animate-gradient-shift">Gradient animation</div>
<div className="animate-shimmer">Loading shimmer</div>
<div className="animate-pulse-glow">Pulsing glow</div>
<div className="animate-float">Floating effect</div>
<div className="animate-stagger-in">Staggered entrance</div>
```

### Shadows

```jsx
<button className="shadow-ds-sm">Small shadow</button>
<div className="shadow-ds-md">Medium shadow</div>
<div className="shadow-ds-lg">Large shadow</div>
```

### Components

```jsx
<button className="h-button p-button">40px height, 10px padding</button>
<div className="rounded-lg">Large border radius</div>
<div className="rounded-md">Medium border radius</div>
<div className="rounded-sm">Small border radius</div>
```

## Testing

```bash
# Run tests
npm test -- tailwind.config.test.ts

# With coverage
npm test -- tailwind.config.test.ts --coverage

# Verify configuration
npx tsx test/verify-tailwind-config.ts
```

## IntelliSense

All custom classes have full TypeScript IntelliSense support:
- Auto-complete for custom colors
- Auto-complete for typography scales
- Auto-complete for animations
- Auto-complete for shadows

## Documentation

- **Full Guide**: `/docs/tailwind-design-system.md`
- **Completion Report**: `/docs/issue-487-completion-report.md`
- **Config File**: `/tailwind.config.ts`
- **Tests**: `/tailwind.config.test.ts`
