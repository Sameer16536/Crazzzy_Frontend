/**
 * StatusBadge Component
 * 
 * Displays order/product status with color coding
 * Status types:
 * - pending: Yellow - awaiting processing
 * - completed: Green - order fulfilled
 * - shipped: Blue - in transit
 * - cancelled: Red - order cancelled
 */

import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'shipped' | 'cancelled' | 'paid' | 'delivered' | 'processing'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Status configuration with colors and labels
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 hover:bg-green-200',
    },
    shipped: {
      label: 'Shipped',
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 hover:bg-red-200',
    },
    paid: {
      label: 'Paid',
      className: 'bg-green-100 text-green-800 hover:bg-green-200',
    },
    delivered: {
      label: 'Delivered',
      className: 'bg-green-100 text-green-800 hover:bg-green-200',
    },
    processing: {
      label: 'Processing',
      className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    },
  }

  // Fallback to pending if status is invalid
  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
