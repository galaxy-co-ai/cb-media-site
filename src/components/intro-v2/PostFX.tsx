'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import type { ChromaticAberrationEffect } from 'postprocessing'
import * as THREE from 'three'
import type { QualityConfig } from './quality'

interface PostFXProps {
  quality: QualityConfig
  animState: {
    bloomIntensity: number
    caOffset: number
  }
}

export function PostFX({ quality, animState }: PostFXProps) {
  const caRef = useRef<ChromaticAberrationEffect>(null)

  useFrame(() => {
    if (caRef.current && quality.postFX.chromaticAberration) {
      const offset = animState.caOffset
      caRef.current.offset = new THREE.Vector2(offset, offset)
    }
  })

  // Always render all effects — disabled ones use neutral values (zero cost)
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={quality.postFX.bloom ? 0.4 : 0}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.3}
        radius={0.6}
        mipmapBlur
      />

      <ChromaticAberration
        ref={caRef}
        blendFunction={BlendFunction.NORMAL}
        offset={
          quality.postFX.chromaticAberration
            ? new THREE.Vector2(0.0006, 0.0006)
            : new THREE.Vector2(0, 0)
        }
        radialModulation
        modulationOffset={0.2}
      />

      <Vignette
        offset={0.3}
        darkness={quality.postFX.vignette ? 0.7 : 0}
        blendFunction={BlendFunction.NORMAL}
      />

      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  )
}
