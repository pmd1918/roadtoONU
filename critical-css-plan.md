# Critical CSS Implementation Plan

## Goal
Eliminate render-blocking CSS by extracting and inlining critical (above-fold) CSS, then loading remaining CSS asynchronously.

## Project Context
- **Stack**: Astro + Tailwind CSS + React
- **Path**: `/home/ubuntu/.openclaw/workspace/projects/roadtoONU`
- **Current CSS**: ~80KB in 2 bundles, render-blocking
- **Target**: Inline ~10-15KB critical, defer rest, no FOUC

---

## Phase 1: Research & Analysis (Scout)

**Task**: Analyze current CSS and determine critical styles needed for above-fold content.

**Deliverables**:
1. List of above-fold components: HeroSection, AppHeader, Container
2. Identify which Tailwind utilities are used above-fold
3. Recommend tool/approach: `critical` npm package, manual extraction, or Astro plugin
4. Document CSS load order requirements

---

## Phase 2: Implementation (Maverick)

**Task**: Implement critical CSS extraction and async loading.

**Steps**:
1. Install `critical` package if using automated extraction
2. Create inline critical CSS component (manually curated or auto-generated)
3. Modify Layout.astro to:
   - Inline critical CSS in `<head>`
   - Load remaining CSS with `media="print" onload="this.media='all'"` trick
4. Ensure fonts still preload correctly
5. Test build compiles without errors

**Files to modify**:
- `src/layouts/Layout.astro`
- `src/styles/critical.css` (new - manually curated critical styles)
- `astro.config.mjs` (if build changes needed)

---

## Phase 3: QA Testing (70b)

**Task**: Verify implementation works correctly.

**Test Cases**:
1. **No FOUC**: Page loads without flash of unstyled content
2. **Visual Regression**: Hero looks identical before/after
3. **Mobile**: Test on mobile viewport
4. **Slow 3G**: Simulate slow network, verify graceful loading
5. **JavaScript Disabled**: Verify noscript fallback works
6. **PageSpeed Score**: Run Lighthouse, target 90+ performance

**Test Commands**:
```bash
# Build and preview
pnpm build && pnpm preview

# Run Lighthouse CLI (if available)
lighthouse https://roadtoonu.com --only-categories=performance
```

---

## Phase 4: Debug & Fix (Maverick)

**Task**: Fix any issues found in QA.

**Common Issues**:
- FOUC: Critical CSS missing styles → add to critical.css
- Layout shift: Dimensions not specified → add explicit sizes
- Broken animations: Keyframes not in critical → add or defer gracefully
- Font flash: font-display not set → ensure `swap` is used

---

## Success Criteria
- [ ] PageSpeed render-blocking warning eliminated or reduced to <500ms
- [ ] No visible FOUC on page load
- [ ] LCP improved or unchanged
- [ ] Total CSS size unchanged (just split differently)
- [ ] Works in all major browsers

---

## Rollback Plan
If implementation causes issues:
```bash
git revert HEAD
git push origin main
```

All changes should be in a single commit for easy rollback.
