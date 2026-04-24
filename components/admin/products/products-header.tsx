/**
 * ProductsHeader Component
 * 
 * Header section for products page
 * Contains:
 * - Page title and description
 * - Add New Product button
 * - Search and filter controls
 * 
 * Usage: Placed at top of products page
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'

export function ProductsHeader() {
  // Search state for filtering products
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-4">
      {/* Title section */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product inventory and catalog
            </p>
          </div>

          {/* Add product button */}
          <Link href="/admin/products/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus size={18} className="mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search products by name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filter dropdown - expandable for additional filters */}
        <select
          className="px-4 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          defaultValue=""
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="home">Home & Garden</option>
        </select>
      </div>
    </div>
  )
}
