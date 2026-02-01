# Design Tokens Quick Reference

**Last Updated:** 2026-01-31
**Source:** Issue #488 Implementation

---

## Color Tokens

### Dark Mode Palette

```tsx
// Primary Background (Darkest)
className="bg-dark-1"           // #131726
className="text-dark-1"
className="border-dark-1"

// Secondary Surface (Medium)
className="bg-dark-2"           // #22263c
className="border-dark-2"
className="hover:bg-dark-2"

// Accent Surface (Lightest of dark palette)
className="bg-dark-3"           // #31395a
className="border-dark-3"
className="hover:bg-dark-3"
```

### Semantic Surface Aliases

```tsx
// Same as dark-1
className="bg-surface-primary"

// Same as dark-2
className="bg-surface-secondary"

// Same as dark-3
className="bg-surface-accent"
```

### Brand Colors

```tsx
// Primary Brand Color
className="bg-brand-primary"    // #5867EF
className="text-brand-primary"
className="border-brand-primary"

// Primary Variants
className="bg-primary"          // #4B6FED
className="bg-primary-dark"     // #3955B8

// Accent Colors
className="bg-accent"           // #FCAE39
className="bg-accent-secondary" // #22BCDE
```

---

## Common Patterns

### Button

```tsx
// Primary Button
<Button className="bg-brand-primary hover:bg-primary-dark text-white">
  Click Me
</Button>

// Outline Button
<Button className="border-2 border-dark-2 hover:border-brand-primary/40 bg-transparent">
  Outline
</Button>

// Ghost Button
<Button className="hover:bg-dark-3 text-foreground">
  Ghost
</Button>
```

### Card

```tsx
// Standard Card
<Card className="bg-dark-2 border-dark-3/50 hover:border-brand-primary/30">
  <CardContent>Card content here</CardContent>
</Card>

// Glassmorphism Card
<CardAdvanced variant="glassmorphism">
  {/* Uses bg-dark-2/60 with backdrop blur */}
</CardAdvanced>

// Elevated Card
<Card className="bg-dark-3 shadow-ds-lg">
  {/* Raised above surface */}
</Card>
```

### Header/Navigation

```tsx
// App Header
<header className="bg-dark-1 border-b border-dark-3">
  {/* Navigation items */}
</header>

// Sidebar
<aside className="bg-dark-1 border-r border-dark-3">
  {/* Sidebar content */}
</aside>
```

### Input

```tsx
// Standard Input
<Input className="border-input focus-visible:ring-ring" />

// Custom Border
<Input className="border-dark-2 focus-visible:ring-brand-primary" />
```

---

## Usage Guidelines

### When to Use Each Token

| Token | Use Case | Examples |
|-------|----------|----------|
| `dark-1` | Page backgrounds, app shells | Header, Sidebar, Page wrapper |
| `dark-2` | Primary content surfaces | Cards, Modals, Panels |
| `dark-3` | Borders, elevated elements | Card borders, Hover states |
| `brand-primary` | Primary actions, brand accents | Buttons, Links, Active states |
| `accent` | Secondary highlights | Badges, Tags, Alerts |

### Opacity Variants

```tsx
// 60% opacity (glassmorphism)
className="bg-dark-2/60"

// 50% opacity (overlays)
className="bg-dark-1/50"

// 20% opacity (subtle highlights)
className="bg-brand-primary/20"
```

### Hover States

```tsx
// Subtle hover
className="hover:bg-dark-2"

// Elevated hover
className="hover:bg-dark-3 hover:shadow-ds-md"

// Brand highlight hover
className="hover:border-brand-primary/40"
```

---

## Typography Scale

```tsx
// Titles
className="text-title-1"  // 28px, bold, for main headings
className="text-title-2"  // 24px, semibold, for sub-headings

// Body
className="text-body"     // 14px, for content text

// Buttons
className="text-button"   // 12px, medium weight, uppercase
```

---

## Shadows

```tsx
// Small elements (buttons, inputs)
className="shadow-ds-sm"

// Medium elements (cards, dropdowns)
className="shadow-ds-md"

// Large elements (modals, popovers)
className="shadow-ds-lg"
```

---

## Accessibility

### Focus Indicators

```tsx
// Standard focus ring
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

// Brand color focus ring
className="focus-visible:ring-2 focus-visible:ring-brand-primary"

// With offset
className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### Contrast Requirements

| Element Type | Min Contrast | Recommended Token Pairing |
|-------------|--------------|---------------------------|
| Normal text | 4.5:1 | White on `dark-2` ✅ |
| Large text | 3:1 | White on `dark-3` ✅ |
| UI components | 3:1 | `dark-3` border on `dark-2` bg ✅ |
| Focus indicators | 3:1 | `brand-primary` ring ✅ |

---

## Light/Dark Mode Support

### Using Theme-Aware Tokens

```tsx
// Automatically adapts
className="bg-background text-foreground"

// Explicit dark mode variant
className="text-gray-900 dark:text-white"

// Card background (theme-aware)
className="bg-card text-card-foreground"
```

### Best Practices

1. **Prefer semantic tokens** for automatic theme switching
   ```tsx
   ✅ className="bg-background"
   ❌ className="bg-white dark:bg-dark-1"
   ```

2. **Use design tokens** for brand-specific colors
   ```tsx
   ✅ className="bg-brand-primary"
   ❌ className="bg-[#5867EF]"
   ```

3. **Add dark: prefix** when needed
   ```tsx
   ✅ className="text-foreground dark:text-white"
   ```

---

## Migration Checklist

When updating existing components:

- [ ] Replace `bg-[#XXXXXX]` with semantic token
- [ ] Replace `border-[#XXXXXX]` with border token
- [ ] Replace `text-[#XXXXXX]` with text token
- [ ] Add `dark:` variants if needed
- [ ] Update hover states to use tokens
- [ ] Verify focus indicators use `ring-ring` or `ring-brand-primary`
- [ ] Test in both light and dark mode
- [ ] Check contrast ratios with WebAIM tool

---

## IntelliSense

With `tailwind.config.ts`, you get autocomplete for:

- `bg-dark-1`, `bg-dark-2`, `bg-dark-3`
- `border-dark-1`, `border-dark-2`, `border-dark-3`
- `text-brand-primary`, `border-brand-primary`
- `shadow-ds-sm`, `shadow-ds-md`, `shadow-ds-lg`
- `text-title-1`, `text-title-2`, `text-body`

**Tip:** Type `bg-` and press Ctrl+Space to see all available background tokens.

---

## Examples

### Dashboard Card

```tsx
<Card className="bg-dark-2 border-dark-3/50 hover:border-brand-primary/30 hover:shadow-ds-lg transition-all duration-300">
  <CardHeader>
    <CardTitle className="text-title-2 text-white">Dashboard</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-body text-gray-400">Content here</p>
  </CardContent>
</Card>
```

### Call-to-Action Button

```tsx
<Button className="bg-brand-primary hover:bg-primary-dark text-white shadow-ds-sm hover:shadow-ds-md transform hover:-translate-y-0.5 transition-all duration-300">
  Get Started
</Button>
```

### Navigation Item

```tsx
<Link
  href="/dashboard"
  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-dark-3 text-foreground hover:text-white transition-colors"
>
  <DashboardIcon />
  Dashboard
</Link>
```

---

## Resources

- **Tailwind Config:** `/tailwind.config.ts`
- **Implementation Guide:** `/docs/issue-488-implementation.md`
- **Audit Script:** `/test/audit-token-usage.sh`
- **Test Suite:** `/test/issue-488-dark-mode-tokens.test.tsx`
- **Design Gap Analysis:** `/docs/design-gap-analysis.md`

---

## Quick Commands

```bash
# Check current token usage
./test/audit-token-usage.sh

# Find hardcoded colors in a file
grep -n "\[#[0-9A-Fa-f]\{6\}\]" path/to/file.tsx

# Run tests
npm test test/issue-488-dark-mode-tokens.test.tsx

# Type check
npm run type-check
```

---

**Maintainer:** Frontend Team
**Last Review:** 2026-01-31
**Next Review:** 2026-02-15
