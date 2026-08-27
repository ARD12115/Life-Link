// hooks/useRequests.ts
// Blood request fetching with Supabase and realtime subscriptions
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

type BloodRequest = {
  id: string;
  blood_group: string;
  units_needed: number;
  status: string;
  urgency: string;
  hospital_id: string | null;
  created_at: string | null;
  notes: string | null;
  delivery_point: string | null;
  hospital?: {
    id: string;
    name: string;
    city: string;
  } | null;
};

export function useRequests(bloodGroup?: string) {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef<boolean>(true);
  const lastFetchTime = useRef<number>(0);

  const cacheKey = `blood_requests_${bloodGroup || 'all'}`;

  // Simple cache without TTL complexity
  const cache = new Map<string, BloodRequest[]>();

  const fetchRequests = useCallback(async (force = false) => {
    // Throttle: max once per 1s unless forced
    const now = Date.now();
    if (!force && now - lastFetchTime.current < 1000) return;
    lastFetchTime.current = now;

    // Check cache first
    if (!force && cache.has(cacheKey)) {
      setRequests(cache.get(cacheKey)!);
      setLoading(false);
      return cache.get(cacheKey)!;
    }

    try {
      let query = supabase.from('blood_requests').select('*, hospital:hospitals(id, name, city)');

      if (bloodGroup) {
        query = query.eq('blood_group', bloodGroup);
      }

      query = query.eq('status', 'open').order('created_at', { ascending: false });

      const { data, error: fetchError } = await query as any;

      if (!isMounted.current) return;

      if (fetchError) {
        console.error('Requests fetch error:', fetchError);
        setError(fetchError.message);
        setRequests([]);
      } else {
        setError(null);
        const resultData = data as BloodRequest[];
        setRequests(resultData);
        cache.set(cacheKey, resultData);
      }
      setLoading(false);
      return data;
    } catch (err) {
      if (!isMounted.current) return;
      console.error('Requests fetch exception:', err);
      setRequests([]);
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [bloodGroup, cacheKey]);

  // Respond to request mutation
  const respondToRequest = async (requestId: string, donorId: string) => {
    try {
      const { data, error } = await supabase
        .from('donor_responses')
        .insert([{ request_id: requestId, donor_id: donorId, status: 'accepted' }])
        .select();

      if (!error) {
        cache.delete(cacheKey);
        await fetchRequests(true);
      }
      return { data, error };
    } catch (err) {
      console.error('Response Error:', err);
      return { data: null, error: err };
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchRequests();

    const channelName = `requests_realtime_${Math.random().toString(36).substring(7)}`;
    const channelRef = supabase.channel(channelName);

    channelRef.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'blood_requests' },
      (payload: any) => {
        if (!isMounted.current) return;

        if (payload.eventType === 'INSERT') {
          if (!bloodGroup || payload.new.blood_group === bloodGroup) {
            cache.delete(cacheKey);
            fetchRequests(true);
          }
        } else if (payload.eventType === 'UPDATE') {
          cache.delete(cacheKey);
          fetchRequests(true);
        } else if (payload.eventType === 'DELETE') {
          setRequests(prev => prev.filter((r: any) => r.id !== payload.old.id));
        }
      }
    );

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channelRef);
    };
  }, [fetchRequests, bloodGroup, cacheKey]);

  return { requests, loading, error, respondToRequest, refetch: fetchRequests };
}