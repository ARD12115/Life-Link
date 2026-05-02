// src/hooks/useRequests.js

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useRequests() {
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const isMounted                 = useRef(true)
  const lastFetchTime             = useRef(0)

  const fetchRequests = useCallback(async () => {
    // Throttle: max once per 1s to prevent network storms
    const now = Date.now()
    if (now - lastFetchTime.current < 1000) return
    lastFetchTime.current = now

    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select(`
          *,
          hospitals (name, city, contact_person, phone),
          donor_responses (
            id, donor_id, status, eta_minutes, responded_at,
            donors (id, name, blood_group, phone, city)
          )
        `)
        .order('created_at', { ascending: false })

      if (!isMounted.current) return

      if (error) {
        // RLS will silently return [] for unauthorised rows — a real error means something else
        console.error('Requests fetch error:', error)
        setError(error.message)
        setRequests([])
      } else {
        setError(null)
        setRequests(data || [])
      }
      setLoading(false)
    } catch (err) {
      console.error('Requests fetch exception:', err)
      if (isMounted.current) {
        setError(err.message)
        setRequests([])
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchRequests()

    const channelName = `blood_requests_realtime_${Math.random().toString(36).substring(7)}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'blood_requests' },
        fetchRequests
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donor_responses' },
        fetchRequests
      )
      .subscribe()

    return () => {
      isMounted.current = false
      supabase.removeChannel(channel)
    }
  }, [fetchRequests])

  return { requests, loading, error, refetch: fetchRequests }
}
