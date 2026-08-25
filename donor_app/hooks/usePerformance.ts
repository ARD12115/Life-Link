// hooks/usePerformance.ts
// Performance monitoring hook for React Native (Expo)

import { useEffect, useRef, useCallback, useState } from 'react';
import { Platform, InteractionManager } from 'react-native';

// Performance marks and measures (web only)
const markStart = (name: string) => {
  if (Platform.OS === 'web' && 'performance' in window) {
    performance.mark(`${name}-start`);
  }
};

const markEnd = (name: string): number => {
  if (Platform.OS === 'web' && 'performance' in window) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    const measure = performance.getEntriesByName(name, 'measure')[0];
    return measure?.duration || 0;
  }
  return 0;
};

export async function measureAsync(name: string, fn: () => Promise<any>) {
  markStart(name);
  try {
    return await fn();
  } finally {
    markEnd(name);
  }
}

// Memory tracking (web only)
function trackMemory() {
  if (Platform.OS === 'web' && 'memory' in performance) {
    const mem = performance.memory;
    return {
      used: (mem.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      total: (mem.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      limit: (mem.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    };
  }
  return null;
}

// Cache with TTL
const memoryCache = new Map<string, { value: any; expires: number }>();

const cache = {
  set: (key: string, value: any, ttlMs = 300000) => {
    memoryCache.set(key, { value, expires: Date.now() + ttlMs });
  },
  get: (key: string) => {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value;
  },
  has: (key: string) => cache.get(key) !== null,
  delete: (key: string) => memoryCache.delete(key),
  clear: () => memoryCache.clear(),
  cleanup: () => {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (now > entry.expires) memoryCache.delete(key);
    }
  }
};

// Debounce
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

// Throttle
function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): T {
  let inThrottle = false;
  return ((...args: any[]) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  }) as T;
}

// Initialize performance monitoring
let initialized = false;

export function initPerformanceMonitoring() {
  if (initialized) return;
  initialized = true;
  
  if (Platform.OS === 'web') {
    // Web vitals tracking
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          console.log('[WebVitals] LCP:', last.startTime.toFixed(2), 'ms');
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}
    }
  }
  
  // Cleanup cache periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of (memoryCache as any).entries()) {
      if (now > entry.expires) memoryCache.delete(key);
    }
  }, 60000);
}

export function usePerformance() {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current++;
    
    // Run once after interactions settle
    InteractionManager.runAfterInteractions(() => {
      // Performance initialization
    });
  }, []);

  return {
    measure: useCallback(async (name: string, fn: () => Promise<any>) => {
      return measureAsync(name, fn);
    }, []),
    
    cache: {
      set: useCallback((key: string, value: any, ttl?: number) => cache.set(key, value, ttl), []),
      get: useCallback((key: string) => cache.get(key), []),
      has: useCallback((key: string) => cache.has(key), []),
      delete: useCallback((key: string) => cache.delete(key), []),
      clear: useCallback(() => cache.clear(), []),
    },
    
    debounce: useCallback((fn: (...args: any[]) => any, delay: number) => debounce(fn, delay), []),
    throttle: useCallback((fn: (...args: any[]) => any, limit: number) => throttle(fn, limit), []),
    
    trackMemory: useCallback(() => trackMemory(), []),
    
    getMetrics: useCallback(() => ({
      renderCount: renderCount.current,
      mountDuration: Date.now() - mountTime.current,
    }), [])
  };
}

// Lazy load hook for images/components
export function useLazyLoad(options: { rootMargin?: string; threshold?: number } = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<any>(null);

  useEffect(() => {
    if (!elementRef.current || isVisible) return;
    
    if (Platform.OS === 'web' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin: '100px', threshold: 0.01, ...options }
      );
      observer.observe(elementRef.current);
      return () => observer.disconnect();
    } else {
      // Native: always visible
      setIsVisible(true);
    }
  }, [isVisible]);

  return { ref: elementRef, isVisible };
}

// Debounced value hook
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T, 
  limit: number
): T {
  const lastRun = useRef(0);
  const throttled = useRef(true);

  return useCallback((...args: any[]) => {
    const now = Date.now();
    if (now - lastRun.current >= limit) {
      lastRun.current = now;
      callback(...args);
    } else if (throttled.current) {
      throttled.current = false;
      setTimeout(() => {
        lastRun.current = Date.now();
        callback(...args);
        throttled.current = true;
      }, limit - (now - lastRun.current));
    }
  }, [callback, limit]) as T;
}

export default function usePerformance() {
  return {
    measure: measureAsync,
    cache: {
      set: (key: string, value: any, ttl?: number) => cache.set(key, value, ttl),
      get: (key: string) => cache.get(key),
      has: (key: string) => cache.has(key),
      delete: (key: string) => cache.delete(key),
      clear: () => cache.clear(),
    },
    debounce,
    throttle,
    trackMemory: () => trackMemory(),
    getMetrics: () => ({ renderCount: 0, mountDuration: 0 })
  };
}

// Import React hooks at the end to avoid circular dependency
import { useEffect, useRef, useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';