'use client'

import { useEffect, useMemo, useState } from 'react'

export type CatalogCategory = {
  id: string
  name: string
  slug: string
  description: string
  image: string
  color: string
}

export type CatalogProduct = {
  id: string
  name: string
  categoryId: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  images: string[]
  description: string
  inStock: boolean
  soldOut?: boolean
  featured?: boolean
}

type CatalogPayload = {
  categories: CatalogCategory[]
  products: CatalogProduct[]
}

export function useCatalog() {
  const [data, setData] = useState<CatalogPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function run() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/catalog', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to load catalog (${res.status})`)
        const json = (await res.json()) as CatalogPayload
        if (!active) return
        setData(json)
      } catch (e) {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Failed to load catalog')
      } finally {
        if (!active) return
        setIsLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [])

  const byCategory = useMemo(() => {
    const map = new Map<string, CatalogProduct[]>()
    for (const p of data?.products ?? []) {
      const arr = map.get(p.categoryId) ?? []
      arr.push(p)
      map.set(p.categoryId, arr)
    }
    return map
  }, [data])

  return { data, isLoading, error, byCategory }
}

