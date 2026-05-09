'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { clearCart, removeFromCart, setQuantity, selectComboOffer } from '@/lib/store/slices/cart-slice'
import { Minus, Plus, Trash2, Gift, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatINR(value: number) {
  return `₹${Math.max(0, value).toLocaleString('en-IN')}`
}

export default function CartPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.cart.items)
  const comboOffer = useAppSelector(selectComboOffer)

  // Compute subtotal after combo offer discount
  // Compute subtotal after combo offer discount and fixed bundles
  const regularSubtotal = items.filter(i => !i.bundleId).reduce((sum, i) => sum + i.price * i.quantity, 0)
  
  // Calculate unique bundle totals
  const processedBundles = new Set<string | number>()
  const bundlesTotal = items.filter(i => i.bundleId).reduce((sum, i) => {
    if (i.bundleId && !processedBundles.has(i.bundleId)) {
      processedBundles.add(i.bundleId)
      return sum + (i.bundlePrice || 0)
    }
    return sum
  }, 0)

  const comboDiscount = comboOffer.totalSavings
  const subtotal = regularSubtotal + bundlesTotal
  const discountedSubtotal = subtotal - comboDiscount
  const shipping = discountedSubtotal >= 1999 ? 0 : items.length > 0 ? 99 : 0
  const total = discountedSubtotal + shipping

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Cart</h1>
            <p className="text-muted-foreground mt-2">Review your items and checkout when you're ready.</p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={() => dispatch(clearCart())}>
              Clear cart
            </Button>
          )}
        </div>

        {/* ── Combo Offer Banner ── */}
        {comboOffer.totalFreeUnits > 0 && (
          <div className="mt-6 flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg px-5 py-4">
            <Gift size={18} className="text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-black text-primary uppercase tracking-widest">
                🎉 Buy 2 Get 1 Free Applied!
              </p>
              <p className="text-xs text-primary/70 mt-0.5">
                {comboOffer.totalFreeUnits} poster{comboOffer.totalFreeUnits > 1 ? 's' : ''} free — you save {formatINR(comboOffer.totalSavings)}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-primary">-{formatINR(comboOffer.totalSavings)}</span>
          </div>
        )}

        {/* Promo hint when posters are in cart but not yet eligible */}
        {comboOffer.totalFreeUnits === 0 && items.some(i => i.categorySlug === 'wall-posters') && (
          <div className="mt-6 flex items-center gap-3 bg-muted/40 border border-border/50 rounded-lg px-5 py-3">
            <Tag size={16} className="text-primary/60 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">Buy 2 Get 1 Free</span> on Wall Posters (same size). Add more to unlock!
            </p>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <Card className="p-8">
                <p className="text-foreground font-semibold">Your cart is empty.</p>
                <p className="text-muted-foreground text-sm mt-2">Add something beautiful to it.</p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/shop">Continue shopping</Link>
                  </Button>
                </div>
              </Card>
            ) : (
              items.map((item, idx) => {
                const freeCount = comboOffer.freeByKey[`${item.productId}__${item.variantId ?? 'base'}`] ?? 0
                return (
                  <Card key={`${item.productId}-${item.variantId || 'base'}-${item.bundleId || 'none'}-${idx}`} className="p-4 sm:p-5">
                    <div className="flex gap-4">
                      <div className="relative size-20 sm:size-24 rounded-lg overflow-hidden bg-white border border-black/5 p-4">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-contain" />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
                            Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate uppercase">{item.name}</p>
                            {item.variantName ? (
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{item.variantName}</p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Base Variant</p>
                            )}
                            {item.bundleId && (
                              <div className="mt-2 inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                                <Gift size={10} className="text-primary" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Bundle Item</span>
                              </div>
                            )}

                            {/* Free unit badge */}
                            {freeCount > 0 && (
                              <div className="mt-1.5 inline-flex items-center gap-1.5 bg-primary/15 text-primary border border-primary/30 rounded-full px-2.5 py-0.5">
                                <Gift size={11} />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {freeCount} FREE (Buy 2 Get 1)
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right flex flex-col justify-between">
                            <p className={cn("text-xs font-mono font-bold", item.bundleId ? "line-through text-muted-foreground" : "text-foreground")}>
                              {formatINR(item.price)}
                            </p>
                            {item.bundleId && (
                              <p className="text-[10px] font-mono font-bold text-primary">BUNDLE</p>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Remove item"
                              onClick={() => dispatch(removeFromCart({ productId: item.productId, variantId: item.variantId }))}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="inline-flex items-center rounded-lg border border-border/40 bg-muted">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Decrease quantity"
                              onClick={() => dispatch(setQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity - 1 }))}
                            >
                              <Minus />
                            </Button>
                            <span className="px-3 text-sm font-semibold tabular-nums">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Increase quantity"
                              onClick={() => dispatch(setQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity + 1 }))}
                            >
                              <Plus />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-foreground tabular-nums">
                              {formatINR(item.price * (item.quantity - freeCount))}
                            </p>
                            {freeCount > 0 && (
                              <p className="text-[10px] text-primary line-through opacity-60">
                                {formatINR(item.price * item.quantity)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="p-8 sticky top-24 bg-card/80 dark:bg-neutral-900/80 backdrop-blur-md border border-border/50 rounded-none space-y-10 shadow-2xl shadow-black/5">
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground mb-2">Order summary</h2>
              <div className="space-y-6 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span className="uppercase tracking-widest font-bold">Subtotal</span>
                  <span className="font-mono text-foreground font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Combo offer discount line */}
                {comboDiscount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span className="uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <Gift size={12} /> Buy 2 Get 1 Free
                    </span>
                    <span className="font-mono font-bold">-{formatINR(comboDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span className="uppercase tracking-widest font-bold">Shipping</span>
                  <span className="font-mono text-foreground font-bold">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between text-xl font-black pt-2">
                  <span className="uppercase tracking-normal text-foreground">Total</span>
                  <span className="text-primary font-mono">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/checkout"
                  className={`
                    w-full py-5 bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-[0.1em] text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-primary/10 whitespace-nowrap
                    ${items.length === 0 ? 'opacity-30 pointer-events-none grayscale' : ''}
                  `}
                >
                  Proceed to Checkout
                </Link>
                <Link 
                  href="/shop" 
                  className="w-full py-2 text-muted-foreground/40 hover:text-primary font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center group"
                >
                  <span className="group-hover:scale-105 transition-transform">Continue Shopping</span>
                </Link>
              </div>

              <p className="text-[10px] text-muted-foreground/40 mt-6 leading-relaxed font-light italic">
                * Free shipping on orders above ₹1,999. Buy 2 Wall Posters of the same size and get 1 FREE.
              </p>
              </div>
          </div>
        </div>
      </section>
    </div>
  )
}
