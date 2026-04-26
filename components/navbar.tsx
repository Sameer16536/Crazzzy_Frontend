/**
 * Navbar Component
 * Main navigation bar for the Crazzzy store.
 */

'use client'

import Link from 'next/link'
import { Search, ShoppingCart, Menu, LayoutDashboard, LogOut, User as UserIcon, ShieldCheck, ChevronRight } from 'lucide-react'
import { useCatalog } from '@/lib/catalog/use-catalog'
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

export function Navbar() {
  const { rootCategories, getSubcategories } = useCatalog()
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0))
  const { user, loading, logout, checkAdmin } = useAuth()

  const isAdmin = checkAdmin()

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 md:gap-8">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg sm:text-xl hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">C</span>
            </div>
            <span className="text-foreground hidden sm:inline">crazzzy</span>
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
                    <div className="grid grid-cols-2 gap-4 p-6">
                      {rootCategories.map((c) => {
                        const subs = getSubcategories(c.id).slice(0, 3)
                        return (
                          <div key={c.id} className="space-y-3">
                            <NavigationMenuLink asChild>
                              <Link
                                href={`/shop?category=${c.slug}`}
                                className="group block space-y-1"
                              >
                                <div className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                  {c.name}
                                  <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-[10px] text-muted-foreground line-clamp-1 uppercase tracking-tight">
                                  {c.description}
                                </div>
                              </Link>
                            </NavigationMenuLink>

                            {/* Sub-categories preview */}
                            {subs.length > 0 && (
                              <div className="flex flex-wrap gap-x-3 gap-y-1">
                                {subs.map(sub => (
                                  <Link
                                    key={sub.id}
                                    href={`/shop?category=${sub.slug}`}
                                    className="text-[9px] font-bold text-muted-foreground/60 hover:text-primary uppercase transition-colors"
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
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <button
              id="navbar-search"
              className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
              aria-label="Search"
            >
              <Search size={18} />
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu" className="w-9 h-9">
                    <Menu size={16} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] bg-background border-border">
                  <SheetHeader className="border-b border-border px-6 py-6">
                    <SheetTitle className="flex items-center gap-2 text-left">
                      <span className="inline-flex size-7 items-center justify-center bg-primary text-primary-foreground font-black text-sm">C</span>
                      <span className="font-black text-foreground">CRAZZZY</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col h-full overflow-y-auto">
                    <div className="p-6 space-y-6">
                      <div className="space-y-3">
                        <Link href="/" className="block text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                          HOME
                        </Link>
                        <Link href="/shop" className="block text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                          EXPLORE ALL
                        </Link>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Collections</p>
                        <div className="space-y-1">
                          {rootCategories.map((c) => (
                            <Link
                              key={c.id}
                              href={`/shop?category=${c.slug}`}
                              className="block py-2 text-sm font-bold text-foreground hover:text-primary transition-colors uppercase tracking-widest"
                            >
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border space-y-3">
                        <Link href="/track" className="block text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest">
                          Track Order
                        </Link>
                        <Link href="/contact" className="block text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest">
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
                              <Link href="/account" className="bg-muted p-3 text-[10px] font-bold text-center uppercase tracking-widest hover:bg-muted/80 transition-all">Profile</Link>
                              <Link href="/account/orders" className="bg-muted p-3 text-[10px] font-bold text-center uppercase tracking-widest hover:bg-muted/80 transition-all">Orders</Link>
                            </div>
                            <button onClick={logout} className="w-full bg-red-500/10 text-red-500 p-3 text-[10px] font-black uppercase tracking-widest">Sign Out</button>
                          </div>
                        ) : (
                          <Link href="/login" className="block bg-primary text-primary-foreground p-4 text-center text-xs font-black uppercase tracking-[0.2em]">
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
    </nav>
  )
}
