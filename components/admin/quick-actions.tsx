/**
 * QuickActions Component
 * 
 * Displays action cards for common admin tasks
 * Each card links to a specific admin section or action
 * 
 * Actions:
 * - Add New Product
 * - View All Orders
 * - Manage Customers
 * - View Analytics
 */

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

interface ActionCard {
  title: string
  description: string
  icon: string
  href: string
  color: string
}

export function QuickActions() {
  // Quick action cards - customizable per use case
  const actions: ActionCard[] = [
    {
      title: 'Add New Product',
      description: 'Upload and list a new product',
      icon: '➕',
      href: '/admin/products/new',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'View All Orders',
      description: 'Check pending and recent orders',
      icon: '📦',
      href: '/admin/orders',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Manage Customers',
      description: 'Review customer profiles and activity',
      icon: '👥',
      href: '/admin/customers',
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'View Analytics',
      description: 'Check sales and traffic metrics',
      icon: '📊',
      href: '/admin/analytics',
      color: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Quick Actions
      </h2>

      {/* Actions grid - responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <QuickActionCard key={action.title} action={action} />
        ))}
      </div>
    </div>
  )
}

/**
 * Individual action card component
 * 
 * Features:
 * - Icon and title
 * - Description text
 * - Hover gradient effect
 * - Arrow indicator
 * - Link to admin section
 */
function QuickActionCard({ action }: { action: ActionCard }) {
  return (
    <Link href={action.href}>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
        {/* Card content wrapper with gradient background on hover */}
        <div className="relative overflow-hidden rounded-lg p-4 mb-4 bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity"
          style={{
            backgroundImage: `linear-gradient(to bottom right, var(--color-primary), var(--color-accent))`,
          }}
        >
          <div className="text-3xl">{action.icon}</div>
        </div>

        {/* Card title */}
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {action.title}
        </h3>

        {/* Card description */}
        <p className="text-sm text-muted-foreground mt-2">
          {action.description}
        </p>

        {/* Arrow indicator - appears on hover */}
        <div className="flex items-center mt-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1">
          <span className="text-sm font-medium">Go</span>
          <ArrowRight size={16} className="ml-2" />
        </div>
      </Card>
    </Link>
  )
}
