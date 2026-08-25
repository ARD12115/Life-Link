// src/hooks/usePerformance.js
// React hook for performance monitoring

import { useEffect, useRef, useCallback } from 'react';
import { 
  measureAsync, 
  trackWebVitals, 
  trackMemory, 
  cache,
  debounce,
  throttle,
  initPerformanceMonitoring,
  checkPerformanceBudgets
} from '../lib/performance';

// Initialize on first load
let initialized = false;

export function usePerformance() {
  const renderCount = useRef(0);
  const mountTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    
    if (!initialized) {
      initialized = true;
      initPerformanceMonitoring();
      
      // Track initial load
      window.addEventListener('load', () => {
        setTimeout(() => {
          const result = checkPerformanceBudgets();
          if (!result.passed) {
            console.warn('[Perf] Budget violations on load:', result.violations);
          }
        }, 100);
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Measure render time
  useEffect(() => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (duration > 16) { // > 1 frame
        console.log(`[Perf] Component render: ${duration.toFixed(2)}ms`);
      }
    };
  });

  return {
    // Measure async operations
    measure: useCallback(async (name, fn) => {
      return measureAsync(name, fn);
    }, []),
    
    // Cache utilities
    cache: {
      set: useCallback((key, value, ttl) => cache.set(key, value, ttl), []),
      get: useCallback((key) => cache.get(key), []),
      has: useCallback((key) => cache.has(key), []),
      delete: useCallback((key) => cache.delete(key), []),
      clear: useCallback(() => cache.clear(), []),
    },
    
    // Debounce/throttle helpers
    debounce: useCallback((fn, delay) => debounce(fn, delay), []),
    throttle: useCallback((fn, limit) => throttle(fn, limit), []),
    
    // Memory tracking
    trackMemory: useCallback(() => trackMemory(), []),
    
    // Performance metrics
    getMetrics: useCallback(() => {
      return {
        renderCount: renderCount.current,
        mountDuration: performance.now() - mountTime.current,
        memory: 'memory' in performance ? performance.memory : null
      };
    }, [])
  };
}

// Hook for lazy loading with IntersectionObserver
export function useLazyLoad(options = {}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current || isVisible) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.01,
        ...options
      }
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isVisible, options.rootMargin, options.threshold]);

  return { ref: elementRef, isVisible };
}

// Hook for debounced values
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Hook for throttled callbacks
export function useThrottledCallback(callback, limit) {
  const [throttled, setThrottled] = useState(true);
  const lastRun = useRef(0);

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastRun.current >= limit) {
      lastRun.current = now;
      callback(...args);
    } else if (throttled) {
      setThrottled(false);
      setTimeout(() => {
        lastRun.current = Date.now();
        callback(...args);
        setThrottled(true);
      }, limit - (now - lastRun.current));
    }
  }, [callback, limit]);
}

// Import useState for the hooks above
import { useState } from 'react';

export default usePerformance;