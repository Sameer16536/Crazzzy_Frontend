export const loadRazorpay = () => {
  return new Promise((resolve) => {
    // Avoid loading the script twice
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  image?: string
  order_id: string
  handler: (response: any) => void
  prefill: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme: {
    color: string
  }
  /** Optional: called when the user dismisses the Razorpay modal without paying */
  onDismiss?: () => void
}

export const openRazorpay = async (options: RazorpayOptions): Promise<void> => {
  const isLoaded = await loadRazorpay()

  if (!isLoaded) {
    throw new Error('Razorpay SDK failed to load. Please check your internet connection.')
  }

  return new Promise<void>((resolve) => {
    const { onDismiss, ...rzpOptions } = options

    const rzp = new (window as any).Razorpay({
      ...rzpOptions,
      modal: {
        ondismiss: () => {
          onDismiss?.()
          resolve() // Always resolve so the caller's finally block runs
        },
      },
    })

    rzp.on('payment.failed', (response: any) => {
      // The handler above won't fire on failure; resolve so loading resets
      resolve()
    })

    rzp.open()
  })
}
