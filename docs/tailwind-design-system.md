# Tailwind Design System Configuration

## Overview

This document describes the comprehensive Tailwind CSS configuration for the AINative Studio Next.js project. The configuration has been migrated from the Vite source implementation and provides complete design system support with TypeScript type safety and IntelliSense.

## File Location

- **Configuration**: `/tailwind.config.ts`
- **Tests**: `/tailwind.config.test.ts`
- **Coverage**: 100% (49 passing tests)

## Design Tokens

### Color System

#### Dark Mode Palette
```typescript
'dark-1': '#131726',  // Darkest background
'dark-2': '#22263c',  // Medium background
'dark-3': '#31395a',  // Lightest dark background
```

#### Brand Colors
```typescript
'brand-primary': '#5867EF',  // Primary brand color
```

#### Semantic Surface Colors
```typescript
'surface-primary': '#131726',    // Maps to dark-1
'surface-secondary': '#22263c',  // Maps to dark-2
'surface-accent': '#31395a',     // Maps to dark-3
```

#### Primary Variants
```typescript
primary: {
  DEFAULT: '#4B6FED',
  dark: '#3955B8',
}
```

#### Secondary Variants
```typescript
secondary: {
  DEFAULT: '#338585',
  dark: '#1A7575',
}
```

#### Accent Colors
```typescript
accent: {
  DEFAULT: '#FCAE39',
  secondary: '#22BCDE',
}
```

#### Neutral Scale
```typescript
neutral: {
  DEFAULT: '#374151',
  muted: '#6B7280',
  light: '#F3F4F6',
}
```

### Typography Scale

All typography tokens include font-size, line-height, and font-weight:

```typescript
'title-1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
'title-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
'body': ['14px', { lineHeight: '1.5' }],
'button': ['12px', { lineHeight: '1.25', fontWeight: '500' }],
```

**Usage:**
```jsx
<h1 className="text-title-1">Page Title</h1>
<h2 className="text-title-2">Section Title</h2>
<p className="text-body">Body content</p>
<button className="text-button">Button</button>
```

### Animations

#### Available Animations (9+)

1. **accordion-down** - Radix UI accordion expand
2. **accordion-up** - Radix UI accordion collapse
3. **fade-in** - Entrance animation with vertical slide
4. **slide-in** - Entrance animation with horizontal slide
5. **gradient-shift** - Background gradient animation (infinite)
6. **shimmer** - Loading skeleton animation (infinite)
7. **pulse-glow** - Pulsing glow effect (infinite)
8. **float** - Floating hover effect (infinite)
9. **stagger-in** - Staggered entrance animation

**Usage:**
```jsx
<div className="animate-fade-in">Fades in on mount</div>
<div className="animate-pulse-glow">Pulsing glow effect</div>
<div className="animate-float">Floating animation</div>
```

### Design System Shadows

Three-tier shadow system for consistent depth hierarchy:

```typescript
'ds-sm': '0 2px 4px rgba(19, 23, 38, 0.1), 0 1px 2px rgba(19, 23, 38, 0.06)',
'ds-md': '0 4px 8px rgba(19, 23, 38, 0.12), 0 2px 4px rgba(19, 23, 38, 0.08)',
'ds-lg': '0 12px 24px rgba(19, 23, 38, 0.15), 0 4px 8px rgba(19, 23, 38, 0.1)',
```

**Usage:**
```jsx
<button className="shadow-ds-sm">Small shadow</button>
<div className="shadow-ds-md">Card with medium shadow</div>
<div className="shadow-ds-lg">Modal with large shadow</div>
```

### Component Dimensions

```typescript
height: {
  'button': '40px',
},
padding: {
  'button': '10px',
}
```

**Usage:**
```jsx
<button className="h-button p-button">Consistent button</button>
```

### Border Radius

```typescript
borderRadius: {
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)',
}
```

## IntelliSense Support

The configuration provides full IntelliSense support in VS Code and other TypeScript-aware editors:

1. **Color tokens**: Auto-complete for all custom colors
2. **Typography**: Auto-complete for custom font sizes
3. **Animations**: Auto-complete for all animation classes
4. **Shadows**: Auto-complete for design system shadows
5. **Type safety**: TypeScript types ensure configuration validity

## Testing

### Running Tests

```bash
# Run tests
npm test -- tailwind.config.test.ts

# Run with coverage
npm test -- tailwind.config.test.ts --coverage
```

### Test Coverage

- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%
- **Total Tests**: 49 passing

### Test Categories

1. Configuration structure validation
2. Color system completeness
3. Typography scale validation
4. Font family configuration
5. Animation keyframes (9+ animations)
6. Animation classes
7. Design system shadows
8. Border radius system
9. Button dimensions
10. Plugin configuration
11. TypeScript type safety
12. Design system completeness

## Migration Notes

This configuration was migrated from:
- **Source**: `/Users/aideveloper/core/AINative-Website/tailwind.config.cjs`
- **Gap Analysis**: `docs/design-gap-analysis.md` Section 1.1

### Key Differences from Vite Version

- Added TypeScript support
- Added comprehensive JSDoc documentation
- Maintained 100% compatibility with source design tokens
- Added extensive test coverage (100%)

## Integration with Next.js

The configuration integrates seamlessly with Next.js 16:

1. **PostCSS**: Uses `@tailwindcss/postcss` plugin (v4)
2. **Dark Mode**: Class-based strategy (matches Next.js conventions)
3. **Content Paths**: Covers all Next.js directories (app, pages, components, src)
4. **Plugin**: Uses `tailwindcss-animate` for additional animations

## Related Files

- **Global Styles**: `app/globals.css` - CSS variables and theme configuration
- **PostCSS Config**: `postcss.config.mjs` - PostCSS plugin setup
- **Tests**: `tailwind.config.test.ts` - Comprehensive test suite
- **Verification**: `test/verify-tailwind-config.ts` - Runtime verification script

## Future Enhancements

Potential additions (not part of current scope):

- Additional responsive typography scales
- Extended color palette variations
- More animation presets
- Additional shadow tiers
- Custom spacing scale

## Troubleshooting

### IntelliSense Not Working

1. Restart VS Code TypeScript server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Verify `tailwind.config.ts` is in project root
3. Check that `tailwindcss` and `@tailwindcss/postcss` are installed

### Build Errors

1. Verify PostCSS config includes `@tailwindcss/postcss`
2. Check that `tailwindcss-animate` plugin is installed
3. Run `npm run type-check` to verify TypeScript errors

### Class Names Not Applied

1. Verify content paths in `tailwind.config.ts` match your file structure
2. Check that `@import "tailwindcss"` is in `app/globals.css`
3. Clear Next.js cache: `rm -rf .next`

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind v4 Beta](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [Next.js with Tailwind](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
