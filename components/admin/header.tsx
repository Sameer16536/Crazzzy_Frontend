/**
 * AdminHeader Component
 * 
 * Top navigation bar for admin dashboard
 * Features:
 * - Mobile hamburger menu toggle
 * - Theme mode switcher (light/dark) with smooth animation
 * - Search functionality with keyboard shortcut hint
 * - User profile avatar (integrate with Clerk UserButton)
 * - Sticky positioning with backdrop blur for modern aesthetic
 * 
 * Design: Inspired by modern crazzzy platforms with glass morphism effects
 */

'use client'

import { Menu, Search, ChevronDown, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminLogout } from '@/app/actions/auth'
import { ThemeToggle } from '@/components/theme-toggle'

interface AdminHeaderProps {
  onMobileMenuToggle: () => void
}

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section: Mobile menu and search */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Mobile hamburger menu button with animation */}
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-all duration-200 hover:shadow-sm"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-foreground" />
          </button>

          {/* Search bar - expandable on desktop with modern styling */}
          <div className="hidden sm:flex items-center flex-1 max-w-sm bg-muted/50 border border-border/50 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-muted transition-all duration-200">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products, orders..."
              className="flex-1 ml-2 bg-transparent outline-none text-foreground placeholder-muted-foreground text-sm"
            />
            <span className="text-xs text-muted-foreground ml-2 hidden lg:inline">⌘K</span>
          </div>
        </div>

        {/* Right section: Theme toggle and user menu */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />

          {/* User profile dropdown */}
          <div className="relative group">
            <button
              className="flex items-center space-x-2 px-2 py-1 hover:bg-muted rounded-lg transition-colors duration-200"
              aria-label="User profile menu"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold hover:shadow-lg transition-shadow duration-200">
                A
              </div>
              <ChevronDown 
                size={16} 
                className="text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block"
              />
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg border border-border/30 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-border/30">
                <p className="text-sm font-semibold text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@crazzzy.com</p>
              </div>
              <button
                onClick={() => adminLogout()}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
