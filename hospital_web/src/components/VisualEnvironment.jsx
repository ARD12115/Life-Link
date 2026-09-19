import React, { useEffect, useRef, useMemo } from 'react';

const VisualEnvironment = () => {
  const containerRef = useRef(null);
  const scrollRef = useRef(0);
  const rafRef = useRef(null);

  // Memoize particles to avoid re-creation
  const particles = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      top: `${(i * 17) % 100}%`,
      left: `${(i * 23) % 100}%`,
      parallaxMultiplier: 1 + (i % 3),
    }));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    const updateStage = () => {
      if (containerRef.current) {
        const scrollPos = scrollRef.current;
        const rotationSpeed = 0.2;

        // Directly update CSS properties via the ref to bypass React rendering
        containerRef.current.style.setProperty(
          '--scroll-rotation',
          `${scrollPos * rotationSpeed}deg`
        );
        containerRef.current.style.setProperty('--scroll-y-offset', `${scrollPos * 0.1}px`);

        // Multiplier for parallax particles
        containerRef.current.style.setProperty('--scroll-pos', `${scrollPos}px`);
      }
      rafRef.current = requestAnimationFrame(updateStage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    rafRef.current = requestAnimationFrame(updateStage);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="visual-environment-root"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, var(--blood-glow) 0%, transparent 70%)',
        opacity: 'var(--aura-opacity)',
        '--scroll-rotation': '0deg',
        '--scroll-y-offset': '0px',
        '--scroll-pos': '0px',
      }}
    >
      {/* 3D Focal Point: The Ruby Blood Cell */}
      <div
        className="focal-cell"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(calc(-1 * var(--scroll-y-offset))) rotateY(var(--scroll-rotation)) rotateX(calc(var(--scroll-rotation) * 0.3))`,
          width: '400px',
          height: '400px',
          background: 'var(--blood-ruby)',
          borderRadius: '50%',
          boxShadow:
            'inset -20px -20px 60px rgba(0,0,0,0.5), inset 20px 20px 60px rgba(255,255,255,0.2), 0 0 80px var(--blood-ruby)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'blur(1px)',
          opacity: 0.8,
          transition: 'opacity 0.5s ease',
          willChange: 'transform', // GPU Hint
        }}
      >
        <div
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.2)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      {/* Atmospheric Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            width: '4px',
            height: '4px',
            background: 'var(--blood-ruby)',
            borderRadius: '50%',
            filter: 'blur(2px)',
            opacity: 0.3,
            transform: `translateY(calc(-0.1 * var(--scroll-pos) * ${p.parallaxMultiplier}))`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
};

export default VisualEnvironment;
