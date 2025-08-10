# Landing Page Components

This directory contains the components for the DoctorSpace landing page, built with React, Tailwind CSS, and Shadcn UI.

## Structure

- `Navbar.tsx` - Responsive navigation with logo, centered links, and action buttons
- `Hero.tsx` - Full-screen hero section with headline and CTA
- `Stats.tsx` - Key metrics and statistics
- `Features.tsx` - Feature highlights with icons and descriptions
- `Testimonials.tsx` - User testimonials with ratings
- `CTA.tsx` - Call-to-action section
- `Footer.tsx` - Footer with links and company information

## Adding GSAP Animations

### Hero Headline Animation

The headline in `Hero.tsx` is structured for easy GSAP targeting:

```tsx
<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
  <div className="overflow-hidden">
    <div className="overflow-hidden">
      <span>WELCOME</span>
    </div>
  </div>
  <div className="overflow-hidden">
    <div className="overflow-hidden">
      <span>TO</span>
    </div>
  </div>
  <div className="overflow-hidden">
    <div className="overflow-hidden">
      <span>DOCTORSPACE.</span>
    </div>
  </div>
</h1>
```

To animate the headline:

1. Import GSAP in `Hero.tsx`
2. Use `useEffect` to target the word containers
3. Animate each word with staggered timing

Example:
```tsx
import { gsap } from "gsap"

useEffect(() => {
  const words = document.querySelectorAll('.hero-headline > div')
  gsap.fromTo(words, 
    { y: 60, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" }
  )
}, [])
```

### Interactive Background

The interactive background is in `Hero.tsx` with the ID `interactive-bg`:

```tsx
<div
  id="interactive-bg"
  ref={bgRef}
  data-bg="interactive"
  aria-hidden="true"
  className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-secondary/5 to-muted/10"
/>
```

To add interactive animations:

1. Use the `useInteractiveBg` hook in `src/lib/useInteractiveBg.ts`
2. Add GSAP animations that respond to mouse movement or scroll
3. Target the `bgRef.current` element

Example:
```tsx
// In useInteractiveBg.ts
useEffect(() => {
  if (containerRef.current) {
    // Add mouse follow animation
    gsap.to(containerRef.current, {
      duration: 0.5,
      x: mouseX * 0.1,
      y: mouseY * 0.1,
      ease: "power2.out"
    })
  }
}, [mouseX, mouseY])
```

## Responsive Design

All components are built mobile-first with:
- Single-column stacking on mobile
- Responsive grids on larger screens
- Proper spacing with `px-6 md:px-12`
- Container max-widths for readability

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Proper heading hierarchy
- Keyboard navigation support
- Color contrast compliance

## Dark Mode Support

All components support dark mode via Tailwind's `dark:` utilities and Shadcn UI's theme system. 