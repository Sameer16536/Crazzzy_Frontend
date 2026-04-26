'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { clearCart, removeFromCart, setQuantity } from '@/lib/store/slices/cart-slice'
import { Minus, Plus, Trash2 } from 'lucide-react'

function formatINR(value: number) {
  return `₹${Math.max(0, value).toLocaleString('en-IN')}`
}

export default function CartPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.cart.items)

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = subtotal >= 1999 ? 0 : items.length > 0 ? 99 : 0
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Cart</h1>
            <p className="text-muted-foreground mt-2">Review your items and checkout when you’re ready.</p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={() => dispatch(clearCart())}>
              Clear cart
            </Button>
          )}
        </div>

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
              items.map((item) => (
                <Card key={item.productId} className="p-4 sm:p-5">
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
                          <p className="font-semibold text-foreground truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{formatINR(item.price)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Remove item"
                          onClick={() => dispatch(removeFromCart({ productId: item.productId }))}
                        >
                          <Trash2 />
                        </Button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="inline-flex items-center rounded-lg border border-border/40 bg-muted">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Decrease quantity"
                            onClick={() => dispatch(setQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                          >
                            <Minus />
                          </Button>
                          <span className="px-3 text-sm font-semibold tabular-nums">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Increase quantity"
                            onClick={() => dispatch(setQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                          >
                            <Plus />
                          </Button>
                        </div>

                        <p className="font-semibold text-foreground tabular-nums">
                          {formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="p-5 sticky top-24">
              <h2 className="text-xl font-black uppercase tracking-tight text-white mb-6">Order summary</h2>
              <div className="space-y-4 text-xs">
                <div className="flex justify-between text-white/40">
                  <span className="uppercase tracking-widest">Subtotal</span>
                  <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span className="uppercase tracking-widest">Shipping</span>
                  <span className="font-mono text-white">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <Separator className="bg-white/5" />
                <div className="flex justify-between text-lg font-black pt-2">
                  <span className="uppercase tracking-tighter text-white">Total</span>
                  <span className="text-primary font-mono">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <Link
                  href="/checkout"
                  className={`
                    w-full py-5 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3
                    ${items.length === 0 ? 'opacity-30 pointer-events-none grayscale' : ''}
                  `}
                >
                  Proceed to Checkout
                </Link>
                <Link 
                  href="/shop" 
                  className="w-full py-4 border border-white/10 hover:border-white/30 text-white/40 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center"
                >
                  Continue Shopping
                </Link>
              </div>

              <p className="text-[10px] text-white/20 mt-6 leading-relaxed font-light italic">
                * Free shipping on orders above ₹1,999. Items are held for 15 minutes once checkout is initiated.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

