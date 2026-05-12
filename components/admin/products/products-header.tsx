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

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function ProductsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground mt-1">
          Manage your product inventory and catalog
        </p>
      </div>


    </div>
  )
}
