'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import { CrystalShards } from './CrystalShards'
import { Lighting } from './Lighting'
// PostFX disabled: @react-three/postprocessing 3.x crashes with R3F 9 / React 19
// import { PostFX } from './PostFX'
import type { QualityConfig } from './quality'
import type { AnimState } from './types'

interface CrystalSceneProps {
  quality: QualityConfig
  timelineRef: React.MutableRefObject<gsap.core.Timeline | null>
  animState: AnimState
  onAutoplayComplete: () => void
}

export function CrystalScene({
  quality,
  timelineRef,
  animState,
  onAutoplayComplete,
}: CrystalSceneProps) {
  const { gl, camera } = useThree()

  // Configure renderer
  useEffect(() => {
    gl.toneMapping = THREE.AgXToneMapping
    gl.toneMappingExposure = 1.0
    gl.setClearColor(0x000000, 1)
  }, [gl])

  // Position camera
  useEffect(() => {
    camera.position.set(0, 0, 3)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Build GSAP master timeline
  useEffect(() => {
    const tl = gsap.timeline({ paused: true })

    // Phase 1: Emergence (0–1.5s)
    tl.to(animState, {
      crystalScale: 1,
      duration: 1.5,
      ease: 'power3.out',
    }, 0)

    tl.to(animState, {
      bloomIntensity: 0.4,
      duration: 1.5,
      ease: 'power2.in',
    }, 0)

    // Phase 2: Dissolution (1.7–3s)
    tl.to(animState, {
      rotationSpeed: 0,
      duration: 0.2,
      ease: 'power2.out',
    }, 1.5)

    tl.to(animState, {
      dissolutionProgress: 1,
      duration: 1.3,
      ease: 'power2.out',
    }, 1.7)

    tl.to(animState, {
      caOffset: 0.0012,
      duration: 0.6,
      ease: 'power2.in',
    }, 1.7)

    tl.to(animState, {
      caOffset: 0.0006,
      duration: 0.7,
      ease: 'power2.out',
    }, 2.3)

    // Phase 3: Text reveal (3–4.5s)
    tl.to(animState, {
      textOpacity: 1,
      duration: 1.0,
      ease: 'power2.out',
    }, 3.0)

    tl.to(animState, {
      taglineOpacity: 1,
      duration: 1.0,
      ease: 'power2.out',
    }, 3.5)

    // Signal autoplay complete at 4.5s
    tl.call(() => {
      onAutoplayComplete()
    }, [], 4.5)

    timelineRef.current = tl
    tl.play()

    return () => {
      tl.kill()
      timelineRef.current = null
    }
  }, [animState, timelineRef, onAutoplayComplete])

  // PerformanceMonitor callbacks
  const handleDecline = useCallback(() => {
    gl.setPixelRatio(Math.max(0.75, window.devicePixelRatio * 0.5))
  }, [gl])

  const handleIncline = useCallback(() => {
    gl.setPixelRatio(Math.min(2, window.devicePixelRatio))
  }, [gl])

  return (
    <>
      <PerformanceMonitor
        onDecline={handleDecline}
        onIncline={handleIncline}
      />
      <color attach="background" args={[0x000000]} />
      <Lighting />
      <CrystalShards quality={quality} animState={animState} />
      {/* PostFX disabled: @react-three/postprocessing 3.x has circular JSON error with R3F 9 / React 19
      {!quality.fallback && <PostFX quality={quality} animState={animState} />}
      */}
    </>
  )
}
