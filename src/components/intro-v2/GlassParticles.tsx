'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { QualityConfig } from './quality'
import type { AnimState } from './types'

// Reusable math objects — allocated once
const _matrix = new THREE.Matrix4()
const _position = new THREE.Vector3()
const _quaternion = new THREE.Quaternion()
const _scale = new THREE.Vector3()

interface Particle {
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
  radius: number
  twinkleSpeed: number
  twinklePhase: number
}

interface GlassParticlesProps {
  quality: QualityConfig
  animState: AnimState
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    // Size tiers: first 5% hero, next 25% medium, rest tiny
    const tier = i < count * 0.05 ? 'hero'
      : i < count * 0.30 ? 'medium'
      : 'tiny'

    const radius = tier === 'hero'
      ? 0.15 + Math.random() * 0.1
      : tier === 'medium'
        ? 0.06 + Math.random() * 0.06
        : 0.02 + Math.random() * 0.02

    particles.push({
      x: (Math.random() - 0.5) * 14,
      y: (Math.random() - 0.5) * 9,
      z: -20 + Math.random() * 21, // -20 to +1
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.002,
      vz: (Math.random() - 0.5) * 0.001,
      radius,
      twinkleSpeed: 0.3 + Math.random() * 0.7,
      twinklePhase: Math.random() * Math.PI * 2,
    })
  }

  return particles
}

export function GlassParticles({ quality, animState }: GlassParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const count = quality.particleCount

  const particles = useMemo(() => generateParticles(count), [count])

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 16, 12), [])

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      iridescence: 0.3,
      iridescenceIOR: 1.3,
      envMapIntensity: 1.2,
      transparent: true,
      opacity: 1,
      side: THREE.FrontSide,
    })

    if (quality.transmission) {
      mat.transmission = 0.92
      mat.thickness = 0.5
      mat.ior = 1.45
    } else {
      mat.opacity = 0.85
      mat.metalness = 0.1
    }

    return mat
  }, [quality.transmission])

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    const time = clock.getElapsedTime()
    const introScale = animState.particleScale

    for (let i = 0; i < count; i++) {
      const p = particles[i]

      // Ambient drift
      p.x += p.vx
      p.y += p.vy
      p.z += p.vz

      // Wrap at bounds for infinite field feel
      if (p.x > 7) p.x = -7
      if (p.x < -7) p.x = 7
      if (p.y > 4.5) p.y = -4.5
      if (p.y < -4.5) p.y = 4.5

      _position.set(p.x, p.y, p.z)
      _quaternion.identity()

      // Staggered intro: far particles (z=-20) appear first, near (z=+1) last
      const depthNorm = (p.z + 20) / 21 // 0=far, 1=near
      const staggerDelay = depthNorm * 0.6
      const localScale = introScale <= staggerDelay
        ? 0
        : Math.min(1, (introScale - staggerDelay) / (1 - staggerDelay))

      // Twinkle
      const twinkle = 0.85 + 0.15 * Math.sin(time * p.twinkleSpeed + p.twinklePhase)

      const s = p.radius * localScale * twinkle
      _scale.set(s, s, s)

      _matrix.compose(_position, _quaternion, _scale)
      meshRef.current.setMatrixAt(i, _matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  )
}
