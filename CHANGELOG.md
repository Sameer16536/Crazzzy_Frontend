# Changelog

All notable changes to this project will be documented in this file.

## [2026-05-05] - Bug Fixes & Responsiveness Improvements

### Fixed
- **Admin Login Connection Error**: Fixed an issue where the Server Action for Admin Login crashed in production. Node.js `fetch` requires absolute URLs, so the relative proxy path (`/api-proxy`) caused a `TypeError`. The Server Action now intercepts relative proxy URLs and routes requests directly to the absolute backend API URL.
- **Wishlist Disappearing on Refresh**: Fixed a bug where the wishlist UI was cleared upon page refresh. The backend response is wrapped in `{ success: true, wishlist: [...] }`, but the frontend `CatalogContext` was incorrectly trying to read from `res.data`. The frontend now safely parses `res.wishlist` and correctly hydrates the state on initial load.
- **Wishlist Counter in Dashboard**: Updated the `/account/dashboard` statistics loader to safely parse the nested `wishlist` array, ensuring the "Saved" counter displays the correct number instead of `undefined` or `0`.
- **Mobile UI Overlaps**: 
  - Reduced the `FEATURED PRODUCTS` and `SHOP BY CATEGORIES` headings from `text-4xl` to `text-3xl` with tighter letter spacing (`tracking-tight`) to prevent text breaking and wrapping awkwardly on small 360px mobile screens.
  - Converted the footer from a 2-column grid to a single-column layout (`grid-cols-1`) on small mobile devices to prevent the "Brand" and "Resources" sections from overlapping.

