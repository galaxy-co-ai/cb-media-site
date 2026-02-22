'use client';

import { useMemo, useCallback } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import GPGPUParticles from './GPGPUParticles';
import IntroPostProcessing from './IntroPostProcessing';

// --- AnimState: plain mutable object for zero-rerender animation ---
export interface AnimState {
  // GPGPU forces
  gravity: number;
  diskFlatten: number;
  collapseForce: number;
  brownian: number;
  maxSpeed: number;
  repulsion: number;
  drag: number;
  spiral: number;
  centerDampen: number;
  // Rendering
  colorTemp: number;
  particleOpacity: number;
  boundaryRadius: number;
  pointSize: number;
  // Post-processing
  bloomIntensity: number;
  caOffset: number;
  vignetteDarkness: number;
}

function createAnimState(): AnimState {
  return {
    gravity: 0,
    diskFlatten: 0,
    collapseForce: 0,
    brownian: 0.015,
    maxSpeed: 0.1,
    repulsion: 0,
    drag: 0.998,
    spiral: 0,
    centerDampen: 0,
    colorTemp: 4000,
    particleOpacity: 1.0,
    boundaryRadius: 999,
    pointSize: 0.7,
    bloomIntensity: 0.3,
    caOffset: 0,
    vignetteDarkness: 0.7,
  };
}

interface EventHorizonSceneProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onComplete: () => void;
  timelineRef?: React.MutableRefObject<gsap.core.Timeline | null>;
}

export default function EventHorizonScene({
  containerRef,
  onComplete,
  timelineRef,
}: EventHorizonSceneProps) {
  const animState = useMemo(() => createAnimState(), []);

  const onCompleteStable = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // --- GSAP Master Timeline ---
  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline({
      paused: true,
      onComplete: onCompleteStable,
    });

    // Expose timeline for skip button
    if (timelineRef) {
      timelineRef.current = tl;
    }

    // =====================================================================
    // Phase 1: DRIFT (0–2s)
    // Canvas fades in, particles drift gently
    // =====================================================================
    tl.fromTo(
      container,
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: 'power2.out' },
      0,
    );

    // =====================================================================
    // Phase 2: PULL (2–4s)
    // Gravity activates, cyclonic spiral begins
    // =====================================================================
    tl.to(
      animState,
      { gravity: 2.0, duration: 2, ease: 'power2.in' },
      2,
    );
    tl.to(
      animState,
      { spiral: 4.0, duration: 2, ease: 'power2.in' },
      2,
    );
    tl.to(
      animState,
      { drag: 0.995, duration: 1.5, ease: 'power1.in' },
      2,
    );
    tl.to(
      animState,
      { maxSpeed: 3.0, duration: 2, ease: 'power1.in' },
      2,
    );
    tl.to(
      animState,
      { bloomIntensity: 0.6, duration: 2, ease: 'power1.in' },
      2,
    );

    // =====================================================================
    // Phase 3: STEADY DRAIN (4–10s)
    // 6 seconds — power4.in easing front-loads the drama so the last
    // third accelerates hard instead of drifting.
    // =====================================================================
    tl.to(
      animState,
      { gravity: 5.0, duration: 6, ease: 'power4.in' },
      4,
    );
    tl.to(
      animState,
      { spiral: 12.0, duration: 6, ease: 'power4.in' },
      4,
    );
    tl.to(
      animState,
      { diskFlatten: 1.0, duration: 6, ease: 'power2.inOut' },
      4,
    );
    tl.to(
      animState,
      { colorTemp: 8000, duration: 6, ease: 'power2.in' },
      4,
    );
    tl.to(
      animState,
      { bloomIntensity: 1.2, duration: 6, ease: 'power2.in' },
      4,
    );
    tl.to(
      animState,
      { caOffset: 0.001, duration: 6, ease: 'power1.in' },
      4,
    );
    tl.to(
      animState,
      { brownian: 0.005, duration: 3, ease: 'power1.in' },
      4,
    );
    // Center dampen ramps in late DRAIN — kills orbital momentum so
    // particles fall INTO the center instead of orbiting with a void.
    tl.to(
      animState,
      { centerDampen: 3.0, duration: 3, ease: 'power2.in' },
      7,
    );

    // =====================================================================
    // Phase 4: FINAL GATHER (10–11.5s)
    // Aggressive collapse + center dampen peak — fill the void with a
    // solid white-hot glow. No more hollow center.
    // =====================================================================
    tl.to(
      animState,
      { collapseForce: 5, duration: 1.5, ease: 'power2.in' },
      10,
    );
    tl.to(
      animState,
      { centerDampen: 6.0, duration: 1.0, ease: 'power1.in' },
      10,
    );
    tl.to(
      animState,
      { colorTemp: 15000, duration: 1.5, ease: 'power2.in' },
      10,
    );
    tl.to(
      animState,
      { diskFlatten: 2.0, duration: 1.0, ease: 'power1.in' },
      10.2,
    );
    tl.to(
      animState,
      { bloomIntensity: 3.0, duration: 1.5, ease: 'power2.in' },
      10,
    );

    // =====================================================================
    // Phase 5: FADE TO BLACK (11.5–12.5s)
    // Bloom peaks white-hot, then everything dims to black
    // =====================================================================
    tl.to(
      animState,
      { bloomIntensity: 4.0, duration: 0.3, ease: 'power2.in' },
      11.5,
    );
    tl.to(
      animState,
      { particleOpacity: 0, duration: 0.7, ease: 'power2.in' },
      11.7,
    );
    tl.to(
      animState,
      { bloomIntensity: 0, duration: 0.6, ease: 'power2.in' },
      11.8,
    );
    tl.to(
      container,
      { opacity: 0, duration: 0.5, ease: 'power2.in' },
      12.0,
    );

    // =====================================================================
    // Phase 6: VOID (12.5–13s)
    // ~0.5s pure black tension
    // =====================================================================
    // (Container already at opacity 0 — just wait)

    // =====================================================================
    // Phase 7: BLOOM (13–15s)
    // Particles expand outward with curl noise — organic galaxy scatter
    // =====================================================================

    // Fire onComplete early so hero text fades in during bloom
    tl.call(onCompleteStable, undefined, 13);

    // Instant physics reset at t=13
    tl.to(
      animState,
      {
        gravity: 0,
        diskFlatten: 0,
        collapseForce: 0,
        centerDampen: 0,
        spiral: 0,
        brownian: 0.01,
        maxSpeed: 15.0,
        colorTemp: 6000,
        caOffset: 0,
        vignetteDarkness: 0.7,
        drag: 0.997,
        duration: 0.01,
        ease: 'none',
      },
      13,
    );

    // Container fades in, repulsion pushes particles outward
    tl.to(
      container,
      { opacity: 1, duration: 2.0, ease: 'power2.out' },
      13,
    );
    tl.to(
      animState,
      { particleOpacity: 0.8, duration: 2.0, ease: 'power2.out' },
      13,
    );
    tl.to(
      animState,
      { repulsion: 12.0, duration: 0.01, ease: 'none' },
      13,
    );
    tl.to(
      animState,
      { bloomIntensity: 0.6, duration: 1.5, ease: 'power2.out' },
      13,
    );
    // Begin tapering repulsion during bloom itself
    tl.to(
      animState,
      { repulsion: 3.0, duration: 2.0, ease: 'power1.out' },
      13.5,
    );

    // =====================================================================
    // Phase 8: COAST (15–19.5s)
    // Gradual tail-off — everything decays into ambient galaxy drift
    // =====================================================================
    tl.to(
      animState,
      { repulsion: 0, duration: 4.5, ease: 'power1.out' },
      15,
    );
    tl.to(
      animState,
      { maxSpeed: 0.15, duration: 3.5, ease: 'power1.out' },
      15,
    );
    tl.to(
      animState,
      { particleOpacity: 0.4, duration: 4.5, ease: 'power1.out' },
      15,
    );
    tl.to(
      animState,
      { bloomIntensity: 0.4, duration: 4.5, ease: 'power1.out' },
      15,
    );
    // Boundary containment fades in — keeps particles on screen
    tl.to(
      animState,
      { boundaryRadius: 30, duration: 3, ease: 'power1.out' },
      15,
    );
    // Stars grow larger as they settle
    tl.to(
      animState,
      { pointSize: 1.8, duration: 4, ease: 'power1.out' },
      15,
    );
    // Increase brownian for gentle ambient drift
    tl.to(
      animState,
      { brownian: 0.04, duration: 4, ease: 'power1.out' },
      16,
    );

    // Start timeline after a brief init delay
    gsap.delayedCall(0.2, () => tl.play());

    return () => {
      tl.kill();
    };
  }, { scope: containerRef });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={60} />
      <GPGPUParticles animState={animState} />
      <IntroPostProcessing animState={animState} />
    </>
  );
}
