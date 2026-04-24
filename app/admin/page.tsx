/**
 * Admin Dashboard Main Page
 * 
 * Displays the primary admin dashboard with:
 * - Key metrics and statistics
 * - Recent orders overview
 * - Quick action cards
 * 
 * Location: /admin
 * Status: Core page - handles routing to admin sections
 */

import { AdminLayout } from '@/components/admin/layout'
import { DashboardOverview } from '@/components/admin/dashboard-overview'
import { RecentOrders } from '@/components/admin/recent-orders'
import { QuickActions } from '@/components/admin/quick-actions'
import { AnalyticsChart } from '@/components/admin/analytics-chart'
import { FeaturedProducts } from '@/components/admin/featured-products'

export const metadata = {
  title: 'Admin Dashboard | crazzzy',
  description: 'Manage your crazzzy store - products, orders, and analytics',
}

export default function AdminPage() {
  return (
    <AdminLayout>
      {/* Main dashboard content area with refined spacing */}
      <div className="space-y-10">
        {/* Top-level metrics and KPIs */}
        <DashboardOverview />
        
        {/* Featured products showcase - visual highlight section */}
        <FeaturedProducts />
        
        {/* Quick action buttons for common tasks */}
        <QuickActions />

        {/* Revenue trend analytics chart */}
        <AnalyticsChart />
        
        {/* Recent orders table with live updates */}
        <RecentOrders />
      </div>
    </AdminLayout>
  )
}
