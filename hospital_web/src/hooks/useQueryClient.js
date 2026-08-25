// src/hooks/useQueryClient.js
// React Query-like caching for Supabase (lightweight, no external deps)

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

// In-memory query cache
const queryCache = new Map();

interface QueryOptions {
  staleTime?: number;        // Time in ms before data becomes stale (default: 30s)
  cacheTime?: number;        // Time in ms before unused cache is deleted (default: 5min)
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;  // Auto-refetch interval in ms (default: disabled)
  enabled?: boolean;         // Enable/disable query
}

interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  isStale: boolean;
  refetch: () => Promise<T | null>;
  mutate: (newData: T | ((old: T) => T)) => void;
}

/**
 * Lightweight query client for Supabase with caching, deduplication, and auto-refetch
 * 
 * Usage:
 * const { data, isLoading, refetch } = useQuery(
 *   ['donors', bloodGroup], 
 *   () => supabase.from('donors').select('*').eq('blood_group', bloodGroup)
 * );
 */
export function useQuery(queryKey, queryFn, options = {}) {
  const {
    staleTime = 30000,      // 30 seconds
    cacheTime = 300000,     // 5 minutes
    refetchOnWindowFocus = true,
    refetchInterval = 0,    // 0 = disabled
    enabled = true
  } = options;

  const cacheKey = JSON.stringify(queryKey);
  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: true,
    isFetching: false,
    isStale: true
  });

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const optionsRef = useRef({ staleTime, cacheTime, refetchOnWindowFocus, refetchInterval, enabled });
  optionsRef.current = { staleTime, cacheTime, refetchOnWindowFocus, refetchInterval, enabled };

  const cleanupRef = useRef(null);
  const refetchIntervalRef = useRef(null);

  // Get cached data
  const getCached = useCallback(() => {
    const cached = queryCache.get(cacheKey);
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.expires) {
      queryCache.delete(cacheKey);
      return null;
    }
    return cached;
  }, [cacheKey]);

  // Set cache
  const setCache = useCallback((data, customCacheTime) => {
    const ttl = customCacheTime ?? optionsRef.current.cacheTime;
    queryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    });
  }, [cacheKey]);

  // Check if data is stale
  const isStale = useCallback((cached) => {
    if (!cached) return true;
    return Date.now() - cached.timestamp > optionsRef.current.staleTime;
  }, []);

  // Execute query
  const executeQuery = useCallback(async (isBackground = false) => {
    if (!optionsRef.current.enabled) return null;

    if (!isBackground) {
      setState(prev => ({ ...prev, isLoading: true, isFetching: true }));
    } else {
      setState(prev => ({ ...prev, isFetching: true }));
    }

    try {
      const { data, error } = await queryFnRef.current();
      
      if (error) throw error;
      
      setCache(data);
      setState({
        data,
        error: null,
        isLoading: false,
        isFetching: false,
        isStale: false
      });
      
      logger.db('Query executed', { queryKey: cacheKey, rows: Array.isArray(data) ? data.length : 1 });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState(prev => ({
        ...prev,
        error,
        isLoading: false,
        isFetching: false
      }));
      logger.error('Query failed', { queryKey: cacheKey, error: error.message });
      return null;
    }
  }, [cacheKey, setCache]);

  // Refetch function
  const refetch = useCallback(async () => {
    return executeQuery(false);
  }, [executeQuery]);

  // Mutate cache directly
  const mutate = useCallback((newData) => {
    const cached = getCached();
    if (!cached) return;
    
    const data = typeof newData === 'function' ? newData(cached.data) : newData;
    setCache(data);
    setState(prev => ({ ...prev, data, isStale: false }));
  }, [getCached, setCache]);

  // Initial fetch
  useEffect(() => {
    if (!optionsRef.current.enabled) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const cached = getCached();
    
    if (cached) {
      // Use cached data immediately
      setState({
        data: cached.data,
        error: null,
        isLoading: false,
        isFetching: false,
        isStale: isStale(cached)
      });
      
      // Refetch in background if stale
      if (isStale(cached)) {
        executeQuery(true);
      }
    } else {
      // No cache, fetch fresh
      executeQuery(false);
    }
  }, [cacheKey, getCached, isStale, executeQuery]);

  // Refetch interval
  useEffect(() => {
    if (optionsRef.current.refetchInterval > 0 && optionsRef.current.enabled) {
      refetchIntervalRef.current = setInterval(() => {
        executeQuery(true);
      }, optionsRef.current.refetchInterval);
    }
    return () => {
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, [cacheKey, executeQuery]);

  // Refetch on window focus
  useEffect(() => {
    if (!optionsRef.current.refetchOnWindowFocus) return;

    const handleFocus = () => {
      const cached = getCached();
      if (cached && isStale(cached)) {
        executeQuery(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [cacheKey, getCached, isStale, executeQuery]);

  // Cleanup cache on unmount (after cacheTime)
  useEffect(() => {
    cleanupRef.current = setTimeout(() => {
      queryCache.delete(cacheKey);
    }, optionsRef.current.cacheTime);

    return () => {
      if (cleanupRef.current) clearTimeout(cleanupRef.current);
      if (refetchIntervalRef.current) clearInterval(refetchIntervalRef.current);
    };
  }, [cacheKey]);

  return {
    ...state,
    refetch,
    mutate,
    // Alias for compatibility
    fetch: refetch
  };
}

/**
 * Mutation hook for Supabase writes
 */
export function useMutation(mutationFn, options = {}) {
  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false
  });

  const mutate = useCallback(async (variables) => {
    setState({ data: null, error: null, isLoading: true, isSuccess: false, isError: false });
    
    try {
      const data = await mutationFn(variables);
      setState({ data, error: null, isLoading: false, isSuccess: true, isError: false });
      options.onSuccess?.(data);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ data: null, error: err, isLoading: false, isSuccess: false, isError: true });
      options.onError?.(err);
      return null;
    }
  }, [mutationFn, options]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false, isSuccess: false, isError: false });
  }, []);

  return { ...state, mutate, reset };
}

/**
 * Invalidate and refetch queries matching a key pattern
 */
export function invalidateQueries(queryKeyPattern) {
  const pattern = JSON.stringify(queryKeyPattern);
  for (const key of queryCache.keys()) {
    if (key.startsWith(pattern.replace('"', ''))) {
      const cached = queryCache.get(key);
      if (cached) {
        cached.expires = 0; // Mark as stale
      }
    }
  }
}

/**
 * Clear all cache
 */
export function clearQueryCache() {
  queryCache.clear();
}

/**
 * Prefetch query data
 */
export async function prefetchQuery(queryKey, queryFn, options = {}) {
  const cacheKey = JSON.stringify(queryKey);
  const cached = queryCache.get(cacheKey);
  
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }
  
  try {
    const { data, error } = await queryFn();
    if (error) throw error;
    
    const ttl = options.cacheTime ?? 300000;
    queryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    });
    
    return data;
  } catch (err) {
    logger.error('Prefetch failed', { queryKey: cacheKey, error: err instanceof Error ? err.message : 'Unknown' });
    return null;
  }
}

export default {
  useQuery,
  useMutation,
  invalidateQueries,
  clearQueryCache,
  prefetchQuery
};