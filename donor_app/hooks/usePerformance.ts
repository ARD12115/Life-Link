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
    const entries = performance.getEntriesByName(name, 'measure');
    const measure = entries.length > 0 ? entries[entries.length - 1] : null;
    return measure?.duration || 0;
  }
  return 0;
};

// Memory tracking (web only)
function trackMemory() {
  if (Platform.OS === 'web' && 'memory' in performance) {
    const mem: any = performance.memory;
    return {
      used: (mem?.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      total: (mem?.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      limit: (mem?.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    };
  }
  return null;
}

// Simple cache using plain object - no Map iterator issues
const memoryCache: Record<string, { value: any; expires: number }> = {};

const cache = {
  set: (key: string, value: any, ttlMs = 300000) => {
    memoryCache[key] = { value, expires: Date.now() + ttlMs };
  },
  get: (key: string) => {
    const entry = memoryCache[key];
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      delete memoryCache[key];
      return null;
    }
    return entry.value;
  },
  has: (key: string) => Object.keys(memoryCache).includes(key),
  delete: (key: string) => delete memoryCache[key],
  clear: () => {
    Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
  },
  cleanup: () => {
    const now = Date.now();
    Object.keys(memoryCache).forEach(key => {
      const entry = memoryCache[key];
      if (entry && now > entry.expires) {
        delete memoryCache[key];
      }
    });
  },
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
          const last = entries.length > 0 ? entries[entries.length - 1] : null;
          if (last) {
            console.log('[WebVitals] LCP:', last.startTime.toFixed(2), 'ms');
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}
    }
  }

  // Cleanup cache periodically
  setInterval(() => {
    cache.cleanup();
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

  const measureAsync = useCallback(async (name: string, fn: () => Promise<any>) => {
    markStart(name);
    try {
      return await fn();
    } finally {
      markEnd(name);
    }
  }, []);

  return {
    measureAsync,
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
  const lastRun = useRef<number>(0);
  const throttled = useRef<boolean>(true);

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

// Named export for direct use without hook
export const performanceMonitor = () => ({
  measureAsync: async (name: string, fn: () => Promise<any>) => {
    markStart(name);
    try {
      return await fn();
    } finally {
      markEnd(name);
    }
  },
  cache: {
    set: (key: string, value: any, ttl?: number) => {
      memoryCache[key] = { value, expires: Date.now() + (ttl || 300000) };
    },
    get: (key: string) => {
      const entry = memoryCache[key];
      if (!entry) return null;
      if (Date.now() > entry.expires) {
        delete memoryCache[key];
        return null;
      }
      return entry.value;
    },
    has: (key: string) => Object.keys(memoryCache).includes(key),
    delete: (key: string) => delete memoryCache[key],
    clear: () => {
      Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
    },
  },
  trackMemory,
  getMetrics: () => ({ renderCount: 0, mountDuration: 0 })
});