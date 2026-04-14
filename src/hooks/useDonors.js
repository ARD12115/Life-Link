// src/hooks/useDonors.js

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useDonors() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const isMounted = useRef(true)

  const fetchDonors = useCallback(async () => {
    const { data } = await supabase
      .from('donors')
      .select('*')
      .order('name')
    
    if (isMounted.current) {
      setDonors(data || [])
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchDonors()

    // Realtime: Incremental updates instead of full re-fetch
    const channel = supabase
      .channel('donors_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donors' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDonors(prev => [...prev, payload.new].sort((a,b) => a.name.localeCompare(b.name)))
          } else if (payload.eventType === 'UPDATE') {
            setDonors(prev => prev.map(d => d.id === payload.new.id ? payload.new : d))
          } else if (payload.eventType === 'DELETE') {
            setDonors(prev => prev.filter(d => d.id === payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      isMounted.current = false
      supabase.removeChannel(channel)
    }
  }, [fetchDonors])

  return { donors, loading, refetch: fetchDonors }
}

export function useHospitals() {
  const [hospitals, setHospitals] = useState([])

  useEffect(() => {
    supabase
      .from('hospitals')
      .select('*')
      .order('name')
      .then(({ data }) => setHospitals(data || []))
  }, [])

  return { hospitals }
}