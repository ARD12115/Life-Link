// src/hooks/useRequests.js

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)
  const lastFetchTime = useRef(0)

  const fetchRequests = useCallback(async () => {
    // Throttling to prevent network storms (max once per 1s)
    const now = Date.now()
    if (now - lastFetchTime.current < 1000) return
    lastFetchTime.current = now

    try {
      console.log('📡 Fetching blood requests...')
      const { data, error: fetchError } = await supabase
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

      if (fetchError) {
        console.error('❌ Error fetching requests:', fetchError)
        setError(typeof fetchError === 'string' ? fetchError : fetchError.message || 'Failed to fetch requests')
        setLoading(false)
        return
      }

      if (isMounted.current) {
        console.log('✅ Requests loaded:', data?.length || 0)
        setRequests(data || [])
        setError(null)
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Unexpected error fetching requests:', err)
      setError(typeof err === 'string' ? err : err.message || 'Unexpected error')
      if (isMounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchRequests()

    console.log('🔌 Setting up realtime subscription for blood_requests')
    const channel = supabase
      .channel('blood_requests_realtime')
      // For blood_requests updates, we can often just re-fetch as they are the primary entity
      // but we throttle it to ensure efficiency.
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'blood_requests' },
        (payload) => {
          console.log('🔄 blood_requests change:', payload.eventType)
          fetchRequests()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donor_responses' },
        (payload) => {
          console.log('🔄 donor_responses change:', payload.eventType)
          fetchRequests()
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status)
      })

    return () => {
      isMounted.current = false
      supabase.removeChannel(channel)
    }
  }, [fetchRequests])

  return { requests, loading, error, refetch: fetchRequests }
}