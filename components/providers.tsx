'use client'

import { Provider as ReduxProvider } from 'react-redux'
import { useRef } from 'react'
import { makeStore, type AppStore } from '@/lib/store/store'
import { CustomCursor } from '@/components/custom-cursor'
import { LenisProvider } from '@/components/lenis-provider'
import { AuthProvider } from '@/lib/auth/auth-context'
import { CatalogProvider } from '@/lib/catalog/use-catalog'

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) storeRef.current = makeStore()

  return (
    <ReduxProvider store={storeRef.current}>
      <LenisProvider>
        <AuthProvider>
          <CatalogProvider>
            <CustomCursor />
            {children}
          </CatalogProvider>
        </AuthProvider>
      </LenisProvider>
    </ReduxProvider>
  )
}

