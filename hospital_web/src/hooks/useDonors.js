// src/hooks/useDonors.js

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useDonors() {
  const [donors, setDonors]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const isMounted             = useRef(true)

  const fetchDonors = useCallback(async (filterGroup = null) => {
    try {
      let query = supabase
        .from('donors')
        .select('*')
        .order('available', { ascending: false })
        .order('name')
        .limit(50)

      if (filterGroup && filterGroup !== 'All Blood Groups') {
        query = query.eq('blood_group', filterGroup)
      }

      const { data, error } = await query

      if (!isMounted.current) return

      if (error) {
        console.error('Donors fetch error:', error)
        setError(error.message)
      } else {
        setError(null)
        setDonors(data || [])
      }
      setLoading(false)
    } catch (err) {
      console.error('Donors fetch exception:', err)
      if (isMounted.current) {
        setError(err.message)
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchDonors()

    // Incremental realtime updates — avoids full re-fetch on every change
    const channelName = `donors_realtime_${Math.random().toString(36).substring(7)}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donors' },
        (payload) => {
          if (!isMounted.current) return
          if (payload.eventType === 'INSERT') {
            setDonors(prev => [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name)))
          } else if (payload.eventType === 'UPDATE') {
            setDonors(prev => prev.map(d => d.id === payload.new.id ? payload.new : d))
          } else if (payload.eventType === 'DELETE') {
            setDonors(prev => prev.filter(d => d.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      isMounted.current = false
      supabase.removeChannel(channel)
    }
  }, [fetchDonors])

  return { donors, loading, error, refetch: fetchDonors }
}

export function useHospitals() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    let isMounted = true
    supabase
      .from('hospitals')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (!isMounted) return
        if (!error) setHospitals(data || [])
        setLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  return { hospitals, loading }
}
