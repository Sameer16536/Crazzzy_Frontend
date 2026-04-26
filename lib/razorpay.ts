export const loadRazorpay = () => {
  return new Promise((resolve) => {
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
}

export const openRazorpay = async (options: RazorpayOptions) => {
  const isLoaded = await loadRazorpay()

  if (!isLoaded) {
    alert('Razorpay SDK failed to load. Are you online?')
    return
  }

  const rzp = new (window as any).Razorpay(options)
  rzp.open()
}
