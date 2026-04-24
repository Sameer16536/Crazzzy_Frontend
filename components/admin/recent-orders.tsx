/**
 * RecentOrders Component
 * 
 * Displays a table of recent orders with:
 * - Order ID
 * - Customer name
 * - Order date
 * - Amount
 * - Status badge
 * 
 * Features:
 * - Responsive table layout
 * - Status color indicators
 * - Click to view details
 */

import { Card } from '@/components/ui/card'
import { StatusBadge } from './status-badge'

interface Order {
  id: string
  customer: string
  date: string
  amount: string
  status: 'pending' | 'completed' | 'shipped' | 'cancelled'
}

export function RecentOrders() {
  // Sample orders data - replace with real data from API
  const orders: Order[] = [
    {
      id: '#12345',
      customer: 'John Doe',
      date: 'Nov 23, 2024',
      amount: '$249.99',
      status: 'completed',
    },
    {
      id: '#12344',
      customer: 'Jane Smith',
      date: 'Nov 23, 2024',
      amount: '$199.99',
      status: 'shipped',
    },
    {
      id: '#12343',
      customer: 'Bob Johnson',
      date: 'Nov 22, 2024',
      amount: '$349.99',
      status: 'pending',
    },
    {
      id: '#12342',
      customer: 'Alice Brown',
      date: 'Nov 22, 2024',
      amount: '$99.99',
      status: 'completed',
    },
    {
      id: '#12341',
      customer: 'Charlie Wilson',
      date: 'Nov 21, 2024',
      amount: '$499.99',
      status: 'shipped',
    },
  ]

  return (
    <Card className="p-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Recent Orders
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Latest orders from your customers
          </p>
        </div>
        {/* View all link - navigate to orders page */}
        <a
          href="/admin/orders"
          className="text-sm text-primary hover:underline font-medium"
        >
          View all
        </a>
      </div>

      {/* Responsive table container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                Order ID
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                Customer
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                Date
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <td className="py-3 px-4 text-sm font-medium text-foreground">
                  {order.id}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  {order.customer}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {order.date}
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-foreground">
                  {order.amount}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination or load more - expandable for future */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 5 of 1,234 orders
        </p>
        <a
          href="/admin/orders"
          className="text-sm text-primary hover:underline font-medium"
        >
          Load more orders →
        </a>
      </div>
    </Card>
  )
}
