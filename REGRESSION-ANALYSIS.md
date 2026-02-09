# ROADTOONU REGRESSION ANALYSIS
**Date**: February 8, 2026  
**Urgency**: CRITICAL - Site broken on desktop  
**Commit Range**: dabae80 (last good) → cb89f54 (broken)  
**Reported by**: Alex

---

## 🚨 **CONFIRMED BROKEN FUNCTIONALITY**

### 1. **MAP FUNCTIONALITY (CRITICAL)**
**Problem**: Travel calculator completely broken - airports dropdown and departure address input not working  
**Root Cause**: **Manual vendor chunking removal** in commit `c1f3445`  
**Technical Details**: 
- TravelCalculator component JavaScript was chunked separately via `manualChunks` config
- Removal caused TravelCalculator script to be lost/incorrectly bundled
- Build now shows single `page.DTIbhfSr.js` (2.18KB) instead of separate travel chunk
- Previous build had: `TravelCalculator.astro_astro_type_script_index_0_lang.Cj2KmlJv.js` (4.26KB)

### 2. **SCENERY BACKGROUND (CRITICAL)**  
**Problem**: Scenery background behind coach bus not loading  
**Root Cause**: **IntersectionObserver + Astro CSS scoping conflict** in commits `d254baf` + `cb89f54`  
**Technical Details**:
- Lazy loading implementation injects style tag: `.stage-wrapper::before { background-image: url('/images/scenery-bg.jpg') !important; }`
- Astro's scoped CSS requires proper `data-astro-cid-*` attributes on dynamically injected styles
- Injected style lacks scoping, so it doesn't target the actual scoped `.stage-wrapper` element
- Background remains unloaded/transparent

### 3. **HAVEHEART FONT LOADING (MODERATE)**
**Problem**: HaveHeart font may show generic cursive fallback  
**Root Cause**: **Inter font preload removal** in commit `7305084`  
**Technical Details**:
- Removed Inter 400/600 preloads but kept only HaveHeart preload
- HaveHeart has `font-display: swap` but may need Inter as system fallback
- FOUT (Flash of Unstyled Text) more likely without proper font loading strategy

---

## 📊 **BUILD COMPARISON**

### WORKING BUILD (dabae80):
```
Assets:
├── vendor.D8iLJbSf.js (2.26 kB)
├── TravelCalculator.astro_astro_type_script_index_0_lang.Cj2KmlJv.js (4.26 kB) ✅
├── page.ylxxI6sE.js (0.04 kB)
├── Layout.Bt5ssWVe.js (12 kB)
└── CSS: Multiple chunks with proper splitting

Font Preloads: ✅ HaveHeart + Inter 400/600
Scenery BG: ✅ Direct CSS background-image (no lazy loading)
```

### BROKEN BUILD (cb89f54):
```
Assets:
├── page.DTIbhfSr.js (2.18 kB) ❌ Missing TravelCalculator chunk
├── Layout.BW9-bqEE.js (varies)
└── CSS: Heavily inlined (83KB+ inline)

Font Preloads: ❌ Only HaveHeart
Scenery BG: ❌ IntersectionObserver injection fails due to scoping
```

---

## 🔧 **SPECIFIC FIXES REQUIRED**

### **FIX 1: RESTORE TRAVEL CALCULATOR** (Critical)
**File**: `astro.config.mjs`  
**Action**: Restore manual chunking for TravelCalculator

```javascript
// ADD back to rollupOptions.output:
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    return 'vendor';
  }
  if (id.includes('TravelCalculator')) {
    return 'travel';
  }
}
```

### **FIX 2: SCENERY BACKGROUND** (Critical)  
**File**: `src/components/ConclaveCoach.astro`  
**Action**: Replace IntersectionObserver injection with Astro-compatible approach

**Option A (Recommended)**: Revert to direct CSS approach
```css
.stage-wrapper::before {
  background-image: url('/images/scenery-bg.jpg');
  /* Keep other styles */
}
```

**Option B**: Fix scoping in injection
```javascript
// Generate proper scoped selector
const scopedSelector = stageWrapper.getAttribute('class').match(/data-astro-cid-\w+/)?.[0];
if (scopedSelector) {
  style.textContent = `.stage-wrapper[${scopedSelector}]::before { background-image: url('/images/scenery-bg.jpg') !important; }`;
}
```

### **FIX 3: FONT LOADING** (Moderate)
**File**: `src/layouts/Layout.astro`  
**Action**: Restore Inter font preloads for system UI

```html
<!-- Restore critical font preloads -->
<link rel="preload" href="/fonts/inter/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/inter/inter-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin />
```

---

## ✅ **SAFE PERFORMANCE OPTIMIZATIONS TO KEEP**

### **KEEP THESE CHANGES:**
- ✅ **Image lazy loading** (`loading="lazy"` on below-fold images)
- ✅ **Avatar WebP conversions** (134KB→17KB savings)  
- ✅ **CSS inlining improvements** (83KB+ critical CSS inlined)
- ✅ **Optimized image sizes** (fraternity-house-bg, vintage-flag-bg resizing)
- ✅ **Testimonial lazy loading** (if working correctly with scoping)
- ✅ **Coach poster lazy loading** (safe, not critical path)

### **REVERT THESE CHANGES:**
- ❌ **Manual chunking removal** (`c1f3445`) - Breaks TravelCalculator
- ❌ **Scenery background IntersectionObserver** (`d254baf`, `cb89f54`) - Scoping conflict  
- ❌ **Inter font preload removal** (`7305084`) - Degrades font loading performance

---

## 🚀 **IMMEDIATE ACTION PLAN**

### **Priority 1 (Blocking):**
1. Restore manual chunking in `astro.config.mjs`
2. Revert scenery background to direct CSS approach
3. Test travel calculator functionality

### **Priority 2 (Polish):**
4. Restore Inter font preloads for better typography
5. Verify HaveHeart font rendering
6. Test all lazy loading implementations for scoping issues

### **Priority 3 (Validation):**
7. Run PageSpeed test to ensure performance targets still met
8. Desktop functionality testing
9. Mobile regression testing

---

## 📋 **ESTIMATED IMPACT**

**Performance Trade-offs:**
- **Lost**: ~15-20ms from scenery background lazy loading
- **Lost**: ~5-10ms from font preload optimization  
- **Gained**: TravelCalculator functionality restored
- **Gained**: Scenery background visual correctness
- **Net**: Slight performance regression but critical functionality restored

**Time to Fix**: ~30 minutes implementation + 10 minutes testing

---

## 🎯 **SUCCESS CRITERIA**

**MUST WORK:**
- ✅ Travel calculator airports dropdown functional
- ✅ Travel calculator address input working  
- ✅ Scenery background visible behind coach bus
- ✅ HaveHeart font rendering properly

**SHOULD MAINTAIN:**
- ✅ 95+ mobile PageSpeed score
- ✅ Critical CSS inlining benefits
- ✅ Image optimization benefits

---

**Analysis completed**: Ready for immediate fix implementation  
**Blocking Alex**: High priority resolution needed