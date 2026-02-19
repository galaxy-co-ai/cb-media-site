'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  BloomEffect,
  ChromaticAberrationEffect,
  NoiseEffect,
  VignetteEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  BlendFunction,
  KernelSize,
} from 'postprocessing';
import * as THREE from 'three';
import type { AnimState } from './EventHorizonScene';

interface IntroPostProcessingProps {
  animState: AnimState;
}

/**
 * Imperative postprocessing setup.
 * The declarative @react-three/postprocessing wrappers hit a circular-reference
 * serialization bug with React 19 (KawaseBlurPass → Resolution → resizable loop).
 * Using the postprocessing library directly avoids this entirely.
 */
export default function IntroPostProcessing({
  animState,
}: IntroPostProcessingProps) {
  const { gl, scene, camera } = useThree();

  const effects = useMemo(() => {
    const bloom = new BloomEffect({
      intensity: 0.3,
      luminanceThreshold: 0.6,
      luminanceSmoothing: 0.9,
      mipmapBlur: true,
      kernelSize: KernelSize.MEDIUM,
    });

    const ca = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0, 0),
      radialModulation: false,
      modulationOffset: 0,
    });

    const noise = new NoiseEffect({
      premultiply: true,
      blendFunction: BlendFunction.ADD,
    });
    noise.blendMode.opacity.value = 0.0;

    const vignette = new VignetteEffect({
      offset: 0.3,
      darkness: 0.7,
    });

    return { bloom, ca, noise, vignette };
  }, []);

  const composerRef = useRef<EffectComposer | null>(null);

  // Set up the composer once
  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.multisampling = 0;
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new EffectPass(camera, effects.bloom, effects.ca, effects.noise, effects.vignette),
    );
    composerRef.current = composer;

    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera, effects]);

  // Animate effects + render via composer each frame
  useFrame((_, delta) => {
    if (!composerRef.current) return;

    effects.bloom.intensity = animState.bloomIntensity;
    effects.ca.offset.set(animState.caOffset, animState.caOffset * 0.5);
    effects.vignette.darkness = animState.vignetteDarkness;

    composerRef.current.render(delta);
  }, 1); // priority 1 = runs after default render (priority 0)

  // This component renders nothing — it owns the render loop via useFrame
  return null;
}
