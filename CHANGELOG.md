# Changelog

All notable changes to this project will be documented in this file.

## [2026-05-09] - Shop Features & Stability Hotfixes

### Added
- **Frontend Override for Categories**: Implemented a map in `catalog-context.tsx` to override the "anime-figures" category display name to "Anime/Superhero Figures" without breaking functional API routing.
- **Continuous Combo Offer**: Added Redux cart logic (`selectComboOffer`) to automatically apply a "Buy 2 Get 1 Free" discount for same-variant wall posters. Applies continuous scaling (e.g. buy 4 get 2 free, buy 6 get 3 free) on the cart and checkout page.
- **Admin Combo Deals**: Added `useComboDeals` custom hook and `/admin/combo-deals` page to allow admins to create flexible "Buy X for ₹Y" bundles. Deals are persisted in `localStorage`.
- **Custom Shop Filters**: Added `useCustomFilters` hook and `/admin/categories` page for admins to define custom search tags per category. These render as quick-filter chips on the Shop page sidebar and interact directly with the client-side search query.

### Fixed
- **SMTP Connection Timeout in Production**: Updated the backend `.env` configuration to force the use of `smtp4.gmail.com` to prevent `ENETUNREACH` IPv6 networking errors on environments blocking outbound IPv6 ports.
- **Prisma Unique Constraint Violation**: Fixed product updates failing when the newly generated title slug conflicts with an existing product. Added fallback logic in `productController.ts` to append the product's ID to the slug to guarantee uniqueness. Improved frontend error handling in `product-form.tsx` to show a user-friendly message on slug collisions.

## [2026-05-07] - Filter Persistence Across Navigations

### Added
- **Global Filter State** (`lib/catalog/catalog-context.tsx`):
  - Implemented persistent storage for admin and shop filters in `CatalogProvider`.
  - Added `adminFilters` for Products, Orders, and Customers registries.
  - Added `shopFilters` for the consumer-facing shop page.
  - Added `setAdminFilter` and `setShopFilter` methods to update selections globally.
- **Persistent Admin Tables**:
  - `ProductsTable`: Category, search, and pagination state now survive navigation (e.g., after editing a product).
  - `OrdersTable`: Search queries are preserved when navigating between orders.
  - `CustomersTable`: Search queries are preserved when managing user accounts.
- **Persistent Shop Experience**:
  - `ShopPage`: Integrated with global context to ensure selected categories, price ranges, and search terms stay active during the session.

### Changed
- Filter states now only reset on a hard page refresh or manual change, as requested.

---

5: 
6: ## [2026-05-07] - Infinite Scrolling for Shop Page
7: 
8: ### Added
9: - **Infinite Scroll Support in Catalog** (`lib/catalog/catalog-context.tsx`):
10:   - Added `pagination` state to track `page`, `totalPages`, and `hasMore`.
11:   - Updated `fetchCatalog` to support appending products for seamless loading.
12:   - Added `loadMore` function to simplify fetching the next page of items.
13:   - Synchronized `refresh` to support custom limits (defaulting to 250 for broad searches).
14: - **IntersectionObserver Integration** (`app/shop/page.tsx`):
15:   - Implemented a "sentinel" element at the bottom of the product grid.
16:   - Automatically triggers `loadMore` when the user scrolls to the bottom of the visible items.
17:   - Added cinematic loading animations ("Syncing more droplets...") while fetching.
18:   - Added "Universe Boundary Reached" indicator when all items are loaded.
19: 
20: ### Fixed
21: - **Product Duplication**: Fixed an issue where the same products were appended multiple times during infinite scroll.
22:   - Implemented a fetch-lock mechanism (`fetchingRef`) to prevent overlapping requests.
23:   - Added explicit deduplication logic in the catalog state to filter out redundant product IDs.
24:   - Ensured `isSyncing` state is correctly updated for all paginated fetches, properly throttling the scroll observer.
25:   - Fixed a critical syntax error (missing `try` block) that caused unpredictable behavior and duplication.
26: 
27: ### Changed
28: - Standardized initial page limit to 20 for consistency with infinite scroll batches, ensuring smooth transitions without overlapping IDs.
22: - **Performance Optimization**: 
23:   - Removed staggered animation delays (`delay: i * 0.05`) to ensure appended items appear instantly.
24:   - Added `rootMargin: 400px` to the `IntersectionObserver` to trigger pre-fetching before the user reaches the bottom.
25:   - Refined loading state logic to prevent existing products from being replaced by skeletons during "load more" cycles.
26: 
27: ---

## [2026-05-06] - Deal of the Day — Real Timer & Multi-Product Admin Control

### Added
- **`dealEndTime` Field on Product (Backend)**: Added a new `dealEndTime DateTime?` column to the `products` table via a new Prisma migration (`add_deal_end_time`). This is the single source of truth for deal expiry — stored in the database, not client-side.
- **Backend Auto-Expiry Logic** (`productController.ts`): `GET /products?isDealOfTheDay=true` now filters out products whose `dealEndTime` has already passed, server-side. The DB is authoritative, like Amazon flash sales.
- **`dealEndTime` Validation** (`productController.ts`): Added ISO 8601 validation to both `productCreateValidation` and `productUpdateValidation`. `updateProduct` also explicitly clears `dealEndTime` when `isDealOfTheDay` is set to `false`.
- **Multi-Product Deal Carousel** (`components/deal-of-the-day.tsx`): Completely rewrote the Deal of the Day section. Now supports multiple simultaneous deals shown in an animated carousel with prev/next navigation and dot indicators.
- **Real Flip-Card Countdown** (`components/deal-of-the-day.tsx`): Each deal card has an individual countdown timer that counts down to its own `dealEndTime` from the backend. Uses animated flip-card digits (like Amazon/Flipkart flash sale clocks).
- **Auto-Expiry on Consumer UI** (`components/deal-of-the-day.tsx`): When a deal's countdown hits zero, it is automatically removed from the carousel. The entire section disappears when all deals have expired.
- **Admin Deal Panel Overhaul** (`app/admin/deal/page.tsx`):
  - Added a **`datetime-local` picker** for the admin to set the exact deal end date & time.
  - Added **Quick Preset buttons**: 5m / 15m / 30m / 1h / 3h / 6h / 12h / 24h / 48h from now.
  - Active deals now show a **live ticking countdown** in the admin panel.
  - **EXPIRED badge** displayed on deals whose `dealEndTime` has passed.
  - Duration preview shown while the admin is picking the end time.
  - `dealEndTime` and reverted `originalPrice` are now both sent to the backend on deal removal.
- **`dealEndTime` in Catalog Type** (`lib/catalog/catalog-context.tsx`): Added `dealEndTime?: string | null` to `CatalogProduct` and mapped it in `fetchCatalog`.

### Changed
- `updateProduct` now correctly handles `originalPrice: null` (explicit clear) vs `undefined` (no change), fixing a subtle bug where the original price wasn't being reverted on deal removal.

---

## [2026-05-06] - Catalog System Type Fix


### Fixed
- **CatalogProduct 'imageUrl' Missing Error**: Fixed a TypeScript error in the Navbar search where `imageUrl` was reported as non-existent on the `CatalogProduct` type.
  - Added `imageUrl: string` to the `CatalogProduct` type definition in `catalog-context.tsx` for cross-component compatibility.
  - Updated the product mapping logic in `CatalogProvider` to explicitly resolve and populate the `imageUrl` property for every product.
  - Verified and synchronized usage in `components/navbar.tsx` search results to ensure proper thumbnail rendering.

---

## [2026-05-05] - Full Security & Functionality Audit

### Fixed (Backend)
- **[CRITICAL] Coupon `/apply-coupon` Route Unreachable** (`orderRoutes.ts`): `POST /orders/apply-coupon` was registered *after* `GET /:id` and `POST /:id/cancel`. Express matched the string `"apply-coupon"` as the `:id` param, making the coupon validation endpoint completely dead. Moved `/apply-coupon` before all `/:id` routes.
- **[MEDIUM] Coupon Creation – No Input Validation** (`couponController.ts`): `createCoupon` accepted any raw body without validation — could insert invalid `discountType` enum values or negative `discountValue`. Added full guards: non-empty code, enum check (`PERCENTAGE`/`FIXED`), positive numeric value, percentage ≤ 100. Coupon codes are now normalized to uppercase.

### Security Findings Noted (Action Required by Developer)
- **[CRITICAL] Weak JWT_SECRET in `.env`**: `JWT_SECRET` is set to the placeholder string `your_super_secret_jwt_key_min_32_chars`. This must be changed to a strong random secret (32+ chars) before production. Anyone who knows this value can forge admin tokens.
- **[LOW] `updateProfile` allows email change without re-verification**: A logged-in user can change their account email without OTP confirmation. This is an account takeover vector if an attacker gains a short-lived session. Consider requiring OTP for email changes.

### Audit Passed – No Issues Found
- ✅ **JWT auth** — `authenticate` middleware verifies token, checks user exists in DB, and checks `isBanned` on every request. Cannot use deleted or banned accounts.
- ✅ **Admin guard** — `requireAdmin` always runs after `authenticate`. All `/api/admin/*` routes double-protected.
- ✅ **Frontend admin guard** — `AdminLayout` checks `user` and `checkAdmin()` client-side; redirects to `/admin-login` if not authenticated/admin.
- ✅ **Refresh token security** — Hashed with SHA-256 before storage (never stored raw). Token reuse detection: replaying a revoked token revokes ALL sessions for that user (token rotation).
- ✅ **Password hashing** — bcrypt with 10 salt rounds. Password change invalidates all refresh tokens.
- ✅ **Forgot password** — Does not leak whether email exists (same response for registered/unregistered).
- ✅ **Order ownership** — `getOrderById` and `cancelOrder` both filter by `userId: req.user!.id` — users cannot view/cancel other users' orders.
- ✅ **Payment verification** — Uses `crypto.timingSafeEqual` (constant-time comparison) for Razorpay HMAC signature verification. Prevents timing attacks.
- ✅ **Address ownership** — `updateAddress` and `deleteAddress` verify `address.userId === req.user.id`.
- ✅ **Stock depletion race** — Stock is decremented inside a Prisma `$transaction`. Cancellation restores stock in the same transaction.
- ✅ **Coupon double-spend** — `usedCount` increment is inside the order creation transaction. Checks `usedCount >= usageLimit` before applying.
- ✅ **Review gating** — Only users with a DELIVERED order for the product can submit a review. One review per user/product (upsert).
- ✅ **CORS** — Restricts to explicit allowlist from `ALLOWED_ORIGINS` env var.
- ✅ **Helmet** — HTTP security headers enabled.
- ✅ **Rate limiting** — Applied on signup (5/15min), OTP (3/10min), login (10/15min), forgot-password (3/15min), token refresh (20/15min).
- ✅ **Body size limit** — JSON body capped at `10kb`.
- ✅ **Cloudinary cleanup** — `deleteProduct` and `updateCategory` call `removeFile()` to delete old images from Cloudinary on delete/replace.
- ✅ **File upload validation** — Multer restricts to `jpeg,jpg,png,gif,webp` and `MAX_FILE_SIZE_MB` (default 5MB).
- ✅ **`api-client.ts` token refresh** — On 401, silently refreshes token and retries original request. Queues concurrent requests during refresh. Works for both JSON and multipart (new `upload`/`uploadPut` methods).

---

## [2026-05-05] - Admin Product Image Upload (Critical Fix)

### Fixed
- **Product Image Upload Not Working (Client-Reported)**: Completely replaced the non-functional "Upload visuals coming soon" placeholder in the admin product form with a fully working multi-image upload UI. Root causes were:
  1. **`api-client.ts` always forced `Content-Type: application/json`** — this corrupted `FormData` payloads, making file uploads impossible. Fixed by adding `api.upload()` and `api.uploadPut()` methods that detect `FormData` and skip the JSON header so the browser sets `multipart/form-data; boundary=...` automatically.
  2. **`product-form.tsx` had no actual `<input type="file">` element** — the image panel was a static placeholder. Replaced with a real click-to-upload zone supporting up to 5 files (JPEG/PNG/WebP/GIF, max 5 MB each).
  3. **HTTP method mismatch** — the edit form used `api.patch()` but the backend route is `PUT /admin/products/:id`. Fixed to use `api.uploadPut()`.
  4. **Form submission used `JSON.stringify`** — product create/update now builds a `FormData` object with all text fields + image file attachments, matching the backend's `upload.array('images', 5)` middleware expectation.
- **Product Form UX improvements**:
  - Live image previews with "new" / "saved" badges
  - Per-image remove buttons (with Cloudinary URL revocation for blob previews)
  - Total image count guard (max 5)
  - Validation requiring at least 1 image before submit
  - Redirects to `/admin/products` list after successful save

---

## [2026-05-05] - Bug Fixes & Responsiveness Improvements

### Fixed
- **Admin Login Connection Error**: Fixed an issue where the Server Action for Admin Login crashed in production. Node.js `fetch` requires absolute URLs, so the relative proxy path (`/api-proxy`) caused a `TypeError`. The Server Action now intercepts relative proxy URLs and routes requests directly to the absolute backend API URL.
- **Wishlist Disappearing on Refresh**: Fixed a bug where the wishlist UI was cleared upon page refresh. The backend response is wrapped in `{ success: true, wishlist: [...] }`, but the frontend `CatalogContext` was incorrectly trying to read from `res.data`. The frontend now safely parses `res.wishlist` and correctly hydrates the state on initial load.
- **Wishlist Counter in Dashboard**: Updated the `/account/dashboard` statistics loader to safely parse the nested `wishlist` array, ensuring the "Saved" counter displays the correct number instead of `undefined` or `0`.
- **Mobile UI Overlaps**: 
  - Reduced the `FEATURED PRODUCTS` and `SHOP BY CATEGORIES` headings from `text-4xl` to `text-3xl` with tighter letter spacing (`tracking-tight`) to prevent text breaking and wrapping awkwardly on small 360px mobile screens.
  - Converted the footer from a 2-column grid to a single-column layout (`grid-cols-1`) on small mobile devices to prevent the "Brand" and "Resources" sections from overlapping.

