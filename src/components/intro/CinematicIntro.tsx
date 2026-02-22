'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import EventHorizonScene from './EventHorizonScene';

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [showSkip, setShowSkip] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const hasCompletedRef = useRef(false);

  // Stable onComplete that only fires once
  const handleComplete = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setCompleted(true);
    onComplete();
  }, [onComplete]);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      // Skip intro entirely
      if (containerRef.current) {
        containerRef.current.style.opacity = '1';
      }
      handleComplete();
      return;
    }

    // Show skip button after 1.5s
    const timer = setTimeout(() => setShowSkip(true), 1500);
    return () => clearTimeout(timer);
  }, [handleComplete]);

  const handleSkip = useCallback(() => {
    if (!timelineRef.current || skipped) return;
    setSkipped(true);

    const tl = timelineRef.current;
    // Seek to BLOOM phase (13s) — NOT the end.
    // tl.progress(1) only sets physics *parameters* to their final state,
    // but particles haven't actually moved through the GPU simulation.
    // Seeking to BLOOM gives particles the repulsion burst so they scatter
    // naturally, and the timeline plays through BLOOM → COAST (~6.5s).
    tl.seek(13);
    // Manually fire onComplete in case seek() suppresses embedded callbacks
    handleComplete();
  }, [skipped, handleComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        opacity: 0,
        zIndex: 50,
        background: '#000',
        pointerEvents: completed ? 'none' : 'auto',
      }}
    >
      <Canvas
        gl={{
          powerPreference: 'high-performance',
          antialias: false,
          stencil: false,
          alpha: false,
        }}
        dpr={[1, 2]}
        frameloop="always"
        flat
        onCreated={({ gl: renderer }) => {
          // Let our EffectComposer handle rendering
          renderer.autoClear = false;
          renderer.setClearColor(0x000000, 1);
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <EventHorizonScene
          containerRef={containerRef}
          onComplete={handleComplete}
          timelineRef={timelineRef}
        />
      </Canvas>

      {/* Skip button — fades away once intro completes */}
      {showSkip && !skipped && !completed && (
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            bottom: '2rem',
            right: '2rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-space-grotesk, sans-serif)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.5)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            transition: 'color 0.2s, border-color 0.2s',
            zIndex: 60,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
        >
          Skip Intro
        </button>
      )}
    </div>
  );
}
