'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Truck, Shield, User, LogOut, Package, Settings, ChevronRight } from 'lucide-react'

/** Store value propositions shown in the left branding panel */
const STORE_VALUES = [
  { icon: ShoppingBag, label: 'Curated Collectibles', desc: 'Hand-picked premium pieces' },
  { icon: Star, label: 'Exclusive Drops', desc: 'Limited editions, first access' },
  { icon: Truck, label: 'Fast Delivery', desc: 'Pan-India shipping' },
  { icon: Shield, label: 'Secure Privacy', desc: 'Protected by encrypted auth' },
]

export default function AccountPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  /** If user is NOT signed in, send them to login */
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/account')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16" />

      <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row">

        {/* ── LEFT: Branding Panel ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex flex-col justify-between w-[40%] px-16 py-20 bg-[#080808] border-r border-border/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '256px',
            }}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-primary to-transparent" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <span className="text-black font-black">C</span>
              </div>
              <span className="text-white font-black text-xl tracking-tight">CRAZZZY</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono tracking-[0.2em] uppercase">
              Curated for Your Kind
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Your<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #f5e27a 50%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Profile.
              </span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Manage your orders, personal details, and preferences in one premium space.
            </p>

            <div className="space-y-4 pt-4 border-t border-border/20">
              {STORE_VALUES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">{label}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-tight">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <button 
              onClick={logout}
              className="text-xs text-red-500 hover:text-red-400 transition-colors font-bold flex items-center gap-2 uppercase tracking-widest"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* ── RIGHT: Account Overview ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 px-6 sm:px-12 lg:px-20 py-16 lg:py-24"
        >
          <div className="max-w-2xl mx-auto space-y-12">
            
            {/* User Header */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-zinc-900 border border-white/10 rounded-none flex items-center justify-center relative group">
                <User size={32} className="text-white/20 group-hover:text-primary transition-colors" />
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{user.name}</h2>
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest">{user.email}</p>
              </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                href="/account/orders"
                className="group p-6 bg-zinc-900/30 border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Package className="text-primary" size={20} />
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">My Orders</p>
                    <p className="text-[10px] text-white/40 uppercase">View order history</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <Link 
                href="/account/settings"
                className="group p-6 bg-zinc-900/30 border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Settings className="text-primary" size={20} />
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Settings</p>
                    <p className="text-[10px] text-white/40 uppercase">Update preferences</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            {/* Profile Details */}
            <div className="space-y-6 pt-8 border-t border-white/5">
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Full Name</p>
                  <p className="text-sm text-white font-medium">{user.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm text-white font-medium">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Member Since</p>
                  <p className="text-sm text-white font-medium">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Account Type</p>
                  <p className="text-sm text-primary font-bold uppercase tracking-widest">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Mobile Logout */}
            <div className="lg:hidden pt-8 border-t border-white/5">
              <button 
                onClick={logout}
                className="w-full bg-red-500/10 text-red-500 p-4 text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]"
              >
                Sign Out
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  )
}
