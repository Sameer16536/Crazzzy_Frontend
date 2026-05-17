'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { X, LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, ExternalLink, ShieldCheck, Ticket, Star, Zap, Tags, Gift, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'

interface AdminSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminSidebar({ open, onOpenChange }: AdminSidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Tags },
    { label: 'Featured', href: '/admin/featured', icon: Star },
    { label: 'Deal of the Day', href: '/admin/deal', icon: Zap },
    { label: 'Combo Deals', href: '/admin/combo-deals', icon: Gift },
    { label: 'Category Offers', href: '/admin/category-offers', icon: Ticket },
    { label: 'Product Offers', href: '/admin/product-offers', icon: Sparkles },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    return pathname === href || (href !== '/admin' && pathname.startsWith(href))
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => onOpenChange(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-500 ease-out',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-24 flex items-center justify-between px-8 border-b border-border bg-muted/20">
          <Link href="/" className="flex flex-col gap-2 group mt-2">
            <div className="relative w-48 h-12 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo-light.png"
                alt="Crazzzy Collectibles"
                fill
                className="object-contain mix-blend-multiply dark:invert dark:mix-blend-screen scale-[2]"
              />
            </div>
            <span className="text-[8px] text-primary font-mono tracking-[0.4em] uppercase">Cockpit Control Center</span>
          </Link>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onOpenChange(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-6">Operations</p>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-4 px-4 py-4 transition-all duration-300 relative group',
                  active
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-primary"
                  />
                )}
                <Icon size={18} className={cn('transition-transform group-hover:scale-110', active ? 'text-primary' : 'text-muted-foreground/40')} />
                <span className="font-bold text-[10px] uppercase tracking-widest">{item.label}</span>
              </Link>
            )
          })}

          <div className="pt-12">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-6">Universe</p>
            <Link
              href="/"
              className="flex items-center gap-4 px-4 py-4 text-muted-foreground hover:text-foreground transition-all group"
            >
              <ExternalLink size={18} className="text-muted-foreground/40" />
              <span className="font-bold text-[10px] uppercase tracking-widest">Live Store</span>
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20">
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-4 text-red-500/60 hover:text-red-500 transition-all group hover:bg-red-500/5"
          >
            <LogOut size={18} />
            <span className="font-bold text-[10px] uppercase tracking-widest">Shut Down Session</span>
          </button>
        </div>
      </aside>
    </>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
