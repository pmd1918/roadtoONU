# RoadToONU Engineering Assessment
**Date:** 2026-02-09  
**Assessor:** John (Engineering)  
**Site:** https://roadtoonu.com  
**Stack:** Astro 5.1.3, Tailwind CSS 4.0.0-beta.8, Cloudflare Pages

---

## 1. Executive Summary

RoadToONU is a well-crafted single-page event site with a secondary sponsorship page. The Astro static-site architecture is the right choice — it produces zero client-side framework overhead. The visual design is polished with thoughtful animations and interactions.

However, the codebase has accumulated technical debt from rapid feature development and a recent performance sprint that introduced (and partially broke) several optimizations. Key issues:

- **~1.4 MB of orphaned public assets** (3D models, unused images, JSON data) shipping to production
- **176 KB HTML file** (35 KB gzipped) with all CSS inlined — effective but makes the single HTML payload heavy
- **Beta dependencies** (Tailwind 4.0.0-beta.8) in production
- **Accessibility gaps** — minimal ARIA coverage, missing skip navigation, no focus management
- **Sitemap references non-existent pages** (`/accommodations/hotels`, `/accommodations/campus`)
- **114 `<img>` tags** on the homepage — many are duplicated marquee SVGs

The site is functional and visually strong. The recommendations below are ordered by impact.

---

## 2. Frontend Findings

### 2.1 Component Architecture

**Structure:** 16 Astro components, clean separation. Each section is its own component with co-located styles and scripts. This is good Astro practice.

**Concerns:**
- **TravelCalculator.astro is 862 lines** — a single component containing HTML, CSS (~250 lines), and JS (~400 lines). Should be split into markup, styles, and a separate JS module.
- **Inline `<script>` blocks everywhere** — Countdown (standalone), Creed (typewriter), AppHeader (scroll logic), Testimonials (slider), Centennial (fireworks canvas), etc. All are `<script type="module">` inlined by Astro. This is fine for performance (no extra requests) but makes debugging harder.
- **No shared component patterns** — each component reinvents IntersectionObserver pause/resume logic. Could extract a `PauseOnScroll` utility.
- **HeroSection.astro has 128 repeated `<img>` tags** for marquee effects — each marquee track has 16 copies of the SVG icon + text. This inflates DOM size significantly (~200+ DOM nodes just for decorative marquees).

### 2.2 Performance

**Good:**
- Hero background preloaded as AVIF with `fetchpriority="high"` ✅
- Critical CSS inlined via Critters post-build (89% inlined) ✅
- 17 images use `loading="lazy"` ✅
- Self-hosted fonts with `font-display: swap` ✅
- Only 15 KB total JS (page.js 2.2KB + 4 utility scripts) ✅
- `data-cfasync="false"` on scripts to bypass Rocket Loader ✅

**Concerns:**
- **`inlineStylesheets: 'always'`** inlines ALL CSS into the HTML. The index page is 176 KB (35 KB gzipped). This includes the full Tailwind utility layer — over 50 KB of CSS @property declarations, color variables, and utility classes that could be in a cached external stylesheet.
- **`prefetchAll: true`** — prefetches all links on the page. With only 2 pages, this is harmless but unnecessary overhead.
- **Fireworks canvas** (Centennial section) runs a `requestAnimationFrame` loop continuously while visible. Creates particles indefinitely (`setTimeout(y, 800 + Math.random() * 1500)` recursively). No particle limit — could cause GC pressure on older devices.
- **Countdown timer** uses `setInterval(u, 1000)` — runs forever even if tab is backgrounded. Should use `requestAnimationFrame` or visibility API.
- **Testimonial auto-advance** (`setInterval(s, 8000)`) — no pause on hover/focus, no `visibilitychange` listener.
- **No image optimization pipeline** — all images are manually placed in `public/`. Astro has `astro:assets` with automatic optimization (resize, format conversion, srcset generation). Currently unused.

### 2.3 Responsive Design & Mobile

**Good:**
- Extensive `clamp()` usage for fluid typography ✅
- Mobile breakpoints at 480px, 640px, 768px, 1024px ✅
- `srcset` on conclave logo for responsive image sizes ✅

**Concerns:**
- **No `<meta name="theme-color">`** — mobile browsers show default chrome color
- **Map container is fixed 500px/600px height** — could be taller on desktop, shorter on small phones
- **Marquee tracks use `width: 200%`** with CSS animation — may cause horizontal overflow on some mobile browsers if parent overflow isn't clipped correctly

### 2.4 Accessibility

**Critical gaps:**
- **No skip navigation link** — users must tab through the entire header/nav to reach content
- **Only 1 `aria-label`** across the entire site (on the scroll-to-top button)
- **AppHeader buttons** (Register, Sponsor) lack `aria-label` — screen readers see empty links
- **Interactive elements in marquees** — decorative `<img>` tags correctly have `aria-hidden="true"`, but the surrounding structure lacks `role="presentation"`
- **Preregister modal** — no focus trap, no `role="dialog"`, no `aria-modal="true"`. Focus isn't moved to the modal when it opens, and pressing Escape doesn't close it (only the CustomEvent listener handles it)
- **Testimonial slider** — no `aria-live` region, no indication of current slide for screen readers
- **Form inputs** in PreregisterModal have labels via custom classes but no `<label for="">` associations
- **Color contrast** — salmon/coral (#ff6f61) on white backgrounds may not meet WCAG AA (4.5:1 ratio). Needs testing.
- **Countdown component** — purely visual, no `aria-live` or text alternative

### 2.5 SEO

**Good:**
- Comprehensive `<head>` metadata (title, description, OG, Twitter) ✅
- Structured data (Organization + Event schema) ✅
- Canonical URLs ✅
- `robots.txt` with sitemap reference ✅

**Concerns:**
- **Heading hierarchy is broken** — `<h1>` is on the Centennial section, not the hero. The hero (the primary page content) has no `<h1>`. The first thing a search engine sees as the page's main heading is "100 Years of Brotherhood."
- **Sitemap lists phantom pages** — `/accommodations/hotels` and `/accommodations/campus` return 404. These pages don't exist.
- **Static sitemap** — manually maintained in `public/sitemap.xml`. Should be auto-generated by `@astrojs/sitemap`.
- **No Open Graph image dimensions** — `og:image:width` and `og:image:height` are missing
- **`meta name="keywords"`** — this tag is ignored by Google, Bing, and all modern search engines. Harmless but misleading.

---

## 3. Backend / Infrastructure Findings

### 3.1 Build Pipeline

**Build command:** `astro build && node scripts/critical-css.mjs`

The build pipeline is clean:
1. Astro static build → `dist/`
2. Critters post-processing inlines critical CSS

**Concerns:**
- **Critters dependency pulls in Puppeteer-related packages** via its dependency tree. The `npm ls` output shows `puppeteer-core`, `chromium-bidi`, `devtools-protocol` etc. as extraneous. These likely came from a Lighthouse audit attempt that was partially cleaned up. Not harmful (not in production bundle) but bloats `node_modules`.
- **pnpm/npm mismatch** — the project appears to use pnpm (`.pnpm` directory, pnpm lockfile implied by `shamefully-hoist` warning) but `npm` commands also work. No `.npmrc` or `pnpm-workspace.yaml` to enforce consistency.
- **No build validation** — no link checker, no HTML validation, no image size budget enforcement in CI.

### 3.2 Cloudflare Pages Deployment

Deployed via git push to `main` → Cloudflare Pages auto-builds.

**Concerns:**
- **No `_headers` or `_redirects` file** — Cloudflare Pages supports custom headers for cache control, security headers (CSP, HSTS, X-Frame-Options). Currently relying entirely on Cloudflare defaults.
- **No 404 page** — navigating to a non-existent path shows Cloudflare's default 404.
- **Rocket Loader interference** — the site includes multiple workarounds for Cloudflare Rocket Loader (`data-cfasync="false"`, `cf-skip-worker-load` meta tag, inline script to neutralize CloudflareApps). The simplest fix is to **disable Rocket Loader in the Cloudflare dashboard** for this zone. These workarounds are brittle.

### 3.3 API Integrations

**Mapbox** — The travel calculator uses Mapbox GL JS for route rendering. The token (`PUBLIC_MAPBOX_TOKEN`) is set as a Cloudflare Pages environment variable and injected at build time via `import.meta.env`.

- Token is exposed client-side (expected for Mapbox GL) but should have **URL restrictions** set in the Mapbox dashboard to only allow `roadtoonu.com`.
- Mapbox GL JS + CSS are loaded lazily only when the user interacts with the travel calculator — this is well done.

**Google Sheets** — The preregister form POSTs to a Google Apps Script web app (`https://script.google.com/macros/s/...`). This is a common pattern for serverless form handling.

### 3.4 Environment Variables

Only one: `PUBLIC_MAPBOX_TOKEN`. Set in Cloudflare Pages dashboard. No `.env` file in repo (correct — the token shouldn't be committed).

**Concern:** No `.env.example` file documenting what env vars are needed. A new contributor would have to read the source to discover this.

### 3.5 Dependencies

| Package | Version | Status |
|---------|---------|--------|
| `astro` | 5.1.3 | ⚠️ Current is ~5.7+. Minor behind. |
| `tailwindcss` | 4.0.0-beta.8 | 🔴 **Beta in production.** Tailwind 4 has been stable since Jan 2025. |
| `@tailwindcss/vite` | 4.0.0-beta.8 | 🔴 Same — upgrade to stable. |
| `@fontsource/inter` | 5.2.8 | ✅ Only used for font files in `public/`. |
| `astro-font` | 0.0.72 | ⚠️ Listed as dependency but **not imported anywhere in src/**. Orphaned. |
| `critters` | 0.0.25 | ✅ Used in build script. |
| `sass` | 1.97.2 | ⚠️ Listed as devDep but **no `.scss` files exist**. Orphaned. |

`npm audit` reports **0 vulnerabilities** — clean.

### 3.6 Orphaned Assets

These files exist in `public/` but are **not referenced by any source file**:

| Path | Size | Notes |
|------|------|-------|
| `public/lanyard/*.glb` (3 files) | 380 KB | 3D badge models — feature was removed |
| `public/json/states-albers-10m.json` | 88 KB | US map topology — feature was removed |
| `public/images/conclave-coach-original.webm` | ~200 KB | Video file, unused |
| `public/images/clients/*.svg` (6 files) | ~12 KB | Template leftovers (Airbnb, Google, etc.) |
| `public/images/scenery-bg.jpg` | 12 KB | Was used for background, removed in commit |
| `public/images/clouds-background.png` | 12 KB | Unused |
| `public/images/orange-black.png` | 4 KB | Unused |
| `public/images/shirt.png` | 12 KB | Unused |
| `public/favicon-lion.jpg` | 68 KB | Unused favicon variant |
| `public/favicon-512.png` | 96 KB | Unused (site uses 32px and 192px) |
| `public/pmd-crest.jpg` | 80 KB | Unused |
| `public/onu-historical-2.jpg` | 60 KB | Unused |
| `public/images/avatars/*.jpg/.jpeg` (4 files) | ~200 KB | Original unoptimized versions (webp versions are used) |
| `public/images/sponsors/Nu Beta...gold.png` | 140 KB | Unused (webp version is used) |
| `public/images/sponsors/mu-beta-aa-shield.png` | 4 KB | Unused (webp version is used) |
| `public/phi mu delta crest-07.svg` | ~8 KB | Unused (space in filename too) |

**Total orphaned: ~1.4 MB** shipping to CDN on every deploy.

---

## 4. Recommendations (Prioritized)

### 🔴 Critical (Ship blockers / data integrity)

| # | Recommendation | Effort |
|---|---------------|--------|
| C1 | **Fix sitemap** — remove phantom `/accommodations/*` URLs. Add `@astrojs/sitemap` integration for auto-generation. | 30 min |
| C2 | **Fix heading hierarchy** — the hero should have the `<h1>`, not Centennial. Move Centennial to `<h2>`. | 15 min |
| C3 | **Disable Rocket Loader in Cloudflare dashboard** — remove all `data-cfasync` and `cf-skip-worker-load` workarounds from code. Cleaner and more reliable. | 15 min |
| C4 | **Add `.env.example`** with `PUBLIC_MAPBOX_TOKEN=your_token_here` and verify Mapbox token has URL restrictions. | 10 min |

### 🟡 High Priority (Quality / performance)

| # | Recommendation | Effort |
|---|---------------|--------|
| H1 | **Delete orphaned assets** — remove ~1.4 MB of unused files from `public/`. See list in §3.6. | 30 min |
| H2 | **Upgrade Tailwind to stable 4.x** — beta.8 in production is a risk. Pin to `4.1.x` stable. | 1 hour |
| H3 | **Remove orphaned dependencies** — `astro-font` (unused), `sass` (no .scss files). | 10 min |
| H4 | **Add Cloudflare `_headers` file** for security headers and cache control. Example: `Cache-Control: public, max-age=31536000` for images/fonts, security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy). | 30 min |
| H5 | **Add custom 404 page** — `src/pages/404.astro`. | 30 min |
| H6 | **Add `<meta name="theme-color" content="#ea7600">`** to Layout.astro. | 5 min |

### 🟢 Medium Priority (Accessibility / UX)

| # | Recommendation | Effort |
|---|---------------|--------|
| M1 | **Add skip navigation** — `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>` at top of Layout. | 15 min |
| M2 | **Fix preregister modal accessibility** — add `role="dialog"`, `aria-modal="true"`, focus trap, and Escape key handler. | 1-2 hours |
| M3 | **Add aria-labels** to header buttons and interactive elements. | 30 min |
| M4 | **Pause animations when tab is hidden** — add `document.addEventListener('visibilitychange', ...)` to countdown, testimonials auto-advance, and fireworks canvas. | 1 hour |
| M5 | **Add particle limit to fireworks** — cap at ~200 particles, stop spawning new rockets when section is off-screen. Already pauses via IntersectionObserver but the loop itself continues. | 30 min |
| M6 | **Reduce marquee DOM bloat** — use CSS `background-image` or a single repeated element with `content` pseudo-elements instead of 16x duplicated `<img>` + `<span>` per track. Saves ~200 DOM nodes. | 2 hours |

### 🔵 Nice-to-Have (Architecture improvements)

| # | Recommendation | Effort |
|---|---------------|--------|
| N1 | **Use `astro:assets`** — migrate images from `public/` to `src/assets/` to get automatic optimization (AVIF/WebP generation, srcset, size hints). Biggest win for images like the 212KB lanyard desktop webp. | 3-4 hours |
| N2 | **Extract TravelCalculator JS** into a proper TypeScript module. Import it as a `<script>` with Astro's module bundling instead of having 400 lines of inline JS. | 2 hours |
| N3 | **Extract IntersectionObserver pause pattern** — create a shared utility used by Creed, Features, HeroSection, Centennial, AccommodationHotel, Testimonials (6 components all copy-paste the same pattern). | 1 hour |
| N4 | **Consider `inlineStylesheets: 'auto'`** instead of `'always'` — let Astro decide based on size threshold. The current approach inlines ~90 KB of CSS into every page load. With `'auto'`, above-the-fold CSS stays inlined and the rest is an external cacheable file. | 30 min |
| N5 | **Lock package manager** — add `.npmrc` with `engine-strict=true` or use `packageManager` field in package.json to enforce pnpm. | 15 min |
| N6 | **Upgrade Astro to 5.7+** — incremental, but picks up bug fixes and build improvements. | 1 hour |

---

## 5. Effort Summary

| Priority | Count | Total Effort |
|----------|-------|-------------|
| 🔴 Critical | 4 | ~1 hour |
| 🟡 High | 6 | ~3 hours |
| 🟢 Medium | 6 | ~5-6 hours |
| 🔵 Nice-to-have | 6 | ~8-10 hours |
| **Total** | **22** | **~17-20 hours** |

The critical and high-priority items (C1-C4, H1-H6) can be knocked out in a single focused session of ~4 hours. The accessibility work (M1-M6) is the next highest-value batch. Architecture improvements (N1-N6) are valuable but can wait for a dedicated sprint.

---

*Assessment complete. No code changes made.*
