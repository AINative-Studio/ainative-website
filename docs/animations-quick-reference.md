# Animation Quick Reference

**Quick access guide for AINative design system animations**

---

## Usage Cheat Sheet

### Entrance Animations

```tsx
// Fade in from below
<div className="animate-fade-in">Content</div>

// Slide from left
<aside className="animate-slide-in">Sidebar</aside>

// Slide from right
<div className="animate-slide-in-right">Panel</div>

// Slide from left (explicit)
<nav className="animate-slide-in-left">Menu</nav>

// Scale up
<Dialog className="animate-scale-in">Modal</Dialog>

// Staggered list
{items.map((item, i) => (
  <li
    className="animate-stagger-in"
    style={{ animationDelay: `${i * 0.1}s` }}
  >
    {item}
  </li>
))}
```

### Continuous Animations

```tsx
// Animated gradient background
<div className="animate-gradient-shift bg-gradient-to-r from-primary via-secondary to-accent bg-[length:200%_100%]">
  Hero Section
</div>

// Loading skeleton shimmer
<div className="relative bg-gray-200 rounded overflow-hidden">
  <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
</div>

// Floating element
<img className="animate-float" src="/icon.svg" alt="" />
```

### Interaction Animations

```tsx
// Pulsing glow button
<button className="animate-pulse-glow bg-primary text-white px-6 py-3 rounded-lg">
  Get Started
</button>
```

### Utility Animations

```tsx
// Radix UI Accordion
<Accordion.Content className="animate-accordion-down">
  Expanding content
</Accordion.Content>

<Accordion.Content className="animate-accordion-up">
  Collapsing content
</Accordion.Content>
```

---

## Animation Reference Table

| Class | Duration | Use Case | Example |
|-------|----------|----------|---------|
| `animate-accordion-down` | 0.2s | Accordion expand | Collapsible sections |
| `animate-accordion-up` | 0.2s | Accordion collapse | Dropdown close |
| `animate-fade-in` | 0.3s | Content reveal | Cards, modals |
| `animate-slide-in` | 0.3s | Sidebar entrance | Navigation panels |
| `animate-slide-in-right` | 0.5s | Right panel | Context menus |
| `animate-slide-in-left` | 0.5s | Left panel | Drawer menus |
| `animate-scale-in` | 0.3s | Modal appearance | Dialogs, popovers |
| `animate-gradient-shift` | 3s (infinite) | Background animation | Hero sections |
| `animate-shimmer` | 2s (infinite) | Loading state | Skeleton screens |
| `animate-pulse-glow` | 2s (infinite) | Emphasis | CTA buttons |
| `animate-float` | 3s (infinite) | Hover effect | Icons, images |
| `animate-stagger-in` | 0.5s | Sequential reveal | Lists, grids |

---

## Common Patterns

### Loading Skeleton
```tsx
<div className="space-y-4">
  {/* Avatar */}
  <div className="relative w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
    <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
  </div>

  {/* Text lines */}
  <div className="relative h-4 bg-gray-200 rounded w-3/4 overflow-hidden">
    <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
  </div>
</div>
```

### Staggered Grid
```tsx
<div className="grid grid-cols-3 gap-4">
  {features.map((feature, i) => (
    <div
      key={feature.id}
      className="animate-stagger-in"
      style={{ animationDelay: `${i * 0.1}s` }}
    >
      {feature.content}
    </div>
  ))}
</div>
```

### Hero Section
```tsx
<section className="animate-gradient-shift bg-gradient-to-r from-primary via-secondary to-accent bg-[length:200%_100%]">
  <h1 className="animate-fade-in text-display-1">
    Welcome
  </h1>
  <p className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
    Subtitle
  </p>
</section>
```

### CTA Button
```tsx
<button className="animate-pulse-glow bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg text-button-lg">
  Start Free Trial
</button>
```

---

## Accessibility

All animations automatically respect `prefers-reduced-motion`:

```tsx
// No changes needed - CSS handles it automatically
<div className="animate-fade-in">
  Accessible content
</div>
```

Users with "Reduce motion" enabled see instant state changes instead of animations.

---

## Performance Tips

✅ **Do**:
- Use `transform` and `opacity` for animations
- Apply animations to visible elements only
- Limit simultaneous complex animations to 3-5
- Use CSS animations for simple effects

❌ **Don't**:
- Animate `width`, `height`, `top`, `left` (causes layout thrashing)
- Use `will-change` on too many elements
- Run infinite animations on many elements simultaneously
- Use JavaScript for simple fade/slide effects

---

## Interactive Demo

Visit `/demo/animations` to see all animations in action with live code examples.

---

## Documentation

- **Full Documentation**: `/docs/animations.md`
- **Storybook**: Component library → Animation Showcase
- **Tests**: `/test/issue-495-animations.test.tsx`
- **Implementation**: `/app/globals.css` (lines 196-327), `/tailwind.config.ts` (lines 185-246)

---

## Troubleshooting

### Animation not playing
```tsx
// Force re-render with key
const [key, setKey] = useState(0);

<div key={key} className="animate-fade-in">Content</div>
<button onClick={() => setKey(k => k + 1)}>Replay</button>
```

### Custom duration
```tsx
<div className="animate-fade-in [animation-duration:1s]">
  Slower fade
</div>
```

### Multiple animations
```tsx
<div className="animate-fade-in animate-float">
  Fades in, then floats
</div>
```

---

**Last Updated**: 2026-01-31
**Issue**: #495
**Status**: Complete
