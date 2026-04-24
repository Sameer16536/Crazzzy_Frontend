/**
 * Account Dashboard — Protected Customer Page
 *
 * Requires a valid Clerk session. Middleware redirects unauthenticated
 * users to /account before they can reach this page.
 *
 * Features:
 * - Personalised greeting with user's first name
 * - Order history placeholder (ready to wire to backend)
 * - Quick actions: wishlist, settings
 * - Clerk <UserButton /> for profile management and sign-out
 */

'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Package,
  Heart,
  Settings,
  ChevronRight,
  ShoppingBag,
  Star,
  MapPin,
} from 'lucide-react'

/** Quick action cards shown on the dashboard */
const QUICK_ACTIONS = [
  {
    id: 'orders',
    icon: Package,
    label: 'My Orders',
    desc: 'Track and manage your purchases',
    href: '#',
    color: '#d4af37',
  },
  {
    id: 'wishlist',
    icon: Heart,
    label: 'Wishlist',
    desc: 'Items you\'ve saved for later',
    href: '#',
    color: '#f43f5e',
  },
  {
    id: 'addresses',
    icon: MapPin,
    label: 'Addresses',
    desc: 'Manage delivery addresses',
    href: '#',
    color: '#10b981',
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    desc: 'Profile and preferences',
    href: '#',
    color: '#8b5cf6',
  },
]

export default function AccountDashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  /** Guard: redirect to sign-in if not authenticated */
  useEffect(() => {
    if (isLoaded && !user) {
      router.replace('/account')
    }
  }, [isLoaded, user, router])

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const firstName = user.firstName || 'there'

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16" />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Welcome Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-start justify-between gap-4 mb-12 flex-wrap"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-6 h-px bg-primary" />
              <span className="text-primary text-xs font-mono tracking-[0.2em] uppercase">Member</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-foreground leading-tight">
              Hey,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #f5e27a 50%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {firstName}
              </span>
              . 👋
            </h1>
            <p className="text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
          </div>

          {/* Clerk UserButton — handles sign-out, profile, etc. */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-muted-foreground font-mono hidden sm:block">Signed in</span>
            <UserButton
              appearance={{
                elements: { avatarBox: 'w-10 h-10' },
              }}
            />
          </div>
        </motion.div>

        {/* ── Stats Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {[
            { value: '0', label: 'Orders' },
            { value: '0', label: 'Wishlist Items' },
            { value: 'New', label: 'Member Status' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border/30 p-4 sm:p-6 text-center"
            >
              <p className="text-2xl sm:text-3xl font-black text-foreground font-mono">{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Quick Actions Grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action, idx) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + idx * 0.07 }}
                >
                  <Link
                    href={action.href}
                    className="group flex items-center gap-4 p-4 sm:p-5 bg-card border border-border/30 hover:border-primary/40 transition-all duration-300 cursor-interactive"
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <Icon size={18} style={{ color: action.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                        {action.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ── Recent Orders Placeholder ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="bg-card border border-border/30 p-8 text-center"
        >
          <div className="w-12 h-12 bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={20} className="text-muted-foreground" />
          </div>
          <h3 className="font-black text-foreground mb-2">No orders yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            When you place your first order, it will appear here.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold text-sm uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-interactive"
          >
            <Star size={14} />
            Start Shopping
          </Link>
        </motion.div>

      </section>
    </div>
  )
}
