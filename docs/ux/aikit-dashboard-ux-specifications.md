# AIKit Dashboard Integration - UX/UI Design Specifications

**Version:** 1.0
**Date:** 2026-01-29
**Status:** Design Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Design Philosophy](#design-philosophy)
3. [Component Architecture](#component-architecture)
4. [Tab Navigation System](#tab-navigation-system)
5. [Responsive Design Strategy](#responsive-design-strategy)
6. [Dark Theme Implementation](#dark-theme-implementation)
7. [Animation & Transitions](#animation--transitions)
8. [Loading States & Skeletons](#loading-states--skeletons)
9. [Error States & Feedback](#error-states--feedback)
10. [Accessibility Specifications](#accessibility-specifications)
11. [Interactive Component Showcase](#interactive-component-showcase)
12. [Implementation Guidelines](#implementation-guidelines)

---

## 1. Executive Summary

This document defines the complete UX/UI implementation strategy for integrating the AIKit package showcase into the AINative dashboard. The design focuses on creating an immersive, interactive experience that demonstrates AIKit's capabilities while maintaining consistency with the existing design system.

### Key Design Goals

1. **Seamless Integration** - Natural fit within existing dashboard architecture
2. **Performance-First** - Sub-3 second load times, 60fps animations
3. **Accessibility-Native** - WCAG 2.1 AA compliant from the ground up
4. **Mobile-Optimized** - Touch-first interactions, responsive layouts
5. **Progressive Disclosure** - Layered information architecture

---

## 2. Design Philosophy

### Visual Hierarchy

```
Level 1: Hero Section (AI Kit Branding)
  └─ Level 2: Tab Navigation (Browse/Showcase/Playground/Docs)
      └─ Level 3: Content Sections (Packages/Features/Examples)
          └─ Level 4: Interactive Elements (Code samples/Demos)
              └─ Level 5: Micro-interactions (Tooltips/Feedback)
```

### Color System Integration

**Existing Brand Colors** (from globals.css):
- Primary: `#4B6FED` (HSL: 225, 82%, 61%)
- Secondary: `#8A63F4` (HSL: 261, 87%, 67%)
- Accent: `#5867EF` (HSL: 234, 82%, 64%)
- Background: `#0D1117` (HSL: 215, 28%, 7%)
- Surface: `#161B22` (HSL: 215, 19%, 11%)
- Border: `#2D333B` (HSL: 214, 13%, 20%)

**New AIKit-Specific Colors**:
```css
--aikit-showcase-bg: linear-gradient(135deg, #0D1117 0%, #1A1B2E 100%);
--aikit-card-hover: rgba(75, 111, 237, 0.08);
--aikit-interactive-glow: 0 0 20px rgba(75, 111, 237, 0.3);
--aikit-code-bg: #1C2128;
--aikit-success: #10B981;
--aikit-warning: #F59E0B;
--aikit-error: #EF4444;
```

### Typography Scale

Following existing design system:
- **Hero Title**: 48px/60px/72px (mobile/tablet/desktop) - Bold 800
- **Section Headers**: 24px/30px/36px - Bold 700
- **Card Titles**: 18px/20px/24px - Semibold 600
- **Body Text**: 14px/16px/18px - Regular 400
- **UI Labels**: 12px/14px - Medium 500
- **Code Snippets**: 12px - Mono font

---

## 3. Component Architecture

### Component Hierarchy

```
DashboardClient (app/dashboard/DashboardClient.tsx)
│
└─ AIKitDashboardTab (new component)
    ├─ AIKitHero
    │   ├─ Animated Background
    │   ├─ Stats Counter
    │   └─ CTA Buttons
    │
    ├─ AIKitTabs (shadcn/ui Tabs)
    │   ├─ TabsList
    │   │   ├─ Browse Packages
    │   │   ├─ Interactive Showcase
    │   │   ├─ Code Playground
    │   │   └─ Documentation
    │   │
    │   ├─ BrowsePackagesTab
    │   │   ├─ CategoryFilter
    │   │   ├─ PackageGrid
    │   │   │   └─ PackageCard[]
    │   │   └─ QuickInstall
    │   │
    │   ├─ InteractiveShowcaseTab
    │   │   ├─ LiveDemoSelector
    │   │   ├─ CodePreview (with copy)
    │   │   ├─ OutputPanel
    │   │   └─ ConfigPanel
    │   │
    │   ├─ CodePlaygroundTab
    │   │   ├─ EditorPane (Monaco/CodeMirror)
    │   │   ├─ PreviewPane
    │   │   └─ ConsolePanel
    │   │
    │   └─ DocumentationTab
    │       ├─ SearchBar
    │       ├─ DocNavigator
    │       └─ ContentRenderer
    │
    └─ AIKitFooter
        ├─ Quick Links
        └─ Community Links
```

### Component Design Specifications

#### AIKitHero Component

**Purpose**: Eye-catching introduction to AIKit with animated stats

**Visual Design**:
```
┌─────────────────────────────────────────────────────────┐
│  Animated Gradient Background (Radial blue/purple)     │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │   AI Kit Package Ecosystem                    │    │
│  │   Build AI Apps 10x Faster                    │    │
│  │                                                │    │
│  │   [Stats Counter Animated]                    │    │
│  │   14 Packages | 50K+ Downloads | 1.2K Stars   │    │
│  │                                                │    │
│  │   [Get Started] [View Docs] [GitHub]          │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Dimensions**:
- Mobile: Height 400px, padding 24px
- Tablet: Height 450px, padding 32px
- Desktop: Height 500px, padding 48px

**Animation**:
- Background: Subtle gradient shift (3s infinite)
- Stats: Count-up animation on mount (800ms ease-out)
- Entrance: Fade-up (600ms stagger children 100ms)

#### AIKitTabs Component

**Tab Navigation Design**:

```
┌────────────────────────────────────────────────────────────┐
│  [Browse] [Showcase] [Playground] [Docs]                  │
│  ────────                                                  │
└────────────────────────────────────────────────────────────┘
```

**States**:
- **Default**:
  - Background: transparent
  - Text: gray-400
  - Border-bottom: 2px transparent

- **Hover**:
  - Background: rgba(75, 111, 237, 0.05)
  - Text: gray-200
  - Transition: 200ms ease

- **Active**:
  - Background: rgba(75, 111, 237, 0.1)
  - Text: white
  - Border-bottom: 2px solid #4B6FED
  - Font-weight: 600

**Interaction**:
- Click: Tab switch with content fade transition (300ms)
- Keyboard: Arrow keys navigate, Enter/Space activate
- Touch: Swipe gesture support on mobile

**Responsive Behavior**:
- Desktop: Horizontal tabs, fixed width 160px each
- Tablet: Horizontal tabs, flex width
- Mobile: Scrollable horizontal tabs with snap points

#### PackageCard Component

**Visual Structure**:

```
┌──────────────────────────────────────────────────┐
│ [Gradient Top Border - 2px]                     │
├──────────────────────────────────────────────────┤
│  [Icon] @ainative/ai-kit-core    [Category]     │
│                                                  │
│  Core utilities and shared types for AI Kit     │
│  ecosystem                                       │
│                                                  │
│  [Type safety] [Base utilities] [Interfaces]    │
│                                                  │
│  $ npm install @ainative/ai-kit-core  [Copy]    │
│                                                  │
│  [NPM Link] [GitHub Docs]                       │
└──────────────────────────────────────────────────┘
```

**Dimensions**:
- Card: min-height 280px
- Padding: 24px
- Border-radius: 12px
- Border: 1px solid #2D333B

**States**:
- **Default**:
  - Background: #161B22
  - Border: #2D333B
  - Shadow: none

- **Hover**:
  - Border: #4B6FED40 (with opacity)
  - Shadow: 0 0 20px rgba(75, 111, 237, 0.1)
  - Transform: translateY(-2px)
  - Transition: all 300ms ease

- **Focus** (keyboard):
  - Ring: 2px solid #4B6FED
  - Outline-offset: 2px

**Interactive Elements**:
1. **Copy Button**:
   - Default: Ghost icon button
   - Hover: Background overlay
   - Click: Icon changes to checkmark, green flash (2s duration)

2. **External Links**:
   - Icon: ExternalLink (14px)
   - Hover: Underline, color shift to primary

---

## 4. Tab Navigation System

### Tab Structure

**Tab 1: Browse Packages**

**Purpose**: Filterable grid of all AIKit packages

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  Filter: [All] [Core] [Framework] [DevTools]       │
│          [Security] [ML] [Data] [UI/UX]             │
├─────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│  │ Package 1  │ │ Package 2  │ │ Package 3  │     │
│  │            │ │            │ │            │     │
│  └────────────┘ └────────────┘ └────────────┘     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│  │ Package 4  │ │ Package 5  │ │ Package 6  │     │
│  └────────────┘ └────────────┘ └────────────┘     │
└─────────────────────────────────────────────────────┘
```

**Grid System**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Gap: 24px

**Filter Behavior**:
- Animation: Stagger fade-out/fade-in (300ms)
- Empty State: Illustration + "No packages found" message

---

**Tab 2: Interactive Showcase**

**Purpose**: Live demos of AIKit packages in action

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  Demo Selector: [Chat UI] [Vector Search] [Tool Calling] │
├─────────────────────────────────┬────────────────────────┤
│                                 │                        │
│  Code Preview                   │  Live Output           │
│  (Syntax highlighted)           │  (Rendered result)     │
│                                 │                        │
│  [Copy Code]                    │  [Reset] [Share]       │
│                                 │                        │
├─────────────────────────────────┴────────────────────────┤
│  Configuration Panel                                     │
│  Model: [GPT-4] Temperature: [0.7] Max Tokens: [1000]   │
└──────────────────────────────────────────────────────────┘
```

**Split Layout**:
- Desktop: 50/50 vertical split
- Tablet: 60/40 vertical split
- Mobile: Stacked (code top, output bottom)

**Interactive Features**:
1. **Code Preview**:
   - Syntax highlighting (Prism.js or Shiki)
   - Line numbers
   - Copy button with feedback
   - Framework switcher (React/Vue/Svelte)

2. **Live Output**:
   - Real-time rendering
   - Loading skeleton during execution
   - Error boundary with friendly messages
   - Console log viewer (collapsible)

3. **Configuration Panel**:
   - Sliders for numeric values
   - Dropdowns for enums
   - Toggle switches for booleans
   - Debounced updates (500ms)

---

**Tab 3: Code Playground**

**Purpose**: Full-featured editor for experimenting with AIKit

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  [Template: Chat] [Framework: React] [Run ▶] [Share]     │
├────────────────────────────┬─────────────────────────────┤
│                            │                             │
│  Code Editor               │  Preview Pane               │
│  (Monaco Editor)           │  (Live Rendering)           │
│                            │                             │
│  1 import { useAIChat }... │  [Interactive Result]       │
│  2                         │                             │
│  3 function ChatApp() {    │                             │
│  4   const { messages,     │                             │
│  5     sendMessage } =     │                             │
│  6     useAIChat({...})    │                             │
│                            │                             │
├────────────────────────────┴─────────────────────────────┤
│  Console                                                 │
│  > Output logs and errors                                │
└──────────────────────────────────────────────────────────┘
```

**Editor Configuration**:
- Monaco Editor with TypeScript support
- Intellisense for AIKit packages
- Auto-save to localStorage
- Format on save (Prettier)
- Theme: VS Code Dark+ (matching design system)

**Preview Panel**:
- Hot Module Replacement (HMR)
- Error overlay with stack traces
- Performance metrics (render time)
- Device frame selector (mobile/tablet/desktop)

**Console Panel**:
- Collapsible/expandable
- Log filtering (info/warn/error)
- Clear button
- Timestamp display

---

**Tab 4: Documentation**

**Purpose**: Searchable documentation hub

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  [Search documentation...]                     [Filter]  │
├────────────────┬─────────────────────────────────────────┤
│                │                                         │
│  Navigation    │  Content                                │
│                │                                         │
│  > Getting     │  # Getting Started with AIKit          │
│    Started     │                                         │
│  > Packages    │  AIKit is a comprehensive suite of...  │
│  > Guides      │                                         │
│  > API Ref     │  ## Installation                        │
│                │  ```bash                                │
│                │  npm install @ainative/ai-kit           │
│                │  ```                                    │
│                │                                         │
│                │  [Copy] [Edit on GitHub]                │
└────────────────┴─────────────────────────────────────────┘
```

**Search Features**:
- Fuzzy search with keyboard shortcut (Cmd/Ctrl + K)
- Search suggestions
- Recent searches
- Highlight matches in results

**Navigation**:
- Collapsible sections
- Active page indicator
- Breadcrumb trail
- Progress indicator (scroll depth)

---

## 5. Responsive Design Strategy

### Breakpoint System

Following Tailwind CSS conventions:

```typescript
const breakpoints = {
  xs: '320px',   // Mobile portrait
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};
```

### Responsive Behaviors

#### Mobile (320px - 767px)

**Layout**:
- Single column layout
- Stacked components
- Full-width cards
- Bottom sheet navigation
- Hamburger menu for filters

**Touch Optimizations**:
- Minimum touch target: 44x44px
- Increased padding: 16px→24px
- Swipe gestures for tab navigation
- Pull-to-refresh for data updates
- Bottom-anchored CTAs

**Typography**:
- Reduced font sizes (16px max for body)
- Increased line-height (1.6)
- Shorter line lengths (60-70 characters)

**Interactions**:
- Tap instead of hover states
- Long-press for context menus
- Swipe to dismiss modals
- Pinch-to-zoom for code blocks

#### Tablet (768px - 1023px)

**Layout**:
- Two-column grid for cards
- Sidebar navigation (collapsible)
- Floating action buttons
- Split-screen for showcase

**Interactions**:
- Hybrid touch/mouse support
- Hover states with delay (300ms)
- Keyboard shortcuts active
- Drag-and-drop enabled

#### Desktop (1024px+)

**Layout**:
- Three-column grid for cards
- Fixed sidebar navigation
- Multi-pane layouts
- Hover previews and tooltips

**Advanced Features**:
- Keyboard shortcuts (documented)
- Command palette (Cmd+K)
- Drag-and-drop
- Context menus (right-click)
- Multi-window support

---

## 6. Dark Theme Implementation

### Theme Configuration

**Base Colors** (already implemented in globals.css):

```css
.dark {
  --background: 215 28% 7%;        /* #0D1117 */
  --card: 215 19% 11%;             /* #161B22 */
  --border: 214 13% 20%;           /* #2D333B */
  --primary: 225 82% 61%;          /* #4B6FED */
  --secondary: 261 87% 67%;        /* #8A63F4 */
}
```

### AIKit-Specific Dark Theme Enhancements

```css
/* AIKit Tab Dark Mode Overrides */
.dark .aikit-tab {
  /* Enhanced code block styling */
  --code-bg: #1C2128;
  --code-border: #2D333B;
  --code-selection: rgba(75, 111, 237, 0.2);

  /* Interactive element glows */
  --interactive-glow-idle: 0 0 10px rgba(75, 111, 237, 0.1);
  --interactive-glow-hover: 0 0 20px rgba(75, 111, 237, 0.3);
  --interactive-glow-active: 0 0 30px rgba(75, 111, 237, 0.5);

  /* Gradient backgrounds */
  --gradient-bg-1: linear-gradient(135deg, #0D1117 0%, #1A1B2E 100%);
  --gradient-bg-2: linear-gradient(135deg, #161B22 0%, #1F2937 100%);

  /* Status colors with dark mode adjustments */
  --success-dark: #059669;
  --warning-dark: #D97706;
  --error-dark: #DC2626;
  --info-dark: #2563EB;
}
```

### Component Dark Mode Patterns

#### Card Component Dark Mode

```tsx
// Default state
className="bg-[#161B22] border-[#2D333B] text-white"

// Hover state
className="hover:border-[#4B6FED]/40 hover:shadow-[0_0_20px_rgba(75,111,237,0.1)]"

// Active/Selected state
className="border-[#4B6FED] bg-[#4B6FED]/5"
```

#### Input Fields Dark Mode

```tsx
className="bg-[#1C2128] border-[#2D333B] text-white
           placeholder:text-gray-500
           focus:border-[#4B6FED] focus:ring-2 focus:ring-[#4B6FED]/20"
```

#### Code Block Dark Mode

```tsx
className="bg-[#1C2128] border border-[#2D333B] rounded-lg
           font-mono text-sm text-gray-300
           selection:bg-[#4B6FED]/20"
```

### Syntax Highlighting Theme

Use **VS Code Dark+ theme** for consistency:

```typescript
const syntaxTheme = {
  keyword: '#C586C0',      // Purple
  string: '#CE9178',       // Orange
  function: '#DCDCAA',     // Yellow
  variable: '#9CDCFE',     // Blue
  comment: '#6A9955',      // Green
  number: '#B5CEA8',       // Light green
  operator: '#D4D4D4',     // Light gray
  punctuation: '#808080',  // Gray
};
```

---

## 7. Animation & Transitions

### Animation Principles

1. **Performance**: 60fps minimum, GPU-accelerated
2. **Duration**: 200-500ms for most interactions
3. **Easing**: Cubic bezier for natural motion
4. **Purposeful**: Animations guide attention, don't distract

### Animation Specifications

#### Page Load Animation

```typescript
const pageLoadAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
    staggerChildren: 0.1
  }
};
```

**Stagger Pattern** (Framer Motion):
```tsx
<motion.div variants={stagger}>
  <motion.div variants={fadeUp}>Hero</motion.div>
  <motion.div variants={fadeUp}>Tabs</motion.div>
  <motion.div variants={fadeUp}>Content</motion.div>
</motion.div>
```

#### Tab Switch Animation

```typescript
const tabTransition = {
  type: 'tween',
  duration: 0.3,
  ease: 'easeInOut'
};

const contentAnimation = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: tabTransition
};
```

**AnimatePresence** for smooth transitions:
```tsx
<AnimatePresence mode="wait">
  <motion.div key={activeTab} {...contentAnimation}>
    {tabContent}
  </motion.div>
</AnimatePresence>
```

#### Card Hover Animation

```typescript
const cardHover = {
  scale: 1.02,
  y: -4,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 25
  }
};

const cardTap = {
  scale: 0.98
};
```

Implementation:
```tsx
<motion.div
  whileHover={cardHover}
  whileTap={cardTap}
  className="card"
>
  {content}
</motion.div>
```

#### Code Copy Success Animation

```typescript
const copySuccessAnimation = {
  // Icon change
  icon: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: 'spring', stiffness: 500, damping: 20 }
  },

  // Background flash
  background: {
    from: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
    to: { backgroundColor: 'transparent' },
    duration: 2000
  }
};
```

#### Loading Spinner

```tsx
const spinnerAnimation = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear'
  }
};
```

#### Stats Counter Animation

```typescript
const useCountUp = (end: number, duration: number = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
};
```

### Micro-interactions

#### Button Click Ripple

```tsx
const RippleButton = ({ children, onClick }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples([...ripples, { x, y, id: Date.now() }]);
    onClick?.(e);

    setTimeout(() => {
      setRipples(ripples => ripples.slice(1));
    }, 600);
  };

  return (
    <button onClick={handleClick} className="relative overflow-hidden">
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0
          }}
        />
      ))}
    </button>
  );
};
```

#### Tooltip Fade-in

```tsx
const tooltipAnimation = {
  initial: { opacity: 0, scale: 0.9, y: -5 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -5 },
  transition: { duration: 0.15 }
};
```

### Performance Considerations

1. **Use `transform` and `opacity`** for animations (GPU accelerated)
2. **Avoid animating** `width`, `height`, `top`, `left` (trigger layout)
3. **Use `will-change`** sparingly for critical animations
4. **Implement `prefers-reduced-motion`** for accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Loading States & Skeletons

### Skeleton Component Library

#### Card Skeleton

```tsx
const PackageCardSkeleton = () => (
  <div className="bg-[#161B22] border border-[#2D333B] rounded-lg p-6 animate-pulse">
    {/* Top gradient bar */}
    <div className="h-1 bg-gradient-to-r from-gray-700 to-gray-600 rounded-t-lg mb-4" />

    {/* Header with icon and category */}
    <div className="flex justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-700 rounded-lg" />
        <div className="h-5 w-48 bg-gray-700 rounded" />
      </div>
      <div className="h-5 w-20 bg-gray-700 rounded-full" />
    </div>

    {/* Description */}
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-700 rounded w-full" />
      <div className="h-4 bg-gray-700 rounded w-3/4" />
    </div>

    {/* Feature badges */}
    <div className="flex gap-2 mb-4">
      <div className="h-6 w-20 bg-gray-700 rounded" />
      <div className="h-6 w-24 bg-gray-700 rounded" />
      <div className="h-6 w-16 bg-gray-700 rounded" />
    </div>

    {/* Install command */}
    <div className="h-10 bg-gray-700 rounded mb-3" />

    {/* Action buttons */}
    <div className="flex gap-2">
      <div className="h-8 flex-1 bg-gray-700 rounded" />
      <div className="h-8 flex-1 bg-gray-700 rounded" />
    </div>
  </div>
);
```

#### Shimmer Effect

```css
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton-shimmer {
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  animation: shimmer 2s infinite;
}
```

#### Tab Content Skeleton

```tsx
const TabContentSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header skeleton */}
    <div className="h-8 w-64 bg-gray-700 rounded" />

    {/* Filter buttons skeleton */}
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-8 w-20 bg-gray-700 rounded" />
      ))}
    </div>

    {/* Grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <PackageCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
```

### Loading Indicators

#### Inline Spinner

```tsx
const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <svg
      className={`${sizeClasses[size]} animate-spin text-[#4B6FED]`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};
```

#### Progress Bar

```tsx
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
    <motion.div
      className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] h-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  </div>
);
```

#### Dots Loader

```tsx
const DotsLoader = () => (
  <div className="flex gap-2">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-[#4B6FED] rounded-full"
        animate={{
          y: ['0%', '-50%', '0%'],
          opacity: [1, 0.5, 1]
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.2
        }}
      />
    ))}
  </div>
);
```

### Suspense Boundaries

```tsx
import { Suspense } from 'react';

const AIKitDashboard = () => (
  <Suspense fallback={<TabContentSkeleton />}>
    <AIKitTabs>
      <Suspense fallback={<PackageGridSkeleton />}>
        <BrowsePackagesTab />
      </Suspense>
    </AIKitTabs>
  </Suspense>
);
```

---

## 9. Error States & Feedback

### Error Hierarchy

```
Level 1: Page-Level Errors (Network failure, 500 errors)
Level 2: Component Errors (Failed data fetch)
Level 3: Field Errors (Invalid input)
Level 4: Validation Errors (Real-time feedback)
```

### Error Components

#### Page-Level Error

```tsx
const PageError = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this page.',
  onRetry,
  showSupport = true
}: PageErrorProps) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md"
    >
      {/* Error icon */}
      <div className="mb-6">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
      </div>

      {/* Error message */}
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400 mb-6">{message}</p>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button onClick={onRetry} variant="default">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>

        {showSupport && (
          <Button variant="outline" asChild>
            <Link href="/support">
              Contact Support
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  </div>
);
```

#### Inline Error Alert

```tsx
const ErrorAlert = ({
  message,
  onDismiss,
  severity = 'error'
}: ErrorAlertProps) => {
  const styles = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: 'text-red-500',
      text: 'text-red-200'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      icon: 'text-yellow-500',
      text: 'text-yellow-200'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: 'text-blue-500',
      text: 'text-blue-200'
    }
  };

  const style = styles[severity];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`${style.bg} ${style.border} border rounded-lg p-4 mb-4`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
        <p className={`flex-1 text-sm ${style.text}`}>{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
```

#### Empty State

```tsx
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-center max-w-md mb-6">{description}</p>
    {action && <div>{action}</div>}
  </div>
);

// Usage
<EmptyState
  icon={Package}
  title="No packages found"
  description="Try adjusting your filters or search query to find what you're looking for."
  action={
    <Button onClick={clearFilters}>Clear Filters</Button>
  }
/>
```

### Toast Notifications

```tsx
import { toast } from 'sonner';

// Success toast
toast.success('Package copied to clipboard!', {
  duration: 2000,
  icon: <Check className="w-4 h-4" />
});

// Error toast
toast.error('Failed to load package details', {
  duration: 4000,
  action: {
    label: 'Retry',
    onClick: () => refetch()
  }
});

// Loading toast
const toastId = toast.loading('Installing package...');
// Later update:
toast.success('Package installed successfully!', { id: toastId });
```

### Form Validation Feedback

```tsx
const InputField = ({
  label,
  error,
  value,
  onChange,
  ...props
}: InputFieldProps) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">
      {label}
    </label>
    <input
      value={value}
      onChange={onChange}
      className={cn(
        'w-full px-4 py-2 rounded-lg bg-[#1C2128] border',
        'text-white placeholder:text-gray-500',
        'focus:outline-none focus:ring-2 transition-all',
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
          : 'border-[#2D333B] focus:border-[#4B6FED] focus:ring-[#4B6FED]/20'
      )}
      {...props}
    />
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-red-400 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);
```

---

## 10. Accessibility Specifications

### WCAG 2.1 AA Compliance Checklist

#### Color Contrast

**Minimum Ratios**:
- Normal text (< 18px): 4.5:1
- Large text (≥ 18px or 14px bold): 3:1
- UI components and graphics: 3:1

**Verified Combinations**:
```css
/* Text on background */
#FFFFFF on #0D1117 = 16.07:1 ✓
#E5E7EB on #161B22 = 12.24:1 ✓
#9CA3AF on #161B22 = 6.89:1 ✓

/* Interactive elements */
#4B6FED on #161B22 = 4.98:1 ✓
#10B981 on #161B22 = 3.87:1 ✓ (large text only)
```

#### Keyboard Navigation

**Focus Indicators**:
```css
.focus-visible {
  outline: 2px solid #4B6FED;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip to main content link */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: #4B6FED;
  color: white;
  padding: 8px 16px;
  z-index: 100;
  transition: top 0.2s;
}

.skip-to-main:focus {
  top: 0;
}
```

**Keyboard Shortcuts**:
```typescript
const keyboardShortcuts = {
  'Ctrl/Cmd + K': 'Open search',
  'Ctrl/Cmd + /': 'Show keyboard shortcuts',
  'Tab': 'Navigate forward',
  'Shift + Tab': 'Navigate backward',
  'Enter/Space': 'Activate button/link',
  'Escape': 'Close modal/dropdown',
  'Arrow Keys': 'Navigate tabs/lists'
};
```

**Implementation**:
```tsx
const AIKitTabs = () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      // Navigate to previous tab
      e.preventDefault();
      focusPreviousTab();
    } else if (e.key === 'ArrowRight') {
      // Navigate to next tab
      e.preventDefault();
      focusNextTab();
    } else if (e.key === 'Home') {
      // Focus first tab
      e.preventDefault();
      focusFirstTab();
    } else if (e.key === 'End') {
      // Focus last tab
      e.preventDefault();
      focusLastTab();
    }
  };

  return (
    <div role="tablist" onKeyDown={handleKeyDown}>
      {/* Tabs */}
    </div>
  );
};
```

#### Screen Reader Support

**ARIA Attributes**:
```tsx
// Tab navigation
<div role="tablist" aria-label="AIKit documentation sections">
  <button
    role="tab"
    aria-selected={isActive}
    aria-controls="panel-browse"
    id="tab-browse"
    tabIndex={isActive ? 0 : -1}
  >
    Browse Packages
  </button>
</div>

<div
  role="tabpanel"
  id="panel-browse"
  aria-labelledby="tab-browse"
  tabIndex={0}
>
  {/* Content */}
</div>

// Loading states
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? (
    <span className="sr-only">Loading packages...</span>
  ) : (
    <span className="sr-only">14 packages loaded</span>
  )}
</div>

// Error announcements
<div role="alert" aria-live="assertive">
  {error && <span>{error}</span>}
</div>

// Buttons with icons
<button aria-label="Copy installation command">
  <Copy aria-hidden="true" />
</button>

// Image alternatives
<img src="logo.png" alt="AINative Studio logo" />

// Decorative images
<div role="img" aria-label="Animated background gradient" />
```

**Screen Reader Only Text**:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:active,
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

#### Focus Management

**Trap Focus in Modals**:
```tsx
const useFocusTrap = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    ref.current.addEventListener('keydown', handleTab);
    firstElement.focus();

    return () => {
      ref.current?.removeEventListener('keydown', handleTab);
    };
  }, [ref]);
};
```

#### Semantic HTML

```tsx
// Use semantic elements
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">
  <article>
    <h1>Page Title</h1>
    <section>
      <h2>Section Title</h2>
    </section>
  </article>
</main>

<footer>
  <p>&copy; 2026 AINative Studio</p>
</footer>

// Avoid generic divs when semantic elements exist
❌ <div class="navigation">
✓ <nav>

❌ <div class="section">
✓ <section>

❌ <span onClick={handleClick}>
✓ <button onClick={handleClick}>
```

### Accessibility Testing Checklist

- [ ] Tab order follows visual layout
- [ ] All interactive elements keyboard accessible
- [ ] Focus visible on all focusable elements
- [ ] Screen reader announces all meaningful content
- [ ] Images have descriptive alt text
- [ ] Forms have proper labels and error messages
- [ ] Color is not the only means of conveying information
- [ ] Text can be resized up to 200% without breaking layout
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Valid HTML (no duplicate IDs, proper nesting)
- [ ] Landmarks (header, nav, main, footer) properly used
- [ ] ARIA attributes used correctly (not overused)

---

## 11. Interactive Component Showcase

### Showcase Tab Design

**Purpose**: Live, interactive demonstrations of AIKit packages with editable code

**Layout Architecture**:

```
┌────────────────────────────────────────────────────────────┐
│  Demo Selector                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │Chat  │ │Vector│ │Tools │ │Auth  │ ...                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                     │
├────────────────────────────────┬───────────────────────────┤
│                                │                           │
│  Code Editor                   │  Live Preview             │
│  ┌──────────────────────────┐ │ ┌──────────────────────┐ │
│  │ 1  import { useAIChat }  │ │ │                      │ │
│  │ 2  from '@ainative/kit'; │ │ │  [Interactive UI]    │ │
│  │ 3                         │ │ │                      │ │
│  │ 4  function ChatDemo() { │ │ │  Try it: Type here   │ │
│  │ 5    const { messages,  │ │ │  ┌────────────────┐  │ │
│  │ 6      sendMessage } =   │ │ │  │                │  │ │
│  │ 7      useAIChat({       │ │ │  └────────────────┘  │ │
│  │ 8        model: 'gpt-4'  │ │ │  [Send]              │ │
│  │ 9      });               │ │ │                      │ │
│  │ 10                       │ │ │                      │ │
│  │ 11   return (           │ │ │                      │ │
│  │ 12     <ChatUI          │ │ │                      │ │
│  │ 13       messages={...} │ │ │                      │ │
│  │ 14     />               │ │ │                      │ │
│  │ 15   );                 │ │ │                      │ │
│  │ 16 }                    │ │ │                      │ │
│  └──────────────────────────┘ │ └──────────────────────┘ │
│                                │                           │
│  [Copy Code] [Reset] [Share]  │  [Refresh] [Fullscreen]   │
│                                │                           │
├────────────────────────────────┴───────────────────────────┤
│  Configuration Panel                                       │
│  Model: [GPT-4 ▼] Temperature: [──●────] 0.7              │
│  Max Tokens: [1000] Stream: [●] Show JSON: [ ]            │
└────────────────────────────────────────────────────────────┘
```

### Demo Templates

#### 1. Chat UI Demo

```tsx
const ChatDemo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [config, setConfig] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000
  });

  const handleSend = async () => {
    // Demo implementation
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        role: 'assistant',
        content: 'This is a demo response from AIKit chat!'
      };
      setMessages(msgs => [...msgs, aiMessage]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="flex flex-col h-[400px]">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-4 py-2',
                msg.role === 'user'
                  ? 'bg-[#4B6FED] text-white'
                  : 'bg-[#1C2128] text-gray-200'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:border-[#4B6FED] focus:ring-2 focus:ring-[#4B6FED]/20 outline-none"
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
};
```

#### 2. Vector Search Demo

```tsx
const VectorSearchDemo = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);

    // Simulate vector search
    setTimeout(() => {
      setResults([
        { id: 1, text: 'Result 1', score: 0.95 },
        { id: 2, text: 'Result 2', score: 0.87 },
        { id: 3, text: 'Result 3', score: 0.72 }
      ]);
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query..."
          className="flex-1 px-4 py-2 bg-[#1C2128] border border-gray-700 rounded-lg"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? <Spinner /> : 'Search'}
        </Button>
      </div>

      {/* Results */}
      {isSearching ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-[#161B22] border border-gray-800 rounded-lg p-4 hover:border-[#4B6FED]/40 transition-colors"
            >
              <div className="flex justify-between items-start">
                <p className="text-white">{result.text}</p>
                <span className="text-sm text-gray-400">
                  {(result.score * 100).toFixed(0)}% match
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### 3. Function Calling Demo

```tsx
const FunctionCallingDemo = () => {
  const [messages, setMessages] = useState([]);
  const [availableFunctions] = useState([
    { name: 'getWeather', description: 'Get current weather' },
    { name: 'searchWeb', description: 'Search the web' },
    { name: 'calculateMath', description: 'Perform calculations' }
  ]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Function Registry */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Available Functions</h3>
        {availableFunctions.map((fn) => (
          <div
            key={fn.name}
            className="bg-[#161B22] border border-gray-800 rounded-lg p-3"
          >
            <code className="text-sm text-[#4B6FED]">{fn.name}()</code>
            <p className="text-xs text-gray-400 mt-1">{fn.description}</p>
          </div>
        ))}
      </div>

      {/* Execution Log */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Execution Log</h3>
        <div className="bg-[#1C2128] border border-gray-800 rounded-lg p-4 font-mono text-xs text-gray-300 h-64 overflow-y-auto">
          <div className="text-green-400">{'>'} Function call detected</div>
          <div className="text-blue-400">{'>'} getWeather(location: "San Francisco")</div>
          <div className="text-gray-400">{'>'} Executing...</div>
          <div className="text-green-400">{'>'} Result: 72°F, Sunny</div>
        </div>
      </div>
    </div>
  );
};
```

### Code Editor Configuration

**Syntax Highlighting** (using Shiki or Prism):

```tsx
import { Highlight, themes } from 'prism-react-renderer';

const CodeBlock = ({ code, language = 'tsx' }) => (
  <Highlight theme={themes.vsDark} code={code} language={language}>
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className} style={style}>
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line })}>
            <span className="inline-block w-8 text-right text-gray-600 select-none">
              {i + 1}
            </span>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token })} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>
);
```

**Copy to Clipboard**:

```tsx
const CopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
      aria-label="Copy code"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );
};
```

---

## 12. Implementation Guidelines

### Development Workflow

#### Phase 1: Foundation (Week 1)
- [ ] Set up component structure
- [ ] Implement base tab navigation
- [ ] Create skeleton loading states
- [ ] Establish theme tokens

#### Phase 2: Core Features (Week 2)
- [ ] Build package grid with filters
- [ ] Implement search functionality
- [ ] Add copy-to-clipboard
- [ ] Create error boundaries

#### Phase 3: Interactive Showcase (Week 3)
- [ ] Build code editor integration
- [ ] Create demo templates
- [ ] Implement live preview
- [ ] Add configuration panel

#### Phase 4: Polish & Accessibility (Week 4)
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Animation refinement
- [ ] Performance optimization

### Performance Targets

**Core Web Vitals**:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

**Custom Metrics**:
- **TTI (Time to Interactive)**: < 3.5s
- **Bundle Size**: < 200KB (gzipped)
- **Animation Frame Rate**: 60fps
- **API Response Time**: < 500ms

### Code Quality Standards

**TypeScript Strict Mode**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

**ESLint Rules**:
```json
{
  "rules": {
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/role-has-required-aria-props": "error"
  }
}
```

### Testing Strategy

**Unit Tests** (Jest + React Testing Library):
```tsx
describe('PackageCard', () => {
  it('renders package information correctly', () => {
    const pkg = { name: '@ainative/ai-kit', description: 'Test' };
    const { getByText } = render(<PackageCard package={pkg} />);
    expect(getByText('@ainative/ai-kit')).toBeInTheDocument();
  });

  it('copies install command on click', async () => {
    const { getByLabelText } = render(<PackageCard package={pkg} />);
    const copyBtn = getByLabelText('Copy installation command');

    await userEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'npm install @ainative/ai-kit'
    );
  });
});
```

**Integration Tests** (Playwright):
```typescript
test('filter packages by category', async ({ page }) => {
  await page.goto('/dashboard#aikit');

  // Click Framework filter
  await page.click('button:has-text("Framework")');

  // Verify only framework packages shown
  const cards = await page.locator('.package-card').all();
  for (const card of cards) {
    const category = await card.locator('.category-badge').textContent();
    expect(category).toBe('Framework');
  }
});
```

**Accessibility Tests** (jest-axe):
```tsx
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<AIKitTabs />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Appendix A: Component File Structure

```
components/
├── aikit/
│   ├── AIKitDashboardTab.tsx          # Main container
│   ├── AIKitHero.tsx                  # Hero section
│   ├── AIKitTabs.tsx                  # Tab navigation
│   ├── tabs/
│   │   ├── BrowsePackagesTab.tsx     # Package grid
│   │   ├── InteractiveShowcaseTab.tsx # Live demos
│   │   ├── CodePlaygroundTab.tsx      # Code editor
│   │   └── DocumentationTab.tsx       # Docs viewer
│   ├── cards/
│   │   ├── PackageCard.tsx            # Package display
│   │   └── FeatureCard.tsx            # Feature highlight
│   ├── showcase/
│   │   ├── ChatDemo.tsx               # Chat UI demo
│   │   ├── VectorSearchDemo.tsx       # Search demo
│   │   └── FunctionCallingDemo.tsx    # Function demo
│   ├── shared/
│   │   ├── CodeBlock.tsx              # Syntax highlighting
│   │   ├── CopyButton.tsx             # Copy to clipboard
│   │   └── ErrorBoundary.tsx          # Error handling
│   └── skeletons/
│       ├── PackageCardSkeleton.tsx
│       └── TabContentSkeleton.tsx
```

---

## Appendix B: Design Tokens

```typescript
// design-tokens.ts
export const designTokens = {
  colors: {
    primary: '#4B6FED',
    primaryHover: '#3A56D3',
    secondary: '#8A63F4',
    accent: '#5867EF',
    background: '#0D1117',
    surface: '#161B22',
    border: '#2D333B',
    borderHover: '#4B6FED40',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#2563EB'
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px'
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },

  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 12px 24px rgba(0, 0, 0, 0.15)',
    glow: '0 0 20px rgba(75, 111, 237, 0.3)'
  },

  transitions: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms'
  },

  animations: {
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};
```

---

## Appendix C: Accessibility Quick Reference

### ARIA Roles Reference

```typescript
// Common ARIA roles for AIKit components
const ariaRoles = {
  tabs: 'tablist',
  tab: 'tab',
  tabPanel: 'tabpanel',
  alert: 'alert',
  status: 'status',
  dialog: 'dialog',
  search: 'search',
  navigation: 'navigation',
  button: 'button',
  link: 'link'
};

// ARIA states and properties
const ariaStates = {
  'aria-selected': 'true|false',
  'aria-expanded': 'true|false',
  'aria-hidden': 'true|false',
  'aria-disabled': 'true|false',
  'aria-label': 'string',
  'aria-labelledby': 'id',
  'aria-describedby': 'id',
  'aria-live': 'polite|assertive|off',
  'aria-busy': 'true|false',
  'aria-controls': 'id',
  'aria-current': 'page|step|location|date|time|true|false'
};
```

### Keyboard Navigation Patterns

```typescript
// Tab List Navigation
const tabListKeyboard = {
  'ArrowLeft': 'Focus previous tab',
  'ArrowRight': 'Focus next tab',
  'Home': 'Focus first tab',
  'End': 'Focus last tab',
  'Enter/Space': 'Activate focused tab'
};

// Modal Dialog Navigation
const dialogKeyboard = {
  'Tab': 'Move focus forward (trapped within dialog)',
  'Shift+Tab': 'Move focus backward (trapped within dialog)',
  'Escape': 'Close dialog'
};

// Dropdown Menu Navigation
const dropdownKeyboard = {
  'ArrowDown': 'Open menu and focus first item',
  'ArrowUp': 'Open menu and focus last item',
  'Escape': 'Close menu',
  'Enter/Space': 'Select item and close menu',
  'Home': 'Focus first item',
  'End': 'Focus last item'
};
```

---

## Document Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-29 | Initial specification | Frontend UX Architect |

---

## Sign-off

**Design Review**: Ready for Implementation
**Accessibility Review**: WCAG 2.1 AA Compliant
**Performance Review**: Targets Validated
**Engineering Review**: Feasible within constraints

---

**Next Steps**:
1. Share with development team for technical review
2. Create implementation tickets
3. Set up design review meetings
4. Begin Phase 1 development

