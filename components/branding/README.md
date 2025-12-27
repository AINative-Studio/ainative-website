# Branding Components

A collection of reusable, branded UI components for the AI Native Studio dashboard system. These components ensure consistent styling, polish, and user experience across all dashboard pages.

## Components

### 1. BrandedWelcome

A visually appealing welcome card for new users with optional background image and dismiss functionality.

**Features:**
- Optional background image with opacity control (default: `/card.png`)
- Gradient text support for branded appearance
- Responsive padding and sizing
- Optional dismiss button for returning users
- Z-index layering for proper content stacking

**Props:**
```typescript
interface BrandedWelcomeProps {
  title: string;                    // Main title
  description: string;               // Description text
  actionLabel: string;               // CTA button text
  actionHref: string;                // CTA button route
  backgroundImage?: string;          // Background image URL (default: /card.png)
  showImage?: boolean;               // Show background image (default: true)
  showDismiss?: boolean;             // Show dismiss button (default: false)
  onDismiss?: () => void;            // Dismiss handler
  className?: string;                // Additional CSS classes
}
```

**Usage:**
```tsx
<BrandedWelcome
  title="Welcome to AI Native Studio"
  description="Build AI-Powered Apps Effortlessly"
  actionLabel="Get Started"
  actionHref="/settings/developer"
  backgroundImage="/card.png"
  showDismiss={true}
  onDismiss={() => setShowWelcome(false)}
/>
```

**Design Tokens:**
- Background: `bg-gradient-to-br from-dark-2 to-dark-3`
- Shadow: `shadow-ds-lg`
- Text gradient: `from-brand-primary to-accent-secondary`

---

### 2. BrandedEmpty

A reusable empty state component with centered layout and clear call-to-action.

**Features:**
- Centered layout with generous padding (py-24)
- Image or icon display with opacity control
- Primary and optional secondary action buttons
- Responsive image sizing (w-64 on mobile, w-96 on desktop)
- Helpful, actionable messaging

**Props:**
```typescript
interface BrandedEmptyProps {
  title: string;                     // Main title
  description: string;               // Description text
  actionLabel: string;               // Primary CTA text
  actionHref: string;                // Primary CTA route
  secondaryActionLabel?: string;     // Secondary CTA text (optional)
  secondaryActionHref?: string;      // Secondary CTA route (optional)
  image?: string;                    // Image URL (default: /card.png)
  icon?: React.ReactNode;            // Icon to display instead of image
  className?: string;                // Additional CSS classes
}
```

**Usage:**
```tsx
<BrandedEmpty
  title="No API Keys Yet"
  description="Create your first API key to start building with AI Native Studio"
  actionLabel="Create API Key"
  actionHref="/settings/developer"
  secondaryActionLabel="View Documentation"
  secondaryActionHref="/docs"
  icon={<Key className="h-12 w-12" />}
/>
```

**Design Tokens:**
- Image opacity: `opacity-60 hover:opacity-80`
- Icon container: `bg-dark-2/50 text-brand-primary`
- Primary button: `bg-brand-primary shadow-ds-md`
- Secondary button: `border-gray-700 hover:bg-dark-2`

---

### 3. EnhancedStatCard

An enhanced stat card with gradient backgrounds, trend indicators, and hover effects.

**Features:**
- Gradient background overlay
- Custom branded icon in circular container
- Large number display with proper formatting (1,234 vs 1234)
- Optional trend indicator (up/down arrow with percentage)
- Optional mini sparkline chart
- Hover effects (scale, shadow)
- Multiple value formats (number, currency, percentage)

**Props:**
```typescript
interface EnhancedStatCardProps {
  title: string;                     // Stat label
  value: number;                     // Numeric value
  icon?: React.ReactNode;            // Icon component
  trend?: 'up' | 'down' | 'neutral'; // Trend direction
  trendValue?: number;               // Trend percentage
  backgroundImage?: string;          // Background image URL
  format?: 'number' | 'currency' | 'percentage'; // Value format
  currency?: string;                 // Currency code (default: USD)
  showSparkline?: boolean;           // Show sparkline chart
  sparklineData?: number[];          // Sparkline data points
  className?: string;                // Additional CSS classes
  iconColor?: string;                // Icon background color
}
```

**Usage:**
```tsx
<EnhancedStatCard
  title="Total API Calls"
  value={12543}
  icon={<Activity className="h-8 w-8" />}
  trend="up"
  trendValue={12.5}
  backgroundImage="/1.png"
  format="number"
/>

<EnhancedStatCard
  title="Revenue This Month"
  value={4250}
  icon={<DollarSign className="h-8 w-8" />}
  trend="up"
  trendValue={8.3}
  format="currency"
  currency="USD"
/>
```

**Design Tokens:**
- Background: `bg-gradient-to-br from-dark-2 to-dark-3`
- Shadow: `shadow-ds-md hover:shadow-ds-lg`
- Gradient overlay: `from-brand-primary/5 to-transparent`
- Hover: `hover:scale-105 transition-all duration-300`
- Trend colors:
  - Up: `text-green-400`
  - Down: `text-red-400`
  - Neutral: `text-gray-400`

---

## Implementation Examples

### DashboardPage.tsx

```tsx
import { BrandedWelcome, EnhancedStatCard } from '@/components/branding';
import { Activity, Code, Zap, Users } from 'lucide-react';

function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome for new users */}
      <BrandedWelcome
        title="Welcome to AI Native Studio"
        description="Get started by creating your first API key"
        actionLabel="Create API Key"
        actionHref="/settings/developer"
        showDismiss={true}
        onDismiss={() => setShowWelcome(false)}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedStatCard
          title="API Requests"
          value={1247}
          icon={<Activity className="h-8 w-8" />}
          trend="up"
          trendValue={12.5}
          backgroundImage="/1.png"
        />
        <EnhancedStatCard
          title="Active Projects"
          value={12}
          icon={<Code className="h-8 w-8" />}
          trend="neutral"
          trendValue={0}
        />
        {/* More cards... */}
      </div>
    </div>
  );
}
```

### QNNDashboardPage.tsx

```tsx
import { BrandedEmpty, EnhancedStatCard } from '@/components/branding';
import { Brain, GitFork, Zap } from 'lucide-react';

function QNNDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Branded hero with gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-dark-2 to-dark-3 p-12">
        <h1 className="bg-gradient-to-r from-brand-primary to-accent-secondary bg-clip-text text-transparent">
          Quantum Neural Network Dashboard
        </h1>
        {/* Hero content... */}
      </div>

      {/* Enhanced stat cards */}
      <div className="grid grid-cols-4 gap-6">
        <EnhancedStatCard title="Active Models" value={0} icon={<Brain />} />
        <EnhancedStatCard title="Repositories" value={0} icon={<GitFork />} />
        {/* More cards... */}
      </div>

      {/* Empty state for no training jobs */}
      {!hasTrainingJobs && (
        <BrandedEmpty
          title="No Training Jobs Yet"
          description="Start your first quantum neural network training job"
          actionLabel="Start Training"
          actionHref="#"
          secondaryActionLabel="View Documentation"
          secondaryActionHref="/docs/qnn"
          icon={<Zap className="h-12 w-12" />}
        />
      )}
    </div>
  );
}
```

### BillingPage.tsx

```tsx
import { BrandedEmpty, EnhancedStatCard } from '@/components/branding';
import { DollarSign, Receipt, RefreshCcw } from 'lucide-react';

function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Credit stats */}
      <div className="grid grid-cols-3 gap-6">
        <EnhancedStatCard
          title="Available Credits"
          value={creditBalance.available}
          icon={<DollarSign className="h-8 w-8" />}
          backgroundImage="/card.png"
        />
        {/* More stat cards... */}
      </div>

      {/* Empty state for no invoices */}
      {invoices.length === 0 && (
        <BrandedEmpty
          title="No Invoices Yet"
          description="Your invoice history will appear here"
          actionLabel="View Plans"
          actionHref="/pricing"
          icon={<Receipt className="h-10 w-10" />}
        />
      )}
    </div>
  );
}
```

---

## Design System Integration

All components use the design system tokens from `tailwind.config.cjs`:

### Colors
- `dark-1`: #131726 (primary background)
- `dark-2`: #22263c (secondary background)
- `dark-3`: #31395a (accent background)
- `brand-primary`: #5867EF (primary brand color)
- `accent-secondary`: #22BCDE (secondary accent)

### Shadows
- `shadow-ds-sm`: Subtle elevation
- `shadow-ds-md`: Medium elevation (default for cards)
- `shadow-ds-lg`: Large elevation (hover states, heroes)

### Spacing
- Use `space-y-6` between sections
- Card padding: `p-6` (default), `p-8` (medium), `p-12` (large)

### Animations
- Hover scale: `hover:scale-105`
- Transition: `transition-all duration-300`
- Framer Motion variants available for stagger animations

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- Proper semantic HTML (h1-h6, p, button)
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Sufficient color contrast ratios
- Screen reader compatible

---

## Responsive Design

All components are mobile-first and responsive:

- **Mobile (375px)**: Single column layout, smaller text, compact padding
- **Tablet (768px)**: 2-column grid for stat cards, increased spacing
- **Desktop (1440px)**: 3-4 column grids, full feature display

---

## Testing Checklist

- [ ] Welcome cards display correctly for new users
- [ ] Empty states are helpful and actionable
- [ ] Stat cards render with correct number formatting
- [ ] All CTAs navigate correctly
- [ ] Hover effects work smoothly
- [ ] Components are responsive on all breakpoints
- [ ] No layout shifts or visual glitches
- [ ] Loading states handle gracefully
- [ ] Icons render properly

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Version History

- **v1.0.0** (2025-12-16): Initial release with BrandedWelcome, BrandedEmpty, EnhancedStatCard

---

## Support

For issues or questions, contact the design system team or create an issue in the repository.
