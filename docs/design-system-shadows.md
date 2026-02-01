# Design System Shadow Guidelines

## Overview

The AINative Studio design system uses a three-tier shadow system for consistent depth hierarchy across all UI components. These shadows are defined in `tailwind.config.ts` and should be used instead of default Tailwind shadow utilities.

## Shadow Tokens

### `shadow-ds-sm` - Small Shadows
**Use for:** Small, floating elements that need subtle elevation
- **Components:** Dropdowns, popovers, tooltips, hover cards, context menus
- **Value:** `0 2px 4px rgba(19, 23, 38, 0.1), 0 1px 2px rgba(19, 23, 38, 0.06)`
- **Elevation:** Low (1-2 levels above surface)

**Example Usage:**
```tsx
// Dropdown Menu
<DropdownMenuContent className="shadow-ds-sm">
  {/* content */}
</DropdownMenuContent>

// Popover
<PopoverContent className="shadow-ds-sm">
  {/* content */}
</PopoverContent>
```

### `shadow-ds-md` - Medium Shadows
**Use for:** Standard cards and containers that need moderate elevation
- **Components:** Cards, panels, sidebars, navigation menus
- **Value:** `0 4px 8px rgba(19, 23, 38, 0.12), 0 2px 4px rgba(19, 23, 38, 0.08)`
- **Elevation:** Medium (3-4 levels above surface)

**Example Usage:**
```tsx
// Card Component
<Card className="shadow-ds-md">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

### `shadow-ds-lg` - Large Shadows
**Use for:** Modal dialogs and overlays that need strong elevation
- **Components:** Dialogs, modals, sheets, drawers, alert dialogs
- **Value:** `0 12px 24px rgba(19, 23, 38, 0.15), 0 4px 8px rgba(19, 23, 38, 0.1)`
- **Elevation:** High (5+ levels above surface)

**Example Usage:**
```tsx
// Dialog
<DialogContent className="shadow-ds-lg">
  <DialogHeader>
    <DialogTitle>Dialog Title</DialogTitle>
  </DialogHeader>
  {/* content */}
</DialogContent>

// Sheet
<SheetContent className="shadow-ds-lg">
  {/* content */}
</SheetContent>
```

## Shadow Color System

All shadows use `rgba(19, 23, 38, ...)` which corresponds to the `dark-1` color (`#131726`) from our design system. This ensures shadows blend naturally with our dark mode interface.

## Implementation Guidelines

### DO ✅
- **Always use design system shadows** (`shadow-ds-sm`, `shadow-ds-md`, `shadow-ds-lg`)
- **Choose appropriate shadow for component hierarchy:**
  - Small floating elements → `shadow-ds-sm`
  - Standard cards/containers → `shadow-ds-md`
  - Modals/overlays → `shadow-ds-lg`
- **Maintain consistency** across similar component types

### DON'T ❌
- **Don't use generic Tailwind shadows** (`shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`)
- **Don't create custom shadow values** outside the design system
- **Don't mix shadow systems** within the same component

## Component Mapping

| Component Type | Shadow Token | Rationale |
|---------------|-------------|-----------|
| Card | `shadow-ds-md` | Standard container, moderate elevation |
| Dialog | `shadow-ds-lg` | High priority overlay |
| Sheet | `shadow-ds-lg` | Side panel overlay |
| Popover | `shadow-ds-sm` | Small floating element |
| Dropdown Menu | `shadow-ds-sm` | Small floating menu |
| Hover Card | `shadow-ds-sm` | Small tooltip-like element |
| Context Menu | `shadow-ds-sm` | Small floating menu |
| Alert Dialog | `shadow-ds-lg` | High priority modal |

## Testing

All shadow implementations are validated in `test/issue-494-shadow-system.test.ts`. The test suite ensures:
- ✅ Shadow tokens exist in Tailwind config
- ✅ Shadow values match design specifications
- ✅ Components use design system shadows
- ✅ No generic Tailwind shadows are used
- ✅ Shadow hierarchy is maintained

Run tests with:
```bash
npm test -- test/issue-494-shadow-system.test.ts
```

## Accessibility Considerations

Shadows play a crucial role in visual hierarchy and help users understand element layering. Proper shadow usage improves:
- **Focus management** - Users can identify active/focused elements
- **Context awareness** - Clear visual separation between overlays and base content
- **Depth perception** - Intuitive understanding of UI structure

## Migration Guide

If you encounter components using generic Tailwind shadows, update them following this pattern:

**Before:**
```tsx
<div className="shadow-lg rounded-lg">
```

**After:**
```tsx
<div className="shadow-ds-lg rounded-lg">
```

**Search for violations:**
```bash
# Find components using generic shadows
grep -r "shadow-\(sm\|md\|lg\|xl\|2xl\)" components/ app/ --include="*.tsx" | grep -v "shadow-ds-"
```

## References

- Tailwind Config: `/Users/aideveloper/ainative-website-nextjs-staging/tailwind.config.ts`
- Test Suite: `/Users/aideveloper/ainative-website-nextjs-staging/test/issue-494-shadow-system.test.ts`
- Related Issues: #494

---

**Last Updated:** 2026-01-31
**Status:** Implemented and tested ✅
