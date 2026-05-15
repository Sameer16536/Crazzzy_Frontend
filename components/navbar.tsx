/**
 * Navbar Component
 * Main navigation bar for the Crazzzy store.
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ShoppingCart, Menu, LayoutDashboard, LogOut, User as UserIcon, ShieldCheck, ChevronRight, Plus, Minus } from 'lucide-react'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { resolveImageUrl } from '@/lib/catalog/catalog-context'
import { useAppSelector } from '@/lib/store/hooks'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/lib/auth/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function Navbar() {
  const { rootCategories: rawCategories, getSubcategories, data } = useCatalog()

  // Deterministic category order for the navbar
  const categories = useMemo(() => {
    if (!rawCategories) return []
    const PREFERRED_ORDER = [
      'wall-posters', // User requested: first
      'aesthetic-items',
      'anime-figures',
      'chocolate-and-beverages',
      'die-cast-cars-and-bikes',
      'hot-wheels',
      'keychains',
      'perfumes',
      'tote-bags'
    ]

    const ordered: any[] = []
    const remaining = [...rawCategories]

    PREFERRED_ORDER.forEach(slug => {
      const idx = remaining.findIndex(c => c.slug === slug)
      if (idx !== -1) ordered.push(remaining.splice(idx, 1)[0])
    })

    return [...ordered, ...remaining]
  }, [rawCategories])
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0))
  const { user, loading, logout, checkAdmin } = useAuth()
  const router = useRouter()

  const isAdmin = checkAdmin()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => {
          if (!open) setTimeout(() => document.getElementById('mega-search-input')?.focus(), 100)
          return !open
        })
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [searchOpen])

  // Prevent background scroll when search is open
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [searchOpen])

  const [apiSearchResults, setApiSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Compute live search results for the dropdown via backend API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setApiSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const params = new URLSearchParams({ search: searchQuery.trim(), limit: '12' })
        const res = await import('@/lib/api-client').then(m => m.api.get<any>(`/products?${params.toString()}`))
        const products = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
        setApiSearchResults(products)
      } catch (e) {
        console.error('Search API error:', e)
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Prefer API results, fallback to local search if API is slow or empty
  const searchResults = apiSearchResults.length > 0 
    ? apiSearchResults.map(p => ({
        id: String(p.id),
        name: p.title,
        price: parseFloat(p.price),
        imageUrl: resolveImageUrl(p.imageUrl),
        slug: p.slug
      })).slice(0, 12)
    : (data?.products
        ? data.products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 12)
        : [])

  const suggestedCategories = categories
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 3)

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      setSearchOpen(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/10">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 md:gap-8">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="relative w-36 sm:w-56 h-12 sm:h-16 flex items-center justify-center overflow-hidden pl-1 sm:pl-0">
              <Image
                src="/logo-light.png"
                alt="Crazzzy Collectibles"
                fill
                className="object-contain mix-blend-multiply dark:invert dark:mix-blend-screen scale-[2] sm:scale-[2.5]"
                priority
              />
            </div>
          </Link>

          {/* ── Desktop Navigation ── */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            <Link href="/" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
              HOME
            </Link>

            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent border border-transparent hover:bg-muted data-[state=open]:bg-muted text-sm font-medium">
                    PRODUCTS
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="md:w-[600px]">
                    <div className="grid grid-cols-2 gap-2 p-4">
                      {categories.map((c) => {
                        const subs = getSubcategories(c.id).slice(0, 3)
                        return (
                          <div key={c.id} className="space-y-3">
                            <NavigationMenuLink asChild>
                              <Link
                                href={`/shop?category=${c.slug}`}
                                className="group/item block space-y-2 p-3 hover:bg-primary transition-all duration-500 rounded-none border border-transparent hover:border-primary/20 shadow-none hover:shadow-xl hover:shadow-primary/5"
                              >
                                <div className="text-[11px] font-black text-primary group-hover/item:text-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
                                  {c.name}
                                  <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                                </div>
                                <div className="text-[10px] text-muted-foreground/90 group-hover/item:text-black/80 line-clamp-2 uppercase tracking-tight transition-colors leading-tight">
                                  {c.description}
                                </div>
                              </Link>
                            </NavigationMenuLink>

                            {/* Sub-categories preview */}
                            {subs.length > 0 && (
                              <div className="flex flex-wrap gap-x-4 gap-y-2 px-1">
                                {subs.map(sub => (
                                  <Link
                                    key={sub.id}
                                    href={`/shop?category=${sub.slug}`}
                                    className="text-[9px] font-black text-muted-foreground hover:text-primary uppercase transition-colors tracking-widest"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="bg-muted/50 p-4 border-t border-border/40">
                      <Link
                        href="/shop"
                        className="flex items-center justify-center gap-2 text-xs font-black text-primary uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
                      >
                        Explore Complete Universe →
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link href="/contact" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
              CONTACT
            </Link>
            <Link href="/track" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
              TRACK ORDER
            </Link>
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <button
              id="navbar-search"
              onClick={() => {
                setSearchOpen(!searchOpen)
                if (!searchOpen) setTimeout(() => document.getElementById('mega-search-input')?.focus(), 100)
              }}
              className={cn(
                "p-2 rounded-lg transition-colors text-foreground flex items-center gap-2",
                searchOpen ? "bg-muted" : "hover:bg-muted"
              )}
              aria-label="Search"
            >
              <Search size={18} />
              <span className="hidden lg:inline-flex text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border px-1.5 py-0.5 rounded opacity-60">
                ⌘K
              </span>
            </button>

            <Link
              href="/cart"
              id="navbar-cart"
              className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground relative"
              aria-label={`Cart — ${cartCount} items`}
            >
              <ShoppingCart size={18} />
              <span
                className={cn(
                  'absolute top-1 right-1 min-w-4 h-4 px-1 bg-primary text-black rounded-full text-[10px] flex items-center justify-center font-bold border border-background shadow-sm',
                  cartCount === 0 && 'opacity-60',
                )}
              >
                {cartCount}
              </span>
            </Link>

            {/* User Account */}
            <div className="relative">
              {!loading && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Avatar className="w-8 h-8 border border-border/20">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback className="bg-primary text-black font-bold uppercase">
                          {user.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 bg-popover border-border backdrop-blur-xl">
                    <DropdownMenuLabel className="font-bold flex flex-col">
                      <span className="text-foreground">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal truncate uppercase tracking-widest">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    {isAdmin && (
                      <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary cursor-pointer">
                        <Link href="/admin" className="flex items-center gap-2">
                          <ShieldCheck size={16} />
                          <span className="font-bold uppercase text-[10px] tracking-widest">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary cursor-pointer">
                      <Link href="/account" className="flex items-center gap-2">
                        <UserIcon size={16} />
                        <span className="font-bold uppercase text-[10px] tracking-widest">Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary cursor-pointer">
                      <Link href="/account/orders" className="flex items-center gap-2">
                        <LayoutDashboard size={16} />
                        <span className="font-bold uppercase text-[10px] tracking-widest">Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-500/80"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <LogOut size={16} />
                        <span className="font-bold uppercase text-[10px] tracking-widest">Sign Out</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  id="navbar-account"
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                  aria-label="Sign in / Account"
                >
                  <UserIcon size={18} />
                </Link>
              )}
            </div>

            {/* Mobile menu trigger */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu" className="w-9 h-9">
                    <Menu size={16} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] bg-background border-border">
                  <SheetHeader className="border-b border-border px-6 py-6">
                    <SheetTitle className="flex items-center gap-2 text-left">
                      <div className="relative w-48 h-14 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/logo-light.png"
                          alt="Crazzzy Collectibles"
                          fill
                          className="object-contain mix-blend-multiply dark:invert dark:mix-blend-screen scale-[2.5]"
                          priority
                        />
                      </div>
                    </SheetTitle>
                    <div className="absolute right-6 top-6">
                      <ThemeToggle variant="outline" />
                    </div>
                  </SheetHeader>

                  <div className="flex flex-col h-full overflow-y-auto">
                    <div className="p-6 space-y-6">
                      <div className="space-y-3">
                        <Link 
                          href="/" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                        >
                          HOME
                        </Link>
                        <Link 
                          href="/shop" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                        >
                          EXPLORE ALL
                        </Link>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Collections</p>
                        <div className="space-y-1">
                          {categories.map((c) => {
                            const subs = getSubcategories(c.id)
                            const hasSubs = subs.length > 0
                            const isActive = activeCategory === c.slug
                            const isChildActive = subs.some(s => s.slug === activeCategory)

                            return (
                              <div key={c.id} className="space-y-1">
                                <Collapsible defaultOpen={isActive || isChildActive}>
                                  <div className="flex items-center justify-between group">
                                    <Link
                                      href={`/shop?category=${c.slug}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className={cn(
                                        "flex-1 py-2 text-sm font-bold transition-colors uppercase tracking-widest",
                                        isActive || isChildActive ? "text-primary" : "text-foreground hover:text-primary"
                                      )}
                                    >
                                      {c.name}
                                    </Link>
                                    {hasSubs && (
                                      <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/5 group/trigger">
                                          <Plus className="h-3 w-3 transition-transform duration-300 group-data-[state=open]/trigger:rotate-45" />
                                          <span className="sr-only">Toggle {c.name}</span>
                                        </Button>
                                      </CollapsibleTrigger>
                                    )}
                                  </div>
                                  
                                  {hasSubs && (
                                    <CollapsibleContent className="space-y-1">
                                      <div className="pl-4 border-l border-border/50 space-y-1 ml-1 mt-1">
                                        {subs.map((sub) => (
                                          <Link
                                            key={sub.id}
                                            href={`/shop?category=${sub.slug}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={cn(
                                              "block py-1.5 text-[11px] font-medium transition-colors uppercase tracking-wider",
                                              activeCategory === sub.slug ? "text-primary" : "text-muted-foreground hover:text-primary"
                                            )}
                                          >
                                            {sub.name}
                                          </Link>
                                        ))}
                                      </div>
                                    </CollapsibleContent>
                                  )}
                                </Collapsible>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border space-y-3">
                        <Link 
                          href="/track" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest"
                        >
                          Track Order
                        </Link>
                        <Link 
                          href="/contact" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest"
                        >
                          Contact
                        </Link>
                      </div>

                      <div className="pt-6 border-t border-border">
                        {!loading && user ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border border-border">
                                <AvatarImage src={user.imageUrl} />
                                <AvatarFallback className="bg-primary text-black font-bold">
                                  {user.name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-black text-foreground uppercase">{user.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{user.email}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Link 
                                href="/account" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="bg-muted p-3 text-[10px] font-bold text-center uppercase tracking-widest hover:bg-muted/80 transition-all"
                              >
                                Profile
                              </Link>
                              <Link 
                                href="/account/orders" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="bg-muted p-3 text-[10px] font-bold text-center uppercase tracking-widest hover:bg-muted/80 transition-all"
                              >
                                Orders
                              </Link>
                            </div>
                            <button 
                              onClick={() => {
                                logout()
                                setMobileMenuOpen(false)
                              }} 
                              className="w-full bg-red-500/10 text-red-500 p-3 text-[10px] font-black uppercase tracking-widest"
                            >
                              Sign Out
                            </button>
                          </div>
                        ) : (
                          <Link 
                            href="/login" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="block bg-primary text-primary-foreground p-4 text-center text-xs font-black uppercase tracking-[0.2em]"
                          >
                            Sign In
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search Overlay & Backdrop ── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[35]"
            />

            {/* Mega-Menu Search Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="absolute top-full left-0 w-full bg-background border-b border-border shadow-2xl z-40 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-primary/20"
            >
              <div className="max-w-4xl mx-auto px-6 py-10">

                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="flex items-center justify-between border border-border bg-muted/20 px-6 py-4 rounded-none group hover:border-primary/50 focus-within:border-primary transition-colors">
                  <div className="flex flex-col flex-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-[0.3em] mb-1">Search</span>
                    <input
                      id="mega-search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type to search..."
                      className="w-full bg-transparent text-foreground text-xl font-black uppercase tracking-widest outline-none placeholder:text-muted-foreground/30"
                      autoComplete="off"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')} className="p-2 text-muted-foreground hover:text-foreground">
                        <X size={16} />
                      </button>
                    )}
                    <button type="submit" className="p-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                      <Search size={20} />
                    </button>
                  </div>
                </form>

                {/* Two Column Layout */}
                {searchQuery.trim().length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-12">

                    {/* Left: Suggestions */}
                    <div className="md:col-span-4 space-y-6">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] border-b border-border pb-3">Suggestions</h4>
                      <ul className="space-y-4">
                        {suggestedCategories.map(cat => (
                          <li key={cat.id}>
                            <Link
                              href={`/shop?category=${cat.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors block"
                            >
                              {cat.name} <span className="text-[10px] text-muted-foreground ml-2">Category</span>
                            </Link>
                          </li>
                        ))}
                        <li>
                          <button
                            onClick={handleSearchSubmit}
                            className="text-sm font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity flex items-center gap-2 mt-4"
                          >
                            Search for "{searchQuery}" <ChevronRight size={14} />
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* Right: Products */}
                    <div className="md:col-span-8 space-y-6">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] border-b border-border pb-3">Products</h4>
                      <div className="relative group/scroll">
                        <div className="max-h-[400px] md:max-h-[500px] overflow-y-auto pr-4 
                          [&::-webkit-scrollbar]:w-1.5 
                          [&::-webkit-scrollbar-track]:bg-transparent 
                          [&::-webkit-scrollbar-thumb]:bg-primary/10 
                          [&::-webkit-scrollbar-thumb]:rounded-full 
                          hover:[&::-webkit-scrollbar-thumb]:bg-primary/30
                          transition-all"
                        >
                          {searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
                              {searchResults.map(product => (
                                <Link
                                  key={product.id}
                                  href={`/product/${product.id}`}
                                  onClick={() => setSearchOpen(false)}
                                  className="group flex items-center gap-4 p-3 bg-muted/10 border border-transparent hover:border-border hover:bg-muted/30 transition-all"
                                >
                                  <div className="w-16 h-16 bg-muted/50 overflow-hidden flex-shrink-0">
                                    {product.imageUrl ? (
                                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                      <Search className="w-full h-full p-4 text-muted-foreground opacity-20" />
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-black text-xs text-foreground uppercase tracking-widest line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">{product.name}</span>
                                    <span className="font-price text-muted-foreground text-[10px] font-bold tracking-wider">₹{product.price}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="py-8 text-center border border-dashed border-border">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No products match this query.</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Bottom Fade Gradient for indicators */}
                        {searchResults.length > 6 && (
                          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
