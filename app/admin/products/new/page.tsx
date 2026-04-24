/**
 * Add New Product Page
 * 
 * Form for creating new products
 * Includes:
 * - Product details (name, description, SKU)
 * - Pricing information
 * - Stock management
 * - Category selection
 * - Image upload (placeholder)
 * 
 * Location: /admin/products/new
 */

import { AdminLayout } from '@/components/admin/layout'
import { ProductForm } from '@/components/admin/products/product-form'

export const metadata = {
  title: 'Add New Product | crazzzy Admin',
  description: 'Create a new product listing',
}

export default function NewProductPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the product details below to create a new listing
          </p>
        </div>

        {/* Product form component */}
        <ProductForm />
      </div>
    </AdminLayout>
  )
}
