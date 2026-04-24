/**
 * Navbar Component
 * Main navigation bar for the Crazzzy store.
 *
 * Auth:
 * - If Clerk user is signed in: shows <UserButton /> (profile + sign-out)
 * - If not signed in: shows person icon linking to /account  
 * Admin auth is completely separate (custom cookie session, /admin-login)
 *
 * Responsiveness:
 * - Desktop: horizontal link bar + NavigationMenu dropdown
 * - Mobile: hamburger → Sheet slide-out with full nav + theme toggle
 */

'use client'

import Link from 'next/link'
import { Search, ShoppingCart, User, Menu } from 'lucide-react'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { useAppSelector } from '@/lib/store/hooks'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserButton, useUser } from '@clerk/nextjs'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

export function Navbar() {
  const { data } = useCatalog()
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0))
  const { isSignedIn, isLoaded } = useUser()

  const categories = data?.categories ?? []

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
                  <NavigationMenuContent className="md:w-[520px]">
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {categories.map((c) => (
                        <NavigationMenuLink key={c.id} asChild>
                          <Link
                            href={`/shop/${c.slug}`}
                            className="rounded-md p-3 hover:bg-muted transition-colors"
                          >
                            <div className="text-sm font-semibold text-foreground">{c.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{c.description}</div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                    <div className="border-t border-border/40 p-2">
                      <Link
                        href="/shop"
                        className="block rounded-md px-3 py-2 text-sm font-semibold text-primary hover:bg-muted transition-colors"
                      >
                        Shop all →
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

            {/* Search */}
            <button
              id="navbar-search"
              className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground cursor-interactive"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              id="navbar-cart"
              className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground relative cursor-interactive"
              aria-label={`Cart — ${cartCount} items`}
            >
              <ShoppingCart size={18} />
              <span
                className={cn(
                  'absolute top-1 right-1 min-w-4 h-4 px-1 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold',
                  cartCount === 0 && 'opacity-60',
                )}
              >
                {cartCount}
              </span>
            </Link>

            {/* Clerk UserButton or Account link */}
            <div className="relative">
              {isLoaded && isSignedIn ? (
                /* Signed in: show Clerk's avatar button */
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8',
                    },
                  }}
                />
              ) : (
                /* Not signed in: show plain person icon → /account */
                <Link
                  href="/account"
                  id="navbar-account"
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground cursor-interactive"
                  aria-label="Sign in / Account"
                >
                  <User size={18} />
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
                <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px]">
                  <SheetHeader className="border-b px-4 py-4">
                    <SheetTitle className="flex items-center gap-2 text-left">
                      <span className="inline-flex size-7 items-center justify-center bg-primary text-black font-black text-sm">C</span>
                      <span className="font-black">CRAZZZY</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col h-full overflow-y-auto">
                    <div className="p-4 space-y-1">

                      {/* Theme toggle */}
                      <div className="flex items-center justify-between px-3 py-3 border-b border-border/20 mb-2">
                        <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Theme</p>
                        <ThemeToggle variant="outline" />
                      </div>

                      <Link href="/" className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                        HOME
                      </Link>
                      <Link href="/shop" className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                        SHOP ALL
                      </Link>

                      {/* Category links */}
                      <div className="pt-3">
                        <p className="px-3 text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-2">Categories</p>
                        <div className="space-y-1">
                          {categories.map((c) => (
                            <Link
                              key={c.id}
                              href={`/shop/${c.slug}`}
                              className="block rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 space-y-1 border-t border-border/20">
                        <Link href="/track" className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                          TRACK ORDER
                        </Link>
                        <Link href="/contact" className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                          CONTACT
                        </Link>
                      </div>

                      {/* Auth section in mobile menu */}
                      <div className="pt-3 border-t border-border/20">
                        {isLoaded && isSignedIn ? (
                          <div className="flex items-center gap-3 px-3 py-2">
                      <UserButton />
                            <Link href="/account/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                              My Account
                            </Link>
                          </div>
                        ) : (
                          <Link href="/account" className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                            SIGN IN
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
