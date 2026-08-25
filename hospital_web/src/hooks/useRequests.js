// src/hooks/useRequests.js

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export function useRequests() {
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const isMounted                 = useRef(true)
  const lastFetchTime             = useRef(0)
  const channelRef                = useRef(null)

  // Memoize the select query to avoid recreation
  const REQUEST_SELECT = `
    *,
    hospitals (id, name, city, contact_person, phone),
    donor_responses (
      id, donor_id, status, eta_minutes, responded_at,
      donors (id, name, blood_group, phone, city)
    )
  `

  const fetchRequests = useCallback(async (force = false) => {
    // Throttle: max once per 1s to prevent network storms, unless forced
    const now = Date.now()
    if (!force && now - lastFetchTime.current < 1000) return
    lastFetchTime.current = now

    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select(REQUEST_SELECT)
        .order('created_at', { ascending: false })

      if (!isMounted.current) return

      if (error) {
        // RLS will silently return [] for unauthorised rows — a real error means something else
        logger.error('Requests fetch error', { error: error.message, table: 'blood_requests' })
        setError(error.message)
        setRequests([])
      } else {
        setError(null)
        setRequests(data || [])
      }
      setLoading(false)
    } catch (err) {
      logger.error('Requests fetch exception', { error: err instanceof Error ? err.message : 'Unknown' })
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setRequests([])
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchRequests()

    // Single channel for all realtime events
    const channelName = `blood_requests_realtime_${Math.random().toString(36).substring(7)}`
    const channel = supabase.channel(channelName)
    
    channelRef.current = channel

    channel
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'blood_requests' },
        (payload) => {
          if (!isMounted.current) return
          
          if (payload.eventType === 'INSERT') {
            // Force refetch for complex joins on new rows
            fetchRequests(true)
          } else if (payload.eventType === 'UPDATE') {
            // Optimistic update for instant UI feedback
            setRequests(prev => prev.map(r => 
              r.id === payload.new.id ? { ...r, ...payload.new } : r
            ))
          } else if (payload.eventType === 'DELETE') {
            setRequests(prev => prev.filter(r => r.id !== payload.old.id))
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donor_responses' },
        (payload) => {
          if (!isMounted.current) return
          // Only refetch if it affects our requests
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            fetchRequests(true)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info('Realtime subscription active', { channel: channelName })
        }
      })

    return () => {
      isMounted.current = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [fetchRequests])

  return { requests, loading, error, refetch: fetchRequests, mutateRequests: setRequests }
}
