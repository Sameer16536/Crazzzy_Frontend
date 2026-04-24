# Architecture & System Design

This document explains the overall architecture, how data flows through the application, component relationships, and integration points for connecting a backend.

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend App                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Pages (app/)  →  Components  →  Hooks  →  Redux Store   │
│                                                             │
│  ├─ Home (/)            ├─ ProductCard     ├─ useCart()    │
│  ├─ Shop (/shop)        ├─ Navbar          ├─ useCatalog() │
│  ├─ Product (/product)  ├─ Carousel        ├─ useToast()   │
│  ├─ Cart (/cart)        ├─ Admin Layout    └─ useIsMobile()│
│  ├─ Admin (/admin)      └─ 60+ UI Comps                   │
│  └─ Auth (/admin-login)                                     │
│                                                             │
│  API Routes (app/api/)                                      │
│  ├─ /api/catalog (GET)  - Returns products & categories    │
│  ├─ /api/theme (POST)   - Sets theme cookie               │
│  └─ /api/media/* (GET)  - Serves images from lib/data/    │
│                                                             │
│  State Management (Redux Toolkit)                            │
│  └─ cart reducer        - Manages shopping cart state      │
│                                                             │
│  Data Sources                                               │
│  ├─ lib/data/products.ts    - Hardcoded sample products    │
│  ├─ lib/data/categories.ts  - Hardcoded categories         │
│  └─ lib/data/[Category]/    - Dynamic folder products      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
              (Ready to integrate real backend)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Your Backend API                         │
│  (Database, Authentication, Orders, etc.)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### User Browsing Products

```
User clicks "Shop" link
        ↓
Router navigates to /shop
        ↓
ShopPage component mounts
        ↓
useCatalog() hook fetches /api/catalog
        ↓
parseProductsFromTxt() parses lib/data/*/data.txt
        ↓
API returns { categories, products }
        ↓
Components render product grid with filters
        ↓
User filters by category/price (client-side)
        ↓
ProductCard components display filtered items
```

### Adding to Cart

```
User clicks "Add to Cart" button
        ↓
dispatch(addToCart({ productId, name, price, quantity }))
        ↓
Redux cart-slice reducer adds/increments item
        ↓
Cart state updated: items[].push(newItem) or quantity++
        ↓
Navbar component re-renders, shows cart count
        ↓
useAppSelector gets new cart items array
        ↓
Cart page shows updated items
```

### Admin Login

```
User enters credentials at /admin-login
        ↓
Form submits to adminLogin() server action
        ↓
Server validates: email === "admin@crazzzy.com" && password === "admin@123"
        ↓
If valid, creates session: { email, loggedInAt }
        ↓
Sets admin-session cookie (httpOnly, signed)
        ↓
Redirects to /admin
        ↓
proxy.ts middleware checks cookie
        ↓
Cookie valid → allows access to /admin/*
Cookie invalid → redirects to /admin-login
```

### Theme Toggle

```
User clicks theme toggle button in navbar
        ↓
toggleTheme() function called
        ↓
Sends POST /api/theme { theme: "dark" | "light" }
        ↓
API sets theme cookie (httpOnly: false, 1 year)
        ↓
Client applies "dark" class to <html> element
        ↓
CSS variables update (dark mode colors)
        ↓
Page re-renders with new theme
```

---

## 🏗️ Component Hierarchy

### Page Structure

```
RootLayout (app/layout.tsx)
├─ Providers (Redux store)
│   ├─ Navbar (fixed navigation)
│   │   ├─ Logo/Header
│   │   ├─ Nav Menu
│   │   ├─ Search (ready for impl.)
│   │   ├─ Cart Icon (with count badge)
│   │   ├─ ThemeToggle
│   │   └─ Mobile Menu (Hamburger)
│   │
│   ├─ [Page Content]
│   │   Page (/)
│   │   ├─ HeroSection
│   │   ├─ CategoryCarousel
│   │   │   └─ CategoryCard[] (with images)
│   │   ├─ FeaturedProducts Section
│   │   │   └─ ProductCard[]
│   │   ├─ NewsletterSection
│   │   └─ Footer
│   │
│   │   Page (/shop)
│   │   ├─ Filters Sidebar
│   │   │   ├─ CategorySelect
│   │   │   ├─ PriceRangeSlider
│   │   │   └─ SortDropdown
│   │   ├─ ProductGrid
│   │   │   └─ ProductCard[]
│   │   └─ ClearFilters Button
│   │
│   │   Page (/shop/[slug])
│   │   ├─ CategoryHeader
│   │   ├─ Same as /shop (filtered)
│   │   └─ BackLink
│   │
│   │   Page (/product/[id])
│   │   ├─ ProductImage Gallery
│   │   ├─ ProductInfo Panel
│   │   │   ├─ Name, Rating
│   │   │   ├─ Price Display
│   │   │   ├─ SizeSelector
│   │   │   ├─ QuantitySelector
│   │   │   ├─ AddToCart Button
│   │   │   └─ AddToWishlist Button
│   │   ├─ ProductDescription
│   │   ├─ Specifications
│   │   ├─ Reviews Section
│   │   └─ RelatedProducts Carousel
│   │
│   │   Page (/cart)
│   │   ├─ CartItemsList
│   │   │   └─ CartItem[]
│   │   │       ├─ ProductImage
│   │   │       ├─ Name, Price
│   │   │       ├─ QuantityControl
│   │   │       └─ RemoveButton
│   │   ├─ OrderSummary
│   │   │   ├─ Subtotal
│   │   │   ├─ Tax
│   │   │   ├─ Shipping
│   │   │   └─ Total
│   │   ├─ CheckoutButton
│   │   └─ ContinueShopping Link
│   │
│   │   Page (/admin-login)
│   │   ├─ LoginForm
│   │   │   ├─ EmailInput
│   │   │   ├─ PasswordInput
│   │   │   ├─ RememberMe Checkbox
│   │   │   └─ LoginButton
│   │   ├─ ErrorMessage (if invalid)
│   │   └─ DemoCredentials Display
│   │
│   │   Page (/admin) - Protected by proxy.ts
│   │   ├─ AdminLayout
│   │   │   ├─ AdminSidebar
│   │   │   │   ├─ Dashboard Link
│   │   │   │   ├─ Products Link
│   │   │   │   ├─ Orders Link
│   │   │   │   ├─ Customers Link
│   │   │   │   ├─ Analytics Link
│   │   │   │   └─ Settings Link
│   │   │   │
│   │   │   └─ AdminContent
│   │   │       ├─ AdminHeader (top bar)
│   │   │       ├─ DashboardOverview (KPI cards)
│   │   │       │   ├─ RevenueCard
│   │   │       │   ├─ OrdersCard
│   │   │       │   ├─ CustomersCard
│   │   │       │   └─ ConversionCard (with TrendIcon)
│   │   │       ├─ QuickActions (buttons)
│   │   │       ├─ FeaturedProducts (grid)
│   │   │       ├─ AnalyticsChart (line chart)
│   │   │       └─ RecentOrdersTable
│   │   │           └─ Table with StatusBadge[]
│   │   │
│   │   Page (/admin/products) - Protected
│   │   Page (/admin/orders) - Protected
│   │   Page (/admin/customers) - Protected
│   │   Page (/admin/analytics) - Protected
│   │   Page (/admin/settings) - Protected
│   │
│   └─ Footer

60+ shadcn/ui Components available
├─ Button, Input, Select, Checkbox, Radio
├─ Dialog, Drawer, Sheet, Popover, Tooltip
├─ Card, Badge, Avatar, Skeleton
├─ Table, Pagination, Breadcrumb, Tabs
├─ Accordion, Collapsible, Carousel
├─ Calendar, Slider, Progress, ScrollArea
└─ And many more...
```

---

## 🔌 API Routes & Schemas

### GET /api/catalog

**Purpose**: Fetch all products and categories

**Response**:
```typescript
{
  categories: [
    {
      id: string           // e.g., "hotwheels"
      name: string         // e.g., "Hot Wheels"
      slug: string         // e.g., "hotwheels"
      description: string  // Category description
      image: string        // Image URL or path
      color: string        // OKLCH hue for badge
    }
  ],
  products: [
    {
      id: string           // Product ID
      name: string         // Product name
      categoryId: string   // Category this belongs to
      price: number        // Current price
      originalPrice?: number // Original price (if discounted)
      rating: number       // Star rating (1-5)
      reviews: number      // Number of reviews
      images: string[]     // Array of image URLs/paths
      description: string  // Full description
      inStock: boolean     // Stock availability
      soldOut?: boolean    // If true, item is sold out
      featured?: boolean   // If true, show on homepage
    }
  ]
}
```

**Current Implementation**: Reads from `lib/data/products.ts` + `lib/data/*/data.txt`

**When to integrate backend**:
- Replace endpoint to fetch from your database
- Maintain same response schema
- Add pagination if needed (add `page`, `limit` query params)

---

### POST /api/theme

**Purpose**: Set user's theme preference

**Request Body**:
```typescript
{
  theme: "dark" | "light"
}
```

**Response**:
```typescript
{
  success: boolean
}
```

**Cookie Set**: `theme` cookie with theme value

**Current Implementation**: Simple cookie setter

**When to integrate backend**:
- Save theme preference to user account (optional)
- Currently frontend-only, no backend needed

---

### GET /api/media/[...slug]

**Purpose**: Serve images from `lib/data/` folders

**Route Pattern**: `/api/media/lib-data/<CategoryFolder>/<filename>`

**Examples**:
- `/api/media/lib-data/Hotwheels/1.jpg`
- `/api/media/lib-data/Anime%20Figurines/product.png`

**Features**:
- Prevents directory traversal attacks
- Auto-detects MIME type
- Cache-Control: public, max-age=3600

**When to integrate backend**:
- Replace with your CDN or image server
- Extract image URLs from product catalog response
- Use relative or absolute URLs in product data

---

## 🛠️ State Management (Redux)

### Store Structure

```typescript
// lib/store/store.ts
store = {
  cart: CartState
}

// lib/store/slices/cart-slice.ts
CartState = {
  items: CartItem[]
  lastUpdatedAt: number | null
}

CartItem = {
  productId: string
  name: string
  image?: string
  price: number
  quantity: number
}
```

### Cart Actions

```typescript
// Add or increment item
dispatch(addToCart({
  productId: "1",
  name: "Product Name",
  price: 1999,
  quantity: 1,
  image?: "url"
}))

// Remove item
dispatch(removeFromCart("productId"))

// Set exact quantity
dispatch(setQuantity({ productId: "1", quantity: 5 }))

// Clear entire cart
dispatch(clearCart())

// Restore from cookie
dispatch(hydrateFromCookie(items))
```

### Using Redux in Components

```typescript
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { addToCart, removeFromCart } from '@/lib/store/slices/cart-slice'

export function MyComponent() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(state => state.cart.items)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  
  return (
    <div>
      <button onClick={() => dispatch(addToCart({...}))}>
        Add to Cart
      </button>
      <p>Items: {itemCount}</p>
    </div>
  )
}
```

---

## 🔐 Authentication Flow

### Admin Login

```
1. User visits /admin
   ↓ (not authenticated)
2. proxy.ts checks admin-session cookie
   ↓ (missing or invalid)
3. Redirects to /admin-login
   ↓
4. User enters credentials
   ↓
5. Form submits to adminLogin(formData) server action
   ↓
6. Server validates against hardcoded credentials
   ↓ (valid)
7. Creates session object: { email, loggedInAt }
   ↓
8. Sets admin-session cookie (httpOnly: true)
   ↓
9. Redirects to /admin
   ↓
10. proxy.ts checks cookie (valid)
    ↓
11. Allows access to /admin/*
```

### Demo Credentials

```
Email: admin@crazzzy.com
Password: admin@123
```

**Stored in**: `app/actions/auth.ts` (hardcoded for demo)

**To replace with real auth**:
1. Remove hardcoded credentials
2. Call your authentication API
3. Validate JWT or session token
4. Set secure httpOnly cookie
5. Return user info or session data

---

## 📁 File Organization & Responsibilities

### Pages (app/)
- Handle routing and layout
- Fetch data (via hooks, not direct API calls)
- Pass data to components
- Handle page-level state (filters, sorting)

### Components (components/)
- Presentational (render UI)
- Accept props, don't fetch data
- Dispatch Redux actions (for cart)
- Use custom hooks for data/state

### Hooks (hooks/)
- **Fetching**: `useCatalog()` – Get products/categories
- **State**: `useAppDispatch()`, `useAppSelector()` – Redux
- **UI**: `useToast()` – Show notifications
- **Responsive**: `useIsMobile()` – Mobile detection

### Lib (lib/)
- **utils.ts** – Helper functions (`cn()` for classes)
- **store/** – Redux configuration and hooks
- **catalog/** – Product catalog fetching
- **data/** – Hardcoded and dynamic data

### API Routes (app/api/)
- **catalog** – Product & category data
- **theme** – Theme preference setter
- **media** – Image serving

### Server Actions (app/actions/)
- **auth.ts** – Admin login/logout

---

## 🔄 Integration Checklist

When ready to connect your backend, follow this checklist:

### Phase 1: Product Data
- [ ] Create backend API endpoint for product catalog
- [ ] Match response schema from `/api/catalog`
- [ ] Replace `app/api/catalog/route.ts` with backend fetch
- [ ] Test product listing, filtering, detail pages
- [ ] Handle loading/error states

### Phase 2: Images
- [ ] Set up image hosting (CDN, server, etc.)
- [ ] Update product image URLs in catalog response
- [ ] Replace `/api/media` route or use external URLs
- [ ] Test image loading in components

### Phase 3: Authentication
- [ ] Create user login endpoint
- [ ] Create admin auth endpoint
- [ ] Replace hardcoded credentials in `app/actions/auth.ts`
- [ ] Update `verifyAdminSession()` to call backend
- [ ] Update `proxy.ts` to validate real sessions

### Phase 4: Shopping Cart
- [ ] Save cart to backend (optional)
- [ ] Create checkout endpoint
- [ ] Create order from cart
- [ ] Add cart persistence via API

### Phase 5: Orders & Admin
- [ ] Create order API endpoint
- [ ] Connect `/admin/orders` page
- [ ] Create product management API
- [ ] Connect `/admin/products` page
- [ ] Create customer management API
- [ ] Connect `/admin/customers` page

### Phase 6: User Accounts
- [ ] Implement user registration
- [ ] Implement user login
- [ ] Connect `/account` page
- [ ] Add order history
- [ ] Add saved addresses

---

## 🎨 Styling Architecture

### CSS Structure
```
app/globals.css
├─ Tailwind directives (@tailwind)
├─ CSS variables (color scheme)
└─ Global component styles

tailwind.config.ts
├─ Color palette
├─ Spacing scale
├─ Animation definitions
└─ Dark mode (class strategy)

components/ui/
├─ Each component has embedded styles
├─ Uses CSS variables for theming
└─ Supports dark mode via CSS classes
```

### Theme System
- **Light Mode**: Applied by default
- **Dark Mode**: Applied when `<html class="dark">` is set
- **Toggle**: Button in navbar calls `toggleTheme()`
- **Persistence**: Stored in `theme` cookie
- **Colors**: CSS variables in `app/globals.css`

---

## 🚀 Performance Optimizations

### Current Optimizations
- ✅ **Code Splitting**: Next.js automatic route splitting
- ✅ **Image Optimization**: Tailwind CSS for efficient styling
- ✅ **Caching**: Catalog data cached in hooks
- ✅ **Memoization**: Components memoized where needed
- ✅ **Lazy Loading**: Dynamic imports for admin routes

### Future Opportunities
- Server-side rendering for product pages (SEO)
- Image CDN with optimization
- API response caching with Redis
- Database indexing for filtering
- Pagination for large product lists
- Async cart updates with optimistic UI

---

## 🔍 Debugging & Development

### Redux DevTools
Install [Redux DevTools browser extension](https://github.com/reduxjs/redux-devtools-extension) to:
- View state changes in real-time
- Travel through action history
- Dispatch actions manually
- Export/import state

### React DevTools
Use [React DevTools extension](https://react.dev/learn/react-developer-tools) to:
- Inspect component hierarchy
- View props and state
- Profile component rendering
- Track component updates

### Console Logging
```typescript
// View current cart state
useAppSelector(state => {
  console.log('Cart:', state.cart)
  return state.cart
})

// View all state in Redux DevTools
// Look at "State" tab to see full store
```

### Testing
Ready for:
- Unit tests (Jest + React Testing Library)
- Integration tests (Cypress/Playwright)
- E2E tests (Playwright/Cypress)
- Visual regression tests

---

## 📚 Architecture Diagrams

### Request Flow

```
Client Action
      ↓
Event Handler (onClick, onChange, etc.)
      ↓
┌─────────────────────────────────┐
│ Fetch Data? → Use Hook          │
│             (useCatalog)        │
│             ↓                   │
│             API Route           │
│             ↓                   │
│             Return Data         │
├─────────────────────────────────┤
│ Update State? → Dispatch Action │
│              (addToCart)        │
│              ↓                  │
│              Redux Reducer      │
│              ↓                  │
│              Update Store       │
├─────────────────────────────────┤
│ Show UI? → Component Renders    │
│          (useAppSelector)       │
│          ↓                      │
│          updated DOM            │
└─────────────────────────────────┘
      ↓
Browser Displays Update
```

### File Dependencies

```
app/layout.tsx (Root)
    ↓
    ├─→ components/providers.tsx (Redux)
    │       ↓
    │       components/navbar.tsx
    ├─→ [Pages]
    │   ├─→ components/product-card.tsx
    │   ├─→ components/category-carousel.tsx
    │   ├─→ lib/catalog/use-catalog.ts
    │   ├─→ lib/store/hooks.ts (Redux)
    │   └─→ components/ui/* (shadcn)
    │
    ├─→ app/api/catalog/route.ts
    │   └─→ lib/data/products.ts
    │   └─→ lib/data/categories.ts
    │   └─→ lib/data/*/data.txt
    │
    ├─→ app/actions/auth.ts
    │   └─→ Cookie management
    │
    └─→ proxy.ts
        └─→ Route protection for /admin/*
```

---

## Summary

This architecture provides:

- ✅ **Clear Separation of Concerns** – Pages, components, hooks, state, APIs
- ✅ **Type Safety** – Full TypeScript throughout
- ✅ **Scalability** – Easy to add features and connect backend
- ✅ **Maintainability** – Well-organized, documented code
- ✅ **Performance** – Optimized for user experience
- ✅ **Security** – httpOnly cookies, no localStorage auth
- ✅ **Flexibility** – Frontend-only, ready for any backend

For detailed file information, see **[CODEBASE.md](CODEBASE.md)**.
For quick start, see **[README.md](README.md)**.
