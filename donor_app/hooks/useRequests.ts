import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Tables } from '../types/supabase';

type BloodRequest = Tables<'blood_requests'>
type Hospital = Tables<'hospitals'>

// Extended type for requests with joined hospital data
type BloodRequestWithHospital = BloodRequest & {
  hospital: Hospital | null
}

// Memoized select query
const REQUEST_SELECT = '*, hospital:hospitals(id, name, city, latitude, longitude)'

export function useRequests(bloodGroup?: string) {
  const [requests, setRequests] = useState<BloodRequestWithHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);
  const channelRef = useRef<any>(null);

  const fetchRequests = useCallback(async (force = false) => {
    // Throttle: max once per 1s to prevent network storms, unless forced
    const now = Date.now();
    if (!force && now - lastFetchTime.current < 1000) return;
    lastFetchTime.current = now;

    try {
      let query = supabase
        .from('blood_requests')
        .select(REQUEST_SELECT)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (bloodGroup) {
        query = query.eq('blood_group', bloodGroup);
      }

      const { data, error } = await query;

      if (!isMounted.current) return;

      if (error) {
        console.error('Requests fetch error:', error);
        setError(error.message);
        setRequests([]);
      } else {
        setError(null);
        setRequests((data as BloodRequestWithHospital[]) || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Requests fetch exception:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRequests([]);
        setLoading(false);
      }
    }
  }, [bloodGroup]);

  useEffect(() => {
    isMounted.current = true;
    fetchRequests();

    const channelName = `requests_realtime_${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'blood_requests' },
        (payload) => {
          if (!isMounted.current) return;
          
          if (payload.eventType === 'INSERT') {
            // Only add if it matches the donor's blood group (if provided)
            if (!bloodGroup || payload.new.blood_group === bloodGroup) {
              setRequests(prev => [payload.new as BloodRequestWithHospital, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new as BloodRequestWithHospital : r));
          } else if (payload.eventType === 'DELETE') {
            setRequests(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription active', { channel: channelName });
        }
      });

    return () => {
      isMounted.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchRequests, bloodGroup]);

  const respondToRequest = async (requestId: string, donorId: string) => {
    try {
      const { data, error } = await supabase
        .from('donor_responses')
        .insert([{ request_id: requestId, donor_id: donorId, status: 'accepted' }])
        .select();

      if (!error) {
        // Optimistic update to UI state
        fetchRequests(true); // force refetch
      }
      return { data, error };
    } catch (err) {
      console.error('📡 Response Error:', err);
      return { data: null, error: err };
    }
  };

  return { requests, loading, error, respondToRequest, refetch: fetchRequests };
}
