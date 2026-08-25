// src/lib/performance.js
// Performance monitoring and optimization utilities

// Performance marks and measures
export function markStart(name) {
  performance.mark(`${name}-start`);
}

export function markEnd(name) {
  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);
  const measure = performance.getEntriesByName(name, 'measure')[0];
  return measure?.duration || 0;
}

// Measure async function execution
export async function measureAsync(name, fn) {
  markStart(name);
  try {
    const result = await fn();
    return result;
  } finally {
    const duration = markEnd(name);
    if (duration > 100) {
      console.warn(`[Perf] ${name} took ${duration.toFixed(2)}ms`);
    }
    return duration;
  }
}

// Web Vitals tracking
export function trackWebVitals() {
  if (!('PerformanceObserver' in window)) return;

  // LCP - Largest Contentful Paint
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('[WebVitals] LCP:', lastEntry.startTime.toFixed(2), 'ms');
    sendToAnalytics('LCP', lastEntry.startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });

  // FID - First Input Delay
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach((entry) => {
      console.log('[WebVitals] FID:', entry.processingStart - entry.startTime, 'ms');
      sendToAnalytics('FID', entry.processingStart - entry.startTime);
    });
  }).observe({ type: 'first-input', buffered: true });

  // CLS - Cumulative Layout Shift
  new PerformanceObserver((entryList) => {
    let clsValue = 0;
    entries.forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    console.log('[WebVitals] CLS:', clsValue.toFixed(4));
    sendToAnalytics('CLS', clsValue);
  }).observe({ type: 'layout-shift', buffered: true });

  // TTFB - Time to First Byte
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach((entry) => {
      console.log('[WebVitals] TTFB:', entry.responseStart - entry.requestStart, 'ms');
      sendToAnalytics('TTFB', entry.responseStart - entry.requestStart);
    });
  }).observe({ type: 'navigation', buffered: true });
}

function sendToAnalytics(metric, value) {
  // In production, send to your analytics endpoint
  // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ metric, value, timestamp: Date.now() }) });
}

// Resource timing analysis
export function analyzeResourceTiming() {
  if (!performance.getEntriesByType) return;

  const resources = performance.getEntriesByType('resource');
  const slowResources = resources
    .filter((r) => r.duration > 500)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  if (slowResources.length > 0) {
    console.group('[Perf] Slow Resources (>500ms)');
    slowResources.forEach((r) => {
      console.log(`${r.duration.toFixed(2)}ms - ${r.name}`);
    });
    console.groupEnd();
  }

  return slowResources;
}

// Memory monitoring (Chrome only)
export function trackMemory() {
  if ('memory' in performance) {
    const mem = performance.memory;
    console.log('[Memory]', {
      used: (mem.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      total: (mem.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      limit: (mem.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    });
    return mem;
  }
  return null;
}

// Cache utilities
export const cache = {
  // Memory cache with TTL
  memory: new Map(),
  
  set(key, value, ttlMs = 300000) { // 5 min default
    this.memory.set(key, {
      value,
      expires: Date.now() + ttlMs
    });
  },
  
  get(key) {
    const entry = this.memory.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  },
  
  has(key) {
    return this.get(key) !== null;
  },
  
  delete(key) {
    this.memory.delete(key);
  },
  
  clear() {
    this.memory.clear();
  },
  
  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.memory.entries()) {
      if (now > entry.expires) {
        this.memory.delete(key);
      }
    }
  }
};

// Debounce function
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle function
export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Request idle callback polyfill
export function requestIdleCallbackPolyfill(callback, options) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  return setTimeout(() => callback({
    timeRemaining: () => Math.max(0, 50 - (Date.now() - performance.now())),
    didTimeout: false
  }), 1);
}

// Intersection Observer for lazy loading
export function createLazyObserver(callback, options = {}) {
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all immediately
    return {
      observe: (el) => callback(el),
      unobserve: () => {},
      disconnect: () => {}
    };
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '100px',
    threshold: 0.01,
    ...options
  });

  return observer;
}

// Performance budgets
export const PERFORMANCE_BUDGETS = {
  // Time budgets (ms)
  apiResponse: 500,
  pageLoad: 3000,
  interaction: 100,
  
  // Size budgets (KB)
  jsBundle: 200,
  cssBundle: 50,
  totalPage: 1000
};

// Check if performance budgets are met
export function checkPerformanceBudgets() {
  const navigation = performance.getEntriesByType('navigation')[0];
  if (!navigation) return { passed: true, violations: [] };

  const violations = [];
  
  if (navigation.loadEventEnd - navigation.startTime > PERFORMANCE_BUDGETS.pageLoad) {
    violations.push(`Page load (${(navigation.loadEventEnd - navigation.startTime).toFixed(0)}ms) exceeds ${PERFORMANCE_BUDGETS.pageLoad}ms`);
  }
  
  if (navigation.responseStart - navigation.requestStart > PERFORMANCE_BUDGETS.apiResponse) {
    violations.push(`TTFB (${(navigation.responseStart - navigation.requestStart).toFixed(0)}ms) exceeds ${PERFORMANCE_BUDGETS.apiResponse}ms`);
  }

  return { passed: violations.length === 0, violations };
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    trackWebVitals();
    
    // Periodic memory check
    setInterval(() => trackMemory(), 30000);
    
    // Periodic resource analysis
    setInterval(() => analyzeResourceTiming(), 60000);
    
    // Check budgets on load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const result = checkPerformanceBudgets();
        if (!result.passed) {
          console.warn('[Perf] Budget violations:', result.violations);
        }
      }, 0);
    });
  }
  
  // Cleanup memory cache periodically
  setInterval(() => cache.cleanup(), 60000);
}

// Export all
export default {
  markStart,
  markEnd,
  measureAsync,
  trackWebVitals,
  analyzeResourceTiming,
  trackMemory,
  cache,
  debounce,
  throttle,
  requestIdleCallbackPolyfill,
  createLazyObserver,
  PERFORMANCE_BUDGETS,
  checkPerformanceBudgets,
  initPerformanceMonitoring
};