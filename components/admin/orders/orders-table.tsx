/**
 * OrdersTable Component
 * 
 * Displays all orders in a comprehensive table
 * Columns:
 * - Order ID
 * - Customer name
 * - Order date
 * - Total amount
 * - Payment status
 * - Fulfillment status
 * - Actions (view, edit, cancel)
 * 
 * Features:
 * - Status badges with color coding
 * - Sortable columns
 * - Quick actions menu
 * - Expandable order details
 */

import { Card } from '@/components/ui/card'
import { StatusBadge } from '../status-badge'
import { OrderActions } from './order-actions'

interface Order {
  id: string
  orderId: string
  customer: string
  email: string
  date: string
  amount: string
  paymentStatus: 'paid' | 'pending' | 'failed'
  fulfillmentStatus: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  items: number
}

export function OrdersTable() {
  // Sample orders data - replace with real API data
  const orders: Order[] = [
    {
      id: '1',
      orderId: '#ORD-12345',
      customer: 'John Doe',
      email: 'john@example.com',
      date: 'Nov 23, 2024',
      amount: '$249.99',
      paymentStatus: 'paid',
      fulfillmentStatus: 'shipped',
      items: 3,
    },
    {
      id: '2',
      orderId: '#ORD-12344',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      date: 'Nov 23, 2024',
      amount: '$199.99',
      paymentStatus: 'paid',
      fulfillmentStatus: 'pending',
      items: 1,
    },
    {
      id: '3',
      orderId: '#ORD-12343',
      customer: 'Bob Johnson',
      email: 'bob@example.com',
      date: 'Nov 22, 2024',
      amount: '$349.99',
      paymentStatus: 'pending',
      fulfillmentStatus: 'pending',
      items: 5,
    },
    {
      id: '4',
      orderId: '#ORD-12342',
      customer: 'Alice Brown',
      email: 'alice@example.com',
      date: 'Nov 22, 2024',
      amount: '$99.99',
      paymentStatus: 'paid',
      fulfillmentStatus: 'delivered',
      items: 2,
    },
    {
      id: '5',
      orderId: '#ORD-12341',
      customer: 'Charlie Wilson',
      email: 'charlie@example.com',
      date: 'Nov 21, 2024',
      amount: '$499.99',
      paymentStatus: 'paid',
      fulfillmentStatus: 'shipped',
      items: 7,
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
                Order ID
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Customer
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Date
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Amount
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Payment
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Status
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Items
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                {/* Order ID */}
                <td className="py-4 px-4">
                  <a
                    href={`#order-details`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {order.orderId}
                  </a>
                </td>

                {/* Customer info */}
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      {order.customer}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {order.email}
                    </p>
                  </div>
                </td>

                {/* Order date */}
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {order.date}
                </td>

                {/* Order amount */}
                <td className="py-4 px-4 text-sm font-semibold text-foreground">
                  {order.amount}
                </td>

                {/* Payment status badge */}
                <td className="py-4 px-4">
                  <PaymentStatusBadge status={order.paymentStatus} />
                </td>

                {/* Fulfillment status badge */}
                <td className="py-4 px-4">
                  <StatusBadge status={order.fulfillmentStatus as any} />
                </td>

                {/* Number of items */}
                <td className="py-4 px-4 text-sm text-foreground text-center">
                  {order.items} item{order.items !== 1 ? 's' : ''}
                </td>

                {/* Action dropdown */}
                <td className="py-4 px-4">
                  <OrderActions orderId={order.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 5 of 2,543 orders
        </p>
        <div className="flex space-x-2">
          <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-foreground">
            Previous
          </button>
          <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-foreground">
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}

/**
 * PaymentStatusBadge Component
 * 
 * Shows payment status with appropriate color coding
 */
function PaymentStatusBadge({
  status,
}: {
  status: 'paid' | 'pending' | 'failed'
}) {
  const statusConfig = {
    paid: 'bg-green-100/50 text-green-700',
    pending: 'bg-yellow-100/50 text-yellow-700',
    failed: 'bg-red-100/50 text-red-700',
  }

  const labels = {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
  }

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[status]}`}
    >
      {labels[status]}
    </span>
  )
}
