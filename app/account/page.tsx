/**
 * Account / Customer Sign-In Page
 *
 * Production-grade split-screen design:
 * - Left panel (desktop): Crazzzy branding + store values
 * - Right panel: Embedded Clerk <SignIn /> with custom dark appearance
 * - Mobile: Full-screen Clerk sign-in panel, branding collapses above
 * - Admin link at bottom directs to the custom admin auth flow
 */

'use client'

import { SignIn, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Truck, Shield } from 'lucide-react'

/** Store value propositions shown in the left branding panel */
const STORE_VALUES = [
  { icon: ShoppingBag, label: 'Curated Collectibles', desc: 'Hand-picked premium pieces' },
  { icon: Star, label: 'Exclusive Drops', desc: 'Limited editions, first access' },
  { icon: Truck, label: 'Fast Delivery', desc: 'Pan-India shipping' },
  { icon: Shield, label: 'Secure Checkout', desc: 'Protected by Clerk auth' },
]

export default function AccountPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  /** If user is already signed in, send them to their dashboard */
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/account/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16" />

      <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row">

        {/* ── LEFT: Branding Panel (desktop only) ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex flex-col justify-between w-[45%] px-16 py-20 bg-[#080808] border-r border-border/20 relative overflow-hidden"
        >
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '256px',
            }}
          />

          {/* Gold vertical accent line */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-primary to-transparent" />

          {/* Brand */}
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

          {/* Headline */}
          <div className="space-y-6 relative z-10">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Welcome<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #f5e27a 50%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Back.
              </span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-xs">
              Sign in to access your orders, wishlist, and exclusive member drops.
            </p>

            {/* Store value props */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              {STORE_VALUES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Admin link */}
          <div className="relative z-10">
            <p className="text-xs text-muted-foreground">
              Store admin?{' '}
              <Link href="/admin-login" className="text-primary hover:text-primary/80 transition-colors font-semibold">
                Admin login →
              </Link>
            </p>
          </div>
        </motion.div>

        {/* ── RIGHT: Clerk Sign-In Panel ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 min-h-[calc(100vh-64px)]"
        >
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <span className="text-black font-black text-sm">C</span>
              </div>
              <span className="text-foreground font-black text-lg tracking-tight">CRAZZZY</span>
            </div>
            <p className="text-muted-foreground text-sm">Sign in to continue</p>
          </div>

          {/* Clerk SignIn — embedded, no routing redirect */}
          <SignIn
            routing="hash"
            fallbackRedirectUrl="/account/dashboard"
            signUpFallbackRedirectUrl="/account/dashboard"
          />

          {/* Mobile admin link */}
          <p className="lg:hidden mt-8 text-xs text-muted-foreground text-center">
            Store admin?{' '}
            <Link href="/admin-login" className="text-primary hover:text-primary/80 transition-colors font-semibold">
              Admin login →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
