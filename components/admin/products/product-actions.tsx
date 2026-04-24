/**
 * ProductActions Component
 * 
 * Action dropdown menu for products
 * Actions:
 * - Edit product
 * - View details
 * - Delete product
 * 
 * Uses dropdown menu for compact UI
 */

'use client'

import { useState } from 'react'
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react'

interface ProductActionsProps {
  productId: string
}

export function ProductActions({ productId }: ProductActionsProps) {
  // Dropdown menu state
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Menu toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Product actions menu"
      >
        <MoreVertical size={18} />
      </button>

      {/* Dropdown menu - appears on button click */}
      {isOpen && (
        <>
          {/* Overlay to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu items */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            {/* Edit action */}
            <button
              onClick={() => {
                // Navigate to edit page or open edit modal
                console.log('Edit product', productId)
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
            >
              <Edit size={16} className="text-blue-500" />
              <span>Edit</span>
            </button>

            {/* View details action */}
            <button
              onClick={() => {
                // Navigate to product details or open details modal
                console.log('View details', productId)
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
            >
              <Eye size={16} className="text-green-500" />
              <span>View Details</span>
            </button>

            {/* Delete action - destructive */}
            <button
              onClick={() => {
                // Show confirmation and delete
                if (
                  window.confirm(
                    'Are you sure you want to delete this product?'
                  )
                ) {
                  console.log('Delete product', productId)
                }
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-destructive/10 transition-colors text-destructive"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
