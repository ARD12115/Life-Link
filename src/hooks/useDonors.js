// src/hooks/useDonors.js

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useDonors() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)

  const fetchDonors = useCallback(async () => {
    try {
      console.log('👥 Fetching donors...')
      const { data, error: fetchError } = await supabase
        .from('donors')
        .select('*')
        .order('name')
      
      if (fetchError) {
        console.error('❌ Error fetching donors:', fetchError)
        setError(typeof fetchError === 'string' ? fetchError : fetchError.message || 'Failed to fetch donors')
        if (isMounted.current) setLoading(false)
        return
      }

      if (isMounted.current) {
        console.log('✅ Donors loaded:', data?.length || 0)
        setDonors(data || [])
        setError(null)
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Unexpected error fetching donors:', err)
      setError(typeof err === 'string' ? err : err.message || 'Unexpected error')
      if (isMounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchDonors()

    console.log('🔌 Setting up realtime subscription for donors')
    // Realtime: Incremental updates instead of full re-fetch
    const channel = supabase
      .channel('donors_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donors' },
        (payload) => {
          console.log('🔄 Donors change:', payload.eventType)
          if (payload.eventType === 'INSERT') {
            setDonors(prev => [...prev, payload.new].sort((a,b) => a.name.localeCompare(b.name)))
          } else if (payload.eventType === 'UPDATE') {
            setDonors(prev => prev.map(d => d.id === payload.new.id ? payload.new : d))
          } else if (payload.eventType === 'DELETE') {
            setDonors(prev => prev.filter(d => d.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Donors realtime subscription status:', status)
      })

    return () => {
      isMounted.current = false
      supabase.removeChannel(channel)
    }
  }, [fetchDonors])

  return { donors, loading, error, refetch: fetchDonors }
}

export function useHospitals() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        console.log('🏥 Fetching hospitals...')
        const { data, error: fetchError } = await supabase
          .from('hospitals')
          .select('*')
          .order('name')
        
        if (fetchError) {
          console.error('❌ Error fetching hospitals:', fetchError)
          setError(typeof fetchError === 'string' ? fetchError : fetchError.message || 'Failed to fetch hospitals')
          setLoading(false)
          return
        }

        console.log('✅ Hospitals loaded:', data?.length || 0)
        setHospitals(data || [])
        setError(null)
      } catch (err) {
        console.error('❌ Unexpected error fetching hospitals:', err)
        setError(typeof err === 'string' ? err : err.message || 'Unexpected error')
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  return { hospitals, loading, error }
}