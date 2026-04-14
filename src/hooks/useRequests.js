// src/hooks/useRequests.js

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const isMounted = useRef(true)
  const lastFetchTime = useRef(0)

  const fetchRequests = useCallback(async () => {
    // Throttling to prevent network storms (max once per 1s)
    const now = Date.now()
    if (now - lastFetchTime.current < 1000) return
    lastFetchTime.current = now

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

    if (!error && isMounted.current) {
      setRequests(data || [])
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchRequests()

    const channel = supabase
      .channel('blood_requests_realtime')
      // For blood_requests updates, we can often just re-fetch as they are the primary entity
      // but we throttle it to ensure efficiency.
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

  return { requests, loading, refetch: fetchRequests }
}