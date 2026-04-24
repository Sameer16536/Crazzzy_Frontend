/**
 * OrdersHeader Component
 * 
 * Header section for orders management page
 * Contains:
 * - Page title and description
 * - Search and filter controls
 * - Date range picker (optional)
 * - Status filter
 */

'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'

export function OrdersHeader() {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  return (
    <div className="space-y-4">
      {/* Title section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage customer orders and fulfillment
        </p>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search by order ID or customer */}
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status filter dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="shipped">Shipped</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  )
}
