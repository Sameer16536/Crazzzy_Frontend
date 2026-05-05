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
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'

interface ProductActionsProps {
  productId: string
}

export function ProductActions({ productId }: ProductActionsProps) {
  // Dropdown menu state
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/admin/products/${productId}`)
      toast.success('Artifact decommissioned')
      setShowDeleteConfirm(false)
      // Since this is a simple action menu, we might need a way to refresh parent
      // but the table usually handles its own state. 
      // This component seems redundant if products-table.tsx exists, but let's keep it safe.
      window.location.reload() 
    } catch (error: any) {
      toast.error(error.message || 'Decommission failed')
    } finally {
      setIsDeleting(false)
    }
  }
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
                setIsOpen(false)
                setShowDeleteConfirm(true)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-destructive/10 transition-colors text-destructive"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Decommission Artifact"
        description="Are you sure you want to delete this product? This action will permanently remove the artifact from the registry and stop all supply chain operations."
        confirmText="Yes, Decommission"
        cancelText="Abort"
        isDestructive={true}
      />
    </div>
  )
}
