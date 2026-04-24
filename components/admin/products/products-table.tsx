/**
 * ProductsTable Component
 * 
 * Displays products in a responsive table format
 * Features:
 * - Product image thumbnail
 * - Name, SKU, category
 * - Price and stock status
 * - Edit and delete actions
 * - Status indicators
 * 
 * In production: Connect to real product database
 */

import { Card } from '@/components/ui/card'
import { ProductActions } from './product-actions'
import { StockBadge } from './stock-badge'

interface Product {
  id: string
  name: string
  sku: string
  price: string
  stock: number
  category: string
  status: 'active' | 'inactive' | 'draft'
  image: string
}

export function ProductsTable() {
  // Sample product data - replace with real API data
  const products: Product[] = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      sku: 'WH-1000XM4',
      price: '$349.99',
      stock: 45,
      category: 'Electronics',
      status: 'active',
      image: '🎧',
    },
    {
      id: '2',
      name: 'Classic T-Shirt',
      sku: 'TSH-001-BLK',
      price: '$29.99',
      stock: 128,
      category: 'Clothing',
      status: 'active',
      image: '👕',
    },
    {
      id: '3',
      name: 'Coffee Maker Pro',
      sku: 'CMK-2024-PRO',
      price: '$199.99',
      stock: 5,
      category: 'Home & Kitchen',
      status: 'active',
      image: '☕',
    },
    {
      id: '4',
      name: 'Programming Guide',
      sku: 'BK-PROG-001',
      price: '$49.99',
      stock: 0,
      category: 'Books',
      status: 'inactive',
      image: '📚',
    },
    {
      id: '5',
      name: 'Smart Watch Ultra',
      sku: 'SW-ULTRA-2024',
      price: '$299.99',
      stock: 23,
      category: 'Electronics',
      status: 'active',
      image: '⌚',
    },
  ]

  return (
    <Card className="p-6">
      {/* Responsive table container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Product
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                SKU
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Price
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Stock
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Category
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Status
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                {/* Product name and image */}
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                      {product.image}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {product.name}
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td className="py-4 px-4 text-sm text-muted-foreground font-mono">
                  {product.sku}
                </td>

                {/* Price */}
                <td className="py-4 px-4 text-sm font-semibold text-foreground">
                  {product.price}
                </td>

                {/* Stock level with color indicator */}
                <td className="py-4 px-4">
                  <StockBadge stock={product.stock} />
                </td>

                {/* Category */}
                <td className="py-4 px-4 text-sm text-foreground">
                  {product.category}
                </td>

                {/* Status indicator */}
                <td className="py-4 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'active'
                        ? 'bg-green-100/50 text-green-700'
                        : product.status === 'inactive'
                        ? 'bg-gray-100/50 text-gray-700'
                        : 'bg-yellow-100/50 text-yellow-700'
                    }`}
                  >
                    {product.status.charAt(0).toUpperCase() +
                      product.status.slice(1)}
                  </span>
                </td>

                {/* Action buttons: Edit, Delete */}
                <td className="py-4 px-4">
                  <ProductActions productId={product.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 5 of 127 products
        </p>
        <div className="flex space-x-2">
          <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
            Previous
          </button>
          <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}
