import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
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

    if (!error) setRequests(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()

    const channel = supabase
      .channel('blood_requests_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'blood_requests' },
        fetchRequests
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donor_responses' },
        fetchRequests
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { requests, loading, refetch: fetchRequests }
}