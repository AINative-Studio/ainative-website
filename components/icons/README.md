# AINative Icon Library

A comprehensive collection of custom SVG icons designed for the AINative design system. All icons are built with clean, minimal designs that support Tailwind CSS classes for easy sizing and theming.

## Features

- **30+ Custom Icons** across 7 categories
- **TypeScript Support** with full type definitions
- **Tailwind CSS Integration** via `currentColor` for fills/strokes
- **Accessible** with proper ARIA support
- **Consistent Design** - 24x24 viewBox for uniform scaling
- **Tree-shakeable** - Import only what you need

## Installation

Icons are located at `/Volumes/Cody/projects/AINative/AINative-website/src/components/icons` and can be imported directly:

```tsx
import { MenuIcon, CodeIcon, CheckIcon } from '@/components/icons';
```

## Usage Examples

### Basic Usage

```tsx
import { MenuIcon } from '@/components/icons';

function MyComponent() {
  return <MenuIcon className="h-6 w-6 text-gray-700" />;
}
```

### Different Sizes

```tsx
// Small
<MenuIcon className="h-4 w-4" />

// Medium (default recommended)
<MenuIcon className="h-6 w-6" />

// Large
<MenuIcon className="h-8 w-8" />

// Extra Large
<MenuIcon className="h-12 w-12" />
```

### Color Theming

```tsx
// Blue
<CodeIcon className="h-6 w-6 text-blue-500" />

// Green for success
<CheckIcon className="h-5 w-5 text-green-500" />

// Red for errors
<ErrorIcon className="h-5 w-5 text-red-500" />

// Theme colors
<DatabaseIcon className="h-6 w-6 text-primary" />
<ChartBarIcon className="h-6 w-6 text-[#4B6FED]" />
```

### Interactive States

```tsx
<button className="group">
  <MenuIcon className="h-6 w-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
</button>
```

## Icon Categories

### Navigation Icons (5)
For header, sidebar, and navigation elements.

- `MenuIcon` - Hamburger menu
- `XIcon` - Close/dismiss
- `HomeIcon` - Home/dashboard
- `ChevronDownIcon` - Dropdown indicator
- `ChevronRightIcon` - Forward navigation

### Feature Icons (5)
For showcasing product features and capabilities.

- `CodeIcon` - Development/coding
- `DatabaseIcon` - Database/storage
- `APIIcon` - API/integration
- `CloudIcon` - Cloud services
- `ServerIcon` - Server/infrastructure

### Status Icons (5)
For displaying states and feedback.

- `CheckIcon` - Success/complete
- `AlertIcon` - Warning/alert
- `InfoIcon` - Information
- `ErrorIcon` - Error/failure
- `WarningIcon` - Caution

### Action Icons (5)
For interactive buttons and controls.

- `SendIcon` - Submit/send
- `EditIcon` - Edit/modify
- `DeleteIcon` - Delete/remove
- `SaveIcon` - Save/persist
- `CopyIcon` - Copy/duplicate

### Social Icons (3)
For social media links.

- `GitHubIcon` - GitHub
- `TwitterIcon` - Twitter/X
- `LinkedInIcon` - LinkedIn

### Content Icons (3)
For blog posts and content metadata.

- `CalendarIcon` - Date/calendar
- `EyeIcon` - View count/visibility
- `TagIcon` - Tags/labels

### Dashboard Icons (4)
For analytics and metrics displays.

- `ChartBarIcon` - Analytics/metrics
- `TrendingUpIcon` - Growth/increase
- `ActivityIcon` - Activity/pulse
- `UsersIcon` - Users/team

## Component Structure

All icons extend the base `IconBase` component:

```tsx
// IconBase provides consistent behavior
export interface IconBaseProps extends SVGProps<SVGSVGElement> {
  children: React.ReactNode;
}

// Example icon implementation
export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </IconBase>
  );
}
```

## Customization

### Custom Stroke Width

```tsx
<CodeIcon
  className="h-6 w-6 text-blue-500"
  strokeWidth="1.5"
/>
```

### Custom Fill

Most icons use `stroke` but some support `fill`:

```tsx
<CheckIcon
  className="h-5 w-5"
  fill="currentColor"
  stroke="none"
/>
```

### Accessibility

All icons support ARIA attributes:

```tsx
<MenuIcon
  className="h-6 w-6"
  aria-label="Open menu"
  role="img"
/>
```

## Design Guidelines

### Sizing Recommendations

- **Small (h-4 w-4)**: Inline with text, small buttons
- **Medium (h-6 w-6)**: Standard buttons, navigation
- **Large (h-8 w-8)**: Feature showcases, headers
- **Extra Large (h-12+)**: Hero sections, emphasis

### Color Usage

- **Primary Actions**: `text-[#4B6FED]` (AINative blue)
- **Success States**: `text-green-500`
- **Warning States**: `text-yellow-500`
- **Error States**: `text-red-500`
- **Neutral**: `text-gray-600`, `text-muted-foreground`

### Animation

```tsx
// Hover effects
<ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />

// Spin animation
<RefreshIcon className="h-4 w-4 animate-spin" />

// Pulse for loading
<InfoIcon className="h-5 w-5 animate-pulse" />
```

## Files Replaced

This icon library replaces the following lucide-react icons:

### Header.tsx
- ✅ `Menu` → `MenuIcon`
- ✅ `X` → `XIcon`

### HomePage.tsx
- ✅ `ChevronRight` → `ChevronRightIcon`
- ✅ `Database` → `DatabaseIcon`
- ✅ `Users` → `UsersIcon`

### BlogListing.tsx
- ✅ `Calendar` → `CalendarIcon`
- ✅ `Eye` → `EyeIcon`
- ✅ `Tag` → `TagIcon`

### DashboardPage.tsx
- ✅ `BarChart2` → `ChartBarIcon`
- ✅ `ChevronRight` → `ChevronRightIcon`

## Future Enhancements

When Figma design files become available:

1. **Replace Placeholder SVGs** - Update with exact Figma exports
2. **Add Remaining Icons** - Expand to full 49 icon set
3. **Create Icon Variants** - Add filled, outlined, and colored versions
4. **Add Icon Showcase Page** - Create demo page at `/icons` route
5. **Generate Sprite Sheet** - Optimize for production builds

## Contributing

When adding new icons:

1. Create icon component in appropriate category folder
2. Extend `IconBase` component
3. Use 24x24 viewBox
4. Support `currentColor` for theming
5. Export from `index.tsx`
6. Add usage example to this README
7. Update component documentation

## Support

For questions or issues:
- Technical: hello@ainative.studio
- Documentation: /Volumes/Cody/projects/AINative/AINative-website/src/components/icons/README.md
- Design System: Refer to Tailwind theme configuration

---

**Version**: 1.0.0
**Last Updated**: 2025-12-14
**Maintainer**: AINative Team
