# Orange Accent Color Audit - Issue #371

## Summary
This document tracks the standardization of orange accent colors across the AINative Studio Next.js codebase.

## Decision
**Standard Orange Accent: `#FCAE39`**

### Rationale
- Matches Vite brand identity
- Already defined in `globals.css` as `--ainative-accent`
- Consistent with design system established during Vite to Next.js migration

## Color Inventory

### Replaced Colors

#### `#FF6B00` → `#FCAE39`
- `lib/config/app.ts` - `theme.colors.orange`

#### `#FF8A3D` → `#FCAE39`
- `components/layout/Sidebar.tsx` - Gradient
- `components/layout/SidebarNew.tsx` - Gradient
- `components/agent-swarm/SprintPlanReview.tsx` - Button gradients (2 instances)
- `components/agent-swarm/DataModelReview.tsx` - Avatar and button gradients (3 instances)
- `components/agent-swarm/AgentSwarmRulesUpload.tsx` - Button gradient
- `components/agent-swarm/BacklogReview.tsx` - Button gradient
- `app/privacy/PrivacyClient.tsx` - Text gradients and glow effects (3 instances)
- `app/dashboard/agent-swarm/AgentSwarmClient.tsx` - Progress bars and buttons (2 instances)

### Retained Colors

#### `#FCAE39` (Standard - No changes needed)
- `app/globals.css` - `--ainative-accent`
- `components/billing/CreditUsageChart.tsx` - Chart color
- `components/zerodb/metrics-dashboard.tsx` - Chart color array
- `components/sections/Solutions.tsx` - Background and icon colors
- `components/ui/gradient-text.tsx` - Gradient definitions

#### Other Orange Variants (Contextual - Kept for gradients)
- `#FF6B6B` - Red-orange used in gradient transitions
- `#FF8E53` - Orange used in sunset gradients

## Design System Documentation

### Orange Accent Usage Guidelines

**Primary Use Cases:**
- Accent highlights in UI components
- Secondary call-to-action buttons
- Chart visualizations (storage operations, metrics)
- Icon backgrounds in feature sections
- Gradient accents combined with primary colors

**Color Value:**
```css
--ainative-accent: #FCAE39;
```

**Tailwind Usage:**
```jsx
bg-[#FCAE39]
text-[#FCAE39]
from-[#FCAE39]
```

**Do NOT use:**
- `#FF6B00` (old appConfig value)
- `#FF8A3D` (inconsistent variant)

## Verification

All instances verified as replaced:
```bash
grep -r "#FF6B00\|#FF8A3D" --include="*.ts" --include="*.tsx" .
# Result: No matches
```

## Implementation Date
2026-01-18

## Related Issues
- Issue #371: Orange accent color inconsistency
