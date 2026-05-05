# Changelog

All notable changes to this project will be documented in this file.

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

