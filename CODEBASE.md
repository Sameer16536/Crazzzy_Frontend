# Complete Codebase Reference

This document provides a **complete file-by-file breakdown** of every TypeScript, JavaScript, and configuration file in the project. Use this as a reference guide when you need to understand what a specific file does or find a particular function.

---

## 📑 Quick Navigation

- [Configuration Files](#configuration-files)
- [App Directory (Pages & Routes)](#app-directory-pages--routes)
- [API Routes](#api-routes)
- [Server Actions](#server-actions)
- [Components](#components)
- [Hooks](#hooks)
- [Library & Utilities](#library--utilities)
- [State Management](#state-management)
- [Data Files](#data-files)
- [Styling](#styling)

---

## Configuration Files

### `next.config.mjs`
**Purpose**: Next.js build and runtime configuration

**Functions & Settings**:
- `typescript.ignoreBuildErrors` – Suppresses TypeScript errors during build
- `images.unoptimized` – Disables Next.js image optimization (using raw images)
- `experimental.reactCompiler` – Enables React compiler (if available)

**When to edit**: If you need to change build behavior, add redirects, or modify image handling

---

### `tsconfig.json`
**Purpose**: TypeScript compiler configuration

**Key Settings**:
- `compilerOptions.strict` – Strict type checking enabled
- `compilerOptions.target` – "ES2020" (modern JavaScript target)
- `compilerOptions.jsx` – "react-jsx" (React 19 JSX transform)
- `compilerOptions.baseUrl` – "." (relative imports)
- `compilerOptions.paths` – Path aliases:
  - `@/*` → files in root
  - `@/app/*` → app directory
  - `@/components/*` → components directory
  - `@/hooks/*` → hooks directory
  - `@/lib/*` → lib directory

**When to edit**: Add new path aliases, change strict settings, or adjust target version

---

### `components.json`
**Purpose**: shadcn/ui configuration

**Settings**:
- `baseColor` – "neutral" (color palette)
- `componentDir` – "./components" (where components are installed)
- `importAlias` – "@/" (import path prefix)

**When to edit**: When adding new shadcn/ui components or changing color schemes

---

### `tailwind.config.ts`
**Purpose**: Tailwind CSS configuration

**Key Settings**:
- `theme.extend` – Custom colors, spacing, animation extensions
- `plugins` – Animation utilities, custom components
- Dark mode support via `dark` class selector

**When to edit**: Add custom colors, spacing, or animations for branding

---

### `postcss.config.mjs`
**Purpose**: PostCSS processing configuration

**Plugins**:
- `tailwindcss` – Tailwind CSS processor
- `autoprefixer` – Adds vendor prefixes for cross-browser support

**When to edit**: Rarely needed; only if adding CSS processing steps

---

### `package.json`
**Purpose**: Project metadata, dependencies, and scripts

**Scripts**:
- `npm run dev` – Start development server (port 3000)
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npm run lint` – Run ESLint (if configured)

**Key Dependencies**:
- `next@16.2.0` – Next.js framework
- `react@19.2.4` – React library
- `typescript` – TypeScript support
- `tailwindcss@4.2.0` – Utility CSS framework
- `@radix-ui/*` – Accessible component primitives
- `@reduxjs/toolkit@2.11.2` – Redux store management
- `react-hook-form@7.54.1` – Form handling
- `zod@3.24.1` – Data validation
- `embla-carousel@*` – Carousel/slider component
- `framer-motion@*` – Animation library
- `recharts@2.15.0` – Data visualization charts
- `sonner@*` – Toast notifications
- `next-themes@*` – Theme provider
- `lucide-react` – Icon library

---

## App Directory (Pages & Routes)

### `app/layout.tsx`
**Purpose**: Root HTML layout wrapper (all pages use this)

**Component**: `RootLayout`

**Functions**:
- `generateMetadata()` – Sets page title, description, icons
- `RootLayout()` – Root component with:
  - HTML structure setup
  - Metadata (favicon, Apple touch icon, etc.)
  - Providers wrapper (Redux context)
  - Theme cookie initialization
  - Body classes and dark mode support
  - Vercel Analytics integration

**Theme Management**:
- Reads `theme` cookie to determine dark/light mode
- Applies `dark` class to `<html>` if theme is "dark"
- Default theme: "light"

**When to edit**: Change global fonts, add global metadata, modify root layout structure

---

### `app/globals.css`
**Purpose**: Global CSS styles and Tailwind directives

**Includes**:
- Tailwind CSS directives: `@tailwind base, components, utilities`
- CSS variable definitions for theme colors
- Custom font imports (if needed)
- Global component styles
- Dark mode color overrides

**When to edit**: Add global styles, define CSS variables, set default font sizes

---

### `app/page.tsx` – HOME PAGE
**Purpose**: Homepage with hero section, featured products, and categories

**Component**: `Home`

**Sections**:
1. **Hero Section**
   - Large headline with gradient text
   - Subheading and description
   - Two CTA buttons: "Shop Now" and "Browse Categories"
   - Background image or color

2. **Category Carousel**
   - `<CategoryCarousel />` component
   - Shows 5 featured categories with images
   - Click to navigate to category page
   - Carousel animation

3. **Featured Products Grid**
   - Displays products marked as `featured: true`
   - 4-column grid (responsive)
   - Each product shows: image, name, rating, price, stock status
   - "View All" button links to `/shop`

4. **Newsletter Section**
   - Email input form
   - Subscribe button
   - Form submission ready for backend

5. **Footer**
   - Company info
   - Quick links
   - Social media icons
   - Contact information

**Related Components**:
- `<CategoryCarousel>` – Category showcase
- `<ProductCard>` – Individual product display

**When to edit**: Change hero content, featured products selection, footer info

---

### `app/shop/page.tsx` – ALL PRODUCTS
**Purpose**: Shop page with all products and filtering

**Component**: `ShopPage`

**Features**:
1. **Product Grid** (responsive columns)
2. **Filters**:
   - **Category Filter** – Dropdown with all categories
   - **Price Filter** – Slider (₹0–₹15,000)
   - **Sort Options** – Newest, Price Low→High, Price High→Low

3. **Active Filters Display** – Shows applied filters with clear option
4. **Product Count** – "Showing X products"
5. **Clear Filters Button** – Reset all filters

**Functions**:
- `applyFilters()` – Filters products by category and price
- `handleSort()` – Sorts by selection
- `clearFilters()` – Resets all filters

**State Management**:
- Uses React state for filters, sort, search

**Related Components**:
- `<ProductCard>` – Individual product
- `<CategoryCarousel>` – Category showcase

**When to edit**: Change default filters, add new filter types, modify grid layout

---

### `app/shop/[slug]/page.tsx` – CATEGORY PAGE
**Purpose**: Browse products filtered by category

**Component**: `CategoryPage`

**Dynamic Params**:
- `[slug]` – Category slug (e.g., "hotwheels", "anime-figurines")

**Features**:
- Same layout as `/shop` but filtered to one category
- Category header with name and description
- Only shows products where `categoryId` matches
- All filters and sorting available

**Functions**:
- `generateStaticParams()` – Pre-generates routes for all categories
- No dynamic data fetching; uses static generation

**When to edit**: Change category header styling, add category-specific promotions

---

### `app/product/[id]/page.tsx` – PRODUCT DETAIL
**Purpose**: Full product detail page with gallery, reviews, and actions

**Component**: `ProductPage`

**Dynamic Params**:
- `[id]` – Product ID (1–15 or custom)

**Sections**:
1. **Product Image Gallery**
   - Large main image (responsive)
   - Hover effect: image swaps to alternate
   - Dark background for contrast

2. **Product Information**
   - Product name (large heading)
   - Star rating with review count
   - Price display:
     - Original price (strikethrough if discounted)
     - Current price (bold, prominent)
   - Stock status badge ("In Stock" / "Out of Stock")

3. **Size/Variant Selector**
   - Dropdown or button group (if applicable)

4. **Quantity Selector**
   - Plus/minus buttons to adjust quantity
   - Quantity input field
   - Minimum 1, maximum ~100

5. **Add to Cart Button**
   - Icon + text: "Add to Cart"
   - Redux dispatch to add item

6. **Add to Wishlist**
   - Heart icon (ready for implementation)

7. **Product Description**
   - Full description text from product data

8. **Specifications**
   - Key-value specs (if available)

9. **Customer Reviews Section**
   - Mock review cards
   - Ratings display
   - Reviewer names and dates

10. **Related Products Section**
    - 4-product carousel
    - Same category products
    - Click to view detail page

**Related Components**:
- `<ProductCard>` – Related products
- Plus standard UI components (buttons, inputs, etc.)

**When to edit**: Change gallery layout, add real reviews API, modify product sections

---

### `app/cart/page.tsx` – SHOPPING CART
**Purpose**: View, edit, and manage items in shopping cart

**Component**: `CartPage`

**Sections**:
1. **Cart Items Table/List**
   - Product image (thumbnail)
   - Product name (links to detail page)
   - Price per item
   - Quantity selector (±/input)
   - Item subtotal
   - Remove button (X icon)

2. **Cart Summary**
   - Subtotal
   - Tax (if applicable)
   - Shipping estimate
   - **Total** (prominent)

3. **Checkout Button**
   - Prominent CTA to proceed to checkout
   - Disabled if cart is empty

4. **Continue Shopping Link**
   - Button to return to `/shop`

**State Management**:
- Uses Redux cart state
- Reads from `useAppSelector(state => state.cart.items)`
- Dispatches `removeFromCart`, `setQuantity` actions

**Related Components**:
- Redux cart slice for data

**When to edit**: Change cart item layout, add promo codes, modify checkout flow

---

### `app/account/page.tsx` – ACCOUNT PAGE
**Purpose**: User account shell (currently a stub)

**Component**: `AccountPage`

**Current State**:
- Simple page structure
- Ready for account features:
  - User profile
  - Order history
  - Saved addresses
  - Wishlist
  - Account settings

**When to edit**: Implement user authentication and profile features

---

### `app/admin-login/page.tsx` – ADMIN LOGIN
**Purpose**: Admin authentication form

**Component**: `AdminLoginPage`

**Features**:
1. **Login Form**
   - Email input field
   - Password input field
   - "Remember me" checkbox (optional)
   - Login button

2. **Form Validation**
   - Client-side validation (email, password required)
   - Server-side validation via `adminLogin` action

3. **Error Handling**
   - Displays error messages if login fails
   - Clears on focus

4. **Demo Credentials Display**
   - Shows: `admin@crazzzy.com` / `admin@123`

5. **Redirect**
   - On successful login, redirects to `/admin`
   - Uses Next.js `redirect()` from `next/navigation`

**Server Action Used**:
- `adminLogin(formData)` from `app/actions/auth.ts`

**When to edit**: Change credential display, modify form validation, customize styling

---

### `app/admin/page.tsx` – ADMIN DASHBOARD
**Purpose**: Main admin dashboard with KPIs, charts, and management overview

**Component**: `AdminDashboard`

**Sections**:
1. **Header**
   - Page title: "Dashboard"
   - Subtitle: "Welcome back, Admin"
   - Last updated timestamp

2. **KPI Cards** (via `<DashboardOverview>`)
   - **Revenue**: Total revenue with trend (up/down arrow)
   - **Orders**: Total orders count with trend
   - **Customers**: Total customers with trend
   - **Conversion Rate**: Conversion percentage with trend

3. **Quick Actions** (via `<QuickActions>`)
   - Buttons: "Add Product", "New Order", "View Reports", "Export Data"
   - Ready for action handlers

4. **Featured Products** (via `<FeaturedProducts>`)
   - Grid of featured products
   - Product card with image, name, price, stock

5. **Revenue Trend Chart** (via `<AnalyticsChart>`)
   - Line chart showing last 7 days revenue
   - Uses Recharts library
   - Interactive tooltip on hover

6. **Recent Orders Table** (via `<RecentOrders>`)
   - Table with mock orders
   - Columns: Order ID, Customer, Amount, Status, Date
   - Status badges (Pending, Processing, Completed)

**Related Components**:
- `<AdminLayout>` – Wrapper with sidebar
- `<DashboardOverview>` – KPI cards
- `<QuickActions>` – Action buttons
- `<FeaturedProducts>` – Product showcase
- `<AnalyticsChart>` – Revenue chart
- `<RecentOrders>` – Orders table

**Authentication**:
- Protected by `proxy.ts` middleware
- Checks `admin-session` cookie

**When to edit**: Change KPI data sources, modify chart data, add real API calls

---

### `app/admin/products/page.tsx` – PRODUCTS MANAGEMENT (Stub)
**Purpose**: Admin product management interface

**Current State**:
- Page structure exists
- Ready for implementation
- Should have:
  - Product list/table
  - Add/Edit product forms
  - Delete functionality
  - Filter/search options

**When to implement**: Connect to backend product API

---

### `app/admin/orders/page.tsx` – ORDERS MANAGEMENT (Stub)
**Purpose**: Admin order management interface

**Current State**:
- Page structure exists
- Ready for implementation
- Should have:
  - Order list/table
  - Order details view
  - Status update functionality
  - Filter by date/status

---

### `app/admin/customers/page.tsx` – CUSTOMERS MANAGEMENT (Stub)
**Purpose**: Admin customer management interface

**Current State**:
- Page structure exists
- Ready for implementation
- Should have:
  - Customer list
  - Customer details
  - Contact history
  - Purchase history

---

### `app/admin/analytics/page.tsx` – ANALYTICS (Stub)
**Purpose**: Admin analytics and reporting

**Current State**:
- Page structure exists
- Ready for implementation
- Should have:
  - Sales charts
  - Customer metrics
  - Product performance
  - Traffic analytics

---

### `app/admin/settings/page.tsx` – SETTINGS (Stub)
**Purpose**: Admin settings and configuration

**Current State**:
- Page structure exists
- Ready for implementation
- Should have:
  - Store settings
  - Email configuration
  - Payment settings
  - User management

---

## API Routes

### `app/api/catalog/route.ts` – GET /api/catalog
**Purpose**: Serves complete product and category catalog

**Endpoint**: `GET /api/catalog`

**Response Format**:
```typescript
{
  categories: [
    {
      id: string,
      name: string,
      slug: string,
      description: string,
      image: string,
      color: string
    }
  ],
  products: [
    {
      id: string,
      name: string,
      categoryId: string,
      price: number,
      originalPrice?: number,
      rating: number,
      reviews: number,
      images: string[],
      description: string,
      inStock: boolean,
      soldOut?: boolean,
      featured?: boolean
    }
  ]
}
```

**Key Functions**:

#### `getLibDataFolderCatalog()`
**Purpose**: Scans `lib/data/` folders to find categories and products

**Process**:
1. Lists all folders in `lib/data/`
2. For each folder:
   - Checks if `data.txt` exists
   - Parses `data.txt` for products
   - Lists images in folder
   - Creates category object

**Returns**: `{ categories, products }`

#### `parseProductsFromTxt(rawText, categoryId, imagesList)`
**Purpose**: Parses custom `data.txt` format into product objects

**Input Format** (data.txt):
```
Product: Product Name One
Product description: This is a detailed description of the product
Mrp: 1,999
---
Product: Product Name Two
Product Description: Another detailed description
Mrp: 2,999
---
```

**Regex Patterns Used**:
- `Product name`: `/^\s*Product\s*:\s*(.+)$/`
- `Description`: `/Product\s+[Dd]escription\s*:\s*([\s\S]+?)(?=Mrp|---)/`
- `Price (MRP)`: `/\bmrp\b\s*:\s*([0-9,]*)/i`

**Returns**: Array of product objects

#### `listCategoryImages(categoryDir)`
**Purpose**: Lists all image files in a category folder

**Supported Formats**: jpg, jpeg, png, webp, gif, avif

**Returns**: String array of relative image paths

#### `slugify(input)`
**Purpose**: Converts text to URL-safe slug

**Example**: "Hot Wheels" → "hot-wheels"

**Returns**: Lowercase, hyphenated string

#### `stableColorFromString(input)`
**Purpose**: Generates stable OKLCH hue from string (for category badges)

**System**: Uses string hash to consistent color

**Returns**: OKLCH hue value

**When to edit**: Change product parsing format, add new fields, modify category logic

---

### `app/api/theme/route.ts` – POST /api/theme
**Purpose**: Sets theme preference cookie

**Endpoint**: `POST /api/theme`

**Request Body**:
```typescript
{ theme: "dark" | "light" }
```

**Response**:
```typescript
{ success: true }
```

**Cookie Settings**:
- Name: `theme`
- Value: "dark" or "light"
- Expires: 365 days (~1 year)
- httpOnly: false (accessible to JavaScript)
- Path: "/"

**When to use**: Called from `<ThemeToggle>` component when user switches theme

---

### `app/api/media/[...slug]/route.ts` – GET /api/media/[...slug]
**Purpose**: Serves images from `lib/data/` folders dynamically

**Endpoint**: `GET /api/media/lib-data/<CategoryFolder>/<filename>`

**Example Routes**:
- `/api/media/lib-data/Hotwheels/1.jpg`
- `/api/media/lib-data/Anime Figurines/product-image.png`

**Features**:

#### Security
- Prevents directory traversal attacks (blocks `../` in paths)
- Validates file path is within allowed directory

#### MIME Type Detection
- Automatically detects format from file extension
- Supported: jpg, jpeg, png, webp, gif, avif
- Default: `application/octet-stream`

#### Caching
- `Cache-Control: public, max-age=3600`
- Images cached for 1 hour

#### Error Handling
- Returns 400 if path contains invalid characters
- Returns 404 if file not found

**When to use**: For serving category product images from local storage

---

## Server Actions

### `app/actions/auth.ts`
**Purpose**: Server-side authentication actions for admin login/logout

**Key Functions**:

#### `adminLogin(formData)` – Server Action
**Parameters**:
- `formData: FormData` – Form data with email and password fields

**Process**:
1. Extracts email and password from formData
2. Validates email format
3. Compares with hardcoded credentials:
   - Email: `admin@crazzzy.com`
   - Password: `admin@123`
4. If valid, creates session object: `{ email, loggedInAt: ISO timestamp }`
5. Sets `admin-session` cookie with encrypted session

**Cookie Settings**:
- Name: `admin-session`
- Value: JSON stringified session
- httpOnly: true (not accessible to JavaScript)
- secure: true (HTTPS only in production)
- sameSite: "lax" (CSRF protection)
- maxAge: 7 days (604800 seconds)

**Returns**: JSON response with success/error

**On Success**: Calls `redirect('/admin')`

**On Error**: Throws error with message

#### `adminLogout()` – Server Action
**Purpose**: Clear admin session cookie

**Process**:
1. Deletes `admin-session` cookie
2. Redirects to homepage or login page

#### `verifyAdminSession()` – Utility
**Purpose**: Check if admin is logged in

**Parameters**: None (reads `admin-session` cookie)

**Returns**:
- `{ email: string, loggedInAt: ISO timestamp }` if valid
- `null` if invalid/expired

**Uses**: Used by `proxy.ts` to protect admin routes

**When to edit**: Replace hardcoded credentials with real authentication backend

---

## Route Protection Middleware

### `proxy.ts`
**Purpose**: Middleware-like protection for `/admin/*` routes

**Function**: Custom route protection (not using Next.js middleware)

**Protected Routes**: All routes under `/admin/*`

**Protection Logic**:
1. Checks if accessing `/admin` route
2. Reads `admin-session` cookie
3. Validates cookie JSON integrity
4. If invalid/missing, redirects to `/admin-login`
5. If valid, allows access

**When to edit**: Change protected routes, modify authentication logic

---

## Components

### Main/Layout Components

#### `components/navbar.tsx`
**Purpose**: Fixed top navigation header for the entire site

**Component**: `Navbar`

**Features**:
1. **Logo** – Clickable link to home
2. **Navigation Menu** – Links to Shop, Categories, etc.
3. **Search Bar** – Search input (ready for implementation)
4. **Cart Icon Badge** – Shows item count from Redux
5. **Theme Toggle Button** – Dark/light toggle
6. **Mobile Hamburger Menu** – For responsive view

**State Management**:
- Uses `useAppSelector` to get cart item count
- Uses `useRouter` for navigation

**Related Hooks**:
- `useIsMobile()` – Toggle menu on mobile
- `useAppSelector` – Get cart count

**When to edit**: Change navigation links, add new menu items, modify logo

---

#### `components/theme-toggle.tsx`
**Purpose**: Dark/light theme toggle button

**Component**: `ThemeToggle`

**Features**:
1. **Toggle Button** – Icon changes between sun/moon
2. **Theme Management**:
   - Reads `theme` cookie
   - Applies `dark` class to `<html>` element
   - Sends theme preference to `/api/theme`

**Functions**:
- `toggleTheme()` – Switches between dark/light

**When to edit**: Change icon styles, modify theme colors

---

#### `components/theme-provider.tsx`
**Purpose**: Theme provider wrapper (currently unused alternative)

**Component**: `ThemeProvider`

**Note**: Uses next-themes library but project uses cookie-based theme instead

**When to use**: If switching from cookie-based to next-themes approach

---

#### `components/providers.tsx`
**Purpose**: Root provider wrapper for Redux store

**Component**: `Providers`

**Wraps**: Redux `<Provider>` with store

**Store Initialization**:
- Creates store only once using `useRef`
- Prevents multiple store instances

**When to edit**: Add other providers (error boundary, etc.)

---

### Feature Components

#### `components/product-card.tsx`
**Purpose**: Individual product display card for grids/carousels

**Component**: `ProductCard`

**Props**:
```typescript
{
  product: {
    id: string
    name: string
    image?: string
    price: number
    originalPrice?: number
    rating: number
    reviews: number
    inStock: boolean
    soldOut?: boolean
  }
}
```

**Features**:
1. **Product Image**
   - Main image display
   - Hover effect swaps to alternate image (if available)
   - Loading skeleton

2. **Product Info**
   - Name (links to detail page)
   - Star rating with review count
   - Price display (with strikethrough if discounted)

3. **Action Buttons**
   - "Add to Cart" button
   - Stock status badge

4. **Interactive**
   - Hover animations
   - Click to navigate to detail page

**State**: None (presentational component)

**When to edit**: Change card layout, modify hover effects, add new fields

---

#### `components/category-carousel.tsx`
**Purpose**: Carousel/slider of product categories

**Component**: `CategoryCarousel`

**Features**:
1. **Embla Carousel** – Smooth, responsive carousel
2. **Category Cards** – Each shows:
   - Category image/icon
   - Category name
   - Category color badge

3. **Navigation Arrows** – Previous/Next buttons
4. **Framer Motion Animations** – Smooth slide-in effects
5. **Loading State** – Skeleton loaders while fetching

**Hooks Used**:
- `useCatalog()` – Fetches category data
- `useEmblaCarousel()` – Carousel functionality

**When to edit**: Change carousel speed, modify card layout, adjust breakpoints

---

### Admin Components

#### `components/admin/layout.tsx`
**Purpose**: Admin dashboard layout wrapper

**Component**: `AdminLayout`

**Sections**:
1. **Sidebar Navigation** – `<AdminSidebar>`
2. **Top Header** – `<AdminHeader>`
3. **Main Content Area** – `{children}`

**Responsive**:
- Desktop: Sidebar always visible
- Mobile: Sidebar in drawer (hamburger menu)

**When to edit**: Modify layout grid, change sidebar position, add new sections

---

#### `components/admin/sidebar.tsx`
**Purpose**: Admin navigation sidebar

**Component**: `AdminSidebar`

**Navigation Items**:
- Dashboard (link to `/admin`)
- Products (link to `/admin/products`)
- Orders (link to `/admin/orders`)
- Customers (link to `/admin/customers`)
- Analytics (link to `/admin/analytics`)
- Settings (link to `/admin/settings`)

**Features**:
- Active route highlighting
- Icons for each item
- Collapsible on mobile

**When to edit**: Add new admin pages, change menu labels, modify icons

---

#### `components/admin/header.tsx`
**Purpose**: Admin top header bar

**Component**: `AdminHeader`

**Features**:
1. **Logo/Home Link**
2. **Page Title** – Dynamic from `usePathname()`
3. **Search Bar** (optional)
4. **Theme Toggle**
5. **Mobile Menu Button** – Toggles sidebar drawer

**When to edit**: Add new header buttons, modify search, change styling

---

#### `components/admin/dashboard-overview.tsx`
**Purpose**: KPI metric cards for dashboard

**Component**: `DashboardOverview`

**Metrics Displayed**:
1. **Revenue** – Total revenue with trend
   - Number: ₹X.XX
   - Trend: up/down arrow with percentage

2. **Orders** – Total order count with trend

3. **Customers** – Total customer count with trend

4. **Conversion Rate** – Conversion percentage with trend

**Trending Component**: `<TrendIcon>` shows up/down arrow

**Card Component**: `<Card>` from shadcn/ui

**When to edit**: Change metric labels, update data sources, modify styling

---

#### `components/admin/analytics-chart.tsx`
**Purpose**: Revenue trend chart for dashboard

**Component**: `AnalyticsChart`

**Features**:
- **Chart Type**: Line chart using Recharts
- **Data**: Last 7 days revenue mock data
- **Axes**: X-axis (dates), Y-axis (revenue in ₹)
- **Tooltip**: Interactive hover info
- **Responsive**: Adapts to container width

**Chart Data**:
```typescript
[
  { date: "Mon", revenue: 1200 },
  { date: "Tue", revenue: 1900 },
  // ... 7 days
]
```

**When to edit**: Change time period, connect to real data, modify chart colors

---

#### `components/admin/recent-orders.tsx`
**Purpose**: Table of recent orders

**Component**: `RecentOrders`

**Columns**:
- Order ID
- Customer Name
- Amount (₹)
- Status (badge: Pending, Processing, Completed)
- Date

**Features**:
- Mock data (sample orders)
- Status badge styling
- Sortable headers (ready for implementation)
- Pagination (ready for implementation)

**When to edit**: Connect to real orders API, add more columns, implement sorting

---

#### `components/admin/featured-products.tsx`
**Purpose**: Featured products grid for admin dashboard

**Component**: `FeaturedProducts`

**Features**:
- Grid of featured products (4 columns)
- Product cards with image, name, price
- Links to product detail pages
- Loading state with skeleton

**When to edit**: Change grid layout, modify product selection, add edit buttons

---

#### `components/admin/quick-actions.tsx`
**Purpose**: Quick action buttons for common admin tasks

**Component**: `QuickActions`

**Actions**:
1. **Add Product** – Navigate to add product form
2. **New Order** – Create new order
3. **View Reports** – Open reports page
4. **Export Data** – Export data to CSV/Excel

**When to edit**: Add new actions, modify button text, connect action handlers

---

#### `components/admin/status-badge.tsx`
**Purpose**: Order status badge component

**Component**: `StatusBadge`

**Props**:
```typescript
{ status: "pending" | "processing" | "completed" | "cancelled" }
```

**Styling**:
- Pending: gray/neutral color
- Processing: yellow/warning color
- Completed: green/success color
- Cancelled: red/destructive color

**When to edit**: Add new statuses, modify badge colors

---

#### `components/admin/trend-icon.tsx`
**Purpose**: Up/down arrow indicator for metric trends

**Component**: `TrendIcon`

**Props**:
```typescript
{
  trend: "up" | "down"
  percentage: number
}
```

**Display**: Arrow icon + percentage text

**When to edit**: Change arrow icons, modify styling

---

### shadcn/ui Components

In `components/ui/`, there are **60+ pre-built, accessible components** from shadcn/ui:

#### Layout Components
- `button.tsx` – Standard button
- `card.tsx` – Card container
- `separator.tsx` – Divider line
- `sheet.tsx` – Sheet/panel overlay
- `drawer.tsx` – Drawer overlay (mobile-friendly)
- `resizable.tsx` – Resizable container

#### Form Components
- `input.tsx` – Text input
- `textarea.tsx` – Text area
- `select.tsx` – Dropdown select
- `checkbox.tsx` – Checkbox
- `radio-group.tsx` – Radio buttons
- `toggle.tsx` – Toggle button
- `switch.tsx` – Toggle switch
- `label.tsx` – Form label
- `form.tsx` – Form context & validation

#### Data Display
- `table.tsx` – Data table
- `badge.tsx` – Badge/tag
- `avatar.tsx` – User avatar
- `skeleton.tsx` – Loading skeleton
- `empty.tsx` – Empty state
- `alert.tsx` – Alert message
- `progress.tsx` – Progress bar
- `slider.tsx` – Range slider

#### Overlays & Dropdowns
- `dialog.tsx` – Modal dialog
- `alert-dialog.tsx` – Alert dialog
- `popover.tsx` – Popover overlay
- `hover-card.tsx` – Hover card
- `tooltip.tsx` – Tooltip
- `dropdown-menu.tsx` – Dropdown menu
- `context-menu.tsx` – Context menu
- `navigation-menu.tsx` – Navigation menu

#### More Components
- `tabs.tsx` – Tab navigation
- `accordion.tsx` – Accordion/collapsible
- `carousel.tsx` – Carousel
- `calendar.tsx` – Calendar picker
- `pagination.tsx` – Pagination controls
- `breadcrumb.tsx` – Breadcrumb navigation
- `command.tsx` – Command palette
- `collapsible.tsx` – Collapsible section
- `scroll-area.tsx` – Scrollable container
- `spinner.tsx` – Loading spinner
- `sonner.tsx` – Toast notifications

**Usage Pattern**:
All components follow same pattern:
```typescript
import { Button } from "@/components/ui/button";

export default function MyComponent() {
  return <Button>Click me</Button>;
}
```

**When to use**: Check shadcn/ui docs for each component's props and features

---

## Hooks

### `hooks/use-mobile.ts`
**Purpose**: Detect if viewport is mobile size

**Hook**: `useIsMobile()`

**Returns**: `boolean | undefined`
- `true` – Viewport width < 768px (Tailwind `md` breakpoint)
- `false` – Viewport width >= 768px
- `undefined` – Not yet hydrated (during SSR)

**Features**:
- Uses MediaQueryList for efficient detection
- Hydration-safe (handles SSR)
- Auto-updates on window resize

**Usage**:
```typescript
const isMobile = useIsMobile();
if (isMobile) {
  return <MobileView />;
}
```

**When to use**: For responsive component logic

---

### `hooks/use-toast.ts`
**Purpose**: Custom toast notification system

**Hook**: `useToast()`

**Returns**:
```typescript
{
  toast: (options) => void
}
```

**Toast Options**:
```typescript
{
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number (ms)
}
```

**Functions**:
- `toast(options)` – Show new toast
- Toast reducer manages state (add, update, dismiss, remove)

**Features**:
- Limit 1 active toast at a time
- Auto-dismiss after duration
- Integrates with Sonner library

**Usage**:
```typescript
const { toast } = useToast();

toast({
  title: "Success",
  description: "Item added to cart"
});
```

**When to use**: Show success/error/info notifications

---

### `lib/catalog/use-catalog.ts`
**Purpose**: Fetch and cache product catalog

**Hook**: `useCatalog()`

**Returns**:
```typescript
{
  data: { categories, products },
  isLoading: boolean,
  error: Error | null,
  byCategory: Map<categoryId, products[]>
}
```

**Type Definitions** (exported):
```typescript
interface CatalogCategory {
  id: string
  name: string
  slug: string
  description: string
  image: string
  color: string
}

interface CatalogProduct {
  id: string
  name: string
  categoryId: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  images: string[]
  description: string
  inStock: boolean
  soldOut?: boolean
  featured?: boolean
}
```

**Features**:
- Fetches from `/api/catalog`
- Caches result (no refetch while component mounted)
- `byCategory` memoized Map for easy filtering
- Error and loading states

**Usage**:
```typescript
const { data, isLoading, byCategory } = useCatalog();

const categProducts = byCategory?.get("hotwheels") || [];
```

**When to use**: Any component that needs product/category data

---

## Library & Utilities

### `lib/utils.ts`
**Purpose**: Common utility functions

**Functions**:

#### `cn(...inputs)`
**Purpose**: Safely merge Tailwind classes without conflicts

**Parameters**: `...inputs` – Class name strings
- Handles arrays and objects
- Removes duplicates
- Resolves conflicting Tailwind classes

**Uses**: clsx + tailwind-merge

**Usage**:
```typescript
const buttonClasses = cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500",
  isSm && "px-2 py-1"
);
```

**When to use**: Conditionally apply Tailwind classes

---

### `lib/store/store.ts`
**Purpose**: Redux store configuration

**Exports**:
```typescript
export const store = configureStore({
  reducer: {
    cart: cartReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

**Features**:
- Redux Toolkit `configureStore`
- Redux DevTools enabled in dev
- Cart reducer included

**Type Exports**: `RootState`, `AppDispatch` (for typed hooks)

---

### `lib/store/hooks.ts`
**Purpose**: Typed Redux hooks

**Exports**:
```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelector = useSelector
```

**Usage**:
```typescript
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

const dispatch = useAppDispatch();
const cartItems = useAppSelector(state => state.cart.items);
```

---

### `lib/store/slices/cart-slice.ts`
**Purpose**: Redux cart state management

**State Type**:
```typescript
interface CartState {
  items: CartItem[]
  lastUpdatedAt: number | null
}

interface CartItem {
  productId: string
  name: string
  image?: string
  price: number
  quantity: number
}
```

**Actions** (functions):

#### `addToCart(item)`
**Purpose**: Add item to cart or increment quantity

**Behavior**:
- If item exists, increment quantity
- If new, add to items array
- Update lastUpdatedAt

#### `removeFromCart(productId)`
**Purpose**: Remove item from cart

**Behavior**:
- Removes item with matching productId

#### `setQuantity(payload)`
**Purpose**: Set exact quantity for item

**Payload**: `{ productId, quantity }`

**Behavior**:
- Sets quantity (minimum 1, max ~100)
- Removes if quantity < 1

#### `clearCart()`
**Purpose**: Empty entire cart

#### `hydrateFromCookie(items)`
**Purpose**: Restore cart from storage

**Use Case**: Load cart from cookie on page load

---

## Data Files

### `lib/data/products.ts`
**Purpose**: Hardcoded sample products for the catalog

**Type**:
```typescript
interface Product {
  id: number | string
  name: string
  categoryId: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  images: string[]
  description: string
  specs?: object
  inStock: boolean
  soldOut?: boolean
  featured?: boolean
}

const productsList: Product[] = [/* ... */]
export default productsList
```

**Sample Products**: ~15 sample products across various categories

**When to edit**: Add more sample products, update product data

---

### `lib/data/categories.ts`
**Purpose**: Hardcoded product categories

**Type**:
```typescript
interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  color: string
}

const categories: Category[] = [/* ... */]
export default categories
```

**Sample Categories**: ~9 categories (Hot Wheels, Anime Figures, Tote Bags, etc.)

**When to edit**: Add more categories, update descriptions

---

### `lib/data/*/data.txt` – Category Data Files
**Purpose**: Product data for category folders (dynamically parsed)

**Location**: `lib/data/[CategoryFolder]/data.txt`

**Format**:
```
Product: Product Name
Product description: Product full description goes here
Mrp: 1,999
---
Product: Another Product
Product Description: Description continues here
Mrp: 2,999
---
```

**Parsing**:
- Regex patterns extract product fields
- Images must be in same folder (1.jpg, 2.jpg, etc.)
- API endpoint `/api/catalog` parses and serves these

**When to use**: For larger product lists or bulk imports

---

## Styling

### `app/globals.css`
**Purpose**: Global CSS and Tailwind configuration

**Includes**:
- Tailwind directives (`@tailwind base, components, utilities`)
- CSS variable definitions for theme colors
- Custom font imports
- Global component styles
- Dark mode color overrides

**Color Variables**:
- `--background`, `--foreground` – Main colors
- `--primary`, `--primary-foreground` – Primary brand color
- `--destructive`, `--destructive-foreground` – Error/danger color
- `--card`, `--card-foreground` – Card styling
- `--input`, `--muted`, `--accent`, etc. – Component colors

**When to edit**: Add global styles, change color scheme, define custom utilities

---

### `tailwind.config.ts`
**Purpose**: Tailwind CSS configuration

**Settings**:
- Theme colors and spacing
- Extended utilities
- Animation definitions
- Dark mode support

**When to edit**: Add custom colors, spacing, animations

---

### `postcss.config.mjs`
**Purpose**: PostCSS processing

**Plugins**:
- `tailwindcss` – Tailwind CSS
- `autoprefixer` – Vendor prefixes

**When to edit**: Add CSS processing stages

---

## Summary

This codebase is well-organized and modular:

- **Pages** in `app/` handle routing and layout
- **Components** in `components/` are reusable and composable
- **Hooks** in `hooks/` provide custom logic
- **API routes** in `app/api/` serve data
- **Redux store** in `lib/store/` manages cart state
- **Data files** in `lib/data/` provide sample/dynamic data
- **Configuration files** set up build and styling

**For a new developer**:
1. Start with [README.md](README.md) for overview
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
3. Use this file to find specific functions and files
4. Explore the actual code files for implementation details

---

**Happy coding!** 🚀
