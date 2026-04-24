/**
 * OrderActions Component
 * 
 * Dropdown menu for order management actions
 * Actions:
 * - View order details
 * - Print order/invoice
 * - Update status
 * - Cancel order
 * - Refund (if paid)
 */

'use client'

import { useState } from 'react'
import { MoreVertical, Eye, Printer, Edit, X, RotateCcw } from 'lucide-react'

interface OrderActionsProps {
  orderId: string
}

export function OrderActions({ orderId }: OrderActionsProps) {
  // Dropdown menu state
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Menu toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Order actions menu"
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
            {/* View Details action */}
            <button
              onClick={() => {
                console.log('View order details', orderId)
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
            >
              <Eye size={16} className="text-blue-500" />
              <span>View Details</span>
            </button>

            {/* Print Invoice action */}
            <button
              onClick={() => {
                console.log('Print invoice', orderId)
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
            >
              <Printer size={16} className="text-green-500" />
              <span>Print Invoice</span>
            </button>

            {/* Update Status action */}
            <button
              onClick={() => {
                console.log('Update status', orderId)
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
            >
              <Edit size={16} className="text-purple-500" />
              <span>Update Status</span>
            </button>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Refund action - potentially destructive */}
            <button
              onClick={() => {
                if (window.confirm('Process refund for this order?')) {
                  console.log('Process refund', orderId)
                }
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-yellow-50 transition-colors text-yellow-700"
            >
              <RotateCcw size={16} />
              <span>Process Refund</span>
            </button>

            {/* Cancel order action - destructive */}
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to cancel this order?'
                  )
                ) {
                  console.log('Cancel order', orderId)
                }
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-destructive/10 transition-colors text-destructive"
            >
              <X size={16} />
              <span>Cancel Order</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
