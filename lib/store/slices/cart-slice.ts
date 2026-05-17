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
  /** Product slug for detailed view links */
  slug?: string
}

export interface CategoryOffer {
  id: number;
  categorySlug: string;
  buyQuantity: number;
  getQuantity: number;
  isActive: boolean;
}

export interface CatalogCategory {
  id: string | number;
  name: string;
  slug: string;
  parentId?: string | number | null;
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
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload
      state.lastUpdatedAt = Date.now()
    },
    addToCart(state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) {
      upsertItem(state.items, action.payload)
      state.lastUpdatedAt = Date.now()
    },
    setQuantity(state, action: PayloadAction<{ productId: string; variantId?: number; bundleId?: string | number; quantity: number }>) {
      const { productId, variantId, bundleId, quantity } = action.payload;
      const itemIndex = state.items.findIndex((i) => 
        i.productId === productId && i.variantId === variantId && i.bundleId === bundleId
      )
      if (itemIndex === -1) return
      
      const item = state.items[itemIndex]

      if (quantity <= 0) {
        if (item.bundleId) {
          const bId = item.bundleId;
          state.items.splice(itemIndex, 1);
          const siblings = state.items.filter(i => i.bundleId === bId);
          state.items = state.items.filter(i => i.bundleId !== bId);
          siblings.forEach(s => upsertItem(state.items, { ...s, bundleId: undefined, bundlePrice: undefined }));
        } else {
          state.items.splice(itemIndex, 1);
        }
      } else {
        if (item.bundleId) {
          const bId = item.bundleId;
          item.quantity = Math.floor(quantity);
          const family = state.items.filter(i => i.bundleId === bId);
          state.items = state.items.filter(i => i.bundleId !== bId);
          family.forEach(f => upsertItem(state.items, { ...f, bundleId: undefined, bundlePrice: undefined }));
        } else {
          item.quantity = Math.floor(quantity)
        }
      }
      state.lastUpdatedAt = Date.now()
    },
    removeFromCart(state, action: PayloadAction<{ productId: string; variantId?: number; bundleId?: string | number }>) {
      const { productId, variantId, bundleId } = action.payload;
      const itemIndex = state.items.findIndex((i) => 
        i.productId === productId && i.variantId === variantId && i.bundleId === bundleId
      )
      if (itemIndex === -1) return
      
      const item = state.items[itemIndex]

      if (item.bundleId) {
        const bId = item.bundleId;
        state.items.splice(itemIndex, 1);
        const siblings = state.items.filter(i => i.bundleId === bId);
        state.items = state.items.filter(i => i.bundleId !== bId);
        siblings.forEach(s => upsertItem(state.items, { ...s, bundleId: undefined, bundlePrice: undefined }));
      } else {
        state.items.splice(itemIndex, 1);
      }
      state.lastUpdatedAt = Date.now()
    },
    clearCart(state) {
      state.items = []
      state.lastUpdatedAt = Date.now()
    },
    addBundle(state, action: PayloadAction<{ bundleId: string | number; price: number; items: (Omit<CartItem, 'quantity'> & { quantity?: number })[] }>) {
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

export const { addToCart, removeFromCart, setQuantity, clearCart, hydrateFromCookie, addBundle, setCartItems } = cartSlice.actions
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

export interface ProductOffer {
  id: number
  productId: number
  buyQuantity: number
  freeProductIds: string // stringified JSON array
  isActive: boolean
}

export interface ProductOfferResult {
  totalSavings: number
  freeByKey: Record<string, number>
  itemOffers: Record<string, { buy: number; get: number; label: string }>
  suggestions: {
    needed: number
    triggerProductSlug: string
    triggerProductName: string
    freeProductId: string
    freeProductName: string
    freeProductSlug: string
    freeProductImage: string
    label: string
  }[]
}

export function calculateProductOffers(
  items: CartItem[],
  offers: ProductOffer[],
  products: any[] = []
): ProductOfferResult {
  const freeByKey: Record<string, number> = {}
  const itemOffers: Record<string, { buy: number; get: number; label: string }> = {}
  let totalSavings = 0
  const suggestions: ProductOfferResult['suggestions'] = []

  const activeOffers = (offers || []).filter(o => o.isActive)

  for (const offer of activeOffers) {
    const triggerId = String(offer.productId)
    // Find trigger items in cart (excluding fixed bundles)
    const triggerItems = items.filter(item => item.productId === triggerId && !item.bundleId)
    const triggerQty = triggerItems.reduce((sum, item) => sum + item.quantity, 0)

    let freeProductIds: number[] = []
    try {
      freeProductIds = JSON.parse(offer.freeProductIds) as number[]
    } catch (e) {
      console.error('Failed to parse freeProductIds in client:', e)
      continue
    }

    const isSameProduct = freeProductIds.includes(Number(offer.productId))

    if (isSameProduct) {
      // BOGO style: Buy X get 1 same product free (e.g. buy 1 get 1 means cycle = 2)
      const cycle = offer.buyQuantity + 1
      const freeUnits = Math.floor(triggerQty / cycle)
      
      // Suggest adding 1 more if trigger items are present but not completing the free cycle
      const remainder = triggerQty % cycle
      if (remainder === offer.buyQuantity) {
        const triggerProduct = products.find(p => String(p.id) === triggerId)
        if (triggerProduct) {
          suggestions.push({
            needed: 1,
            triggerProductSlug: triggerProduct.slug || '',
            triggerProductName: triggerProduct.name || triggerProduct.title || '',
            freeProductId: triggerId,
            freeProductName: triggerProduct.name || triggerProduct.title || '',
            freeProductSlug: triggerProduct.slug || '',
            freeProductImage: triggerProduct.imageUrl || '',
            label: `Add 1 more ${triggerProduct.name || triggerProduct.title} to get it for FREE!`
          })
        }
      }

      if (freeUnits > 0) {
        let remainingFree = freeUnits
        const sortedTriggerItems = [...triggerItems].sort((a, b) => a.price - b.price)

        for (const item of sortedTriggerItems) {
          if (remainingFree <= 0) break
          const take = Math.min(item.quantity, remainingFree)
          const itemKey = `${item.productId}__${item.variantId ?? 'base'}`
          freeByKey[itemKey] = (freeByKey[itemKey] || 0) + take
          itemOffers[itemKey] = {
            buy: offer.buyQuantity,
            get: 1,
            label: `Buy ${offer.buyQuantity} Get 1 Free`
          }
          totalSavings += take * item.price
          remainingFree -= take
        }
      }
    } else {
      // Cross-product offer: Buy X triggers, get Y free products free
      const triggerCycles = Math.floor(triggerQty / offer.buyQuantity)

      for (const freeIdNum of freeProductIds) {
        const freeId = String(freeIdNum)
        const freeItems = items.filter(item => item.productId === freeId && !item.bundleId)
        const freeQtyInCart = freeItems.reduce((sum, item) => sum + item.quantity, 0)

        // If trigger is bought but free product not in cart (or not enough units), suggest adding it
        const desiredFreeQty = triggerCycles > 0 ? triggerCycles : 1
        if (triggerQty >= offer.buyQuantity && freeQtyInCart < desiredFreeQty) {
          const triggerProduct = products.find(p => String(p.id) === triggerId)
          const freeProduct = products.find(p => String(p.id) === freeId)
          if (triggerProduct && freeProduct) {
            suggestions.push({
              needed: desiredFreeQty - freeQtyInCart,
              triggerProductSlug: triggerProduct.slug || '',
              triggerProductName: triggerProduct.name || triggerProduct.title || '',
              freeProductId: freeId,
              freeProductName: freeProduct.name || freeProduct.title || '',
              freeProductSlug: freeProduct.slug || '',
              freeProductImage: freeProduct.imageUrl || '',
              label: `Add ${freeProduct.name || freeProduct.title} to your cart to get it for FREE!`
            })
          }
        }

        if (triggerCycles > 0 && freeQtyInCart > 0) {
          let remainingFree = Math.min(freeQtyInCart, triggerCycles)
          const sortedFreeItems = [...freeItems].sort((a, b) => a.price - b.price)

          for (const item of sortedFreeItems) {
            if (remainingFree <= 0) break
            const take = Math.min(item.quantity, remainingFree)
            const itemKey = `${item.productId}__${item.variantId ?? 'base'}`
            freeByKey[itemKey] = (freeByKey[itemKey] || 0) + take
            itemOffers[itemKey] = {
              buy: offer.buyQuantity,
              get: 1,
              label: `Buy ${offer.buyQuantity} Get Free Gift`
            }
            totalSavings += take * item.price
            remainingFree -= take
          }
        }
      }
    }
  }

  return { totalSavings, freeByKey, itemOffers, suggestions }
}


