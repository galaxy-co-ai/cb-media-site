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
  // Rendering
  colorTemp: number;
  particleOpacity: number;
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
    brownian: 0.02,
    maxSpeed: 0.1,
    repulsion: 0,
    drag: 0.998,
    spiral: 0,
    colorTemp: 4000,
    particleOpacity: 1.0,
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
    // Phase 1: DRIFT (0–4s)
    // Canvas fades in, particles drift gently
    // =====================================================================
    tl.fromTo(
      container,
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: 'power2.out' },
      0,
    );

    // =====================================================================
    // Phase 2: PULL (4–7s)
    // Gravity activates, drag bleeds energy, cyclonic spiral begins
    // =====================================================================
    tl.to(
      animState,
      { gravity: 2.0, duration: 3, ease: 'power2.in' },
      4,
    );
    tl.to(
      animState,
      { spiral: 4.0, duration: 3, ease: 'power2.in' },
      4,
    );
    tl.to(
      animState,
      { drag: 0.99, duration: 2, ease: 'power1.in' },
      4,
    );
    tl.to(
      animState,
      { maxSpeed: 3.0, duration: 3, ease: 'power1.in' },
      4,
    );
    tl.to(
      animState,
      { bloomIntensity: 0.6, duration: 3, ease: 'power1.in' },
      4,
    );

    // =====================================================================
    // Phase 3: STEADY DRAIN (7–21.5s)
    // 14.5 seconds of constant gravity + constant drag = uniform drain.
    // Inner particles reach center first, outer follow steadily.
    // (+20% duration from 12s to give outer particles time to arrive)
    // =====================================================================
    // Gravity + cyclonic spiral ramp — accelerating rate through the drain
    tl.to(
      animState,
      { gravity: 3.5, duration: 14.5, ease: 'power2.in' },
      7,
    );
    tl.to(
      animState,
      { spiral: 12.0, duration: 14.5, ease: 'power3.in' },
      7,
    );
    tl.to(
      animState,
      { diskFlatten: 1.0, duration: 14.5, ease: 'power2.inOut' },
      7,
    );
    tl.to(
      animState,
      { colorTemp: 8000, duration: 14.5, ease: 'power1.in' },
      7,
    );
    tl.to(
      animState,
      { bloomIntensity: 1.2, duration: 14.5, ease: 'power1.in' },
      7,
    );
    tl.to(
      animState,
      { caOffset: 0.001, duration: 14.5, ease: 'power1.in' },
      7,
    );
    tl.to(
      animState,
      { brownian: 0.005, duration: 7, ease: 'power1.in' },
      7,
    );

    // =====================================================================
    // Phase 4: FINAL GATHER (21.5–23s)
    // Gentle nudge for stragglers — NO violent collapse
    // =====================================================================
    tl.to(
      animState,
      { collapseForce: 3, duration: 1.5, ease: 'power1.in' },
      21.5,
    );
    tl.to(
      animState,
      { colorTemp: 15000, duration: 1.5, ease: 'power2.in' },
      21.5,
    );
    tl.to(
      animState,
      { diskFlatten: 2.0, duration: 1.0, ease: 'power1.in' },
      22,
    );
    tl.to(
      animState,
      { bloomIntensity: 2.5, duration: 1.5, ease: 'power1.in' },
      21.5,
    );

    // =====================================================================
    // Phase 5: FADE TO BLACK (23–25s)
    // Concentrated ball glows, then gracefully dims into darkness
    // =====================================================================
    tl.to(
      animState,
      { bloomIntensity: 3.5, duration: 0.4, ease: 'power2.in' },
      23,
    );
    tl.to(
      animState,
      { particleOpacity: 0, duration: 1.2, ease: 'power2.in' },
      23.3,
    );
    tl.to(
      animState,
      { bloomIntensity: 0, duration: 1.0, ease: 'power2.in' },
      23.5,
    );
    tl.to(
      container,
      { opacity: 0, duration: 0.8, ease: 'power2.in' },
      23.8,
    );

    // =====================================================================
    // Phase 6: VOID (24.8–26s)
    // ~1.2s pure black tension
    // =====================================================================
    // (Container already at opacity 0 — just wait)

    // =====================================================================
    // Phase 7: BLOOM (26–28.5s)
    // Particles expand outward with curl noise — organic galaxy scatter
    // =====================================================================

    // Fire onComplete early so hero text fades in during bloom
    tl.call(onCompleteStable, undefined, 26);

    // Instant physics reset at t=26
    tl.to(
      animState,
      {
        gravity: 0,
        diskFlatten: 0,
        collapseForce: 0,
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
      26,
    );

    // Container fades in, repulsion pushes particles outward
    tl.to(
      container,
      { opacity: 1, duration: 2.5, ease: 'power2.out' },
      26,
    );
    tl.to(
      animState,
      { particleOpacity: 0.8, duration: 2.5, ease: 'power2.out' },
      26,
    );
    tl.to(
      animState,
      { repulsion: 12.0, duration: 0.01, ease: 'none' },
      26,
    );
    tl.to(
      animState,
      { bloomIntensity: 0.6, duration: 2.0, ease: 'power2.out' },
      26,
    );
    // Begin tapering repulsion during bloom itself (not waiting for coast)
    tl.to(
      animState,
      { repulsion: 3.0, duration: 2.5, ease: 'power1.out' },
      26.5,
    );

    // =====================================================================
    // Phase 8: COAST (29–34s)
    // Gradual tail-off — everything decays slowly into ambient drift
    // =====================================================================
    tl.to(
      animState,
      { repulsion: 0, duration: 5.0, ease: 'power1.out' },
      29,
    );
    tl.to(
      animState,
      { maxSpeed: 0.05, duration: 4.0, ease: 'power1.out' },
      29,
    );
    tl.to(
      animState,
      { particleOpacity: 0.3, duration: 5.0, ease: 'power1.out' },
      29,
    );
    tl.to(
      animState,
      { bloomIntensity: 0.2, duration: 5.0, ease: 'power1.out' },
      29,
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
