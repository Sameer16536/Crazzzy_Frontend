'use client'

import { Provider as ReduxProvider } from 'react-redux'
import { useEffect, useRef } from 'react'
import { makeStore, type AppStore } from '@/lib/store/store'
import { CustomCursor } from '@/components/custom-cursor'
import { LenisProvider } from '@/components/lenis-provider'
import { AuthProvider } from '@/lib/auth/auth-context'
import { CatalogProvider } from '@/lib/catalog/use-catalog'
import { Toaster } from '@/components/ui/sonner'

import { CartSync } from '@/components/cart/cart-sync'

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) storeRef.current = makeStore()

  useEffect(() => {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const preventRightClick = (e: MouseEvent) => e.preventDefault()
      document.addEventListener('contextmenu', preventRightClick)
      document.documentElement.classList.add('production-mode')
      return () => document.removeEventListener('contextmenu', preventRightClick)
    }
  }, [])

  return (
    <ReduxProvider store={storeRef.current}>
      <LenisProvider>
        <AuthProvider>
          <CatalogProvider>
            <CartSync />
            <CustomCursor />
            {children}
            <Toaster />
          </CatalogProvider>
        </AuthProvider>
      </LenisProvider>
    </ReduxProvider>
  )
}

