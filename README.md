# crazzzy — E-Commerce Storefront + Admin Dashboard

A **modern, production-ready e-commerce frontend** built with **Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui**. Features a complete customer-facing storefront and a fully functional admin dashboard.

**Status**: Frontend-only with mock data. Ready to integrate a real backend.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open in browser:
- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📋 Documentation Structure

This documentation is organized to help developers at all levels quickly find what they need:

| Document | Purpose | Best For |
|----------|---------|----------|
| **README.md** | You are here! Overview and quick start | Getting oriented fast |
| **CODEBASE.md** | Complete file-by-file breakdown | Understanding every file & function |
| **ARCHITECTURE.md** | System design & data flow | Understanding how components work together |

---

## 🏗️ Application Overview

### What's Built

#### Customer Storefront
- **Homepage** (`/`) – Hero section, featured products, category carousel
- **Shop Page** (`/shop`) – All products with filtering & sorting
- **Category Pages** (`/shop/[slug]`) – Browse products by category
- **Product Detail** (`/product/[id]`) – Full product info, gallery, reviews, add-to-cart
- **Shopping Cart** (`/cart`) – Manage cart items, view totals
- **Account** (`/account`) – User account shell (ready for auth integration)

#### Admin Dashboard (Protected)
- **Login** (`/admin-login`) – Credentials-based admin authentication
- **Dashboard** (`/admin`) – KPIs, featured products, recent orders, analytics
- **Products** (`/admin/products`) – Product management (stub)
- **Orders** (`/admin/orders`) – Order management (stub)
- **Customers** (`/admin/customers`) – Customer management (stub)
- **Analytics** (`/admin/analytics`) – Analytics overview (stub)
- **Settings** (`/admin/settings`) – Admin settings (stub)

### Architecture Highlights

- **State Management**: Redux Toolkit for cart
- **Styling**: Tailwind CSS 4 with dark mode support
- **UI Components**: 60+ shadcn/ui components (Radix UI primitives)
- **Data Source**: Hybrid — hardcoded products + dynamic category folders
- **Authentication**: Cookie-based (httpOnly for security)
- **Image Serving**: Dynamic media API for category images
- **Forms**: react-hook-form + Zod validation framework
- **Animations**: Framer Motion for smooth interactions

---

## 🔐 Admin Demo Login

**Default Credentials**:
- Email: `admin@crazzzy.com`
- Password: `admin@123`

**Access**: [http://localhost:3000/admin-login](http://localhost:3000/admin-login)

---

## 📖 For Different Roles

### 👨‍💻 Developers
1. Read **[CODEBASE.md](CODEBASE.md)** for complete file-by-file breakdown
2. Check **[ARCHITECTURE.md](ARCHITECTURE.md)** for system design & data flow
3. Run `npm run dev` and explore the UI
4. Look at `components/ui/` for available UI components

### 🎯 Product Managers / Designers
1. Visit [http://localhost:3000](http://localhost:3000) to see the full UI
2. Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)
3. See **[ARCHITECTURE.md](ARCHITECTURE.md)** for detailed feature breakdown

### 🔌 Backend Engineers
1. Review `/app/api/` folder for endpoint patterns
2. Check data types in `lib/data/categories.ts` & `lib/data/products.ts`
3. See **[ARCHITECTURE.md](ARCHITECTURE.md)** "Integration Points" section
4. API response schemas documented in **[CODEBASE.md](CODEBASE.md)**

### 🧪 QA / Testers
1. Visit all routes listed in **[ARCHITECTURE.md](ARCHITECTURE.md)** routing section
2. Test with demo login: `admin@crazzzy.com` / `admin@123`
3. Check mobile responsiveness (use DevTools, test at 375px and 768px breakpoints)
4. Test dark/light theme toggle in navbar

---

## 🚀 Deployment

```bash
npm run build
npm start
```

**Hosting Options**:
- **Vercel** (recommended): `vercel deploy`
- **Docker**: Build with Docker, run with Node.js
- **Traditional hosting**: Standard Next.js build output in `.next/`

**Environment Variables**:
Currently none required. When integrating backend, add:
```
NEXT_PUBLIC_API_URL=https://your-api.com
NEXT_PUBLIC_ANALYTICS_ID=your-vercel-analytics-id
```

---

## 📚 Documentation Links

### Quick Reference
- **[CODEBASE.md](CODEBASE.md)** – Detailed breakdown of every file with function signatures
- **[ARCHITECTURE.md](ARCHITECTURE.md)** – System design, data flow, and component relationships
- **[Next.js 16 Docs](https://nextjs.org/docs)**
- **[React 19 Docs](https://react.dev)**
- **[Tailwind CSS Docs](https://tailwindcss.com/docs)**
- **[shadcn/ui Components](https://ui.shadcn.com)**
- **[Redux Toolkit Docs](https://redux-toolkit.js.org)**

---

## 🎯 Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Product Catalog | ✅ | Dynamic from folders & hardcoded data |
| Category Filtering | ✅ | Dropdown + URL slug routing |
| Price Filtering | ✅ | Slider (₹0–₹15,000) |
| Product Search | 🔲 | UI ready, backend needed |
| Product Gallery | ✅ | Multiple images, hover effects |
| Shopping Cart | ✅ | Redux-based, responsive |
| Dark/Light Theme | ✅ | Cookie-based, toggle in navbar |
| Responsive Design | ✅ | Mobile, tablet, desktop optimized |
| Animations | ✅ | Framer Motion, smooth interactions |
| Admin Dashboard | ✅ | KPIs, charts, mock data |
| Admin Auth | ✅ | Credentials-based with cookies |
| Admin Pages | 🔲 | Structure ready, logic needed |

---

## 📝 Key Technologies

- **Framework**: Next.js 16.2.0
- **Language**: TypeScript
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4.2.0 + CSS Variables
- **Components**: shadcn/ui (60+ Radix UI primitives)
- **State**: Redux Toolkit 2.11.2
- **Forms**: react-hook-form + Zod
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Carousels**: Embla Carousel
- **Toasts**: Sonner + Custom hooks
- **Icons**: Lucide React

---

## 💡 Developer Tips

1. **Finding a specific file?** → See [CODEBASE.md](CODEBASE.md) file index
2. **Understanding component relationships?** → Read [ARCHITECTURE.md](ARCHITECTURE.md) data flow section
3. **Want to add a new feature?** → Start from the page component in `app/`, use existing components
4. **Need state management?** → Use Redux hooks from `lib/store/hooks.ts`
5. **Need a UI component?** → Check `components/ui/` (60+ options available)
6. **Debugging?** → Use React DevTools + Redux DevTools browser extensions

---

## 🔄 Backend Integration Points

Ready to connect your backend? Here's what to replace:

1. **Product Data** (`/api/catalog`) → Connect to your product database
2. **Admin Auth** (`app/actions/auth.ts`) → Replace demo credentials with real auth
3. **Product Images** (`/api/media`) → Use your CDN or image API
4. **Orders** (`/admin/orders`) → Implement order API
5. **User Accounts** (`/account`) → Add user registration & authentication

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for detailed integration guide.

---

**Happy coding! 🚀**

For detailed file-by-file breakdown, see **[CODEBASE.md](CODEBASE.md)**.
For system architecture and data flow, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.
