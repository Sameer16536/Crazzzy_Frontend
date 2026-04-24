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
                    <div className="relative size-20 sm:size-24 rounded-lg overflow-hidden bg-muted border border-border/30">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
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
              <h2 className="text-lg font-bold text-foreground">Order summary</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-semibold tabular-nums">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground font-semibold tabular-nums">
                    {shipping === 0 ? 'Free' : formatINR(shipping)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="text-foreground font-bold">Total</span>
                  <span className="text-foreground font-bold tabular-nums">{formatINR(total)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button className="w-full" disabled={items.length === 0}>
                  Checkout
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/shop">Continue shopping</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                This is a frontend demo checkout. Payment APIs will be wired once the backend is ready.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

