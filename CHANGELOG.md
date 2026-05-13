# CHANGELOG — Crazzzy Frontend

All significant changes are documented here. For rollback, use the git commit SHA listed with each entry.

---

## [2026-05-13] — Bento Grid Category Thumbnails Fix

### Problem
The "Shop By Categories" section on the Home Page displayed empty grey boxes for certain categories (e.g., Die Cast Cars, Perfumes, Keychains).

### Root Cause
The global catalog context (`CatalogProvider`) initially fetches a default limit of 50 products. Because the `bento-grid-categories.tsx` component relies on grabbing a random product image from the global `byCategory` map for categories that lack a dedicated admin image, categories without recent products in the initial 50-item cache had an empty fallback pool, leading to blank thumbnails.

### Fix
Increased the default global fetch limit in `fetchCatalog` and `refresh` from 50 to 200 to guarantee a robust cross-section of products, ensuring every category has an image pool to draw from.

### Architecture Upgrade: Full Database Search
Upgraded the Navbar live search dropdown and the `/search` page to query the backend API directly (`/products?search=...`) rather than filtering the global context's limited cache. This guarantees that search queries check the entire database, bypassing pagination limits entirely.

---

## [2026-05-13] — Product Not Found Fix + Shop Category Cache

### Problem 1: "Product Not Found" for wall poster products
Clicking any wall poster product showed "Product Not Found" page.

### Root Cause
`app/product/[id]/page.tsx` searched only `data?.products` (global catalog, ~50 items).
Wall poster products were fetched into the shop's local `shopProducts` state but never populated the global catalog.

### Fix
Added a direct API fallback in the product page: if not found in global cache → fetch directly from `/products/${id}` endpoint. Same normalization as the shop page mapper.

### Problem 2: Category re-fetches on repeat visits
Every visit to a category (even a repeat) triggered a full API fetch.

### Fix
Added `shopCache` (`useRef<Map>`) in the shop page. Cache key = category slug or `'__all__'`. Cache hit = instant serve from memory. Cache miss = fetch + store. Cache is cleared on full browser refresh (React ref lifecycle).

### Problem 3: "On Wall" mockup missing for subcategory products
Products in subcategories (like `anime`) didn't show the "On Wall" thumbnail because their `categoryId` matched the subcategory, not `wall-posters`.

### Fix
Updated `isWallPoster` logic in `app/product/[id]/page.tsx` to traverse the category tree and check if the parent category is `wall-posters`.

### Files Changed
- `app/product/[id]/page.tsx` — direct API fallback and robust `isWallPoster` check
- `app/shop/page.tsx` — in-memory Map cache for shop fetches

---

## [2026-05-13] — Wall Poster Mockup Enhancements

### Features
1. **Studio Plant Mockup**: Added a second, minimalist wall mockup template featuring a clean wall with a potted plant.
2. **Concrete Monstera Mockup**: Added a third ultra-realistic architectural mockup featuring a textured concrete wall and a foreground Monstera leaf based on user prompt. The poster is positioned in the sunlit area to preserve the depth effect of the foreground leaf.
3. **Refactored Mockup Component**: `WallMockup` now accepts props for room images and CSS positioning, allowing infinite scalable mockup templates without repeating code.
4. **Desk Mockup Resized**: Scaled down the desk poster CSS overlay (`width: 20%`) and aligned it perfectly over the monitor to prevent unnatural overlapping in the background.
5. **Realism Stack & Anti-Aliasing**: Upgraded `WallMockup` with ambient occlusion shadows, a lighting gradient, paper texture `mix-blend-overlay`, and precise 3D perspective transforms (`rotateX`, `rotateY`). Applied sub-pixel blurring (`filter: blur(0.2px) contrast(1.05)`), hardware acceleration (`translateZ(0)`), inner box-shadow, and `opacity: 0.98` to eliminate rendering jaggedness (aliasing) and seamlessly blend the digital white of posters with the room lighting.

### Files Changed
- `app/product/[id]/page.tsx`
- `public/wall-mockup-plant.png` (Added)
- `public/wall-mockup-concrete.png` (Added)

---

## [2026-05-13] — Shop Page Architecture Fix (Subcategory Filtering)

### Problem
Subcategory filtering (e.g. `/shop?category=anime`) showed 0 products even though products existed.

### Root Cause Chain
1. **Session 1 (cache poisoning fix):** `refresh(cat)` was being called on the shop page which replaced the global `data.products` with only one category's products — breaking the home page bento grid images after navigation.
2. **Session 2 (over-correction):** Fixed by stopping `refresh(cat)` calls and using `if (!data) refresh()` — but this never called refresh if data existed, leaving the shop stuck with the initial 50-product cache. Wall posters (142 items) happened to be in the 200-limit fetch but subcategories (anime, f1, etc.) returned 0 due to client-side ID mismatches.
3. **Session 3 (incomplete fix):** Added `p.categorySlug === selectedCategorySlug` as fallback — still 0 because `categorySlug` on products returns the PARENT category slug when fetching all products from backend.

### Final Fix (this commit)
**Architecture: Server-side fetch per category selection** (mirrors admin panel exactly)
- Added `shopProducts` local state in ShopPage
- Added `mapProduct()` helper to normalize raw API response
- Added `shopLoading` state  
- `useEffect([searchParams])` now calls backend `/products?category=slug&limit=200` directly
- Global catalog (`data.products`) is **never overwritten** — bento grid images remain correct
- Client-side filters (price, search, stock) still apply on top of server-filtered results

### Files Changed
- `app/shop/page.tsx` — server-side fetch logic
- `components/bento-grid-categories.tsx` — deterministic image selection (no Math.random)
- `lib/catalog/catalog-context.tsx` — unchanged (global cache protected)

### Rollback
```bash
git revert HEAD  # or git checkout <sha> -- app/shop/page.tsx
```

---

## [2026-05-13] — Bento Grid: Stable Image Selection

### Problem  
Category images on the home page shuffled on every navigation (different image each time).

### Fix
Replaced `Math.random()` with deterministic hash: `String(cat.id).split('').reduce(...)`.

---

## [2026-05-13] — Mobile Crash Prevention

### Problem
Website crashed on phone in a reload loop → "can't open this page."

### Root Cause
- `filter: blur()` on every headline word — massive GPU texture allocation per element
- 48+ DOM nodes in marquee with unoptimized images all loaded simultaneously  
- 3 Framer Motion spring hooks (`useMouseParallax` ×2, magnetic button) running on every mousemove

### Fix
- Removed all `filter: blur()` from animations globally
- Mobile marquee capped at 8 products × 2 = 16 DOM nodes
- Priority images cut from 12 → 4, rest lazy-loaded
- Parallax + magnetic button hooks removed entirely (strength set to 0 on mobile was still instantiating them)
- Desktop marquee reduced from 40 → 16 products

---

## [2026-05-13] — Wall Poster CSS Mockup

### Feature
"On Wall" lifestyle preview for wall poster products — zero Cloudinary/Vercel credits.

### Implementation
- Static room background image at `public/wall-mockup-room.jpg`
- `WallMockup` component: CSS overlay positions product image on room wall
- Virtual gallery index `WALL_MOCKUP_INDEX = -1` in product page
- Only shown when `product.categorySlug === 'wall-posters'`

---

## [2026-05-12] — Performance: Removed Mouse Parallax & Magnetic Button

### Problem
8GB RAM laptops lagging on the homepage.

### Root Cause
- `useMouseParallax()` ×2 fired Framer Motion spring on every `mousemove` event (60-100/sec)
- `useMagneticButton()` — same
- `motion.button` with `repeat: Infinity` — permanent RAF loop for scroll chevron
- Multiple `willChange: transform` on non-animating elements wasting VRAM

### Fix
- Removed `useMouseParallax` and `useMagneticButton` imports entirely
- CSS-only scroll bounce: `@keyframes bounceSlow` — no JS involved
- `will-change: transform` only on marquee tracks (justified GPU layer)
- `prefers-reduced-motion` media query stops marquee for accessibility

---

## [2026-05-12] — Hero Showcase: Prevent Mobile OOM Crash

### Problem  
Mobile: load → reload → reload → "can't open this page"

### Fix
- `mounted` state check prevents SSR/CSR hydration mismatch  
- Desktop product count: 40 → 16 (16 = 32 DOM nodes after doubling)
- Mobile: 8 products only
- `priority` images: 12 → 4

---

## Image Credits & Cost Status
- All product images: served raw from Cloudinary CDN (no transformations)
- `next.config.mjs`: `images: { unoptimized: true }` — Vercel optimization OFF globally
- `resolveImageUrl()`: pass-through only, no URL transformations added
- **Zero Cloudinary transformation credits used. Zero Vercel image optimization credits used.**
