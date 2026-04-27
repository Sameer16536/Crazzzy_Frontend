import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type CartItem = {
  productId: string
  variantId?: number
  variantName?: string
  name: string
  image?: string
  price: number
  quantity: number
}

type CartState = {
  items: CartItem[]
  lastUpdatedAt: number | null
}

const initialState: CartState = {
  items: [],
  lastUpdatedAt: null,
}

function upsertItem(items: CartItem[], next: Omit<CartItem, 'quantity'> & { quantity?: number }) {
  const idx = items.findIndex((i) => 
    i.productId === next.productId && i.variantId === next.variantId
  )
  const addQty = next.quantity ?? 1
  if (idx === -1) {
    items.push({ ...next, quantity: Math.max(1, addQty) })
    return
  }
  items[idx] = { ...items[idx], ...next, quantity: Math.max(1, items[idx].quantity + addQty) }
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateFromCookie(state, action: PayloadAction<{ items: CartItem[] }>) {
      state.items = Array.isArray(action.payload.items) ? action.payload.items : []
      state.lastUpdatedAt = Date.now()
    },
    addToCart(state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) {
      upsertItem(state.items, action.payload)
      state.lastUpdatedAt = Date.now()
    },
    setQuantity(state, action: PayloadAction<{ productId: string; variantId?: number; quantity: number }>) {
      const item = state.items.find((i) => 
        i.productId === action.payload.productId && i.variantId === action.payload.variantId
      )
      if (!item) return
      item.quantity = Math.max(1, Math.floor(action.payload.quantity))
      state.lastUpdatedAt = Date.now()
    },
    removeFromCart(state, action: PayloadAction<{ productId: string; variantId?: number }>) {
      state.items = state.items.filter((i) => 
        !(i.productId === action.payload.productId && i.variantId === action.payload.variantId)
      )
      state.lastUpdatedAt = Date.now()
    },
    clearCart(state) {
      state.items = []
      state.lastUpdatedAt = Date.now()
    },
  },
})

export const { addToCart, removeFromCart, setQuantity, clearCart, hydrateFromCookie } = cartSlice.actions
export default cartSlice.reducer

