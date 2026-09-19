'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useDeviceCapabilities() {
  const [caps, setCaps] = useState({
    webgl2: false,
    webgl: false,
    reducedMotion: false,
    lowMemory: false,
    prefersReducedMotion: false,
  });

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const webgl2 = !!canvas.getContext('webgl2');
    const webgl = webgl2 || !!canvas.getContext('webgl');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowMemory = (navigator as any).deviceMemory <= 2;

    setCaps({
      webgl2,
      webgl,
      reducedMotion,
      lowMemory,
      prefersReducedMotion: reducedMotion,
    });
  }, []);

  return caps;
}

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(Math.min(scrollTop / docHeight, 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}

export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, rootMargin: '50px', ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, options.threshold, options.rootMargin]);

  return isIntersecting;
}

export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}