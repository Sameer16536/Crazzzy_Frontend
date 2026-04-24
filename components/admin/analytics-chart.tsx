/**
 * AnalyticsChart Component
 * 
 * Revenue trend visualization
 * Uses Recharts for responsive, interactive charts
 * 
 * Data: Sample revenue data for last 7 days
 * In production: Connect to real analytics API
 * 
 * Features:
 * - Responsive design
 * - Interactive tooltips
 * - Smooth animations
 * - Dark/light mode support
 */

'use client'

import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function AnalyticsChart() {
  // Sample revenue data - replace with real API data
  const data = [
    { day: 'Mon', revenue: 2400, orders: 12 },
    { day: 'Tue', revenue: 1398, orders: 10 },
    { day: 'Wed', revenue: 9800, orders: 28 },
    { day: 'Thu', revenue: 3908, orders: 18 },
    { day: 'Fri', revenue: 4800, orders: 22 },
    { day: 'Sat', revenue: 3800, orders: 19 },
    { day: 'Sun', revenue: 4300, orders: 21 },
  ]

  return (
    <Card className="p-6">
      {/* Chart header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Revenue Trend
        </h2>
        <p className="text-sm text-muted-foreground">
          Last 7 days revenue analysis
        </p>
      </div>

      {/* Chart container with responsive sizing */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            {/* Grid background */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />

            {/* Axis configuration */}
            <XAxis
              dataKey="day"
              stroke="currentColor"
              className="text-muted-foreground text-sm"
            />
            <YAxis
              stroke="currentColor"
              className="text-muted-foreground text-sm"
            />

            {/* Interactive tooltip on hover */}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelStyle={{ color: '#f8fafc' }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />

            {/* Revenue line - primary accent color */}
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary)"
              strokeWidth={3}
              dot={false}
              animationDuration={800}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
