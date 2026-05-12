'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Truck, Shield, User, LogOut, Package, Settings, ChevronRight, Heart, Pencil } from 'lucide-react'
import { useCatalog } from '@/lib/catalog/catalog-context'
import { ProductCard } from '@/components/product-card'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'

/** Store value propositions shown in the left branding panel */
const STORE_VALUES = [
  { icon: ShoppingBag, label: 'Curated Collectibles', desc: 'Hand-picked premium pieces' },
  { icon: Star, label: 'Exclusive Drops', desc: 'Limited editions, first access' },
  { icon: Truck, label: 'Fast Delivery', desc: 'Pan-India shipping' },
  { icon: Shield, label: 'Secure Privacy', desc: 'Protected by encrypted auth' },
]

export default function AccountPage() {
  const { user, loading, logout, fetchProfile } = useAuth()
  const { data, wishlistIds } = useCatalog()
  const router = useRouter()
  
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const wishlistedProducts = data?.products.filter(p => wishlistIds.has(String(p.id))) || []

  /** If user is NOT signed in, send them to login */
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/account')
    }
  }, [loading, user, router])

  const handleEditClick = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue || '')
  }

  const handleSave = async () => {
    if (!editingField || !editValue.trim() || isSaving) return
    setIsSaving(true)
    try {
      await api.patch('/auth/me', { [editingField]: editValue.trim() })
      await fetchProfile()
      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
      setEditingField(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditingField(null)
  }

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

      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12"
        >
          {/* User Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-8 pb-12 border-b border-border">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-muted border border-border rounded-none flex items-center justify-center relative group">
                <User size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-3xl font-black text-foreground uppercase tracking-tighter">{user.name}</h2>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{user.email}</p>
              </div>
            </div>

            <button 
              onClick={logout}
              className="bg-red-500/10 text-red-500 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              href="/account/orders"
              className="group p-8 bg-muted/30 border border-border hover:border-primary/30 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <Package className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-widest">My Orders</p>
                  <p className="text-[10px] text-muted-foreground uppercase">View order history</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>

            <Link 
              href="/account/settings"
              className="group p-8 bg-muted/30 border border-border hover:border-primary/30 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <Settings className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-widest">Settings</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Update preferences</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {/* Profile Details */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-border" />
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Profile Details</h3>
              <div className="h-[1px] flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-8">
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</p>
                {editingField === 'name' ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    disabled={isSaving}
                    className="w-full bg-transparent border-b border-primary text-sm text-foreground font-bold uppercase focus:outline-none"
                  />
                ) : (
                  <p 
                    onClick={() => handleEditClick('name', user.name)}
                    className="text-sm text-foreground font-bold uppercase truncate cursor-pointer group flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {user.name} <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                {editingField === 'email' ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    disabled={isSaving}
                    className="w-full bg-transparent border-b border-primary text-sm text-foreground font-bold uppercase focus:outline-none"
                  />
                ) : (
                  <p 
                    onClick={() => handleEditClick('email', user.email)}
                    className="text-sm text-foreground font-bold uppercase break-all cursor-pointer group flex items-start gap-2 hover:text-primary transition-colors"
                  >
                    {user.email} <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                  </p>
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone Number</p>
                {editingField === 'phone' ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    disabled={isSaving}
                    placeholder="10-digit number"
                    className="w-full bg-transparent border-b border-primary text-sm text-foreground font-bold uppercase focus:outline-none"
                  />
                ) : (
                  <p 
                    // @ts-ignore
                    onClick={() => handleEditClick('phone', user.phone || '')}
                    className="text-sm text-foreground font-bold uppercase truncate cursor-pointer group flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {/* @ts-ignore */}
                    {user.phone || 'Not Provided'} <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Member Since</p>
                <p className="text-sm text-foreground font-bold uppercase truncate">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Type</p>
                <p className="text-sm text-primary font-black uppercase tracking-widest truncate">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Wishlist Section */}
          <div className="space-y-10 pt-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="text-primary fill-current" size={20} />
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">My Wishlist</h3>
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-2">
                {wishlistedProducts.length} Items
              </span>
            </div>

            {wishlistedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                {wishlistedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-muted/10 border border-border p-20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <Heart className="mx-auto text-muted-foreground/20 mb-6 relative z-10" size={48} />
                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 relative z-10">Your wishlist is currently empty</p>
                <Link 
                  href="/shop" 
                  className="relative z-10 inline-block bg-primary text-primary-foreground px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                  Enter the Shop
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
