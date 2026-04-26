/**
 * Customers Management Page
 * 
 * Customer database and management interface
 * Features:
 * - Customer list with contact info
 * - Segment and filter options
 * - Purchase history
 * - Customer lifetime value
 * - Communication history
 * 
 * Location: /admin/customers
 */

import { AdminLayout } from '@/components/admin/layout'
import { CustomersTable } from '@/components/admin/customers/customers-table'

export const metadata = {
  title: 'Customer Registry | Cockpit',
  description: 'Manage the user registry and account privileges',
}

export default function CustomersPage() {
  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-primary" />
            <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Registry</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">CUSTOMER DATABASE</h1>
        </div>

        <CustomersTable />
      </div>
    </AdminLayout>
  )
}
