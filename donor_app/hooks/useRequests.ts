import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useRequests(bloodGroup?: string) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('requests_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blood_requests' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Only add if it matches the donor's blood group (if provided)
            if (!bloodGroup || payload.new.blood_group === bloodGroup) {
              setRequests(prev => [payload.new, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
          } else if (payload.eventType === 'DELETE') {
            setRequests(prev => prev.filter(r => r.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bloodGroup]);

  async function fetchRequests() {
    let query = supabase
      .from('blood_requests')
      .select('*, hospital:hospitals(name, city, latitude, longitude)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (bloodGroup) {
      query = query.eq('blood_group', bloodGroup);
    }

    const { data, error } = await query;
    if (data) setRequests(data);
    setLoading(false);
  }

  const respondToRequest = async (requestId: string, donorId: string) => {
    try {
      const { data, error } = await supabase
        .from('donor_responses')
        .insert([{ request_id: requestId, donor_id: donorId, status: 'accepted' }])
        .select();

      if (!error) {
        // Optimistic update to UI state
        fetchRequests();
      }
      return { data, error };
    } catch (err) {
      console.error('📡 Response Error:', err);
      return { data: null, error: err };
    }
  };

  return { requests, loading, respondToRequest, refetch: fetchRequests };
}
