// src/hooks/useDonors.js - Optimized with query client and fixed phone exposure

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'
import { useSupabaseQuery, invalidateQuery } from '../lib/queryClient'

export function useDonors() {
  // Use query client for caching with explicit column selection (NO phone/coords)
  const { data: donors, loading, error, refetch } = useSupabaseQuery(
    'donors',
    async (filterGroup = null) => {
      let query = supabase
        .from('donors')
        .select('id, name, blood_group, city, available, created_at')
        .order('available', { ascending: false })
        .order('name')
        .limit(50)

      if (filterGroup && filterGroup !== 'All Blood Groups') {
        query = query.eq('blood_group', filterGroup)
      }

      const { data, error } = await query
      return { data, error }
    },
    {
      staleTime: 60000, // 1 minute
      cacheTime: 300000 // 5 minutes
    }
  )

  // Realtime subscription with memoized channel
  useEffect(() => {
    const channelName = `donors_realtime_${Math.random().toString(36).substring(7)}`
    const channelRef = supabase.channel(channelName)

    channelRef
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donors' },
        (payload) => {
          if (!isMounted.current) return
          
          if (payload.eventType === 'INSERT') {
            // Force refetch to maintain proper ordering and limit
            invalidateQuery('donors')
            refetch(true)
          } else if (payload.eventType === 'UPDATE') {
            // Check if updated donor should be in our current filtered list
            // For simplicity, just refetch to ensure consistency
            invalidateQuery('donors')
            refetch(true)
          } else if (payload.eventType === 'DELETE') {
            invalidateQuery('donors')
            refetch(true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelRef)
    }
  }, [refetch])

  // Filter function for components
  const getFilteredDonors = useCallback((filterGroup = null) => {
    if (!donors) return []
    if (!filterGroup || filterGroup === 'All Blood Groups') return donors
    return donors.filter(d => d.blood_group === filterGroup)
  }, [donors])

  return { 
    donors: donors || [], 
    loading, 
    error, 
    refetch,
    getFilteredDonors
  }
}

export function useHospitals() {
  const { data: hospitals, loading, error, refetch } = useSupabaseQuery(
    'hospitals',
    async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, city, contact_person, phone, latitude, longitude, is_verified')
        .order('name')
      return { data, error }
    },
    {
      staleTime: 300000, // 5 minutes
      cacheTime: 600000 // 10 minutes
    }
  )

  return { hospitals: hospitals || [], loading, error, refetch }
}