# AIKitTabs Component

A fully accessible, keyboard-navigable dashboard navigation component built with TDD approach.

## Features

- **Next.js Routing Integration**: Automatic synchronization with Next.js routing
- **Dark Theme Support**: Pre-styled for dark interfaces with customizable classes
- **Mobile Responsive**: Optimized layout for mobile, tablet, and desktop viewports
- **Full Keyboard Navigation**: Arrow keys, Home, End, Enter, Space support
- **WCAG 2.1 AA Compliant**: Proper ARIA attributes and screen reader support
- **Smooth Transitions**: 200ms CSS transitions for state changes
- **Active State Indicators**: Visual feedback for current route
- **Performance Optimized**: Memoized values and efficient re-render prevention

## Installation

The component uses shadcn/ui Tabs component and Next.js navigation:

```bash
# Already installed in this project
# @radix-ui/react-tabs
# next
```

## Usage

### Basic Usage

```tsx
import AIKitTabs from '@/components/aikit/AIKitTabs';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <AIKitTabs />
      {children}
    </div>
  );
}
```

### With Disabled Tabs

```tsx
<AIKitTabs disabled={['billing', 'settings']} />
```

### With Custom Class Name

```tsx
<AIKitTabs className="custom-wrapper" />
```

## Tab Configuration

The component includes 5 pre-configured tabs:

| Tab       | Path                  | Description                |
|-----------|-----------------------|----------------------------|
| Overview  | `/dashboard`          | Dashboard home page        |
| AI-Kit    | `/dashboard/ai-kit`   | AI-Kit section             |
| Usage     | `/dashboard/usage`    | Usage statistics           |
| Billing   | `/dashboard/billing`  | Billing information        |
| Settings  | `/dashboard/settings` | Dashboard settings         |

## Keyboard Navigation

| Key         | Action                             |
|-------------|------------------------------------|
| Tab         | Focus on first tab                 |
| Arrow Right | Move to next tab                   |
| Arrow Left  | Move to previous tab               |
| Home        | Jump to first tab (Overview)       |
| End         | Jump to last tab (Settings)        |
| Enter       | Activate focused tab and navigate  |
| Space       | Activate focused tab and navigate  |

## Accessibility

### ARIA Attributes

- `role="tablist"` on the tab container
- `role="tab"` on each tab button
- `aria-label` on tablist: "Dashboard navigation tabs"
- `aria-label` on each tab: Descriptive navigation label
- `aria-selected` indicates active tab state
- `tabindex` properly managed for keyboard navigation

### Screen Reader Support

- All tabs have accessible names
- Active state is announced
- Navigation changes are communicated
- Disabled tabs are properly indicated

## Styling

### Dark Theme (Default)

```tsx
// Tab list background
bg-[#161B22] border-gray-800

// Inactive tabs
text-gray-400 hover:text-gray-200
hover:bg-gray-800/50

// Active tab
bg-[#4B6FED] text-white
shadow-md shadow-[#4B6FED]/20

// Focus state
focus-visible:ring-2 focus-visible:ring-[#4B6FED]
```

### Responsive Classes

```tsx
// Tab list
w-full md:w-auto
overflow-x-auto scrollbar-hide

// Tab buttons
min-w-[80px] md:min-w-[100px]
```

## Props

### AIKitTabsProps

```typescript
interface AIKitTabsProps {
  /** Array of tab IDs to disable */
  disabled?: string[];

  /** Additional CSS classes */
  className?: string;
}
```

## Testing

The component includes comprehensive tests with 96.87% statement coverage:

```bash
# Run tests
npm test -- AIKitTabs.standalone.test.tsx

# Run with coverage
npm test -- AIKitTabs.standalone.test.tsx --coverage
```

### Test Coverage

- **39 test cases** covering all functionality
- **96.87% statement coverage**
- **77.41% branch coverage**
- **100% function coverage**
- **96.66% line coverage**

### Test Categories

1. **Rendering Tests** - Component structure and tab order
2. **Active State Management** - Route-based active state
3. **Navigation Tests** - Click-to-navigate functionality
4. **Keyboard Navigation Tests** - Arrow keys, Home, End, Enter, Space
5. **Accessibility Tests** - ARIA attributes and screen reader support
6. **Dark Theme Support** - Styling verification
7. **Responsive Design Tests** - Mobile, tablet, desktop viewports
8. **Smooth Transitions** - CSS transition classes
9. **Edge Cases** - Error handling and edge scenarios
10. **Performance Tests** - Re-render efficiency

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (latest)

## Performance

- **Memoized activeTab calculation** prevents unnecessary re-computation
- **useCallback hooks** prevent function recreation on each render
- **Efficient pathname matching** with early returns
- **No unnecessary navigation** when clicking active tab

## Customization

### Changing Tab Configuration

Edit the `TABS` constant in `AIKitTabs.tsx`:

```typescript
const TABS: TabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/dashboard',
    ariaLabel: 'Navigate to dashboard overview',
  },
  // Add more tabs...
];
```

### Styling Customization

The component uses Tailwind CSS classes. To customize:

1. Modify the `className` prop on `TabsList` or `TabsTrigger`
2. Override styles using CSS modules
3. Extend Tailwind configuration

### Example: Custom Styles

```tsx
<AIKitTabs
  className="custom-tabs"
/>
```

```css
/* Custom styles */
.custom-tabs [role="tablist"] {
  background: linear-gradient(to right, #1a1a2e, #16213e);
}
```

## Type Definitions

```typescript
/** Tab configuration type */
interface TabConfig {
  id: string;
  label: string;
  path: string;
  ariaLabel: string;
}

/** Component props */
export interface AIKitTabsProps {
  disabled?: string[];
  className?: string;
}
```

## Dependencies

- `next` - Next.js framework (routing)
- `react` - React library
- `@radix-ui/react-tabs` - Accessible tabs primitive
- `framer-motion` - Not used (removed for performance)
- `tailwindcss` - Utility-first CSS

## Troubleshooting

### Tabs Not Highlighting Correctly

**Issue**: Active tab doesn't highlight when navigating

**Solution**: Ensure the component is inside a layout that provides routing context

### Navigation Not Working

**Issue**: Clicking tabs doesn't navigate

**Solution**: Check that `useRouter` from `next/navigation` is available

### Keyboard Navigation Issues

**Issue**: Arrow keys don't work

**Solution**: Ensure tab has focus before using keyboard navigation

## Contributing

When modifying this component:

1. **Write tests first** (TDD approach)
2. **Run existing tests** to ensure no regressions
3. **Maintain 80%+ coverage** requirement
4. **Update documentation** for API changes
5. **Test keyboard navigation** manually
6. **Verify accessibility** with screen reader

## License

Part of AINative Studio Next.js project.

## Related Components

- `components/ui/tabs.tsx` - Base Radix UI tabs component
- `components/layout/DashboardLayout.tsx` - Dashboard layout wrapper

## Examples

### Integration in Dashboard Layout

```tsx
// app/dashboard/layout.tsx
import AIKitTabs from '@/components/aikit/AIKitTabs';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      <header>
        <h1>AI Native Studio</h1>
        <AIKitTabs />
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### Conditional Tab Disabling

```tsx
// Disable billing for free users
const disabledTabs = user.plan === 'free' ? ['billing'] : [];

<AIKitTabs disabled={disabledTabs} />
```

### With Loading State

```tsx
function DashboardNav() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return <AIKitTabs />;
}
```

## Changelog

### v1.0.0 (2026-01-29)

- Initial release with TDD approach
- 39 test cases, 96.87% coverage
- Full keyboard navigation support
- Dark theme styling
- Mobile responsive design
- WCAG 2.1 AA compliant
