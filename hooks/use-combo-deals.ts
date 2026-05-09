'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

export interface ComboDeal {
  id: string | number
  title: string
  description: string
  requiredQuantity: number
  bundlePrice: number
  eligibleProductIds: string[]
  isActive: boolean
}

export function useComboDeals() {
  const [deals, setDeals] = useState<ComboDeal[]>([])
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDeals = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/settings/combo-deals')
      setDeals(Array.isArray(res) ? res : [])
    } catch (error) {
      console.error('Failed to fetch combo deals:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchDeals()
  }, [fetchDeals])

  const addDeal = useCallback(async (deal: Omit<ComboDeal, 'id'>) => {
    try {
      const newDeal = await api.post('/settings/combo-deals', deal)
      setDeals(prev => [newDeal, ...prev])
      return newDeal
    } catch (error: any) {
      toast.error(error.message || 'Failed to create deal')
      throw error
    }
  }, [])

  const updateDeal = useCallback(async (id: string | number, updates: Partial<ComboDeal>) => {
    try {
      const updated = await api.put(`/settings/combo-deals/${id}`, updates)
      setDeals(prev => prev.map(d => String(d.id) === String(id) ? { ...d, ...updated } : d))
      return updated
    } catch (error: any) {
      toast.error(error.message || 'Failed to update deal')
      throw error
    }
  }, [])

  const removeDeal = useCallback(async (id: string | number) => {
    try {
      await api.delete(`/settings/combo-deals/${id}`)
      setDeals(prev => prev.filter(d => String(d.id) !== String(id)))
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove deal')
      throw error
    }
  }, [])

  const activeDeals = deals.filter(d => d.isActive)

  return { deals, activeDeals, addDeal, updateDeal, removeDeal, mounted, isLoading, refresh: fetchDeals }
}
