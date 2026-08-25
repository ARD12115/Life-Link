import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Tables } from '../types/supabase';

type Donor = Tables<'donors'>
type Hospital = Tables<'hospitals'>

export function useDonors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonors();

    const channel = supabase
      .channel('donors_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donors' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDonors(prev => [...prev, payload.new as Donor]);
        } else if (payload.eventType === 'UPDATE') {
          setDonors(prev => prev.map(d => d.id === payload.new.id ? payload.new as Donor : d));
        } else if (payload.eventType === 'DELETE') {
          setDonors(prev => prev.filter(d => d.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchDonors() {
    // Only select columns needed for map display (no phone, no PII)
    const { data, error } = await supabase
      .from('donors')
      .select('id, name, blood_group, city, latitude, longitude, available');
    if (data) setDonors(data as Donor[]);
    setLoading(false);
  }

  return { donors, loading, refetch: fetchDonors };
}

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitals();
  }, []);

  async function fetchHospitals() {
    const { data } = await supabase
      .from('hospitals')
      .select('id, name, city, contact_person, phone, latitude, longitude');
    if (data) setHospitals(data as Hospital[]);
    setLoading(false);
  }

  return { hospitals, loading };
}
