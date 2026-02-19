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
    gravity: 1.5,         // Already pulling from frame 1
    diskFlatten: 0.3,     // Already disk-shaped
    collapseForce: 0,
    brownian: 0.005,      // Clean spiral, less noise
    maxSpeed: 2.0,        // Fast enough to see motion immediately
    repulsion: 0,
    drag: 0.995,          // Bleeding energy into spiral
    colorTemp: 4500,
    particleOpacity: 1.0,
    bloomIntensity: 0.4,
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
    // Phase 1: GALAXY REVEAL (0–2s)
    // Already spiraling on load — fade in the drama
    // =====================================================================
    tl.fromTo(
      container,
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: 'power2.out' },
      0,
    );

    // =====================================================================
    // Phase 2: INTENSIFYING VORTEX (0–8s)
    // Gravity ramps, spiral tightens, stars accelerate into the drain
    // =====================================================================
    tl.to(
      animState,
      { gravity: 4.0, duration: 8, ease: 'power2.in' },
      0,
    );
    tl.to(
      animState,
      { maxSpeed: 5.0, duration: 6, ease: 'power2.in' },
      0,
    );
    tl.to(
      animState,
      { drag: 0.985, duration: 8, ease: 'power1.in' },
      0,
    );
    tl.to(
      animState,
      { diskFlatten: 1.5, duration: 8, ease: 'power2.inOut' },
      0,
    );
    tl.to(
      animState,
      { bloomIntensity: 0.8, duration: 6, ease: 'power1.in' },
      1,
    );
    tl.to(
      animState,
      { colorTemp: 7000, duration: 8, ease: 'power1.in' },
      0,
    );
    tl.to(
      animState,
      { caOffset: 0.0008, duration: 8, ease: 'power1.in' },
      0,
    );

    // =====================================================================
    // Phase 3: WORMHOLE COLLAPSE (8–13s)
    // Violent acceleration, everything spiraling into the singularity
    // =====================================================================
    tl.to(
      animState,
      { gravity: 6.0, duration: 5, ease: 'power3.in' },
      8,
    );
    tl.to(
      animState,
      { maxSpeed: 8.0, duration: 4, ease: 'power2.in' },
      8,
    );
    tl.to(
      animState,
      { colorTemp: 12000, duration: 5, ease: 'power2.in' },
      8,
    );
    tl.to(
      animState,
      { bloomIntensity: 1.8, duration: 5, ease: 'power2.in' },
      8,
    );
    tl.to(
      animState,
      { diskFlatten: 2.5, duration: 5, ease: 'power2.in' },
      8,
    );
    tl.to(
      animState,
      { caOffset: 0.002, duration: 5, ease: 'power2.in' },
      8,
    );

    // =====================================================================
    // Phase 4: SINGULARITY (13–15s)
    // Final violent collapse — everything sucked to a point
    // =====================================================================
    tl.to(
      animState,
      { collapseForce: 5, duration: 2, ease: 'power2.in' },
      13,
    );
    tl.to(
      animState,
      { colorTemp: 15000, duration: 1.5, ease: 'power3.in' },
      13,
    );
    tl.to(
      animState,
      { bloomIntensity: 3.0, duration: 2, ease: 'power2.in' },
      13,
    );

    // =====================================================================
    // Phase 5: FADE TO BLACK (15–17s)
    // White-hot center implodes into darkness
    // =====================================================================
    tl.to(
      animState,
      { bloomIntensity: 4.0, duration: 0.4, ease: 'power3.in' },
      15,
    );
    tl.to(
      animState,
      { particleOpacity: 0, duration: 1.0, ease: 'power2.in' },
      15.2,
    );
    tl.to(
      animState,
      { bloomIntensity: 0, duration: 0.8, ease: 'power2.in' },
      15.5,
    );
    tl.to(
      container,
      { opacity: 0, duration: 0.6, ease: 'power2.in' },
      15.8,
    );

    // =====================================================================
    // Phase 6: VOID (17–18s)
    // Pure black tension
    // =====================================================================

    // =====================================================================
    // Phase 7: BLOOM (18–21s)
    // Particles explode outward — galaxy rebirth
    // =====================================================================

    // Fire onComplete so hero text fades in during bloom
    tl.call(onCompleteStable, undefined, 18);

    // Instant physics reset
    tl.to(
      animState,
      {
        gravity: 0,
        diskFlatten: 0,
        collapseForce: 0,
        brownian: 0.01,
        maxSpeed: 15.0,
        colorTemp: 6000,
        caOffset: 0,
        vignetteDarkness: 0.7,
        drag: 0.997,
        duration: 0.01,
        ease: 'none',
      },
      18,
    );

    // Container fades in, repulsion pushes particles outward
    tl.to(
      container,
      { opacity: 1, duration: 2.0, ease: 'power2.out' },
      18,
    );
    tl.to(
      animState,
      { particleOpacity: 0.8, duration: 2.0, ease: 'power2.out' },
      18,
    );
    tl.to(
      animState,
      { repulsion: 14.0, duration: 0.01, ease: 'none' },
      18,
    );
    tl.to(
      animState,
      { bloomIntensity: 0.6, duration: 1.5, ease: 'power2.out' },
      18,
    );
    tl.to(
      animState,
      { repulsion: 3.0, duration: 2.0, ease: 'power1.out' },
      18.5,
    );

    // =====================================================================
    // Phase 8: COAST (21–26s)
    // Gradual decay into ambient starfield
    // =====================================================================
    tl.to(
      animState,
      { repulsion: 0, duration: 5.0, ease: 'power1.out' },
      21,
    );
    tl.to(
      animState,
      { maxSpeed: 0.05, duration: 4.0, ease: 'power1.out' },
      21,
    );
    tl.to(
      animState,
      { particleOpacity: 0.3, duration: 5.0, ease: 'power1.out' },
      21,
    );
    tl.to(
      animState,
      { bloomIntensity: 0.2, duration: 5.0, ease: 'power1.out' },
      21,
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
      <PerspectiveCamera makeDefault position={[0, 0, 40]} fov={60} />
      <GPGPUParticles animState={animState} />
      <IntroPostProcessing animState={animState} />
    </>
  );
}
