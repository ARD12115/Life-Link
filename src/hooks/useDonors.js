import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useDonors() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDonors = async () => {
    const { data } = await supabase
      .from('donors')
      .select('*')
      .order('name')
    setDonors(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchDonors()

    // Realtime: re-fetch donors when availability changes
    const channel = supabase
      .channel('donors_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donors' },
        fetchDonors
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

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