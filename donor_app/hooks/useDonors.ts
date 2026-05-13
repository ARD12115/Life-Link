import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useDonors() {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonors();

    const channel = supabase
      .channel('donors_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donors' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDonors(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setDonors(prev => prev.map(d => d.id === payload.new.id ? payload.new : d));
        } else if (payload.eventType === 'DELETE') {
          setDonors(prev => prev.filter(d => d.id === payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchDonors() {
    const { data, error } = await supabase
      .from('donors')
      .select('id, name, blood_group, city, latitude, longitude, available');
    if (data) setDonors(data);
    setLoading(false);
  }

  return { donors, loading, refetch: fetchDonors };
}

export function useHospitals() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitals();
  }, []);

  async function fetchHospitals() {
    const { data } = await supabase
      .from('hospitals')
      .select('*');
    if (data) setHospitals(data);
    setLoading(false);
  }

  return { hospitals, loading };
}
