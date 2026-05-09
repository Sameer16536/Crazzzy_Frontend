import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export type CartItem = {
  productId: string
  variantId?: number
  variantName?: string
  name: string
  image?: string
  price: number
  quantity: number
  /** Category slug – used for combo offer eligibility checks */
  categorySlug?: string
  /** If part of a fixed bundle deal */
  bundleId?: string | number
  /** Total price for the entire bundle (shared across items) */
  bundlePrice?: number
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
    i.productId === next.productId && 
    i.variantId === next.variantId &&
    i.bundleId === next.bundleId
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
    addBundle(state, action: PayloadAction<{ bundleId: string | number; price: number; items: Omit<CartItem, 'quantity' | 'bundleId' | 'bundlePrice'>[] }>) {
      const { bundleId, price, items } = action.payload
      // Each item in the bundle is added with quantity 1
      items.forEach(item => {
        state.items.push({
          ...item,
          quantity: 1,
          bundleId,
          bundlePrice: price
        })
      })
      state.lastUpdatedAt = Date.now()
    },
  },
})

export const { addToCart, removeFromCart, setQuantity, clearCart, hydrateFromCookie, addBundle } = cartSlice.actions
export default cartSlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────

/**
 * Compute key for grouping items by product + variant (same offer group).
 */
function comboKey(item: CartItem) {
  return `${item.productId}__${item.variantId ?? 'base'}`
}

export interface ComboOfferResult {
  /** Total free units across all wall-poster variant groups */
  totalFreeUnits: number
  /** How many ₹0 units apply per variant key */
  freeByKey: Record<string, number>
  /** Total savings from the Buy-2-Get-1-Free offer (in ₹) */
  totalSavings: number
}

/**
 * selectComboOffer — Buy 2 same-variant Wall Posters, Get 1 FREE.
 * Continuous: buy 4 → 2 free, buy 6 → 3 free, etc.
 * Only applies to Wall Posters (categorySlug === 'wall-posters').
 */
export function selectComboOffer(state: RootState): ComboOfferResult {
  const items = state.cart.items
  const wallPosters = items.filter(i => 
    (i.categorySlug === 'wall-posters' || i.name.toLowerCase().includes('poster')) && 
    !i.bundleId
  )
  
  // Group by variant (e.g. "13 x 19") normalized
  const groups: Record<string, { totalQuantity: number, items: CartItem[] }> = {}
  
  for (const item of wallPosters) {
    const key = (item.variantName || 'base').replace(/\s+/g, '').toUpperCase()
    if (!groups[key]) groups[key] = { totalQuantity: 0, items: [] }
    groups[key].totalQuantity += item.quantity
    groups[key].items.push(item)
  }

  const freeByKey: Record<string, number> = {}
  let totalFreeUnits = 0
  let totalSavings = 0

  for (const variantKey in groups) {
    const { totalQuantity, items: groupItems } = groups[variantKey]
    const freeCount = Math.floor(totalQuantity / 3)
    
    if (freeCount > 0) {
      totalFreeUnits += freeCount
      // Calculate savings based on the actual items in the group
      // For simplicity, we assume same variant posters have similar prices, 
      // but we apply the discount to the items we mark as free.
      let remainingFree = freeCount
      
      // Sort items by price ascending to ensure the cheapest ones are "free"
      const sortedItems = [...groupItems].sort((a, b) => a.price - b.price)
      
      for (const item of sortedItems) {
        if (remainingFree <= 0) break
        const take = Math.min(item.quantity, remainingFree)
        const itemKey = `${item.productId}__${item.variantId ?? 'base'}`
        freeByKey[itemKey] = (freeByKey[itemKey] || 0) + take
        totalSavings += take * item.price
        remainingFree -= take
      }
    }
  }

  return { totalFreeUnits, freeByKey, totalSavings }
}

/** Returns true if this specific cart item has at least 1 free unit from the combo offer */
export function selectItemFreeCount(state: RootState, item: CartItem): number {
  const { freeByKey } = selectComboOffer(state)
  const key = `${item.productId}__${item.variantId ?? 'base'}`
  return freeByKey[key] || 0
}
