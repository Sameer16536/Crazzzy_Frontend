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
  /** Total free units across all variant groups */
  totalFreeUnits: number
  /** How many ₹0 units apply per item key */
  freeByKey: Record<string, number>
  /** Metadata about the offer applied to each item key */
  itemOffers: Record<string, { buy: number; get: number; label: string }>
  /** Total savings from all offers (in ₹) */
  totalSavings: number
  /** Upsell message: how many more items needed for next free unit */
  upsell?: {
    needed: number
    variantName: string
  }
}

/** 
 * Actual implementation that takes offers and category metadata as arguments
 */
export function calculateComboOffer(
  items: CartItem[], 
  offers: CategoryOffer[],
  categories: CatalogCategory[]
): ComboOfferResult {
  const freeByKey: Record<string, number> = {}
  const itemOffers: Record<string, { buy: number; get: number; label: string }> = {}
  let totalFreeUnits = 0
  let totalSavings = 0
  let upsell: ComboOfferResult['upsell'] = undefined

  // Active offers mapped by category slug
  const offerMap: Record<string, CategoryOffer> = {}
  offers.filter(o => o.isActive).forEach(o => {
    offerMap[o.categorySlug] = o
  })

  // Helper to find best matching offer (self or ancestor)
  const getOfferForCategory = (slug: string | undefined): CategoryOffer | null => {
    if (!slug) return null
    
    // 1. Direct match
    if (offerMap[slug]) return offerMap[slug]
    
    // 2. Ancestor match
    let currentCat = categories.find(c => c.slug === slug)
    while (currentCat?.parentId) {
      const parent = categories.find(c => c.id === currentCat?.parentId)
      if (parent && offerMap[parent.slug]) return offerMap[parent.slug]
      currentCat = parent
    }
    
    return null
  }

  // Group items by Category-with-Offer + Variant
  const groupMap: Record<string, { totalQuantity: number, items: CartItem[], offer: CategoryOffer }> = {}

  for (const item of items) {
    if (item.bundleId) continue
    
    // Find matching offer (including inheritance)
    const offer = getOfferForCategory(item.categorySlug)
    
    if (!offer) continue

    const variantKey = (item.variantName || 'base').replace(/\s+/g, '').toUpperCase()
    const groupKey = `${offer.categorySlug}__${variantKey}`

    if (!groupMap[groupKey]) {
      groupMap[groupKey] = { totalQuantity: 0, items: [], offer }
    }
    groupMap[groupKey].totalQuantity += item.quantity
    groupMap[groupKey].items.push(item)
  }

  for (const key in groupMap) {
    const { totalQuantity, items: groupItems, offer } = groupMap[key]
    const cycle = offer.buyQuantity + offer.getQuantity
    const freeCount = Math.floor(totalQuantity / cycle) * offer.getQuantity
    
    // Upsell logic
    const needed = cycle - (totalQuantity % cycle)
    if (needed > 0 && needed < cycle) {
      if (!upsell || (needed / cycle) < (upsell.needed / 3)) { // Prioritize closer milestones
        upsell = { 
          needed, 
          variantName: `${groupItems[0].variantName || 'Standard'} ${offer.categorySlug.replace('-', ' ').toUpperCase()}` 
        }
      }
    }

    if (freeCount > 0) {
      totalFreeUnits += freeCount
      let remainingFree = freeCount
      const sortedItems = [...groupItems].sort((a, b) => a.price - b.price)
      
      for (const item of sortedItems) {
        if (remainingFree <= 0) break
        const take = Math.min(item.quantity, remainingFree)
        const itemKey = `${item.productId}__${item.variantId ?? 'base'}`
        freeByKey[itemKey] = (freeByKey[itemKey] || 0) + take
        itemOffers[itemKey] = { 
          buy: offer.buyQuantity, 
          get: offer.getQuantity,
          label: `Buy ${offer.buyQuantity} Get ${offer.getQuantity}`
        }
        totalSavings += take * item.price
        remainingFree -= take
      }
    }
  }

  return { totalFreeUnits, freeByKey, itemOffers, totalSavings, upsell }
}


/** Returns true if this specific cart item has at least 1 free unit from the combo offer */
export function selectItemFreeCount(state: RootState, item: CartItem): number {
  const { freeByKey } = selectComboOffer(state)
  const key = `${item.productId}__${item.variantId ?? 'base'}`
  return freeByKey[key] || 0
}
