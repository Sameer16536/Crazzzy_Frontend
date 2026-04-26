'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { clearCart } from '@/lib/store/slices/cart-slice'
import { api } from '@/lib/api-client'
import { openRazorpay } from '@/lib/razorpay'
import { toast } from 'sonner'
import { Loader2, CreditCard, ChevronRight, CheckCircle2, ShieldCheck, Phone } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, loading: authLoading } = useAuth()
  const items = useAppSelector((s) => s.cart.items)

  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingAddresses, setFetchingAddresses] = useState(false)

  // Phone number is mandatory per backend validation
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  })

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout')
    }
  }, [authLoading, user, router])

  // ── Cart guard (runs separately so it doesn't block address fetch) ──────────
  useEffect(() => {
    if (!authLoading && user && items.length === 0) {
      router.push('/cart')
    }
  }, [authLoading, user, items, router])

  // ── Fetch addresses once user is confirmed ──────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    try {
      setFetchingAddresses(true)
      const data = await api.get<any>('/users/addresses')
      // Backend returns: { success: true, addresses: [...] }
      const list: any[] = Array.isArray(data?.addresses) ? data.addresses : (Array.isArray(data) ? data : [])
      setAddresses(list)

      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0]
        setSelectedAddressId(Number(defaultAddr.id))
        setShowNewAddressForm(false)
      } else {
        setShowNewAddressForm(true)
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err)
      toast.error('Could not load your saved addresses. Please add one below.')
      setShowNewAddressForm(true)
    } finally {
      setFetchingAddresses(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      fetchAddresses()
    }
  }, [authLoading, user, fetchAddresses])

  // ── Save new address ────────────────────────────────────────────────────────
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await api.post<any>('/users/addresses', newAddress)
      // Backend returns: { success: true, address: { id, ... } }
      const newId = result?.address?.id || result?.id
      // Re-fetch to get the canonical list from the server
      await fetchAddresses()
      // Select the newly created address
      if (newId) setSelectedAddressId(Number(newId))
      setShowNewAddressForm(false)
      toast.success(`"${newAddress.label}" address saved!`)
      setNewAddress({ label: 'Home', street: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false })
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  // ── Validate phone number ───────────────────────────────────────────────────
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s+/g, '')
    if (!cleaned) { setPhoneError('Phone number is required'); return false }
    if (!/^[6-9]\d{9}$/.test(cleaned)) { setPhoneError('Enter a valid 10-digit Indian mobile number'); return false }
    setPhoneError('')
    return true
  }

  // ── Initiate checkout ───────────────────────────────────────────────────────
  const handleCheckout = async () => {
    // Validate address
    if (!selectedAddressId) {
      toast.error('Please select a shipping address first')
      document.getElementById('address-section')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    // Validate phone
    if (!validatePhone(phoneNumber)) {
      toast.error('Please enter a valid phone number')
      document.getElementById('phone-input')?.focus()
      return
    }

    setLoading(true)
    try {
      // 1. Create order — backend returns: { orderId, razorpay: { key_id, razorpay_order_id, amount, currency } }
      const orderData = await api.post<any>('/create-order', {
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: i.quantity,
          ...(i.variants ? { variantId: Object.values(i.variants)[0] } : {}),
        })),
        addressId: selectedAddressId, // Already a number
        phoneNumber: phoneNumber.replace(/\s+/g, ''),
      })

      const { orderId, razorpay: rpData } = orderData

      // 2. Open Razorpay — map the correct response fields
      await openRazorpay({
        key: rpData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: rpData.amount,
        currency: rpData.currency,
        name: 'Crazzzy.in',
        description: `Order #${orderId}`,
        order_id: rpData.razorpay_order_id,
        handler: async (response: any) => {
          try {
            // 3. Verify payment
            await api.post('/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            })
            toast.success('🎉 Payment successful! Your order is confirmed.')
            dispatch(clearCart())
            router.push(`/account/orders/${orderId}`)
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed. Contact support.')
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: phoneNumber },
        theme: { color: '#d4af37' },
      })
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = subtotal >= 1999 ? 0 : 99
  const total = subtotal + shipping

  const isReadyToPay = !!selectedAddressId && !!phoneNumber && !phoneError

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 mb-8">
          <span>Cart</span>
          <ChevronRight size={10} />
          <span className="text-white">Checkout</span>
          <ChevronRight size={10} />
          <span>Payment</span>
        </div>

        <h1 className="text-4xl font-bold uppercase tracking-tight mb-12">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── Left: Steps ───────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-12">

            {/* Step 1: Shipping Address */}
            <section id="address-section" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold transition-colors ${selectedAddressId ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/10 text-white/40'}`}>1</div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">Shipping Address</h2>
                </div>
                {!showNewAddressForm && addresses.length > 0 && addresses.length < 3 && (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                  >
                    + Add New
                  </button>
                )}
              </div>

              {fetchingAddresses ? (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/10 gap-3">
                  <Loader2 className="animate-spin text-primary" size={24} />
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Loading your saved addresses...</p>
                </div>

              ) : showNewAddressForm ? (
                /* ── New Address Form ── */
                <form onSubmit={handleAddAddress} className="bg-zinc-900/50 border border-white/5 p-8 space-y-6">
                  {/* Label Picker */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Address Label</label>
                    <div className="flex flex-wrap gap-3">
                      {['Home', 'Office', 'Other'].map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setNewAddress({ ...newAddress, label: l })}
                          className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            newAddress.label === l
                              ? 'bg-primary text-black border-primary'
                              : 'bg-black text-white/40 border-white/10 hover:border-white/30'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Street Address</label>
                      <input
                        required
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors"
                        placeholder="Unit 5A/7, Kopargaon, Sector 8"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">City</label>
                      <input
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors"
                        placeholder="Navi Mumbai"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">State</label>
                      <input
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Postal Code</label>
                      <input
                        required
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        className="w-full bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors"
                        placeholder="410206"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary text-black px-8 py-3 font-bold uppercase tracking-wider text-[10px] active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save & Use This Address'}
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-white/40 hover:text-white px-8 py-3 font-bold uppercase tracking-wider text-[10px]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

              ) : (
                /* ── Saved Address Cards ── */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.slice(0, 3).map((addr) => {
                    const isSelected = selectedAddressId === Number(addr.id)
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => setSelectedAddressId(Number(addr.id))}
                        className={`text-left p-6 border transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary/5 border-primary shadow-[0_0_20px_rgba(212,175,55,0.1)]'
                            : 'bg-zinc-900/30 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${
                            isSelected ? 'bg-primary text-black border-primary' : 'bg-white/5 text-white/40 border-white/10'
                          }`}>
                            {addr.label || 'Home'}
                          </span>
                          {isSelected && <CheckCircle2 className="text-primary" size={18} />}
                        </div>
                        <p className="font-bold text-sm mb-1 text-white">{addr.street}</p>
                        <p className="text-xs text-white/40">{addr.city}, {addr.state} — {addr.postalCode}</p>
                      </button>
                    )
                  })}

                  {addresses.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(true)}
                      className="border border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all p-6 flex flex-col items-center justify-center gap-3 text-white/20 hover:text-primary"
                    >
                      <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center">
                        <span className="text-xl leading-none">+</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Add New Address</span>
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Step 2: Contact Phone (mandatory) */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold transition-colors ${selectedAddressId ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/10 text-white/40'}`}>2</div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">Contact Number</h2>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Required for delivery coordination</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Mobile Number</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white/30 group-focus-within:text-primary transition-colors">
                    <Phone size={14} />
                    <span className="text-xs font-mono">+91</span>
                  </div>
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setPhoneNumber(val)
                      if (phoneError) validatePhone(val)
                    }}
                    onBlur={() => validatePhone(phoneNumber)}
                    className={`w-full bg-zinc-900/50 border px-16 py-4 text-sm font-mono focus:outline-none transition-colors ${
                      phoneError ? 'border-red-500/60' : 'border-white/10 focus:border-primary/60'
                    }`}
                    placeholder="9876543210"
                  />
                </div>
                {phoneError && (
                  <p className="text-[10px] text-red-400 uppercase tracking-wider font-bold">{phoneError}</p>
                )}
              </div>
            </section>

            {/* Step 3: Payment Method */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold transition-colors ${isReadyToPay ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/10 text-white/40'}`}>3</div>
                <h2 className={`text-xl font-bold uppercase tracking-tight transition-opacity ${isReadyToPay ? 'opacity-100' : 'opacity-40'}`}>Payment Method</h2>
              </div>
              <div className={`bg-zinc-900/30 border p-6 flex items-center justify-between transition-all ${isReadyToPay ? 'border-primary/30' : 'border-white/5 opacity-50'}`}>
                <div className="flex items-center gap-4">
                  <CreditCard className={isReadyToPay ? 'text-primary' : 'text-white/20'} />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider">Razorpay Secure</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">UPI · Cards · Net Banking · Wallets</p>
                  </div>
                </div>
                <span className="text-[10px] text-primary uppercase font-bold">Selected</span>
              </div>
            </section>

          </div>

          {/* ── Right: Order Summary ──────────────────────────────────── */}
          <div className="lg:col-span-4">
            <div className="bg-zinc-900/50 border border-white/5 p-8 sticky top-24 space-y-8">
              <h3 className="font-bold uppercase tracking-widest text-xs border-b border-white/5 pb-4">Order Summary</h3>

              <div className="space-y-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-white border border-black/5 shrink-0 p-3">
                      <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill className="object-contain" />
                      <span className="absolute -top-2 -right-2 bg-primary text-black w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full border-2 border-black shadow-lg">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-tight truncate">{item.name}</p>
                      <p className="text-[10px] text-white/40 mt-1 font-mono">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs text-white/40">
                  <span className="uppercase tracking-widest">Subtotal</span>
                  <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-white/40">
                  <span className="uppercase tracking-widest">Shipping</span>
                  <span className={`font-mono ${shipping === 0 ? 'text-primary' : ''}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-white/20 uppercase tracking-wider">Free shipping on orders ₹1,999+</p>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-4">
                  <span className="uppercase tracking-tight">Total</span>
                  <span className="text-primary font-mono">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Readiness Checklist */}
              <div className="space-y-2 border border-white/5 p-4">
                <p className="text-[9px] uppercase tracking-widest text-white/20 mb-3">Checkout Status</p>
                <div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider ${selectedAddressId ? 'text-primary' : 'text-white/30'}`}>
                  <CheckCircle2 size={12} className={selectedAddressId ? 'opacity-100' : 'opacity-20'} />
                  Shipping Address
                </div>
                <div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider ${phoneNumber && !phoneError ? 'text-primary' : 'text-white/30'}`}>
                  <CheckCircle2 size={12} className={phoneNumber && !phoneError ? 'opacity-100' : 'opacity-20'} />
                  Contact Number
                </div>
                <div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider text-primary`}>
                  <CheckCircle2 size={12} />
                  Payment Method
                </div>
              </div>

              {/* Complete Payment Button */}
              <button
                disabled={loading}
                onClick={handleCheckout}
                className={`
                  w-full py-5 uppercase tracking-[0.15em] text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-3 font-bold
                  ${loading
                    ? 'bg-zinc-800 text-white/20 cursor-not-allowed'
                    : isReadyToPay
                    ? 'bg-primary hover:bg-primary/90 text-black shadow-[0_0_30px_rgba(212,175,55,0.25)]'
                    : 'bg-zinc-900 border border-white/10 text-white/50 hover:border-primary/40 cursor-pointer'}
                `}
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={18} /> Processing...</>
                ) : !selectedAddressId ? (
                  <><CreditCard size={18} /> Select an Address</>
                ) : !phoneNumber || phoneError ? (
                  <><Phone size={18} /> Enter Your Phone</>
                ) : (
                  <><CreditCard size={18} /> Complete Payment</>
                )}
              </button>

              <div className="flex items-start gap-3 text-white/20">
                <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed">
                  Secured by Razorpay. Your payment details are never stored on our servers.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
