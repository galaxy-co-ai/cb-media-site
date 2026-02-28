'use client'

import { useRef, useEffect, useCallback, useMemo } from 'react'
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

function Singularity({ animState }: { animState: AnimState }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => new THREE.SphereGeometry(0.05, 16, 12), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#fffaf0'),
    transparent: true,
    opacity: 1,
  }), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const s = animState.singularityScale
    // Pulse effect during hold phase
    const pulse = s > 0.5 ? 1 + 0.15 * Math.sin(clock.getElapsedTime() * 8) : 1
    const scale = s * pulse
    meshRef.current.scale.set(scale, scale, scale)
    meshRef.current.visible = s > 0.01
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}

export function GalaxyScene({
  quality,
  timelineRef,
  animState,
  mouseRef,
  onAutoplayComplete,
}: GalaxySceneProps) {
  const { gl, camera } = useThree()

  // Configure renderer
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

  // Build GSAP timeline (~6s total)
  useEffect(() => {
    const tl = gsap.timeline({ paused: true })

    // Phase 1: Emerge (0–1s)
    tl.to(animState, {
      particleScale: 1,
      duration: 1.0,
      ease: 'power2.out',
    }, 0)

    // Phase 2: Drain — spiral toward center (1–3s)
    tl.to(animState, {
      drainProgress: 1,
      duration: 2.0,
      ease: 'power2.in',
    }, 1.0)

    // Phase 3: Collapse — singularity appears (2.5–3.2s)
    tl.to(animState, {
      singularityScale: 1,
      duration: 0.7,
      ease: 'power3.in',
    }, 2.5)

    // Phase 4: Pause — hold singularity (3.2–4.2s, implicit)

    // Phase 5: Explosion — blast particles outward (4.2s)
    tl.to(animState, {
      explodeProgress: 1,
      duration: 0.1,
      ease: 'none',
    }, 4.2)

    // Singularity shrinks after explosion (4.2–4.6s)
    tl.to(animState, {
      singularityScale: 0,
      duration: 0.4,
      ease: 'power2.out',
    }, 4.2)

    // Phase 6: Settle + Text (5–6s)
    tl.to(animState, {
      textOpacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    }, 5.0)

    tl.to(animState, {
      taglineOpacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    }, 5.4)

    // Autoplay complete at 6s
    tl.call(() => onAutoplayComplete(), [], 6.0)

    timelineRef.current = tl
    tl.play()

    return () => {
      tl.kill()
      timelineRef.current = null
    }
  }, [animState, timelineRef, onAutoplayComplete])

  // Cursor parallax
  useFrame(() => {
    if (!mouseRef.current) return
    const targetX = mouseRef.current.x * 0.3
    const targetY = mouseRef.current.y * 0.15
    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (targetY - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })

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
      <Singularity animState={animState} />
      <ShootingStars delay={5} />
    </>
  )
}
