// hospital_web/src/lib/queryClient.js
// React Query-like caching for Supabase (lightweight, no external deps)

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

// Simple in-memory cache with TTL
const queryCache = new Map()

const DEFAULT_STALE_TIME = 30000 // 30 seconds
const DEFAULT_CACHE_TIME = 300000 // 5 minutes

export function useQueryClient() {
  const cache = useRef(queryCache).current

  const getCache = useCallback((key) => {
    const entry = cache.get(key)
    if (!entry) return null
    
    const now = Date.now()
    if (now - entry.timestamp > entry.cacheTime) {
      cache.delete(key)
      return null
    }
    return entry.data
  }, [])

  const setCache = useCallback((key, data, options = {}) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      cacheTime: options.cacheTime || DEFAULT_CACHE_TIME,
      staleTime: options.staleTime || DEFAULT_STALE_TIME
    })
  }, [])

  const isStale = useCallback((key) => {
    const entry = cache.get(key)
    if (!entry) return true
    return Date.now() - entry.timestamp > (entry.staleTime || DEFAULT_STALE_TIME)
  }, [])

  return { getCache, setCache, isStale }
}

export function useSupabaseQuery(queryKey, queryFn, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)
  const lastFetchTime = useRef(0)
  const { getCache, setCache, isStale } = useQueryClient()

  const cacheKey = Array.isArray(queryKey) ? queryKey.join(':') : queryKey

  const fetchData = useCallback(async (force = false) => {
    // Throttle: max once per 1s unless forced
    const now = Date.now()
    if (!force && now - lastFetchTime.current < 1000) {
      return getCache(cacheKey)
    }
    lastFetchTime.current = now

    // Check cache first
    if (!force && !isStale(cacheKey)) {
      const cached = getCache(cacheKey)
      if (cached) {
        setData(cached)
        setLoading(false)
        return cached
      }
    }

    try {
      const result = await queryFn()
      
      if (!isMounted.current) return null

      if (result.error) {
        throw new Error(result.error.message)
      }

      const resultData = result.data || []
      setData(resultData)
      setError(null)
      setCache(cacheKey, resultData, options)
      setLoading(false)
      return resultData
    } catch (err) {
      if (!isMounted.current) return null
      
      logger.error(`Query error: ${cacheKey}`, { error: err.message })
      setError(err.message)
      setData(null)
      setLoading(false)
      return null
    }
  }, [queryFn, cacheKey, getCache, setCache, isStale])

  useEffect(() => {
    isMounted.current = true
    fetchData()
    
    return () => {
      isMounted.current = false
    }
  }, [fetchData])

  const refetch = useCallback(() => fetchData(true), [fetchData])

  return { data, loading, error, refetch, mutate: setData }
}

// Invalidate cache for a key
export function invalidateQuery(queryKey) {
  const cacheKey = Array.isArray(queryKey) ? queryKey.join(':') : queryKey
  queryCache.delete(cacheKey)
}

// Mutate and invalidate related queries
export function useSupabaseMutation(mutationFn, options = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutationFn(...args)
      if (result.error) throw new Error(result.error.message)
      
      // Invalidate related queries
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach(key => invalidateQuery(key))
      }
      
      if (options.onSuccess) {
        options.onSuccess(result.data)
      }
      return result.data
    } catch (err) {
      setError(err.message)
      if (options.onError) options.onError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [mutationFn, options])

  return { mutate, loading, error }
}