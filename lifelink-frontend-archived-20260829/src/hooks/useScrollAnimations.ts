'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

import { HTMLMotionProps } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  offset?: ['start end', 'end start'] | [string, string];
}

export function AnimatedSection({ children, className = '', offset = ['start end', 'end start'] }: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ 
    target: ref, 
    offset: offset as any
  });

  const y = useTransform(scrollYProgress, [0, 1], ['100%', '0%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const blur = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, 0]);

  return (
    <motion.section
      ref={ref}
      style={{ 
        transform: `translateY(${y}) scale(${scale}) rotateX(${rotateX}deg)`,
        opacity,
        filter: `blur(${blur}px)`,
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ 
    target: ref, 
    offset: ['start end', 'end start'] as any
  });

  const y = useTransform(scrollYProgress, [0, 1], ['50px', '0px']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxLayer({ children, speed = 0.5, className = '' }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: ref });

  const y = useTransform(scrollY, [0, window.innerHeight], [`${speed * 100}px`, `${-speed * 100}px`]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgressIndicator() {
  const scrollProgress = useScroll();
  const progress = useTransform(scrollProgress, [0, 1], [0, 100]);

  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-red-500 to-red-600 z-50"
      style={{ transformOrigin: 'left center' }}
      animate={{ scaleX: progress }}
      initial={{ scaleX: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 30 }}
    />
  );
}