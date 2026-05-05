# Changelog

All notable changes to this project will be documented in this file.

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

