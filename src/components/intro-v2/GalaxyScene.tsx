'use client'

import { useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import { GlassParticles } from './GlassParticles'
import { ShootingStars } from './ShootingStars'
import { Lighting } from './Lighting'
import type { QualityConfig } from './quality'
import type { AnimState } from './types'

interface GalaxySceneProps {
  quality: QualityConfig
  timelineRef: React.MutableRefObject<gsap.core.Timeline | null>
  animState: AnimState
  mouseRef: React.RefObject<{ x: number; y: number }>
  onAutoplayComplete: () => void
}

export function GalaxyScene({
  quality,
  timelineRef,
  animState,
  mouseRef,
  onAutoplayComplete,
}: GalaxySceneProps) {
  const { gl, camera } = useThree()

  // Configure renderer — warm dark background
  useEffect(() => {
    gl.toneMapping = THREE.AgXToneMapping
    gl.toneMappingExposure = 1.0
    gl.setClearColor(new THREE.Color('#0a0806'), 1)
  }, [gl])

  // Position camera
  useEffect(() => {
    camera.position.set(0, 0, 3)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Build GSAP timeline (~2s)
  useEffect(() => {
    const tl = gsap.timeline({ paused: true })

    // 0–0.8s: Particles emerge (staggered per-particle in GlassParticles)
    tl.to(animState, {
      particleScale: 1,
      duration: 0.8,
      ease: 'power2.out',
    }, 0)

    // 0.5–1.5s: Headline fades in
    tl.to(animState, {
      textOpacity: 1,
      duration: 1.0,
      ease: 'power2.out',
    }, 0.5)

    // 1.2–2.0s: Tagline fades in
    tl.to(animState, {
      taglineOpacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    }, 1.2)

    // 2.0s: Autoplay complete
    tl.call(() => onAutoplayComplete(), [], 2.0)

    timelineRef.current = tl
    tl.play()

    return () => {
      tl.kill()
      timelineRef.current = null
    }
  }, [animState, timelineRef, onAutoplayComplete])

  // Cursor parallax — smooth camera offset toward mouse
  useFrame(() => {
    if (!mouseRef.current) return
    const targetX = mouseRef.current.x * 0.3
    const targetY = mouseRef.current.y * 0.15
    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (targetY - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })

  // PerformanceMonitor
  const handleDecline = useCallback(() => {
    gl.setPixelRatio(Math.max(0.75, window.devicePixelRatio * 0.5))
  }, [gl])

  const handleIncline = useCallback(() => {
    gl.setPixelRatio(Math.min(2, window.devicePixelRatio))
  }, [gl])

  return (
    <>
      <PerformanceMonitor onDecline={handleDecline} onIncline={handleIncline} />
      <fog attach="fog" args={['#0a0806', 10, 25]} />
      <Lighting />
      <GlassParticles quality={quality} animState={animState} />
      <ShootingStars delay={2} />
    </>
  )
}
