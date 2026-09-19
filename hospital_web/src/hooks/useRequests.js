// src/hooks/useRequests.js - Optimized with query client

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { useSupabaseQuery, useSupabaseMutation, invalidateQuery } from '../lib/queryClient';

export function useRequests() {
  // Memoize the select query to avoid recreation
  const REQUEST_SELECT = useMemo(
    () => `
    *,
    hospitals (id, name, city, contact_person, phone),
    donor_responses (
      id, donor_id, status, eta_minutes, responded_at,
      donors (id, name, blood_group, phone, city)
    )
  `,
    []
  );

  // Use query client for caching
  const {
    data: requests,
    loading,
    error,
    refetch,
    mutate: setRequests,
  } = useSupabaseQuery(
    'blood_requests',
    async () => {
      const { data, error } = await supabase
        .from('blood_requests')
        .select(REQUEST_SELECT)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
    }
  );

  // Mutation for creating requests
  const createRequestMutation = useSupabaseMutation(
    async requestData => {
      const { data, error } = await supabase
        .from('blood_requests')
        .insert([requestData])
        .select()
        .single();
      return { data, error };
    },
    {
      invalidateKeys: ['blood_requests'],
      onSuccess: newRequest => {
        logger.info('Request created', { requestId: newRequest.id });
      },
    }
  );

  // Realtime subscription (stable channel name)
  useEffect(() => {
    const channelName = 'blood_requests_realtime';
    const channelRef = supabase.channel(channelName);

    channelRef
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blood_requests' },
        payload => {
          if (payload.eventType === 'INSERT') {
            // Force refetch for complex joins on new rows
            invalidateQuery('blood_requests');
            refetch(true);
          } else if (payload.eventType === 'UPDATE') {
            // Optimistic update for instant UI feedback
            setRequests(prev =>
              prev.map(r => (r.id === payload.new.id ? { ...r, ...payload.new } : r))
            );
          } else if (payload.eventType === 'DELETE') {
            setRequests(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donor_responses' },
        payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            invalidateQuery('blood_requests');
            refetch(true);
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          logger.info('Realtime subscription active', { channel: channelName });
        }
      });

    return () => {
      supabase.removeChannel(channelRef);
    };
  }, [refetch, setRequests]);

  return {
    requests: requests || [],
    loading,
    error,
    refetch,
    mutateRequests: setRequests,
    createRequest: createRequestMutation.mutate,
    creating: createRequestMutation.loading,
  };
}
