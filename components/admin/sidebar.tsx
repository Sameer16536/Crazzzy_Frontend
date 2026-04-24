/**
 * AdminSidebar Component
 * 
 * Navigation sidebar for admin dashboard
 * Features:
 * - Primary navigation links
 * - Active state indicators
 * - Icons for visual clarity
 * - Mobile responsive behavior
 * 
 * Navigation items:
 * - Dashboard: Main overview
 * - Products: Inventory management
 * - Orders: Order management
 * - Customers: Customer management
 * - Analytics: Business metrics
 * - Settings: Configuration
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminSidebar({ open, onOpenChange }: AdminSidebarProps) {
  const pathname = usePathname()

  // Navigation menu items
  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Products', href: '/admin/products', icon: '📦' },
    { label: 'Orders', href: '/admin/orders', icon: '🛒' },
    { label: 'Customers', href: '/admin/customers', icon: '👥' },
    { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile overlay - closes sidebar when clicked */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border',
          'transition-transform duration-300 ease-in-out transform',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Sidebar header with logo and close button */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border/50 bg-sidebar/50">
          {/* Logo/Brand section with modern styling */}
          <div className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-sidebar-foreground block">crazzzy</span>
              <span className="text-xs text-sidebar-foreground/60">Admin v1.0</span>
            </div>
          </div>

          {/* Close button for mobile with better styling */}
          <button
            className="md:hidden p-1.5 text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent rounded-lg transition-all duration-200"
            onClick={() => onOpenChange(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation menu with enhanced styling */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative group',
                'hover:text-sidebar-accent-foreground',
                isActive(item.href)
                  ? 'bg-gradient-to-r from-sidebar-primary/20 to-sidebar-primary/10 text-sidebar-primary border-l-2 border-sidebar-primary shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              {/* Animated indicator for active item */}
              {isActive(item.href) && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full" />
              )}
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
              {/* Optional: Add badge count here */}
            </Link>
          ))}
        </nav>

        {/* Sidebar footer with support and info */}
        <div className="border-t border-sidebar-border/50 px-4 py-4 bg-sidebar-accent/20">
          <div className="space-y-3">
            <p className="text-xs text-sidebar-foreground/70 text-center font-medium">
              Need Help?
            </p>
            <button className="w-full px-3 py-2 bg-sidebar-primary/10 hover:bg-sidebar-primary/20 text-sidebar-primary rounded-lg text-xs font-medium transition-colors">
              Support Docs →
            </button>
            <p className="text-xs text-sidebar-foreground/50 text-center">
              Dashboard v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
