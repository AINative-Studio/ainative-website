# Container Custom - Usage Guide

## Quick Reference

Use `.container-custom` for main content areas that need:
- Responsive horizontal padding
- Maximum width constraint (1280px)
- Automatic centering

---

## Basic Usage

```tsx
// Layout component
<div className="container-custom">
  <YourContent />
</div>
```

---

## Responsive Behavior

### Mobile First (Default - < 640px)
```tsx
<div className="container-custom">
  {/* Content has 16px padding on left/right */}
</div>
```

### Tablet (640px+)
```tsx
<div className="container-custom">
  {/* Content has 24px padding on left/right */}
</div>
```

### Desktop (1024px+)
```tsx
<div className="container-custom">
  {/* Content has 32px padding on left/right */}
</div>
```

---

## Common Patterns

### Page Wrapper
```tsx
export default function YourPageClient() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-12">
        <h1>Your Page Title</h1>
        <p>Content automatically has responsive padding</p>
      </div>
    </div>
  );
}
```

### Section Container
```tsx
export default function YourSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-8">Section Title</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cards or content */}
        </div>
      </div>
    </section>
  );
}
```

---

## When NOT to Use

### ❌ Full-width backgrounds
```tsx
// DON'T
<section className="container-custom bg-gradient-primary">
  <Hero />
</section>

// DO - Nest container inside
<section className="bg-gradient-primary">
  <div className="container-custom">
    <Hero />
  </div>
</section>
```

---

## Current Usage Count

As of 2026-01-18:
- 8+ components
- Header, Footer, and major page sections

---

## Questions?

See `/docs/issue-383-container-padding-verification.md` for full documentation.
