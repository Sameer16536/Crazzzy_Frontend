/**
 * AdminLayout Component
 * 
 * Main layout wrapper for all admin pages
 * Features:
 * - Responsive sidebar navigation
 * - Top navigation bar with theme toggle
 * - Mobile-friendly hamburger menu
 * - Consistent spacing and styling
 * 
 * Usage: Wrap admin pages with <AdminLayout>{children}</AdminLayout>
 */

'use client'

import { useState } from 'react'
import { AdminHeader } from './header'
import { AdminSidebar } from './sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* 
        Sidebar Navigation
        - Desktop: Always visible
        - Mobile: Toggleable via hamburger menu
      */}
      <AdminSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* 
          Header with theme toggle and mobile menu
          - Logo/branding
          - Search bar
          - Theme switcher
          - Mobile menu toggle
        */}
        <AdminHeader onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content area with consistent padding */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
