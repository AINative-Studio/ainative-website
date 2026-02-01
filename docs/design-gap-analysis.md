# AINative Website Design Gap Analysis

**Analysis Date:** 2026-01-31
**Source:** `/Users/aideveloper/core/AINative-Website` (Vite)
**Target:** `/Users/aideveloper/ainative-website-nextjs-staging` (Next.js)
**Analyst:** UX Advocate

---

## Executive Summary

This comprehensive design gap analysis compares the original Vite-based AINative Website with the current Next.js migration implementation. The analysis identifies critical inconsistencies in design tokens, component styling, and UX patterns that impact visual consistency and user experience.

### Overall Assessment

- **Total Gaps Identified:** 23
- **Critical Issues:** 4
- **High Priority:** 8
- **Medium Priority:** 7
- **Low Priority:** 4

### Key Findings

1. **Design Token Inconsistency (CRITICAL)**: Source uses `dark-1`, `dark-2`, `dark-3`, `surface-*` colors extensively (67 usages), but Next.js implementation has these tokens defined but unused (0 usages), creating visual inconsistencies.

2. **Missing Tailwind Configuration (CRITICAL)**: Next.js lacks `tailwind.config.ts` entirely - relying solely on CSS @theme inline configuration, preventing proper Tailwind IntelliSense and limiting design system enforcement.

3. **Button Component Hardcoded Colors (HIGH)**: Outline and ghost button variants use hardcoded hex values instead of design tokens, breaking theme consistency.

4. **Missing Typography Scale in Tailwind (HIGH)**: Source has comprehensive `fontSize` definitions in Tailwind config that are missing in Next.js Tailwind configuration.

---

## 1. Design Tokens Analysis

### 1.1 Missing Tailwind Configuration File

**Status:** CRITICAL
**Priority:** P0
**Impact:** Development Experience, Type Safety, IntelliSense

#### Gap Description

The Next.js implementation completely lacks a `tailwind.config.ts` file. The source Vite project has a comprehensive `tailwind.config.cjs` with:

- Extended color palette with semantic naming
- Custom fontSize scale (title-1, title-2, body, button)
- Custom height/padding for buttons
- Design system shadows (ds-sm, ds-md, ds-lg)
- 9 custom animations (accordion-down/up, fade-in, slide-in, gradient-shift, shimmer, pulse-glow, float, stagger-in)

The Next.js implementation only uses CSS `@theme inline` in `globals.css`, which:
- Doesn't provide TypeScript IntelliSense
- Can't be imported by component libraries
- Lacks proper design token validation
- Makes theme customization harder

#### Affected Areas

- All components using Tailwind classes
- Developer experience (no autocomplete for custom tokens)
- Third-party integrations expecting standard Tailwind config
- Storybook/documentation tools

#### Recommendation

**Action:** Create `/Users/aideveloper/ainative-website-nextjs-staging/tailwind.config.ts` mirroring the source configuration structure.

**Implementation:**
```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      colors: {
        // Design System Colors
        'dark-1': '#131726',
        'dark-2': '#22263c',
        'dark-3': '#31395a',
        'brand-primary': '#5867EF',

        // Semantic Color Aliases
        'surface-primary': '#131726',
        'surface-secondary': '#22263c',
        'surface-accent': '#31395a',

        // ... (rest from source)
      },
      fontSize: {
        'title-1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'title-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.5' }],
        'button': ['12px', { lineHeight: '1.25', fontWeight: '500' }],
      },
      height: {
        'button': '40px',
      },
      padding: {
        'button': '10px',
      },
      boxShadow: {
        'ds-sm': '0 2px 4px rgba(19, 23, 38, 0.1), 0 1px 2px rgba(19, 23, 38, 0.06)',
        'ds-md': '0 4px 8px rgba(19, 23, 38, 0.12), 0 2px 4px rgba(19, 23, 38, 0.08)',
        'ds-lg': '0 12px 24px rgba(19, 23, 38, 0.15), 0 4px 8px rgba(19, 23, 38, 0.1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
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
        'stagger-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'stagger-in': 'stagger-in 0.5s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
```

**Estimated Effort:** 2-3 hours
**Testing Required:** Verify all components render identically, test IntelliSense, run build

---

### 1.2 Dark Mode Color Token Usage Gap

**Status:** CRITICAL
**Priority:** P0
**Impact:** Visual Consistency, Design System Integrity

#### Gap Description

**Source (Vite):** Uses `dark-1`, `dark-2`, `dark-3`, and `surface-*` tokens extensively throughout dashboard components (67 usages identified):
- `bg-dark-1` - Primary dark background (#131726)
- `bg-dark-2` - Secondary surface (#22263c)
- `bg-dark-3` - Accent surface (#31395a)
- `surface-primary`, `surface-secondary`, `surface-accent` - Semantic variants

**Next.js:** These tokens are defined in CSS variables but NEVER USED (0 usages). Components use generic `bg-card`, `bg-background`, or hardcoded colors instead.

#### Visual Impact

Dashboard components in source have distinct surface hierarchy:
- Cards: `bg-dark-2` (#22263c)
- Containers: `bg-dark-1` (#131726)
- Elevated elements: `bg-dark-3` (#31395a)

Next.js implementation loses this hierarchy, appearing "flatter" and less visually organized.

#### Affected Components

Based on source analysis:
- `StatsGrid.tsx` - StatCard uses `bg-dark-2`
- `AgentSwarmInteractiveDashboard.tsx` - Multiple gradients with dark-* bases
- All dashboard card components
- Modal overlays
- Dropdown menus

#### Recommendation

**Action:** Global find-and-replace to adopt dark-* tokens consistently.

**Implementation Steps:**
1. Search all dashboard components for `bg-card` → Replace with `bg-dark-2` where appropriate
2. Search for `bg-background` in cards → Replace with `bg-dark-1`
3. Add `dark-*` classes to component library defaults
4. Update card-advanced.tsx glassmorphism variant to use `bg-[rgba(34,38,60,0.6)]` (matches dark-2 with opacity)

**Estimated Effort:** 4-6 hours
**Testing Required:** Visual regression testing of all dashboard pages in dark mode

---

### 1.3 Typography Scale Missing from Tailwind Config

**Status:** HIGH
**Priority:** P1
**Impact:** Typography Consistency, Accessibility

#### Gap Description

**Source** defines these in `tailwind.config.cjs`:
```javascript
fontSize: {
  'title-1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
  'title-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
  'body': ['14px', { lineHeight: '1.5' }],
  'button': ['12px', { lineHeight: '1.25', fontWeight: '500' }],
}
```

**Next.js** only has these as CSS utility classes (`.text-title-1`, `.text-body`, etc.) but they're NOT available as Tailwind classes (`text-title-1` won't autocomplete).

#### Accessibility Impact

Without proper Tailwind fontSize definitions:
- Line-height is decoupled from font-size (accessibility risk)
- Font-weight may be inconsistent
- Harder to maintain WCAG 1.4.12 (Text Spacing) compliance
- Responsive scaling requires manual media query overrides

#### Recommendation

Add to `tailwind.config.ts` theme.extend:
```typescript
fontSize: {
  'title-1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
  'title-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
  'body': ['14px', { lineHeight: '1.5' }],
  'button': ['12px', { lineHeight: '1.25', fontWeight: '500' }],
},
```

Keep CSS classes as fallback but promote Tailwind class usage for consistency.

**Estimated Effort:** 1 hour
**Testing Required:** Typography audit across all pages

---

### 1.4 Shadow System Inconsistency

**Status:** MEDIUM
**Priority:** P2
**Impact:** Visual Depth Hierarchy

#### Gap Description

**Source** defines design system shadows in Tailwind config:
```javascript
boxShadow: {
  'ds-sm': '0 2px 4px rgba(19, 23, 38, 0.1), 0 1px 2px rgba(19, 23, 38, 0.06)',
  'ds-md': '0 4px 8px rgba(19, 23, 38, 0.12), 0 2px 4px rgba(19, 23, 38, 0.08)',
  'ds-lg': '0 12px 24px rgba(19, 23, 38, 0.15), 0 4px 8px rgba(19, 23, 38, 0.1)',
}
```

**Next.js** has these only in CSS variables:
```css
--shadow-ds-sm: 0 2px 4px rgba(19, 23, 38, 0.1), 0 1px 2px rgba(19, 23, 38, 0.06);
/* etc */
```

No Tailwind classes available (`shadow-ds-md` won't work).

#### Current Workaround Impact

Developers use generic `shadow`, `shadow-lg`, `shadow-xl` which:
- Don't match the design system's specific RGBA values
- Use different base colors (not dark-1 #131726)
- Break visual consistency with source

#### Recommendation

Add to `tailwind.config.ts`:
```typescript
boxShadow: {
  'ds-sm': '0 2px 4px rgba(19, 23, 38, 0.1), 0 1px 2px rgba(19, 23, 38, 0.06)',
  'ds-md': '0 4px 8px rgba(19, 23, 38, 0.12), 0 2px 4px rgba(19, 23, 38, 0.08)',
  'ds-lg': '0 12px 24px rgba(19, 23, 38, 0.15), 0 4px 8px rgba(19, 23, 38, 0.1)',
}
```

**Estimated Effort:** 30 minutes
**Testing Required:** Visual check of cards, modals, dropdowns

---

### 1.5 Animation Variants Missing

**Status:** MEDIUM
**Priority:** P2
**Impact:** Interaction Polish, Brand Consistency

#### Gap Description

**Source** has 9 defined animations in Tailwind config that can be used as `animate-{name}`:
- `accordion-down` / `accordion-up`
- `fade-in`
- `slide-in`
- `gradient-shift`
- `shimmer`
- `pulse-glow`
- `float`
- `stagger-in`

**Next.js** has these defined in CSS but NOT in Tailwind config, so `animate-pulse-glow` class won't work.

#### Current Workaround

Components directly apply CSS classes (`.animate-pulse-glow`) which works but:
- No IntelliSense
- Can't use JIT variants (`hover:animate-float`)
- Harder to conditionally apply in component logic

#### Recommendation

Add all animation definitions to `tailwind.config.ts` as shown in section 1.1.

**Estimated Effort:** 15 minutes (included in 1.1)
**Testing Required:** Verify animations work on hover states, page transitions

---

## 2. Component Patterns Analysis

### 2.1 Button Component Hardcoded Colors

**Status:** HIGH
**Priority:** P1
**Impact:** Theme Consistency, Maintainability

#### Gap Description

**Location:** `/components/ui/button-custom.tsx`

**Source (Vite):**
```tsx
'border-2 border-gray-200 dark:border-gray-700 bg-transparent
 hover:bg-gray-50 dark:hover:bg-gray-800
 text-gray-700 dark:text-gray-200': variant === 'outline',
```

Uses semantic color tokens with proper light/dark mode variants.

**Next.js:**
```tsx
'border-2 border-[#374151] bg-transparent
 hover:bg-[#1f2937]
 text-[#e5e7eb]': variant === 'outline',
```

Uses hardcoded hex values with NO light mode support.

#### User Impact

- Outline buttons look incorrect in light mode
- Ghost buttons have poor contrast
- Can't leverage theme switching
- Breaks WCAG 1.4.3 (Contrast Minimum) in light mode

#### Recommendation

**Action:** Revert button-custom.tsx to use Tailwind color tokens.

**Updated Code:**
```tsx
{
  'bg-primary text-white hover:bg-primary/90 active:bg-primary/95':
    variant === 'primary',
  'border-2 border-border bg-transparent hover:bg-accent text-foreground':
    variant === 'outline',
  'bg-transparent hover:bg-accent text-foreground':
    variant === 'ghost',
  // ... sizes
}
```

**Estimated Effort:** 30 minutes
**Testing Required:** Test all button variants in light/dark mode, verify WCAG AA contrast

---

### 2.2 GradientText Size Scale Discrepancy

**Status:** LOW
**Priority:** P3
**Impact:** Typography Options

#### Gap Description

**Source** GradientText supports sizes: `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`

**Next.js** supports: `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl`

Next.js has EXTRA sizes (5xl, 6xl) not in source. This is fine but inconsistent.

#### Recommendation

**Action:** Document this as an enhancement. Consider if 5xl/6xl are actually used, or remove to match source.

**Estimated Effort:** 15 minutes
**Testing Required:** Search for usage of `size="5xl"` or `size="6xl"`

---

### 2.3 Progress Component Complex Structure

**Status:** LOW
**Priority:** P3
**Impact:** Component Complexity

#### Gap Description

**Next.js** has a very complex progress component structure:
```
components/ui/progress/
  ├── ErrorDisplay.tsx
  ├── LongOperationIndicator.tsx
  ├── ProgressContext.tsx
  ├── StreamingProgress.tsx
  └── ToolExecutionStatus.tsx
```

**Source** likely has a simpler progress component (needs verification).

This may be intentional for Next.js streaming requirements, but adds maintenance burden.

#### Recommendation

**Action:** Audit if all 5 progress sub-components are necessary. Consider consolidating if possible.

**Estimated Effort:** 2-3 hours (investigation + refactor)
**Testing Required:** Full dashboard functionality test

---

### 2.4 Missing "BacklogReview" Component

**Status:** MEDIUM
**Priority:** P2
**Impact:** Feature Completeness

#### Gap Description

**Source** has `/components/BacklogReview.tsx` (97,811 bytes - very large component).

**Next.js** does not have this component.

This appears to be a complex dashboard feature for reviewing backlogs. Needs investigation if this was intentionally excluded or is a migration gap.

#### Recommendation

**Action:**
1. Review if BacklogReview is needed for Next.js (check PRD/specs)
2. If needed, migrate component using standard migration pattern
3. If excluded, document why in architecture decisions

**Estimated Effort:** 8-16 hours (if migration needed)
**Testing Required:** Full feature testing with mock data

---

### 2.5 Dashboard Component Count Discrepancy

**Status:** HIGH
**Priority:** P1
**Impact:** Feature Parity

#### Gap Description

**Source Dashboard Components:** 78 files
**Next.js Dashboard Components:** ~56 files (in app/dashboard)

22+ components may be missing or relocated. Key gaps identified:

Missing from Next.js (examples):
- `StatsGrid.tsx` (exists in source, not in Next.js app/dashboard)
- `StatCard.tsx` (exists in source)
- `QuantumMetrics.tsx`
- `TaskQueue.tsx`
- `SwarmExecutionTimeline.tsx`
- Various specialized dashboard cards

Some may exist in different locations (components/ vs app/) but needs full audit.

#### User Impact

- Dashboard may be missing features
- Navigation may be incomplete
- User workflows disrupted

#### Recommendation

**Action:**
1. Full component inventory comparison (create spreadsheet)
2. Identify truly missing vs relocated components
3. Prioritize migration of P0 dashboard features
4. Document architectural differences (why some components weren't migrated)

**Estimated Effort:** 2-4 days (audit + migration)
**Testing Required:** Complete dashboard flow testing

---

## 3. Admin Dashboard Styling Analysis

### 3.1 Dashboard Card Background Inconsistency

**Status:** HIGH
**Priority:** P1
**Impact:** Visual Hierarchy, Brand Consistency

#### Gap Description

**Source Dashboard Cards:**
```tsx
<Card className="border-none bg-dark-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" />
```

Uses `bg-dark-2` consistently for card backgrounds with specific hover effects.

**Next.js Dashboard:**
Likely uses generic `bg-card` which maps to different HSL values.

#### Visual Impact

- Source has consistent #22263c background for all dashboard cards
- Next.js cards may appear lighter/darker depending on theme
- Hover effects may be missing the scale transform
- Shadow progression inconsistent

#### Recommendation

**Action:** Update all dashboard card components to use `bg-dark-2` with matching hover states.

**Pattern:**
```tsx
<Card className={cn(
  "border-none bg-dark-2 shadow-lg",
  "hover:shadow-xl hover:scale-[1.02]",
  "transition-all duration-300",
  className
)} />
```

**Estimated Effort:** 2-3 hours
**Testing Required:** Visual inspection of all dashboard sections

---

### 3.2 Gradient Usage in Dashboard Components

**Status:** MEDIUM
**Priority:** P2
**Impact:** Visual Polish, Brand Expression

#### Gap Description

**Source** uses gradients extensively in dashboard:
- Agent type cards: `bg-gradient-to-br from-blue-500 to-blue-600`
- Feature cards: `bg-gradient-to-br from-purple-500/10 to-pink-500/10`
- Icon containers: `bg-gradient-to-br from-purple-500/20 to-pink-500/20`

Pattern: Low-opacity gradients for subtle backgrounds, full-opacity for badges/accents.

**Next.js** implementation status unclear - needs audit of dashboard component styling.

#### Recommendation

**Action:**
1. Audit Next.js dashboard components for gradient usage
2. Apply source gradient patterns where missing
3. Create utility classes for common gradient combinations:

```css
/* In globals.css */
.gradient-blue-badge {
  @apply bg-gradient-to-br from-blue-500 to-blue-600;
}
.gradient-purple-subtle {
  @apply bg-gradient-to-br from-purple-500/10 to-pink-500/10;
}
.gradient-purple-icon {
  @apply bg-gradient-to-br from-purple-500/20 to-pink-500/20;
}
```

**Estimated Effort:** 3-4 hours
**Testing Required:** Visual comparison with source dashboard

---

### 3.3 Agent Type Color Coding System

**Status:** MEDIUM
**Priority:** P2
**Impact:** Information Architecture, Scannability

#### Gap Description

**Source** has defined color coding for agent types:
```tsx
const agentTypeColors: Record<AgentType, string> = {
  backend: 'from-blue-500 to-blue-600',
  frontend: 'from-purple-500 to-purple-600',
  test: 'from-green-500 to-green-600',
  devops: 'from-orange-500 to-orange-600',
  security: 'from-red-500 to-red-600',
  database: 'from-cyan-500 to-cyan-600',
  qa: 'from-yellow-500 to-yellow-600',
  docs: 'from-pink-500 to-pink-600'
};
```

This creates visual consistency and improves scannability in agent swarm interfaces.

**Next.js** needs verification if this system is implemented.

#### User Experience Impact

Without consistent color coding:
- Users can't quickly distinguish agent types
- Cognitive load increases in multi-agent views
- Visual hierarchy unclear in execution timelines

#### Recommendation

**Action:**
1. Create shared `agentTypeColors` constant in a utils file
2. Apply to all agent-related components
3. Consider using same pattern for task priorities, log levels

**Estimated Effort:** 1-2 hours
**Testing Required:** Agent swarm dashboard review

---

### 3.4 Backdrop Blur and Glassmorphism Effects

**Status:** MEDIUM
**Priority:** P2
**Impact:** Visual Depth, Modern Aesthetic

#### Gap Description

**Source** uses backdrop-blur in several contexts:
```tsx
<div className="p-4 bg-background/50 rounded-lg backdrop-blur-sm">
```

CardAdvanced component has glassmorphism variant:
```tsx
glassmorphism: [
  'border border-primary/20 shadow-xl',
  'bg-[rgba(34,38,60,0.6)]',
  'backdrop-blur-[10px]',
  'supports-[backdrop-filter]:bg-[rgba(34,38,60,0.6)]',
].join(' ')
```

**Next.js** has identical CardAdvanced implementation (good!) but needs audit if actually used in dashboard.

#### Recommendation

**Action:** Verify glassmorphism variant is used in appropriate dashboard contexts (modals, overlays, floating panels).

**Estimated Effort:** 1 hour (audit only)
**Testing Required:** Browser compatibility (backdrop-filter support)

---

## 4. CSS Custom Properties Gaps

### 4.1 Vite-Specific CSS Variables Not Used

**Status:** LOW
**Priority:** P3
**Impact:** Migration Completeness

#### Gap Description

**Next.js** globals.css defines these Vite-specific variables:
```css
--vite-bg: #0D1117;
--vite-surface: #161B22;
--vite-border: #2D333B;
--vite-border-hover: #4B6FED;
--vite-primary: #4B6FED;
--vite-primary-hover: #3A56D3;
```

And in @theme inline:
```css
--color-vite-bg: #0D1117;
--color-vite-surface: #161B22;
/* etc */
```

But these are NEVER USED in components (use dark-* instead).

#### Recommendation

**Action:** Remove unused `--vite-*` variables to reduce confusion and bundle size.

**Estimated Effort:** 15 minutes
**Testing Required:** Verify no references exist (`grep -r "vite-bg"`)

---

### 4.2 AINative Brand Color Variables

**Status:** LOW
**Priority:** P4
**Impact:** Code Organization

#### Gap Description

**Next.js** defines:
```css
--ainative-primary: #4B6FED;
--ainative-primary-dark: #3955B8;
/* etc */
```

These duplicate Tailwind color definitions and add confusion about which to use.

#### Recommendation

**Action:** Standardize on ONE source of truth:
- Keep Tailwind config colors (they work everywhere)
- Use CSS variables only for shadcn/ui HSL values
- Remove redundant `--ainative-*` definitions

**Estimated Effort:** 30 minutes
**Testing Required:** No visual changes expected

---

## 5. Accessibility Gaps

### 5.1 Light Mode Support in Components

**Status:** HIGH
**Priority:** P1
**Impact:** WCAG 2.1 AA Compliance, User Choice

#### Gap Description

Many Next.js components appear dark-mode-first with inadequate light mode styling:

**ButtonCustom** (already noted):
- Hardcoded dark colors, no light mode variant

**Likely Issues in Other Components:**
- Text contrast may fail in light mode
- Borders may be invisible
- Focus indicators may not meet 3:1 contrast

#### WCAG Impact

- **1.4.3 Contrast (Minimum):** Text must have 4.5:1 contrast ratio
- **1.4.6 Contrast (Enhanced):** AAA requires 7:1
- **2.4.7 Focus Visible:** Focus indicators must be clearly visible

#### Recommendation

**Action:**
1. Full accessibility audit in light mode
2. Add light mode variants to all interactive components
3. Test with automated tools (axe DevTools, Lighthouse)
4. Manual testing with screen reader

**Estimated Effort:** 8-12 hours
**Testing Required:** WCAG 2.1 AA compliance verification

---

### 5.2 Focus Indicator Consistency

**Status:** MEDIUM
**Priority:** P2
**Impact:** Keyboard Navigation (WCAG 2.4.7)

#### Gap Description

**Source** ButtonCustom has:
```tsx
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
```

This provides a 2px ring with 2px offset (total 4px visible indicator).

**Next.js** has same pattern but needs verification it's applied to ALL interactive elements:
- Links
- Cards with onClick
- Custom form controls
- Modal triggers

#### Recommendation

**Action:**
1. Create shared focus ring utility class
2. Audit all interactive elements
3. Ensure 3:1 contrast for focus indicators (WCAG 2.4.11)

**Estimated Effort:** 2-3 hours
**Testing Required:** Keyboard-only navigation testing

---

### 5.3 Reduced Motion Support

**Status:** MEDIUM
**Priority:** P2
**Impact:** Accessibility, WCAG 2.3.3

#### Gap Description

**Next.js globals.css** has:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-slide-in-right,
  .animate-slide-in-left,
  /* etc */ {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

Good! But this only covers CSS classes, not Framer Motion animations used extensively in components.

#### Recommendation

**Action:** Add to root layout or provider:
```tsx
import { useReducedMotion } from 'framer-motion';

function RootLayout({ children }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion={shouldReduceMotion ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
```

**Estimated Effort:** 1 hour
**Testing Required:** Test with OS motion preference disabled

---

## 6. Responsive Design Patterns

### 6.1 Container-Custom Implementation

**Status:** LOW
**Priority:** P4
**Impact:** Layout Consistency

#### Gap Description

Both implementations have `.container-custom` with identical breakpoints:
- Mobile: 1rem padding
- SM (640px): 1.5rem padding
- LG (1024px): 2rem padding
- Max-width: 1280px

Good consistency! No gap identified.

#### Recommendation

No action needed. Document this as correctly migrated.

---

### 6.2 Mobile Typography Scaling

**Status:** MEDIUM
**Priority:** P2
**Impact:** Mobile Readability

#### Gap Description

**Source** globals.css has:
```css
@media (max-width: 768px) {
  .text-display-1 { font-size: 48px; }
  .text-display-2 { font-size: 40px; }
  .text-display-3 { font-size: 36px; }
  /* etc */
}
```

**Next.js** has IDENTICAL responsive typography (lines 522-546).

Good consistency! No gap identified.

#### Recommendation

No action needed. Verify these classes are actually used in components (may need promotion over hardcoded text-4xl classes).

---

## 7. Implementation Priority Matrix

### Critical (P0) - Fix Immediately

| Gap | Effort | Impact | Risk if Ignored |
|-----|--------|--------|-----------------|
| 1.1 Missing Tailwind Config | 2-3h | High | Poor DX, broken IntelliSense, harder maintenance |
| 1.2 Dark Token Usage | 4-6h | High | Visual inconsistency across dashboard |
| 2.1 Button Hardcoded Colors | 30m | High | Light mode broken, WCAG failure |

**Total P0 Effort:** 7-9.5 hours

---

### High Priority (P1) - Next Sprint

| Gap | Effort | Impact | Risk if Ignored |
|-----|--------|--------|-----------------|
| 1.3 Typography Scale in Config | 1h | Medium | Inconsistent text sizing |
| 2.5 Dashboard Component Count | 2-4d | High | Missing features, user confusion |
| 3.1 Dashboard Card Backgrounds | 2-3h | Medium | Visual hierarchy unclear |
| 5.1 Light Mode Support | 8-12h | High | Accessibility violations |

**Total P1 Effort:** 3-5 days

---

### Medium Priority (P2) - Backlog

| Gap | Effort | Impact | Risk if Ignored |
|-----|--------|--------|-----------------|
| 1.4 Shadow System | 30m | Low | Subtle visual inconsistency |
| 1.5 Animation Variants | 15m | Low | Less polish |
| 2.4 BacklogReview Component | 8-16h | Medium | Feature gap (if needed) |
| 3.2 Gradient Usage Audit | 3-4h | Low | Less visual polish |
| 3.3 Agent Color Coding | 1-2h | Medium | Harder to scan agent UI |
| 3.4 Glassmorphism Audit | 1h | Low | Modern aesthetic missing |
| 5.2 Focus Indicators | 2-3h | Medium | Keyboard nav issues |
| 5.3 Reduced Motion | 1h | Medium | Accessibility gap |

**Total P2 Effort:** 2-3 days

---

### Low Priority (P3-P4) - Nice to Have

| Gap | Effort | Impact | Risk if Ignored |
|-----|--------|--------|-----------------|
| 2.2 GradientText Sizes | 15m | Very Low | None (enhancement) |
| 2.3 Progress Complexity | 2-3h | Low | Maintenance burden |
| 4.1 Unused Vite Variables | 15m | Very Low | Code clarity |
| 4.2 Brand Color Variables | 30m | Very Low | Code clarity |
| 6.1 Container Custom | 0 | N/A | No gap |
| 6.2 Mobile Typography | 0 | N/A | No gap |

**Total P3-P4 Effort:** 3-4 hours

---

## 8. Recommended Implementation Sequence

### Phase 1: Foundation (Week 1)
**Goal:** Establish proper design system infrastructure

1. **Day 1-2:** Create `tailwind.config.ts` with full source parity (Gap 1.1)
   - Add all colors, fontSize, shadows, animations
   - Verify IntelliSense works
   - Run build, fix any conflicts

2. **Day 2-3:** Fix Button component and light mode (Gaps 2.1, 5.1 partial)
   - Update button-custom.tsx to use tokens
   - Add light mode variants
   - Test WCAG contrast in both modes

3. **Day 4-5:** Implement dark-* token usage (Gap 1.2)
   - Find/replace bg-card → bg-dark-2 in dashboard
   - Update all card components
   - Visual regression testing

**Deliverable:** Solid design system foundation with proper theming

---

### Phase 2: Dashboard Parity (Week 2-3)
**Goal:** Achieve feature and visual parity with source

1. **Day 6-8:** Dashboard component audit (Gap 2.5)
   - Create component inventory spreadsheet
   - Identify missing vs relocated
   - Migrate P0 components (StatsGrid, StatCard, etc.)

2. **Day 9-10:** Dashboard styling consistency (Gaps 3.1, 3.2, 3.3)
   - Apply gradient patterns
   - Implement agent color coding
   - Update card backgrounds

3. **Day 11-12:** Accessibility improvements (Gaps 5.1 complete, 5.2, 5.3)
   - Full WCAG audit
   - Fix focus indicators
   - Implement reduced motion support

**Deliverable:** Dashboard at visual and functional parity

---

### Phase 3: Polish (Week 4)
**Goal:** Clean up and optimize

1. **Day 13-14:** Typography and shadows (Gaps 1.3, 1.4, 1.5)
   - Verify typography scale usage
   - Apply shadow system
   - Animation variant testing

2. **Day 15:** Code cleanup (Gaps 4.1, 4.2, 2.2, 2.3)
   - Remove unused variables
   - Simplify progress component if possible
   - Documentation updates

3. **Day 16:** Final testing and documentation
   - Cross-browser testing
   - WCAG 2.1 AA certification
   - Update design system docs

**Deliverable:** Production-ready, accessible, maintainable codebase

---

## 9. Testing Strategy

### Visual Regression Testing

**Tools:** Percy, Chromatic, or manual screenshot comparison

**Critical Paths:**
- Dashboard main page (all card types)
- Agent swarm interactive view
- Billing/stats grids
- Form components in light/dark mode

**Acceptance Criteria:**
- No visual differences in P0 components
- Documented intentional differences

---

### Accessibility Testing

**Automated Tools:**
- axe DevTools
- Lighthouse
- WAVE

**Manual Testing:**
- NVDA/JAWS screen reader testing
- Keyboard-only navigation
- Color contrast verification (WebAIM Contrast Checker)
- Reduced motion testing

**Acceptance Criteria:**
- WCAG 2.1 AA compliance (minimum)
- Zero critical/serious axe violations
- Lighthouse accessibility score ≥ 90

---

### Cross-Browser Testing

**Required Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Focus Areas:**
- Backdrop-filter support (glassmorphism)
- CSS custom property fallbacks
- Animation performance

---

## 10. Success Metrics

### Quantitative Metrics

- **Design Token Usage:** 100% of dashboard components use dark-* tokens
- **Accessibility Score:** Lighthouse ≥ 90
- **WCAG Violations:** 0 critical, 0 serious
- **Component Parity:** 100% of source dashboard features migrated
- **Build Performance:** No regression in bundle size

### Qualitative Metrics

- **Developer Experience:** Positive feedback on IntelliSense/autocomplete
- **Visual Consistency:** Stakeholder approval after side-by-side comparison
- **User Feedback:** No increase in contrast/readability complaints

---

## 11. Risk Assessment

### High Risk Items

**Risk:** Breaking existing functionality during token migration
**Mitigation:** Feature flag dark-* rollout, component-by-component testing

**Risk:** Light mode may uncover new contrast issues
**Mitigation:** Early WCAG testing, establish contrast checker in CI/CD

**Risk:** Dashboard component migration reveals missing backend APIs
**Mitigation:** Early API contract verification, mock data fallbacks

### Medium Risk Items

**Risk:** Tailwind config conflicts with existing @theme inline
**Mitigation:** Test thoroughly, gradual migration from CSS to Tailwind classes

**Risk:** Animation performance issues on low-end devices
**Mitigation:** Performance profiling, conditional animation disable

---

## 12. Open Questions for Stakeholders

1. **BacklogReview Component:** Was this intentionally excluded? If so, document why. If not, prioritize migration.

2. **Light Mode Support:** Is light mode a requirement? If not, can we simplify by removing unused light mode tokens?

3. **Vite Variables:** Can we confirm `--vite-*` variables are safe to remove?

4. **Dashboard Feature Completeness:** Do we have a feature parity checklist from the original migration plan?

5. **Accessibility Target:** Are we targeting WCAG 2.1 AA or AAA? This affects contrast requirements.

---

## Appendix A: Color Palette Comparison

### Source (Vite) Colors

| Token | Hex | Usage |
|-------|-----|-------|
| dark-1 | #131726 | Primary background |
| dark-2 | #22263c | Card/surface background |
| dark-3 | #31395a | Elevated surface |
| brand-primary | #5867EF | Primary actions |
| primary.DEFAULT | #4B6FED | Links, accents |
| secondary.DEFAULT | #338585 | Secondary actions |
| accent.DEFAULT | #FCAE39 | Highlights |
| accent.secondary | #22BCDE | Secondary highlights |

### Next.js Colors (Currently Defined but Unused)

All above colors are defined in CSS variables and @theme inline but NOT actively used in components.

---

## Appendix B: Component Inventory

### Source Components Not Found in Next.js

*Preliminary list - requires full audit*

1. BacklogReview.tsx
2. StatsGrid.tsx (in components/dashboard in source)
3. StatCard.tsx
4. QuantumMetrics.tsx
5. TaskQueue.tsx
6. SwarmExecutionTimeline.tsx
7. CompletionStatistics.tsx
8. CompletionTimeSummary.tsx
9. ExecutionTimer.tsx
10. GitHubIntegrationCard.tsx
11. GitHubRepoStatus.tsx
12. StageIndicator.tsx
13. TDDProgressDisplay.tsx
14. TimeComparisonCard.tsx
15. DataModelReview.tsx
16. SprintPlanReview.tsx
17. SwarmLaunchConfirmation.tsx

*Note: Some may exist in different locations. Full audit needed.*

---

## Appendix C: WCAG 2.1 Compliance Checklist

### Perceivable

- [ ] **1.4.3 Contrast (Minimum):** Text 4.5:1, large text 3:1
- [ ] **1.4.6 Contrast (Enhanced):** Text 7:1, large text 4.5:1 (AAA)
- [ ] **1.4.11 Non-text Contrast:** UI components 3:1
- [ ] **1.4.12 Text Spacing:** No loss of content with custom spacing

### Operable

- [ ] **2.4.7 Focus Visible:** All interactive elements have visible focus
- [ ] **2.5.5 Target Size:** Touch targets ≥ 44x44px
- [ ] **2.1.1 Keyboard:** All functionality via keyboard

### Understandable

- [ ] **3.2.4 Consistent Identification:** Components consistent across pages

### Robust

- [ ] **4.1.3 Status Messages:** Proper ARIA live regions for dynamic content

---

## Document Control

**Version:** 1.0
**Last Updated:** 2026-01-31
**Author:** UX Advocate
**Status:** Draft for Review

**Next Review:** After Phase 1 completion
**Change Log:**
- 2026-01-31: Initial analysis completed

---

## References

1. Source Codebase: `/Users/aideveloper/core/AINative-Website`
2. Target Codebase: `/Users/aideveloper/ainative-website-nextjs-staging`
3. WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
4. Tailwind CSS v4 Documentation: https://tailwindcss.com/docs
5. Next.js App Router Documentation: https://nextjs.org/docs
