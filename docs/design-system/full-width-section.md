# Full-Width Section Utility Classes

## Overview

The `.full-width-section` utility classes provide a consistent way to create sections that span the full viewport width with proper responsive behavior and overflow handling. These classes are designed to work seamlessly with the `.container-custom` class for proper content containment.

---

## Available Classes

### Base Class

#### `.full-width-section`
- **Purpose**: Basic full-width section without built-in padding
- **Use Case**: When you need full control over spacing or have complex nested layouts

```tsx
<section className="full-width-section bg-gradient-to-br from-[#0D1117] to-[#161B22]">
  <div className="container-custom py-12">
    {/* Your content */}
  </div>
</section>
```

**CSS Properties:**
```css
.full-width-section {
  width: 100%;
  position: relative;
  overflow: hidden;
}
```

---

### Padding Variants

All padding variants include responsive scaling across breakpoints.

#### `.full-width-section-sm`
- **Mobile**: 3rem (48px) vertical padding
- **Tablet (768px+)**: 4rem (64px) vertical padding
- **Desktop (1024px+)**: 5rem (80px) vertical padding
- **Use Case**: Smaller sections like CTAs, testimonials

```tsx
<section className="full-width-section-sm bg-gradient-to-b from-[#0D1117] to-[#161B22]">
  <div className="container-custom">
    {/* Your CTA content */}
  </div>
</section>
```

#### `.full-width-section-md`
- **Mobile**: 4rem (64px) vertical padding
- **Tablet (768px+)**: 5rem (80px) vertical padding
- **Desktop (1024px+)**: 6rem (96px) vertical padding
- **Use Case**: Standard feature sections, content blocks

```tsx
<section className="full-width-section-md bg-vite-bg">
  <div className="container-custom">
    {/* Your feature grid */}
  </div>
</section>
```

#### `.full-width-section-lg`
- **Mobile**: 5rem (80px) vertical padding
- **Tablet (768px+)**: 6rem (96px) vertical padding
- **Desktop (1024px+)**: 8rem (128px) vertical padding
- **Use Case**: Major sections, product showcases

```tsx
<section className="full-width-section-lg bg-gradient-to-br from-[#4B6FED]/10 to-[#8A63F5]/10">
  <div className="container-custom">
    {/* Your showcase content */}
  </div>
</section>
```

#### `.full-width-section-xl`
- **Mobile**: 6rem (96px) vertical padding
- **Tablet (768px+)**: 8rem (128px) vertical padding
- **Desktop (1024px+)**: 10rem (160px) vertical padding
- **Use Case**: Hero sections, landing page headers

```tsx
<section className="full-width-section-xl relative">
  <div className="container-custom">
    {/* Your hero content */}
  </div>
</section>
```

---

## Design Patterns

### Pattern 1: Full-Width Background with Contained Content

**Best Practice**: Use this pattern for sections with gradient or colored backgrounds.

```tsx
<section className="full-width-section-md bg-gradient-to-r from-[#4B6FED] to-[#8A63F5]">
  <div className="container-custom">
    <h2 className="text-3xl font-bold text-white mb-8">
      Section Title
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Cards */}
    </div>
  </div>
</section>
```

**Why**: The background spans edge-to-edge while content stays within readable width (max-width: 1280px).

---

### Pattern 2: Hero Section with Absolute Backgrounds

```tsx
<section className="full-width-section relative min-h-[70vh] flex items-center justify-center pt-20 pb-12">
  <div className="absolute inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117]/80 via-[#0D1117]/90 to-[#0D1117]/80"></div>
    {/* Gradient effects */}
  </div>

  <div className="container-custom relative z-10">
    <h1 className="text-5xl font-bold text-center">
      Hero Title
    </h1>
  </div>
</section>
```

**Key Points**:
- Use `relative` positioning on section
- Use `absolute` with `-z-10` for background layers
- Ensure content has `relative z-10` to stay above backgrounds

---

### Pattern 3: Alternating Section Colors

```tsx
<>
  <section className="full-width-section-md bg-vite-bg">
    <div className="container-custom">
      {/* Dark section content */}
    </div>
  </section>

  <section className="full-width-section-md bg-[#161B22]">
    <div className="container-custom">
      {/* Slightly lighter section content */}
    </div>
  </section>

  <section className="full-width-section-md bg-vite-bg">
    <div className="container-custom">
      {/* Back to dark */}
    </div>
  </section>
</>
```

**Purpose**: Creates visual separation between sections while maintaining consistency.

---

## Common Use Cases

### Hero Sections
```tsx
<section className="full-width-section relative min-h-[80vh] flex items-center justify-center pt-20 pb-12">
  {/* Large, impactful hero content */}
</section>
```

### Feature Showcases
```tsx
<section className="full-width-section-md bg-vite-bg">
  <div className="container-custom">
    {/* Feature grid or cards */}
  </div>
</section>
```

### CTA Sections
```tsx
<section className="full-width-section-sm bg-gradient-to-b from-[#0D1117] to-[#161B22]">
  <div className="container-custom text-center">
    {/* Call-to-action content */}
  </div>
</section>
```

### Testimonials
```tsx
<section className="full-width-section-md bg-[#161B22]">
  <div className="container-custom">
    {/* Testimonial cards */}
  </div>
</section>
```

---

## Responsive Behavior

All padding variants automatically adjust across breakpoints:

| Class | Mobile (<768px) | Tablet (768px+) | Desktop (1024px+) |
|-------|----------------|-----------------|-------------------|
| `-sm` | 48px | 64px | 80px |
| `-md` | 64px | 80px | 96px |
| `-lg` | 80px | 96px | 128px |
| `-xl` | 96px | 128px | 160px |

**Overflow**: All variants include `overflow: hidden` to prevent horizontal scrolling issues with gradient effects and absolute positioned elements.

---

## Migration from Old Pattern

### Before (Manual Padding)
```tsx
<section className="py-20 bg-vite-bg relative overflow-hidden">
  <div className="container-custom max-w-6xl">
    {/* Content */}
  </div>
</section>
```

### After (Using Utility)
```tsx
<section className="full-width-section-md bg-vite-bg">
  <div className="container-custom max-w-6xl">
    {/* Content */}
  </div>
</section>
```

**Benefits**:
- Responsive padding out of the box
- Consistent spacing across the site
- Cleaner component code
- Less repetitive class combinations

---

## Browser Support

- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Responsive design with mobile-first approach

---

## Related Classes

- **`.container-custom`**: For constraining content width within sections
- **`bg-vite-bg`**: Main dark background color (#0D1117)
- **`bg-gradient-*`**: Tailwind gradient utilities for backgrounds

---

## Examples in Production

- **Home Page**: Hero section, feature grid, CTA
- **Enterprise Page**: All sections use full-width pattern
- **Agent Swarm Page**: Multiple alternating sections
- **Pricing Page**: Full-width pricing grid
- **Product Pages**: Hero and feature sections

---

## Questions?

See also:
- `/docs/container-usage-guide.md` - Container custom documentation
- `/app/globals.css` - Source CSS definitions
- `/app/HomeClient.tsx` - Reference implementation
