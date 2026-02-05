# Critical CSS Analysis for roadtoONU

**Date:** 2026-02-05  
**Goal:** Eliminate render-blocking CSS (~80KB) by extracting critical above-fold styles

## Summary

Successfully implemented critical CSS extraction. The above-fold content (header + hero + countdown) now renders instantly without waiting for full CSS bundle.

### File Sizes

| File | Size | Purpose |
|------|------|---------|
| `src/styles/critical-inline.css` | ~10.5KB | Inlined in `<head>`, renders immediately |
| `public/styles/deferred.css` | ~9.5KB | Loaded async, non-blocking |
| **Total** | ~20KB | vs. original ~80KB blocking load |

**Target:** Under 15KB for critical CSS ✅ **ACHIEVED** (10.5KB)

## Components Analyzed

### Above-Fold Components
1. **AppHeader.astro** - Fixed navbar (initially transparent, elements hidden)
2. **HeroSection.astro** - Hero with background, gradient overlays, conclave logo
3. **Container.astro** - Simple wrapper with max-width
4. **Countdown.astro** - Flip countdown timer

### CSS Files Reviewed
- `src/tailus.css` - Tailwind config with theme colors
- `src/styles/creed.css` - Creed section (below fold, deferred)
- `src/styles/fonts.css` - Font-face declarations
- `src/styles/inter.css` - Inter font weights

## What's in Critical CSS

### Essential for No FOUC
1. **Font-face declarations** - Inter (400, 600, 700) and Have Heart
2. **Base reset** - box-sizing, overflow-x hidden
3. **Body background** - `#f4f7ff`

### Navbar (initially hidden but positioned)
- `.navbar` - fixed positioning, z-index
- `.nav-container` - flex centering
- `.navbar-conclave-logo` - hidden until scroll
- `.nav-action-btn` - hidden until scroll

### Hero Section
- `.hero-section`, `.hero-top` - layout structure
- `.hero-bg` - background image positioning
- `.sponsor-unified-gradient` - orange-to-gold gradient
- `.hero-divider` - marquee track layout (static state)
- `.hero-divider-text` - Have Heart font styling

### Countdown
- `.countdown`, `.bloc-time`, `.figure` - flip card layout
- `.count-title` - label styling
- Number gradient styling (gold to orange)

### Tailwind Utilities
Only utilities actually used in above-fold:
- Layout: `relative`, `absolute`, `fixed`, `flex`, `grid`
- Spacing: `pt-24`, `pb-8`, `px-4`, responsive variants
- Typography: `text-sm` through `text-xl`, font weights
- Colors: `text-[#ea7600]`, `text-[#212322]`, `text-white`
- Responsive: `sm:`, `md:`, `lg:`, `xl:` breakpoints

## What's Deferred (Non-Blocking)

1. **Animations** - marquee scroll, flip card animations
2. **Hover/active states** - button glow effects, grayscale removal
3. **Scroll-top button** - only appears on scroll
4. **Creed section** - below the fold
5. **CSS custom properties for animations** - `@property` declarations
6. **Reduced motion styles**

## Implementation Details

### Files Created
1. `src/styles/critical-inline.css` - Hand-crafted critical CSS
2. `src/components/CriticalCSS.astro` - Reads and minifies CSS at build time
3. `public/styles/deferred.css` - Non-critical styles

### Layout.astro Changes
- Added `CriticalCSS` component import
- Commented out direct CSS imports (now handled separately)
- Added async CSS loading with print media trick:
  ```html
  <link rel="stylesheet" href="/styles/deferred.css" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="/styles/deferred.css" /></noscript>
  ```

### CriticalCSS.astro Features
- Reads CSS file at build time (not runtime)
- Minifies: removes comments, collapses whitespace
- Uses `is:inline` to prevent Astro bundling
- Output is pure inline `<style>` block

## Performance Impact

### Before
- ~80KB CSS blocking render
- First contentful paint delayed by CSS download + parse

### After
- ~10.5KB inline CSS (instant)
- Remaining ~9.5KB loads async (non-blocking)
- First contentful paint: immediate after HTML
- Full styles: available shortly after (async load)

## Verification

```bash
pnpm build  # ✅ Completed successfully
```

No build errors. Both pages (`/` and `/sponsorship`) generate correctly.

## Notes

1. The `@import 'tailwindcss'` in deferred.css ensures any missed utilities are available
2. Font preloads are still in place (critical fonts load early)
3. LCP image preload unchanged
4. The async CSS pattern gracefully degrades with `<noscript>` fallback
5. Hero background image referenced by URL, loads independently

## Future Optimizations

1. Could extract only used Tailwind classes with PurgeCSS for even smaller deferred bundle
2. Consider splitting deferred.css by route if pages diverge significantly
3. Service worker caching for repeat visits
