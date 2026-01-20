# Full-Width Section - Quick Reference

## Quick Class Selection

Choose based on section importance and content density:

```
.full-width-section     → Base (custom padding)
.full-width-section-sm  → CTAs, testimonials (3-5rem)
.full-width-section-md  → Features, content blocks (4-6rem)
.full-width-section-lg  → Major sections, showcases (5-8rem)
.full-width-section-xl  → Hero sections, headers (6-10rem)
```

---

## Common Patterns

### Hero Section
```tsx
<section className="full-width-section relative min-h-[70vh] flex items-center justify-center pt-20 pb-12">
  <div className="container-custom">...</div>
</section>
```

### Feature Grid
```tsx
<section className="full-width-section-md bg-vite-bg">
  <div className="container-custom">...</div>
</section>
```

### CTA
```tsx
<section className="full-width-section-sm bg-gradient-to-b from-[#0D1117] to-[#161B22]">
  <div className="container-custom text-center">...</div>
</section>
```

---

## Responsive Padding

| Class | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| `-sm` | 48px   | 64px   | 80px    |
| `-md` | 64px   | 80px   | 96px    |
| `-lg` | 80px   | 96px   | 128px   |
| `-xl` | 96px   | 128px  | 160px   |

---

## Implementation Checklist

- [ ] Use `full-width-section-*` for the section
- [ ] Nest `container-custom` inside for content
- [ ] Add background class (`bg-vite-bg`, `bg-gradient-*`)
- [ ] Remove manual `py-*`, `overflow-hidden`, `relative` classes
- [ ] Test on mobile (375px), tablet (768px), desktop (1024px+)

---

## Examples in Production

- **Home**: `/app/HomeClient.tsx` - 3 sections
- **Agent Swarm**: `/app/agent-swarm/AgentSwarmClient.tsx` - 6 sections
- **Enterprise**: `/app/enterprise/EnterpriseClient.tsx` - 1 section
- **Pricing**: `/app/pricing/PricingClient.tsx` - 1 section
- **ZeroDB**: `/app/products/zerodb/ZeroDBClient.tsx` - 2 sections

---

## Full Documentation

See: `/docs/design-system/full-width-section.md`
