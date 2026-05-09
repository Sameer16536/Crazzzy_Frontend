'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api-client'

type CategoryFiltersMap = Record<string, string[]>

export function useCustomFilters() {
  const [filtersMap, setFiltersMap] = useState<CategoryFiltersMap>({})
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchFilters = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/settings/category-filters')
      setFiltersMap(res || {})
    } catch (error) {
      console.error('Failed to fetch category filters:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchFilters()
  }, [fetchFilters])

  const setCategoryFilters = useCallback(async (slug: string, tags: string[]) => {
    const validTags = tags.filter(t => t.trim().length > 0)
    
    // Optimistic UI update
    setFiltersMap(prev => ({ ...prev, [slug]: validTags }))

    try {
      await api.post(`/settings/category-filters/${slug}`, { tags: validTags })
    } catch (error) {
      console.error('Failed to save filters for', slug, error)
      // On failure, we could revert, but for simplicity we'll just log
    }
  }, [])

  const getFilters = useCallback((slug: string): string[] => {
    return filtersMap[slug] ?? []
  }, [filtersMap])

  return { filtersMap, setCategoryFilters, getFilters, mounted, isLoading, refresh: fetchFilters }
}
