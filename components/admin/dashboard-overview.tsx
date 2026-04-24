/**
 * DashboardOverview Component
 * 
 * Displays key metrics and KPIs
 * Cards show:
 * - Total Revenue
 * - Total Orders
 * - Total Customers
 * - Conversion Rate
 * 
 * Each card is interactive with trend indicators
 * Data should be connected to real backend in production
 */

import { Card } from '@/components/ui/card'
import { TrendIcon } from './trend-icon'

interface MetricCard {
  label: string
  value: string
  change: number
  icon: string
  trend: 'up' | 'down'
}

export function DashboardOverview() {
  // Sample metrics data - replace with real data in production
  const metrics: MetricCard[] = [
    {
      label: 'Total Revenue',
      value: '$45,231.89',
      change: 20.1,
      icon: '💰',
      trend: 'up',
    },
    {
      label: 'Total Orders',
      value: '2,543',
      change: 15.3,
      icon: '📦',
      trend: 'up',
    },
    {
      label: 'Total Customers',
      value: '1,234',
      change: -4.3,
      icon: '👥',
      trend: 'down',
    },
    {
      label: 'Conversion Rate',
      value: '3.24%',
      change: 10.5,
      icon: '📈',
      trend: 'up',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Section title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Metrics grid - responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </div>
  )
}

/**
 * Individual metric card component
 * 
 * Props:
 * - metric: MetricCard object with label, value, change, icon, trend
 * 
 * Features:
 * - Icon display
 * - Trend indicator (up/down arrow with color)
 * - Hover effect for interactivity
 */
function MetricCard({ metric }: { metric: MetricCard }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
      {/* Card header with icon */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">
            {metric.label}
          </p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {metric.value}
          </p>
        </div>

        {/* Icon badge - can be customized per metric */}
        <div className="text-3xl opacity-60 group-hover:opacity-100 transition-opacity">
          {metric.icon}
        </div>
      </div>

      {/* Trend indicator with percentage change */}
      <div className="flex items-center space-x-2 mt-4">
        <TrendIcon trend={metric.trend} />
        <span
          className={`text-sm font-semibold ${
            metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {metric.trend === 'up' ? '+' : '-'}
          {Math.abs(metric.change)}%
        </span>
        <span className="text-sm text-muted-foreground">vs last month</span>
      </div>
    </Card>
  )
}
