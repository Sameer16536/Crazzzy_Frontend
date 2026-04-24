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
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Customers | crazzzy Admin',
  description: 'Manage customer relationships and data',
}

export default function CustomersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database and relationships
          </p>
        </div>

        {/* Placeholder for customers table - expandable for future development */}
        <Card className="p-12 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Customers Module
          </h2>
          <p className="text-muted-foreground mb-6">
            Coming soon - Customer management tools including segmentation, communication, and analytics
          </p>
          <div className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
            Under Development
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
