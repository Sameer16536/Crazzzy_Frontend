/**
 * Orders Management Page
 * 
 * Complete order management interface
 * Features:
 * - Order listing with sorting and filtering
 * - Order status tracking
 * - Customer information
 * - Payment status
 * - Order details quick view
 * 
 * Location: /admin/orders
 */

import { AdminLayout } from '@/components/admin/layout'
import { OrdersTable } from '@/components/admin/orders/orders-table'
import { OrdersHeader } from '@/components/admin/orders/orders-header'

export const metadata = {
  title: 'Orders | crazzzy Admin',
  description: 'Manage customer orders and fulfillment',
}

export default function OrdersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header with title and filters */}
        <OrdersHeader />

        {/* Orders table with management tools */}
        <OrdersTable />
      </div>
    </AdminLayout>
  )
}
