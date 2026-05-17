'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { clearCart, removeFromCart, setQuantity, calculateComboOffer, calculateProductOffers } from '@/lib/store/slices/cart-slice'
import { useCatalog } from '@/lib/catalog/catalog-context'
import { Minus, Plus, Trash2, Gift, Tag, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatINR(value: number) {
  return `₹${Math.max(0, value).toLocaleString('en-IN')}`
}

export default function CartPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.cart.items)
  const { data: catalogData } = useCatalog()
  const offers = catalogData?.categoryOffers || []
  const categories = catalogData?.categories || []
  const productOffers = catalogData?.productOffers || []
  const products = catalogData?.products || []

  const comboOffer = calculateComboOffer(items, offers, categories)
  const productOfferResult = calculateProductOffers(items, productOffers, products)

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

  const totalPromoSavings = comboOffer.totalSavings + productOfferResult.totalSavings
  const subtotal = regularSubtotal + bundlesTotal
  const discountedSubtotal = subtotal - totalPromoSavings
  const shipping = discountedSubtotal >= 999 ? 0 : items.length > 0 ? 99 : 0
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

        {/* ── Automatic Offer Applied Banner ── */}
        {totalPromoSavings > 0 && (
          <div className="mt-6 flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg px-5 py-4">
            <Gift size={18} className="text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-black text-primary uppercase tracking-widest">
                🎉 Automatic Discount Applied!
              </p>
              <p className="text-xs text-primary/70 mt-0.5">
                Offers applied to your items — you save {formatINR(totalPromoSavings)} in total!
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-primary">-{formatINR(totalPromoSavings)}</span>
          </div>
        )}

        {/* ── Product Offers Freebie Suggestions ── */}
        {productOfferResult.suggestions && productOfferResult.suggestions.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-1.5 pl-1">
              <Sparkles size={12} className="animate-pulse" /> Unlock Free Gift suggestions:
            </p>
            {productOfferResult.suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 bg-card/65 dark:bg-neutral-900/65 border border-primary/25 rounded-xl px-5 py-4 hover:border-primary/45 hover:bg-primary/[0.03] transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-11 sm:size-12 rounded-lg bg-white border border-black/5 overflow-hidden relative flex-shrink-0">
                    {suggestion.freeProductImage ? (
                      <Image src={suggestion.freeProductImage} alt={suggestion.freeProductName} fill className="object-contain p-1" />
                    ) : (
                      <Gift size={16} className="text-primary m-auto absolute inset-0" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-foreground leading-snug truncate uppercase">{suggestion.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Qualified by adding "{suggestion.triggerProductName}" to your cart.</p>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-wider text-[9px] h-8 px-3 shrink-0">
                  <Link href={`/product/${suggestion.freeProductSlug}`}>Add Freebie</Link>
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* ── Category Offer Upsell Banner ── */}
        {comboOffer.upsell && (
          <div className="mt-6 flex items-center gap-4 bg-primary/[0.03] border border-primary/10 rounded-xl px-6 py-5 group hover:bg-primary/[0.06] transition-all cursor-default">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles size={20} className="text-primary" />
            </div>
            <p className="text-sm md:text-base text-foreground/80 font-medium leading-relaxed tracking-tight">
              Psst! Add <span className="text-primary font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded ml-1 mr-1">{comboOffer.upsell.needed} more</span> 
              {" "}<span className="text-foreground font-black underline decoration-primary/40 underline-offset-4">{comboOffer.upsell.variantName}</span> 
              {" "}item{comboOffer.upsell.needed > 1 ? 's' : ''} to unlock your next <span className="text-primary font-black uppercase tracking-[0.1em] drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">FREE</span> item!
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
                const itemKey = `${item.productId}__${item.variantId ?? 'base'}`
                const catFree = comboOffer.freeByKey[itemKey] || 0
                const prodFree = productOfferResult.freeByKey[itemKey] || 0
                const freeCount = catFree + prodFree
                const offerMeta = comboOffer.itemOffers[itemKey] || productOfferResult.itemOffers[itemKey]

                return (
                  <Card key={`${item.productId}-${item.variantId || 'base'}-${item.bundleId || 'none'}-${idx}`} className="p-4 sm:p-5">
                    <div className="flex gap-4">
                      <Link 
                        href={`/product/${item.slug || item.productId}`}
                        className="relative size-20 sm:size-24 rounded-lg overflow-hidden bg-white border border-black/5 p-4 hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0"
                      >
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-contain" />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
                            Image
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link href={`/product/${item.slug || item.productId}`} className="font-semibold text-foreground truncate uppercase hover:text-primary transition-colors cursor-pointer block">
                              {item.name}
                            </Link>
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
                                  {freeCount} FREE ({offerMeta?.label || 'Special Promotion'})
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
                              onClick={() => dispatch(removeFromCart({ productId: item.productId, variantId: item.variantId, bundleId: item.bundleId }))}
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
                              onClick={() => dispatch(setQuantity({ productId: item.productId, variantId: item.variantId, bundleId: item.bundleId, quantity: item.quantity - 1 }))}
                            >
                              <Minus />
                            </Button>
                            <span className="px-3 text-sm font-semibold tabular-nums">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Increase quantity"
                              onClick={() => dispatch(setQuantity({ productId: item.productId, variantId: item.variantId, bundleId: item.bundleId, quantity: item.quantity + 1 }))}
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

                {/* Combined offer discount line */}
                {totalPromoSavings > 0 && (
                  <div className="flex justify-between text-primary">
                    <span className="uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <Gift size={12} /> Promo discount applied
                    </span>
                    <span className="font-mono font-bold">-{formatINR(totalPromoSavings)}</span>
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
                * Free shipping on orders above ₹999. Automatic discounts apply based on active product/category promotions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
