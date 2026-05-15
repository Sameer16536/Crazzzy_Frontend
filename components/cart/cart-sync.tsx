'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setCartItems, CartItem } from '@/lib/store/slices/cart-slice'
import { api } from '@/lib/api-client'

const CART_STORAGE_KEY = 'crazzzy_guest_cart'

export function CartSync() {
  const { user, loading: authLoading } = useAuth()
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector(state => state.cart.items)
  const cartUpdatedAt = useAppSelector(state => state.cart.lastUpdatedAt)
  
  const [isHydrated, setIsHydrated] = useState(false)
  const [hasMerged, setHasMerged] = useState(false)
  const previousUserId = useRef<string | null>(null)
  
  // 1. Initial Hydration from LocalStorage (Guest)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isHydrated) {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            dispatch(setCartItems(parsed))
          }
        }
      } catch (e) {
        console.error('Failed to parse local cart', e)
      } finally {
        setIsHydrated(true)
      }
    }
  }, [dispatch, isHydrated])

  // 2. Auth State Change (Merge)
  useEffect(() => {
    if (!isHydrated || authLoading) return

    const handleMerge = async () => {
      if (user && !hasMerged && user.id !== previousUserId.current) {
        // User just logged in. Send local items to merge.
        try {
          const localItems = cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          }))
          
          const res = await api.post<any>('/cart/merge', { items: localItems })
          
          if (res.success && res.cart?.items) {
            // Map DB items back to CartItem format
            const mergedItems: CartItem[] = res.cart.items.map((dbItem: any) => ({
              productId: String(dbItem.productId),
              variantId: dbItem.productVariantId || undefined,
              name: dbItem.product?.title || 'Unknown Product',
              image: dbItem.product?.imageUrl || undefined,
              price: dbItem.variant ? Number(dbItem.product.price) + Number(dbItem.variant.additionalPrice) : Number(dbItem.product?.price || 0),
              quantity: dbItem.quantity,
              categorySlug: dbItem.product?.category?.slug,
              variantName: dbItem.variant?.variantName
            }))
            
            dispatch(setCartItems(mergedItems))
            localStorage.removeItem(CART_STORAGE_KEY) // Clear local storage since it's in DB now
            setHasMerged(true)
            previousUserId.current = user.id
          }
        } catch (e) {
          console.error('Failed to merge cart', e)
        }
      } else if (!user && previousUserId.current) {
        // User logged out.
        dispatch(setCartItems([]))
        setHasMerged(false)
        previousUserId.current = null
      }
    }

    handleMerge()
  }, [user, authLoading, isHydrated, hasMerged, dispatch, cartItems])

  // 3. Ongoing Sync
  const isSyncing = useRef(false)
  useEffect(() => {
    if (!isHydrated) return

    const syncTask = setTimeout(async () => {
      if (!user) {
        // Guest: Sync to LocalStorage
        if (cartItems.length > 0) {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
        } else {
          localStorage.removeItem(CART_STORAGE_KEY)
        }
      } else if (hasMerged) {
        // Logged in: Sync Redux state to Backend
        if (isSyncing.current) return
        isSyncing.current = true
        
        try {
          const localItems = cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          }))
          await api.post('/cart/sync', { items: localItems })
        } catch (e) {
          console.error('Background cart sync failed', e)
        } finally {
          isSyncing.current = false
        }
      }
    }, 1000) // 1-second debounce

    return () => clearTimeout(syncTask)
  }, [cartItems, cartUpdatedAt, user, isHydrated, hasMerged])

  return null
}
