# AIKit Dashboard - Responsive Breakpoints Specification

**Mobile-First Design System**
**Version:** 1.0
**Date:** 2026-01-29

---

## Breakpoint System

### Breakpoint Definitions

Following Tailwind CSS v4 conventions:

```typescript
const breakpoints = {
  'xs': '320px',   // Extra small phones (portrait)
  'sm': '640px',   // Small phones (landscape) / large phones (portrait)
  'md': '768px',   // Tablets (portrait)
  'lg': '1024px',  // Tablets (landscape) / small laptops
  'xl': '1280px',  // Laptops / desktops
  '2xl': '1536px'  // Large desktops
};
```

### Target Devices

| Breakpoint | Device Examples | Resolution | Orientation |
|------------|-----------------|------------|-------------|
| xs | iPhone SE, Galaxy S8 | 320-639px | Portrait |
| sm | iPhone 12 Pro, Pixel 5 | 640-767px | Landscape |
| md | iPad Mini, Galaxy Tab | 768-1023px | Portrait |
| lg | iPad Pro, Surface | 1024-1279px | Landscape |
| xl | 13" MacBook, 15" laptop | 1280-1535px | - |
| 2xl | 27" iMac, 4K displays | 1536px+ | - |

---

## Layout Patterns by Breakpoint

### Mobile Portrait (320px - 639px)

**Design Priorities:**
- Single column layout
- Touch-first interactions
- Bottom-anchored CTAs
- Stacked components
- Maximum content width

**Visual Layout:**
```
┌─────────────────────────────────────────┐
│  [☰] AI Kit Dashboard            [👤]  │ ← Sticky header (56px)
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Hero Section                     │ │
│  │  (Full width, 300px height)       │ │
│  │                                   │ │
│  │  AI Kit Package Ecosystem         │ │
│  │  14 Packages | 50K+ Downloads     │ │
│  │                                   │ │
│  │  [Get Started]                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Tabs (Horizontal Scroll)         │ │
│  │  [Browse] [Showcase] [Playground] │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Package Card 1 (Full width)      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Package Card 2 (Full width)      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Package Card 3 (Full width)      │ │
│  └───────────────────────────────────┘ │
│                                         │
│         [Load More]                     │
│                                         │
└─────────────────────────────────────────┘
```

**Component Adaptations:**

**Hero Section:**
```tsx
// Mobile-specific styling
<div className="px-4 py-8">
  <h1 className="text-3xl font-bold mb-3">
    AI Kit Package Ecosystem
  </h1>
  <p className="text-base text-gray-400 mb-6">
    Build AI apps 10x faster
  </p>
  <div className="flex flex-col gap-3">
    <Button size="lg" className="w-full">Get Started</Button>
    <Button variant="outline" size="lg" className="w-full">View Docs</Button>
  </div>
</div>
```

**Tabs:**
```tsx
// Horizontal scroll with snap points
<div className="overflow-x-auto scrollbar-hide">
  <div className="flex gap-2 px-4 pb-2" style={{ width: 'max-content' }}>
    <Button variant={active === 'browse' ? 'default' : 'ghost'}>
      Browse
    </Button>
    <Button variant={active === 'showcase' ? 'default' : 'ghost'}>
      Showcase
    </Button>
    <Button variant={active === 'playground' ? 'default' : 'ghost'}>
      Playground
    </Button>
    <Button variant={active === 'docs' ? 'default' : 'ghost'}>
      Docs
    </Button>
  </div>
</div>

<style jsx>{`
  .overflow-x-auto {
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  button {
    scroll-snap-align: start;
  }
`}</style>
```

**Package Grid:**
```tsx
// Single column
<div className="grid grid-cols-1 gap-4 px-4">
  {packages.map(pkg => (
    <PackageCard key={pkg.name} package={pkg} />
  ))}
</div>
```

**Touch Target Minimum:** 44x44px

```css
/* Ensure all interactive elements meet minimum size */
.btn-mobile {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}
```

---

### Mobile Landscape (640px - 767px)

**Design Priorities:**
- Utilize horizontal space
- 2-column grid where appropriate
- Maintain touch targets
- Optimize for wider viewport

**Visual Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  [☰] AI Kit Dashboard                              [👤]       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Hero (400px height, centered)                           │ │
│  │                                                          │ │
│  │  [Get Started]  [View Docs]  [GitHub]                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [Browse] [Showcase] [Playground] [Docs]                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌────────────────────────┐  ┌────────────────────────┐       │
│  │  Package Card 1        │  │  Package Card 2        │       │
│  └────────────────────────┘  └────────────────────────┘       │
│                                                                │
│  ┌────────────────────────┐  ┌────────────────────────┐       │
│  │  Package Card 3        │  │  Package Card 4        │       │
│  └────────────────────────┘  └────────────────────────┘       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Component Adaptations:**

```tsx
// 2-column grid
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
  {packages.map(pkg => (
    <PackageCard key={pkg.name} package={pkg} />
  ))}
</div>

// Hero buttons horizontal
<div className="flex flex-row gap-3 justify-center">
  <Button size="lg">Get Started</Button>
  <Button variant="outline" size="lg">View Docs</Button>
  <Button variant="ghost" size="lg">GitHub</Button>
</div>
```

---

### Tablet Portrait (768px - 1023px)

**Design Priorities:**
- 2-column layouts
- Sidebar navigation (collapsible)
- Hybrid touch/mouse support
- Optimize for reading

**Visual Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  Header with full navigation                        [Profile] │
├────┬───────────────────────────────────────────────────────────┤
│    │                                                           │
│ S  │  ┌─────────────────────────────────────────────────────┐ │
│ i  │  │  Hero Section (500px height)                        │ │
│ d  │  │                                                     │ │
│ e  │  │  AI Kit Package Ecosystem                           │ │
│ b  │  │  Build AI Apps 10x Faster                           │ │
│ a  │  │                                                     │ │
│ r  │  │  [Get Started]  [View Docs]  [GitHub]               │ │
│    │  └─────────────────────────────────────────────────────┘ │
│ [  │                                                           │
│ C  │  ┌─────────────────────────────────────────────────────┐ │
│ o  │  │  [Browse] [Showcase] [Playground] [Docs]            │ │
│ l  │  └─────────────────────────────────────────────────────┘ │
│ l  │                                                           │
│ a  │  Filter: [All] [Core] [Framework] [DevTools]             │
│ p  │                                                           │
│ s  │  ┌─────────────────────┐  ┌─────────────────────┐        │
│ e  │  │  Package Card 1     │  │  Package Card 2     │        │
│ ]  │  └─────────────────────┘  └─────────────────────┘        │
│    │                                                           │
│    │  ┌─────────────────────┐  ┌─────────────────────┐        │
│    │  │  Package Card 3     │  │  Package Card 4     │        │
│    │  └─────────────────────┘  └─────────────────────┘        │
│    │                                                           │
└────┴───────────────────────────────────────────────────────────┘
```

**Component Adaptations:**

**Sidebar:**
```tsx
// Collapsible sidebar
const [sidebarOpen, setSidebarOpen] = useState(true);

<div className="flex">
  {/* Sidebar - collapsible on tablet */}
  <aside
    className={cn(
      'transition-all duration-300',
      sidebarOpen ? 'w-64' : 'w-16'
    )}
  >
    <button onClick={() => setSidebarOpen(!sidebarOpen)}>
      {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
    </button>
    {/* Sidebar content */}
  </aside>

  {/* Main content */}
  <main className="flex-1 p-6">
    {children}
  </main>
</div>
```

**Package Grid:**
```tsx
// 2-column grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {packages.map(pkg => (
    <PackageCard key={pkg.name} package={pkg} />
  ))}
</div>
```

**Interactive Showcase Split:**
```tsx
// Vertical split for code/preview
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="code-editor">
    <CodePreview />
  </div>
  <div className="preview-pane">
    <LivePreview />
  </div>
</div>
```

---

### Tablet Landscape / Small Laptop (1024px - 1279px)

**Design Priorities:**
- 3-column layouts
- Fixed sidebar
- Full keyboard navigation
- Optimized for productivity

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  Header with full navigation                          [Search] [👤] │
├────┬─────────────────────────────────────────────────────────────────┤
│    │                                                                 │
│ S  │  ┌───────────────────────────────────────────────────────────┐ │
│ i  │  │  Hero Section (500px height, centered)                    │ │
│ d  │  │                                                           │ │
│ e  │  │  AI Kit Package Ecosystem                                 │ │
│ b  │  │  Build AI Apps 10x Faster                                 │ │
│ a  │  │                                                           │ │
│ r  │  │  14 Packages | 50K+ Downloads | 1.2K Stars                │ │
│    │  │                                                           │ │
│    │  │  [Get Started]  [View Docs]  [GitHub]                     │ │
│ F  │  └───────────────────────────────────────────────────────────┘ │
│ i  │                                                                 │
│ x  │  ┌───────────────────────────────────────────────────────────┐ │
│ e  │  │  [Browse] [Showcase] [Playground] [Docs]                  │ │
│ d  │  └───────────────────────────────────────────────────────────┘ │
│    │                                                                 │
│    │  Filter: [All] [Core] [Framework] [DevTools] [Security] ...    │
│    │                                                                 │
│    │  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│    │  │  Card 1  │  │  Card 2  │  │  Card 3  │                     │
│    │  └──────────┘  └──────────┘  └──────────┘                     │
│    │                                                                 │
│    │  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│    │  │  Card 4  │  │  Card 5  │  │  Card 6  │                     │
│    │  └──────────┘  └──────────┘  └──────────┘                     │
│    │                                                                 │
└────┴─────────────────────────────────────────────────────────────────┘
```

**Component Adaptations:**

**Fixed Sidebar:**
```tsx
<div className="flex min-h-screen">
  {/* Fixed sidebar on desktop */}
  <aside className="hidden lg:block w-72 fixed left-0 top-16 h-[calc(100vh-64px)] overflow-y-auto border-r border-gray-800">
    <Sidebar />
  </aside>

  {/* Main content with left margin for sidebar */}
  <main className="flex-1 lg:ml-72 p-8">
    {children}
  </main>
</div>
```

**Package Grid:**
```tsx
// 3-column grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {packages.map(pkg => (
    <PackageCard key={pkg.name} package={pkg} />
  ))}
</div>
```

**Code Playground:**
```tsx
// Multi-pane layout
<div className="grid grid-cols-12 gap-4 h-[600px]">
  {/* Code editor - 7 columns */}
  <div className="col-span-12 lg:col-span-7">
    <MonacoEditor />
  </div>

  {/* Preview - 5 columns */}
  <div className="col-span-12 lg:col-span-5">
    <LivePreview />
  </div>

  {/* Console - full width below */}
  <div className="col-span-12 lg:col-span-12 h-32">
    <Console />
  </div>
</div>
```

---

### Desktop (1280px - 1535px)

**Design Priorities:**
- Maximum information density
- Multi-column layouts
- Hover interactions
- Keyboard shortcuts
- Command palette

**Visual Layout:**
```
┌────────────────────────────────────────────────────────────────────────────┐
│  [Logo] AI Kit Dashboard     [Browse] [Docs] [Pricing]    [Search] [👤]  │
├────┬───────────────────────────────────────────────────────────────────────┤
│    │                                                                       │
│    │  ┌─────────────────────────────────────────────────────────────────┐ │
│    │  │  Hero Section (600px height, max-width 1200px, centered)        │ │
│ S  │  │                                                                 │ │
│ i  │  │  AI Kit Package Ecosystem                                       │ │
│ d  │  │  Build AI Apps 10x Faster                                       │ │
│ e  │  │                                                                 │ │
│ b  │  │  A comprehensive suite of NPM packages for building             │ │
│ a  │  │  production-ready AI applications                               │ │
│ r  │  │                                                                 │ │
│    │  │  14 Packages | 50K+ Downloads | 1.2K Stars | Open Source       │ │
│    │  │                                                                 │ │
│ 2  │  │  [Get Started]  [View Docs]  [GitHub]                           │ │
│ 8  │  └─────────────────────────────────────────────────────────────────┘ │
│ 8  │                                                                       │
│ p  │  ┌─────────────────────────────────────────────────────────────────┐ │
│ x  │  │  [Browse Packages] [Interactive Showcase] [Code Playground]     │ │
│    │  │  [Documentation]                                                │ │
│    │  └─────────────────────────────────────────────────────────────────┘ │
│    │                                                                       │
│    │  Filter: [All] [Core] [Framework] [DevTools] [Security] [ML] ...    │
│    │  Search: [Type to search packages...]                      14 found │
│    │                                                                       │
│    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│    │  │  Card 1  │  │  Card 2  │  │  Card 3  │  │  Card 4  │            │
│    │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│    │                                                                       │
│    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│    │  │  Card 5  │  │  Card 6  │  │  Card 7  │  │  Card 8  │            │
│    │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│    │                                                                       │
└────┴───────────────────────────────────────────────────────────────────────┘
```

**Component Adaptations:**

**Package Grid:**
```tsx
// 4-column grid for large screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {packages.map(pkg => (
    <PackageCard key={pkg.name} package={pkg} />
  ))}
</div>
```

**Code Playground Enhanced:**
```tsx
// Advanced multi-pane layout with resizable panels
<div className="grid grid-cols-12 gap-4 h-[800px]">
  {/* Left sidebar - file tree */}
  <div className="col-span-2 overflow-y-auto">
    <FileTree />
  </div>

  {/* Editor */}
  <div className="col-span-6">
    <MonacoEditor
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: 'on',
        folding: true
      }}
    />
  </div>

  {/* Preview + Console */}
  <div className="col-span-4 flex flex-col">
    <div className="flex-1 overflow-auto">
      <LivePreview />
    </div>
    <div className="h-48 border-t border-gray-800">
      <Console />
    </div>
  </div>
</div>
```

**Hover Tooltips:**
```tsx
// Rich hover tooltips on desktop
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon">
      <Info className="w-4 h-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent side="right" className="max-w-xs">
    <p className="font-medium mb-1">AI Kit Core</p>
    <p className="text-sm text-gray-400">
      Core utilities and shared types for the AI Kit ecosystem.
      Includes base interfaces, type definitions, and common helpers.
    </p>
    <div className="flex gap-2 mt-2">
      <Badge>TypeScript</Badge>
      <Badge>v1.2.0</Badge>
    </div>
  </TooltipContent>
</Tooltip>
```

---

### Large Desktop (1536px+)

**Design Priorities:**
- Maximum content display
- Wide reading measures
- Side-by-side comparisons
- Multi-panel layouts

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [Logo] AI Kit Dashboard     [Browse] [Docs] [Pricing]       [Search] [👤]      │
├────┬─────────────────────────────────────────────────────────────────────────────┤
│    │                                                                             │
│    │  ┌───────────────────────────────────────────────────────────────────────┐ │
│    │  │  Hero (max-width 1400px, centered)                                    │ │
│    │  └───────────────────────────────────────────────────────────────────────┘ │
│    │                                                                             │
│    │  ┌───────────────────────────────────────────────────────────────────────┐ │
│ S  │  │  [Browse] [Showcase] [Playground] [Docs]                              │ │
│ i  │  └───────────────────────────────────────────────────────────────────────┘ │
│ d  │                                                                             │
│ e  │  Filters + Search (inline, left-aligned)                                   │
│ b  │                                                                             │
│ a  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐              │
│ r  │  │Card 1│  │Card 2│  │Card 3│  │Card 4│  │Card 5│  │Card 6│              │
│    │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘              │
│ 3  │                                                                             │
│ 2  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐              │
│ 0  │  │Card 7│  │Card 8│  │Card 9│  │Card10│  │Card11│  │Card12│              │
│ p  │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘              │
│ x  │                                                                             │
│    │                                                                             │
└────┴─────────────────────────────────────────────────────────────────────────────┘
```

**Component Adaptations:**

```tsx
// 5-6 column grid for extra large screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 max-w-[1600px] mx-auto">
  {packages.map(pkg => (
    <PackageCard key={pkg.name} package={pkg} />
  ))}
</div>

// Or for very wide screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
  {packages.map(pkg => (
    <PackageCard key={pkg.name} package={pkg} />
  ))}
</div>
```

---

## Responsive Utilities

### Container Queries

```tsx
// Use container queries for component-level responsiveness
<div className="@container">
  <div className="@sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4">
    {items}
  </div>
</div>
```

### Responsive Typography

```tsx
// Fluid typography scaling
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
  AI Kit Package Ecosystem
</h1>

// Or using CSS clamp
.hero-title {
  font-size: clamp(2rem, 5vw, 4.5rem);
}
```

### Responsive Spacing

```tsx
// Responsive padding/margin
<div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
  <div className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24">
    {content}
  </div>
</div>
```

---

## Testing Checklist

### Per Breakpoint

- [ ] **xs (320px)**
  - [ ] All content visible
  - [ ] No horizontal scroll
  - [ ] Touch targets ≥ 44px
  - [ ] Single column layout
  - [ ] Bottom CTAs accessible

- [ ] **sm (640px)**
  - [ ] 2-column grid where appropriate
  - [ ] Touch targets maintained
  - [ ] Horizontal space utilized

- [ ] **md (768px)**
  - [ ] Sidebar appears (collapsible)
  - [ ] 2-column layouts
  - [ ] Touch/mouse hybrid works

- [ ] **lg (1024px)**
  - [ ] 3-column grid
  - [ ] Fixed sidebar
  - [ ] All keyboard shortcuts work
  - [ ] Hover states functional

- [ ] **xl (1280px)**
  - [ ] 4-column grid (optional)
  - [ ] Max content width enforced
  - [ ] Rich hover interactions

- [ ] **2xl (1536px+)**
  - [ ] 5-6 column grid
  - [ ] Content centered
  - [ ] No excessive white space

### Cross-Breakpoint

- [ ] Smooth transitions between breakpoints
- [ ] No content jumps or jank
- [ ] Images scale appropriately
- [ ] Typography remains readable
- [ ] No broken layouts
- [ ] Animations respect reduced-motion

---

## Implementation Examples

### Complete Responsive Component

```tsx
const AIKitDashboard = () => {
  return (
    <div className="min-h-screen bg-vite-bg">
      {/* Header - responsive */}
      <header className="sticky top-0 z-50 bg-vite-surface border-b border-gray-800">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu button */}
            <button className="lg:hidden">
              <Menu />
            </button>

            {/* Logo */}
            <Link href="/" className="text-xl font-bold">
              AI Kit
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex gap-6">
              <Link href="/browse">Browse</Link>
              <Link href="/docs">Docs</Link>
              <Link href="/pricing">Pricing</Link>
            </nav>

            {/* Profile */}
            <div className="flex items-center gap-4">
              <button className="hidden md:block">
                <Search />
              </button>
              <Avatar />
            </div>
          </div>
        </div>
      </header>

      {/* Layout with sidebar */}
      <div className="flex">
        {/* Sidebar - hidden on mobile, collapsible on tablet, fixed on desktop */}
        <aside className={cn(
          'fixed lg:static inset-y-0 left-0 z-40',
          'w-72 bg-vite-surface border-r border-gray-800',
          'transform transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden">
          {/* Hero - responsive height and padding */}
          <section className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                AI Kit Package Ecosystem
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-6 sm:mb-8">
                Build AI apps 10x faster with our comprehensive suite
              </p>

              {/* Responsive button group */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Docs
                </Button>
              </div>
            </div>
          </section>

          {/* Tabs - responsive layout */}
          <section className="border-b border-gray-800">
            <div className="container-custom">
              {/* Mobile: horizontal scroll */}
              <div className="lg:hidden overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 px-4 pb-2" style={{ width: 'max-content' }}>
                  {tabs.map(tab => (
                    <Button key={tab.id} variant={activeTab === tab.id ? 'default' : 'ghost'}>
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Desktop: normal tab list */}
              <div className="hidden lg:flex gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={cn(
                      'px-6 py-3 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'border-b-2 border-primary text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Package grid - responsive columns */}
          <section className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {packages.map(pkg => (
                  <PackageCard key={pkg.name} package={pkg} />
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
```

---

## Document Metadata

**Created:** 2026-01-29
**Last Updated:** 2026-01-29
**Version:** 1.0
**Author:** Frontend UX Architect
**Status:** Complete

**Related Documents:**
- `aikit-dashboard-ux-specifications.md` - Main UX specifications
- `aikit-component-interaction-flows.md` - Interaction patterns
- `aikit-accessibility-checklist.md` - Accessibility compliance

---

**Next Steps:**
1. Validate breakpoints with design team
2. Test on real devices
3. Create responsive prototypes
4. Implement and iterate

