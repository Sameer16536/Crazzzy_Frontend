'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import {
  Package,
  Heart,
  Settings,
  ChevronRight,
  ShoppingBag,
  Star,
  MapPin,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react'

const QUICK_ACTIONS = [
  {
    id: 'orders',
    icon: Package,
    label: 'My Orders',
    desc: 'Track and manage your purchases',
    href: '/account/orders',
    color: '#EAB308',
  },
  {
    id: 'wishlist',
    icon: Heart,
    label: 'Wishlist',
    desc: 'Items you\'ve saved for later',
    href: '/account/wishlist',
    color: '#f43f5e',
  },
  {
    id: 'addresses',
    icon: MapPin,
    label: 'Addresses',
    desc: 'Manage delivery addresses',
    href: '/account/addresses',
    color: '#10b981',
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    desc: 'Profile and preferences',
    href: '/account/settings',
    color: '#8b5cf6',
  },
]

export default function AccountDashboardPage() {
  const { user, loading: authLoading, logout, checkAdmin } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ orders: 0, wishlist: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/account/dashboard')
      return
    }

    if (user) {
      fetchStats()
    }
  }, [user, authLoading, router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [orders, wishlist] = await Promise.all([
        api.get<any[]>('/orders'),
        api.get<any[]>('/users/wishlist')
      ])
      setStats({
        orders: orders.length,
        wishlist: wishlist.length
      })
    } catch (error) {
      console.error('Failed to fetch stats', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (loading && !user)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!user) return null

  const isAdmin = checkAdmin()

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <Navbar />

      <div className="pt-32 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-primary" />
              <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Collector</span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
              HEY, <span className="text-primary">{user.name.split(' ')[0]}</span>.
            </h1>
            <p className="text-white/40 text-xs font-mono uppercase tracking-widest">{user.email}</p>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-primary/10 text-primary border border-primary/20 px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 transition-all"
              >
                <ShieldCheck size={14} />
                Admin Cockpit
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-white/5 border border-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Orders', value: stats.orders, icon: Package },
            { label: 'Saved', value: stats.wishlist, icon: Heart },
            { label: 'Coupons', value: '0', icon: Star },
            { label: 'Rank', value: 'Alpha', icon: UserIcon },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/50 border border-white/5 p-8 text-center space-y-2 relative group overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <p className="text-3xl font-black font-mono">{stat.value}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6 mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Link
                  href={action.href}
                  className="group flex items-center gap-6 p-6 bg-zinc-900/30 border border-white/5 hover:border-primary/30 transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center shrink-0 border border-white/5 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${action.color}10` }}
                  >
                    <action.icon size={20} style={{ color: action.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black uppercase tracking-widest group-hover:text-primary transition-colors">{action.label}</p>
                    <p className="text-[10px] text-white/30 truncate uppercase mt-1">{action.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity / Empty State */}
        <div className="bg-zinc-900/50 border border-white/5 p-16 text-center space-y-6">
          <div className="w-16 h-16 bg-white/5 flex items-center justify-center mx-auto rounded-none border border-white/10">
            <ShoppingBag size={24} className="text-white/20" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight">No Recent Activity</h3>
            <p className="text-xs text-white/30 max-w-xs mx-auto uppercase tracking-widest leading-loose">
              Your collection is currently empty. Explore the shop to start your journey.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-block bg-primary text-black px-10 py-4 font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-transform"
          >
            Enter the Shop
          </Link>
        </div>
      </div>
    </div>
  )
}
