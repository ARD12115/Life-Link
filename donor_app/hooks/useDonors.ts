// hooks/useDonors.ts
// Donor data fetching with Supabase and realtime subscriptions
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useDonors() {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef<boolean>(true);

  const fetchDonors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('donors')
        .select('id, name, blood_group, city, latitude, longitude, available');

      if (!isMounted.current) return;

      if (error) {
        console.error('Donors fetch error:', error);
        setLoading(false);
        return;
      } else {
        setDonors(data || []);
        setLoading(false);
      }
    } catch (err) {
      if (!isMounted.current) return;
      console.error('Donors fetch exception:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchDonors();

    const channelName = 'donors_realtime';
    const channelRef = supabase.channel(channelName);

    channelRef
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donors' }, (payload: any) => {
        if (!isMounted.current) return;

        if (payload.eventType === 'INSERT') {
          fetchDonors();
        } else if (payload.eventType === 'UPDATE') {
          fetchDonors();
        } else if (payload.eventType === 'DELETE') {
          setDonors(prev => prev.filter((d: any) => d.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channelRef);
    };
  }, [fetchDonors]);

  return { donors, loading, refetch: fetchDonors };
}

export function useHospitals() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef<boolean>(true);

  const fetchHospitals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, city, contact_person, phone, latitude, longitude, is_verified');

      if (!isMounted.current) return;

      if (!error && data) {
        setHospitals(data as any[]);
      }
      setLoading(false);
    } catch (err) {
      if (!isMounted.current) return;
      console.error('Hospitals fetch exception:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchHospitals();
  }, [fetchHospitals]);

  return { hospitals, loading, refetch: fetchHospitals };
}