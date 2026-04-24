/**
 * Products Management Page
 * 
 * Main page for product inventory management
 * Features:
 * - Product listing with filters
 * - Search functionality
 * - Sort options
 * - Add new product button
 * - Edit/Delete actions
 * 
 * Location: /admin/products
 */

import { AdminLayout } from '@/components/admin/layout'
import { ProductsTable } from '@/components/admin/products/products-table'
import { ProductsHeader } from '@/components/admin/products/products-header'

export const metadata = {
  title: 'Products | crazzzy Admin',
  description: 'Manage your product inventory',
}

export default function ProductsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with title and action buttons */}
        <ProductsHeader />

        {/* Products table/grid with management tools */}
        <ProductsTable />
      </div>
    </AdminLayout>
  )
}
